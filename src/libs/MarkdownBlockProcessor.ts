/* eslint-disable no-case-declarations */
// Note: MarkdownBlockProcessor Class

import { FrontMatterCache, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import * as yaml from 'js-yaml';
import Global from "../classes/Global";
import DocumentBlockRenderComponent from "./BlockRenderComponents/DocumentBlockRenderComponent";

export default class MarkdownBlockProcessor {
    private static moment = require('moment');

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const startTime = Date.now();

        const div = el.closest('div.cm-preview-code-block.cm-embed-block.markdown-rendered');
        if (div) {
            div.classList.remove('cm-embed-block');
        }

        const global = Global.getInstance();
        await global.metadataCache.waitForCacheReady();
        const cache = global.metadataCache.Cache;
        const logger = global.logger;

        const cmp = new MarkdownRenderChild(el);
        ctx.addChild(cmp);
        cmp.load();

        const blockContainer = document.createElement('div');
        el.append(blockContainer);
        blockContainer.classList.add('prj-block-container');


        const setting: ProcessorSettings = yaml.load(source) as ProcessorSettings;
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

export interface ProcessorSettings {
    type: string;
    options: ProcessorOptions[];
    source: string;
    frontmatter: FrontMatterCache | null | undefined;
    container: HTMLElement;
    ctx: MarkdownPostProcessorContext;
}

export interface ProcessorOptions {
    label: string;
    value: never;
}