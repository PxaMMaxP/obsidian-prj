// Note: MarkdownBlockProcessor Class

import { FrontMatterCache, MarkdownPostProcessorContext } from "obsidian";
import * as yaml from 'js-yaml';
import TagLib from "./TagLib";
import Global from "../global";
import { TaskModel } from "../models/TaskModel";
import TaskData from "../TaskData";
import FileCacheLib from "./FileCacheLib";
import MetadataCache from "./MetadataCache";

export default class MarkdownBlockProcessor {

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const setting: ProcessorSettings = yaml.load(source) as ProcessorSettings;
        if (setting) {
            const fileCache = FileCacheLib.getInstance();
            const metadataCache = MetadataCache.getInstance();
            await metadataCache.waitForCacheReady();
            const cache = metadataCache.Cache;

            const allTaskFiles = cache.filter(file => file.metadata.frontmatter?.type === "Task" && file.file.path !== ctx.sourcePath);

            setting.source = ctx.sourcePath;
            //const allFile = await DataviewWrapper.getAllMetadataFiles(null, ['Task'], setting.source);

            let file = await fileCache.findFileByPath(setting.source);
            if (!file) {
                throw new Error(`File ${ctx.sourcePath} not found`);
            }
            if (Array.isArray(file)) {
                file = file[0];
            }
            const task = new TaskModel(file);
            const tags = task.data.tags as string[];
            setting.container = el;
            const tagLib = new TagLib();
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