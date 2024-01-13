/* eslint-disable no-case-declarations */
// Note: MarkdownBlockProcessor Class

import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import * as yaml from 'js-yaml';
import Global from "../classes/Global";
import DocumentBlockRenderComponent from "./BlockRenderComponents/DocumentBlockRenderComponent";
import { IProcessorSettings } from "../interfaces/IProcessorSettings";
import ProjectBlockRenderComponent from "./BlockRenderComponents/ProjectBlockRenderComponent";

/**
 * Class for the markdown block processor.
 */
export default class MarkdownBlockProcessor {

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const startTime = Date.now();

        // Remove the cm-embed-block class from the parent element
        // and add the prj-block class.
        // This remove the Block-Hover-Effekt from the block
        // and with CSS we remove the Block-Edit-Button
        const parent = el.closest('div.cm-preview-code-block.cm-embed-block.markdown-rendered');
        if (parent) {
            parent.classList.remove('cm-embed-block');
            parent.addClass('prj-block');
        }

        const global = Global.getInstance();
        await global.metadataCache.waitForCacheReady();
        const cache = global.metadataCache.cache;
        const logger = global.logger;

        const cmp = new MarkdownRenderChild(el);
        ctx.addChild(cmp);
        cmp.load();

        const blockContainer = document.createElement('div');
        el.append(blockContainer);
        blockContainer.classList.add('prj-block-container');
        blockContainer.lang = global.settings.language;

        const setting: IProcessorSettings = yaml.load(source) as IProcessorSettings;
        setting.source = ctx.sourcePath;
        setting.frontmatter = cache.filter(file => file.file.path === ctx.sourcePath).first()?.metadata.frontmatter;
        setting.container = blockContainer;
        setting.ctx = ctx;

        if (setting) {
            switch (setting.type) {
                case "Documents":
                    const documentBlock = new DocumentBlockRenderComponent(setting)
                    await documentBlock.build();
                    break;
                case "Tasks":
                case "Projects":
                case "Topics":
                    const projectBlock = new ProjectBlockRenderComponent(setting)
                    await projectBlock.build();
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

