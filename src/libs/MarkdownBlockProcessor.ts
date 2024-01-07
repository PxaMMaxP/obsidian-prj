/* eslint-disable no-case-declarations */
// Note: MarkdownBlockProcessor Class

import { Component, FrontMatterCache, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import * as yaml from 'js-yaml';
import Tag from "./Tag";
import Global from "../classes/Global";
import { DocumentModel } from "../models/DocumentModel";
import Table, { TableHeader } from "./Table";
import EditableDataView from "./EditableDataView/EditableDataView";

export default class MarkdownBlockProcessor {

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const startTime = Date.now();
        const cmp = new MarkdownRenderChild(el);
        ctx.addChild(cmp);
        const setting: ProcessorSettings = yaml.load(source) as ProcessorSettings;
        setting.source = ctx.sourcePath;
        if (setting) {
            const global = Global.getInstance();
            await global.metadataCache.waitForCacheReady();
            const cache = global.metadataCache.Cache;
            const logger = global.logger;

            const allTaskFiles = cache.filter(file => file.metadata.frontmatter?.type === "Metadata" && file.file.path !== ctx.sourcePath);
            const documents = allTaskFiles.map(file => new DocumentModel(file.file));
            //const allFile = await DataviewWrapper.getAllMetadataFiles(null, ['Task'], setting.source);

            let file = await global.fileCache.findFileByPath(setting.source);
            if (!file) {
                throw new Error(`File ${ctx.sourcePath} not found`);
            }
            if (Array.isArray(file)) {
                file = file[0];
            }
            const task = new DocumentModel(file);
            const title = task.data.title ?? "";
            const docDate = task.data.date ?? "";
            const desc = task.data.description ?? "";
            const tags = task.data.tags as string[];
            const status = task.data.sender ?? "";
            const run = false;
            let firstFile = task.relatedFiles?.length ? task.relatedFiles[0] : undefined;
            setting.container = el;
            const tagLib = new Tag();
            switch (setting.type) {
                case "Documents":

                    break;
                case "Tasks":

                    break;
                case "Debug":
                    console.log("Debug Mode");
                    console.log(`Settings: ${setting}`);

                    const headers: TableHeader[] = [];
                    const headerOptions = setting.options.find(option => option.label === "Headers")?.value as string[];
                    if (headerOptions) {
                        headerOptions.forEach((header: string) => {
                            headers.push({
                                text: header,
                                headerClass: undefined,
                                columnClass: undefined
                            });
                        });
                    }

                    const table = new Table(headers, "TableDebug", ["prj-table"]);
                    const tableData: { rowUid: string, rowData: DocumentFragment[], rowClassList: string[] | undefined, hidden: boolean }[] = [];
                    el.appendChild(table.data.table);
                    documents.forEach(documentModel => {
                        const rowData: DocumentFragment[] = [];
                        headers.forEach(header => {
                            const cellData = document.createDocumentFragment();
                            const cellContent = document.createElement("span");
                            if (documentModel.data.hasOwnProperty(header.text)) {
                                if (header.text === "title") {
                                    new EditableDataView(cellData, cmp)
                                        .addText(text => text
                                            .setPlaceholder("Title")
                                            .setValue(documentModel.data[header.text as keyof typeof documentModel.data]?.toString() ?? "")
                                            .onSave(async (value: string) => {
                                                //task.data.title = value;
                                            })
                                        );
                                } else if (header.text === "date") {
                                    new EditableDataView(cellData, cmp)
                                        .addDate(date => date
                                            .setValue(documentModel.data[header.text as keyof typeof documentModel.data]?.toString() ?? "")
                                            .onSave(async (value) => {
                                                //task.data.date = value;
                                            })
                                        );
                                } else {
                                    cellContent.textContent = documentModel.data[header.text as keyof typeof documentModel.data]?.toString() ?? "";
                                    cellData.appendChild(cellContent);
                                }
                            }
                            rowData.push(cellData);
                        });
                        tableData.push({ rowUid: documentModel.data.title ?? "", rowData: rowData, rowClassList: undefined, hidden: false });
                    });
                    table.addRows(tableData);
                    const content = setting.options.find(option => option.label === "Content")?.value;
                    /**if (content && run) {
                        let index = 0;
                        let i = 0;
                        content.forEach((item: any) => {
                            const rowData: DocumentFragment[] = [];
                            item.forEach((cell: any) => {
                                const cellData = document.createDocumentFragment();
                                if (i === 0) {
                                    new EditableDataView(cellData, cmp)
                                        .addText(text => text
                                            .setPlaceholder("Title")
                                            .setValue(title)
                                            .setSuggestions(tags)
                                            .onSave(async (value: string) => {
                                                task.data.title = value;
                                            })
                                        );
                                } else if (i === 1) {
                                    new EditableDataView(cellData, cmp)
                                        .addDate(date => date
                                            .setPlaceholder("0000-00-00")
                                            .setValue(docDate)
                                            .onSave(async (value) => {
                                                task.data.date = value;
                                            })
                                        );
                                } else if (i === 2) {
                                    new EditableDataView(cellData, cmp)
                                        .addLink(link => link
                                            .setAsTagLink()
                                            .setValue(`${desc}`)
                                            .setLinkValue(`#${desc}`, `#${desc}`)
                                            .setSuggestions(tags)
                                            .onSave(async (value: string): Promise<{ href: string, text: string }> => {
                                                task.data.description = value;
                                                return { href: `#${value}`, text: `#${value}` };
                                            })
                                        );
                                } else if (i === 3) {
                                    if (firstFile && firstFile.file) {
                                        new EditableDataView(cellData, cmp)
                                            .addLink(link => link
                                                .setAsFileLink()
                                                .setValue(firstFile?.file.name ?? "")
                                                .setLinkValue(firstFile?.file.path ?? "", firstFile?.file.basename ?? "")
                                                .setSuggestions(tags)
                                                .onChangeCallback(async (value: string): Promise<string[]> => {
                                                    const files = cache.filter(file => file.file.basename.includes(value)).map(file => file.file.name).splice(0, 10);
                                                    return files;
                                                })
                                                .onSave(async (value: string): Promise<{ href: string, text: string }> => {
                                                    const file = cache.filter(file => file.file.name.includes(value)).first()?.file;
                                                    if (file) {
                                                        if (task.data.relatedFiles)
                                                            task.data.relatedFiles[0] = new DocumentModel(file).getWikilink(undefined);
                                                        return { href: file.path, text: file.basename };
                                                    } else {
                                                        firstFile = task.relatedFiles?.length ? task.relatedFiles[0] : undefined;
                                                        if (!firstFile) {
                                                            return { href: "", text: "" };
                                                        }
                                                        return { href: firstFile.file.path, text: firstFile.file.basename };
                                                    }
                                                })
                                            );
                                    }
                                } else if (i === 4) {
                                    new EditableDataView(cellData, cmp)
                                        .addDropdown(dropdown => dropdown
                                            .setOptions([
                                                { value: "Task", text: "Task" },
                                                { value: "Document", text: "Document" },
                                                { value: "Note", text: "Note" },
                                                { value: "Metadata", text: "Metadata" }
                                            ])
                                            .setValue(status)
                                            .onSave(async (value) => {
                                                task.data.sender = value;
                                            })
                                        );
                                } else {
                                    const cellContent = document.createElement("span");
                                    cellContent.textContent = cell;
                                    cellData.appendChild(cellContent);
                                }
                                rowData.push(cellData);
                                i++;
                            });
                            table.addRow(index.toString(), rowData, undefined);
                            index++;
                        });

                    }**/
                    break;
                default:
                    break;
            }

            const endTime = Date.now();
            cmp.load();
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
}

export interface ProcessorOptions {
    label: string;
    value: any;
}