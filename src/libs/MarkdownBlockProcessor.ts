/* eslint-disable no-case-declarations */
import * as yaml from 'js-yaml';
import { MarkdownPostProcessorContext } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Logging } from 'src/classes/Logging';
import DocumentBlockRenderComponent from './BlockRenderComponents/DocumentBlockRenderComponent';
import HeaderBlockRenderComponent from './BlockRenderComponents/HeaderBlockRenderComponent';
import NoteBlockRenderComponent from './BlockRenderComponents/NoteBlockRenderComponent';
import ProjectBlockRenderComponent from './BlockRenderComponents/ProjectBlockRenderComponent';
import CustomizableRenderChild from './CustomizableRenderChild/CustomizableRenderChild';
import { HelperGeneral } from './Helper/General';
import { Lifecycle } from './LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from './LifecycleManager/interfaces/ILifecycleManager';
import SingletonBlockProcessor from './SingletonBlockProcessor/SingletonBlockProcessor';
import Global from '../classes/Global';
import { IProcessorSettings } from '../interfaces/IProcessorSettings';

/**
 * Class for the markdown block processor.
 */
@ImplementsStatic<ILifecycleObject>()
@Lifecycle
export default class MarkdownBlockProcessor {
    /**
     * Register the markdown block processor and update the workspace options.
     */
    public static onLoad(): void {
        Global.getInstance().plugin.registerMarkdownCodeBlockProcessor(
            'prj',
            MarkdownBlockProcessor.parseSource,
        );

        Global.getInstance().app.workspace.updateOptions();
    }

    /**
     * Parse the source of the `prj` block.
     * @param source A unique identifier for the block.
     * @param el The HTML element.
     * @param ctx The markdown post processor context.
     */
    static async parseSource(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
    ): Promise<void> {
        const startTime = Date.now();
        const global = Global.getInstance();
        await global.metadataCache.waitForCacheReady();
        const logger = Logging.getLogger('BlockProcessor');
        logger.trace(`DocId: ${ctx.docId}`);

        const uid = HelperGeneral.generateUID(source.trim(), 15);

        const setting: IProcessorSettings = yaml.load(
            source,
        ) as IProcessorSettings;

        // Remove the cm-embed-block class from the parent element
        // and add the prj-block class.
        // This remove the Block-Hover-Effekt from the block
        // and with CSS we remove the Block-Edit-Button
        const parent = el.closest(
            'div.cm-preview-code-block.cm-embed-block.markdown-rendered',
        );

        if (parent) {
            parent.classList.remove('cm-embed-block');
            parent.addClass('prj-block');
        }

        const singletonBlockProcessor = new SingletonBlockProcessor(
            uid,
            el,
            ctx,
            Logging.getLogger('SingletonBlockProcessor'),
        );

        const singletonBlock = singletonBlockProcessor.singletoneContainer;
        el.append(singletonBlock);

        if (!singletonBlockProcessor.checkForSiblingBlocks()) {
            const endTime = Date.now();

            logger.debug(
                `MarkdownBlockProcessor runs for ${endTime - startTime}ms`,
            );

            return;
        }

        const blockContainer = document.createElement('div');
        singletonBlock.append(blockContainer);
        blockContainer.classList.add('prj-block-container');
        blockContainer.lang = global.settings.language;

        if (setting.styles) {
            setting.styles.forEach((style) => {
                blockContainer.classList.add(style);
            });
        }

        const cmp = new CustomizableRenderChild(
            blockContainer,
            undefined,
            undefined,
            logger,
        );
        setting.component = cmp;
        ctx.addChild(cmp);

        setting.source = ctx.sourcePath;

        setting.frontmatter = global.metadataCache.cache
            .filter((file) => file.file.path === ctx.sourcePath)
            .first()?.metadata.frontmatter;
        setting.container = blockContainer;
        setting.ctx = ctx;

        if (setting) {
            switch (setting.type) {
                case 'Documents':
                    const documentBlock = new DocumentBlockRenderComponent(
                        setting,
                    );
                    await documentBlock.build();
                    break;
                case 'Tasks':
                case 'Projects':
                case 'Topics':
                    const projectBlock = new ProjectBlockRenderComponent(
                        setting,
                    );
                    await projectBlock.build();
                    break;
                case 'Notes':
                    const noteBlock = new NoteBlockRenderComponent(setting);
                    await noteBlock.build();
                    break;
                case 'Header':
                    const header = new HeaderBlockRenderComponent(setting);
                    await header.build();
                    break;
                case 'Debug':
                    logger.debug('Debug Mode');
                    logger.debug(`Settings: ${setting}`);
                    break;
                default:
                    break;
            }

            const endTime = Date.now();

            logger.debug(
                `MarkdownBlockProcessor runs for ${endTime - startTime}ms`,
            );
        }
    }
}
