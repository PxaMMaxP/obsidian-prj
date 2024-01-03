// Note: DocMetadataLib class

import { DvAPIInterface } from "obsidian-dataview/lib/typings/api";
import Global from "../global";
import { App } from "obsidian";
import { DataArray } from "obsidian-dataview/lib/api/data-array";

export class DocMetadataLib {
    private dv: DvAPIInterface = Global.getInstance().dv;
    private app: App = Global.getInstance().app;
    private settings = Global.getInstance().settings;

    getAllMetadataFiles(tags: string[] | null, metadataType: string[], activeFilePath: string): DataArray<Record<string, any>> | never[] {
        let metadataFiles;
        if (tags) {
            const formattedTags = tags.map(tag => `${tag}`).join(" or ");
            metadataFiles = formattedTags
                ? this.dv.pages(formattedTags, '')
                    .where(file => metadataType.includes(file.type) && file.file.path !== activeFilePath)
                : [];
        } else {
            metadataFiles = this.dv.pages().where(
                file => metadataType.includes(file.type) &&
                    !file.file.path.contains(this.settings.templateFolder) &&
                    file.file.path !== activeFilePath);
        }

        return metadataFiles;
    }
}