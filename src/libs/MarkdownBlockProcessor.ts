/* eslint-disable no-case-declarations */
// Note: MarkdownBlockProcessor Class

import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import * as yaml from 'js-yaml';
import Global from "../classes/Global";
import DocumentBlockRenderComponent from "./BlockRenderComponents/DocumentBlockRenderComponent";
import { IProcessorSettings } from "../interfaces/IProcessorSettings";
import ProjectBlockRenderComponent from "./BlockRenderComponents/ProjectBlockRenderComponent";
import Logging from "src/classes/Logging";
import Helper from "./Helper";
import NoteBlockRenderComponent from "./BlockRenderComponents/NoteBlockRenderComponent";
import SingletonBlockProcessor from "./SingletonBlockProcessor";

class MdRenderChild extends MarkdownRenderChild {
    constructor(container: HTMLElement) {
        super(container);
    }

    override onunload(): void {
        const logger = Logging.getLogger("MdRenderChild");
        logger.trace("On Unload");
        super.onunload();
    }
}

/**
 * Class for the markdown block processor.
 */
export default class MarkdownBlockProcessor {

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const startTime = Date.now();
        const global = Global.getInstance();
        await global.metadataCache.waitForCacheReady();
        const logger = Logging.getLogger("BlockProcessor");
        logger.trace(`DocId: ${ctx.docId}`);

        const uid = Helper.generateUID(source.trim(), 15);
        const setting: IProcessorSettings = yaml.load(source) as IProcessorSettings;

        // Remove the cm-embed-block class from the parent element
        // and add the prj-block class.
        // This remove the Block-Hover-Effekt from the block
        // and with CSS we remove the Block-Edit-Button
        const parent = el.closest('div.cm-preview-code-block.cm-embed-block.markdown-rendered');
        if (parent) {
            parent.classList.remove('cm-embed-block');
            parent.addClass('prj-block');
        }

        const singletonBlockProcessor = new SingletonBlockProcessor(
            uid,
            el,
            ctx,
            Logging.getLogger("SingletonBlockProcessor"));

        const singleToneBlock = singletonBlockProcessor.singletoneContainer;
        el.append(singleToneBlock);

        if (!singletonBlockProcessor.checkForSiblingBlocks()) {
            const endTime = Date.now();
            logger.debug(`MarkdownBlockProcessor runs for ${endTime - startTime}ms`);
            return;
        }

        const blockContainer = document.createElement('div');
        singleToneBlock.append(blockContainer);
        blockContainer.classList.add('prj-block-container');
        blockContainer.lang = global.settings.language;
        if (setting.styles) {
            setting.styles.forEach(style => {
                blockContainer.classList.add(style);
            });
        }

        const cmp = new MdRenderChild(blockContainer);
        setting.component = cmp;
        ctx.addChild(cmp);

        setting.source = ctx.sourcePath;
        setting.frontmatter = global.metadataCache.cache.filter(file => file.file.path === ctx.sourcePath).first()?.metadata.frontmatter;
        setting.container = blockContainer;
        setting.ctx = ctx;

        if (setting) {
            switch (setting.type) {
                case "Documents":
                    const documentBlock = new DocumentBlockRenderComponent(setting);
                    await documentBlock.build();
                    break;
                case "Tasks":
                case "Projects":
                case "Topics":
                    const projectBlock = new ProjectBlockRenderComponent(setting);
                    await projectBlock.build();
                    break;
                case "Notes":
                    const noteBlock = new NoteBlockRenderComponent(setting);
                    await noteBlock.build();
                    break;
                case "Debug":
                    console.log("Debug Mode");
                    console.log(`Settings: ${setting}`);
                    break;
                default:
                    break;
            }

            const endTime = Date.now();
            logger.debug(`MarkdownBlockProcessor runs for ${endTime - startTime}ms`);
        }

    }
}

