// Note: MarkdownBlockProcessor Class

import { FrontMatterCache, MarkdownPostProcessorContext } from "obsidian";
import * as yaml from 'js-yaml';
import Tag from "./Tag";
import Global from "../classes/Global";
import { DocumentModel } from "../models/DocumentModel";

export default class MarkdownBlockProcessor {

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const startTime = Date.now();
        const setting: ProcessorSettings = yaml.load(source) as ProcessorSettings;
        if (setting) {
            const global = Global.getInstance();
            await global.metadataCache.waitForCacheReady();
            const cache = global.metadataCache.Cache;
            const logger = global.logger;

            const allTaskFiles = cache.filter(file => file.metadata.frontmatter?.type === "Metadata" && file.file.path !== ctx.sourcePath);
            const documents = allTaskFiles.map(file => new DocumentModel(file.file));
            setting.source = ctx.sourcePath;
            //const allFile = await DataviewWrapper.getAllMetadataFiles(null, ['Task'], setting.source);

            let file = await global.fileCache.findFileByPath(setting.source);
            if (!file) {
                throw new Error(`File ${ctx.sourcePath} not found`);
            }
            if (Array.isArray(file)) {
                file = file[0];
            }
            const task = new DocumentModel(file);
            logger.debug("task.relatedFiles", task.relatedFiles);
            task.data.annotationTarget = "Super Lustiger...";
            const tags = task.data.tags as string[];
            setting.container = el;
            const tagLib = new Tag();
            switch (setting.type) {
                case "Documents":
                    if (tags) {
                        const validTags = tagLib.getValidTags(tags);
                        const tagLinks = tagLib.generateTagList(validTags);
                        el.appendChild(tagLinks);
                    }
                    break;
                case "Tasks":

                    break;
                default:
                    break;
            }

            const endTime = Date.now();
            logger.debug(`MarkdownBlockProcessor (${documents.length} Documents) runs for ${endTime - startTime}ms`);
        }

    }
}

export interface ProcessorSettings {
    type: string;
    options: ProcessorOptions[];
    source: string;
    frontmatter: FrontMatterCache | null | undefined;
    container: HTMLElement;
}

export interface ProcessorOptions {
    label: string;
    value: string;
}