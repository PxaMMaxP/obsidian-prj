// Note: DocMetadataLib class

import { TFile } from "obsidian";
import Global from "../global";
import FileCacheLib from "./FileCacheLib";

export class DataviewWrapper {

    static async getAllMetadataFiles(tags: string[] | null, metadataType: string[], activeFilePath: string | null): Promise<TFile[]> {
        const dv = Global.getInstance().dv;
        const settings = Global.getInstance().settings;
        const fileCache = FileCacheLib.getInstance();

        const metadataFiles: Array<TFile> = [];
        let queryResult;
        if (tags) {
            const formattedTags = tags.map(tag => `${tag}`).join(" or ");
            queryResult = dv.pages(formattedTags, '')
                .where(file => metadataType.includes(file.type) && file.file.path !== activeFilePath).map(file => file.file);

        } else {
            queryResult = dv.pages().where(
                file => metadataType.includes(file.type) &&
                    !file.file.path.contains(settings.templateFolder) &&
                    file.file.path !== activeFilePath).map(file => file.file);

        }

        if (queryResult) {
            for (const file of queryResult) {
                const cachedFile = await fileCache.findFileByPath(file.path);
                if (cachedFile) {
                    if (Array.isArray(cachedFile)) {
                        metadataFiles.push(...cachedFile);
                    } else {
                        metadataFiles.push(cachedFile);
                    }
                } else {
                    console.error(`File ${file.path} not found in cache`);
                }
            }
        }

        return metadataFiles;
    }


}