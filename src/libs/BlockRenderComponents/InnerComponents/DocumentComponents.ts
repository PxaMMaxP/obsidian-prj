import { Component, MarkdownRenderer, TFile, setIcon } from "obsidian";
import Global from "src/classes/Global";
import Lng from "src/classes/Lng";
import EditableDataView from "src/libs/EditableDataView/EditableDataView";
import Helper from "src/libs/Helper";
import { DocumentModel } from "src/models/DocumentModel";
import { StaticDocumentModel } from "src/models/StaticHelper/StaticDocumentModel";

export default class DocumentComponents {
    public static createCellSummary(
        documentModel: DocumentModel,
        component: Component,
        summaryRelatedFiles: DocumentFragment) {
        const description = documentModel.getDescription();
        new EditableDataView(summaryRelatedFiles, component)
            .addTextarea(textarea => textarea
                .setValue(description)
                .setTitle("Summary")
                .enableEditability()
                .setRenderMarkdown()
                .onSave((value: string) => {
                    documentModel.data.description = value;
                    return Promise.resolve();
                })
            );
    }

    public static createRelatedFilesList(
        relatedFilesList: DocumentFragment,
        component: Component,
        documentModel: DocumentModel,
        noneDocSymbol: string,
        dateFormatShort: string) {
        const relatedFiles = documentModel.relatedFiles;
        if (!relatedFiles || relatedFiles.length === 0) return;
        const container = document.createElement('div');
        relatedFilesList.appendChild(container);
        container.classList.add('related-files-container');

        const breakLine = document.createElement('hr');
        container.appendChild(breakLine);
        breakLine.classList.add('related-files-breakline');

        const list = document.createElement('ul');
        container.appendChild(list);
        list.classList.add('related-files-list');

        relatedFiles.forEach(relatedFile => {
            const listEntry = document.createElement('li');
            list.append(listEntry);

            const gridContainer = document.createElement('div');
            listEntry.appendChild(gridContainer);
            gridContainer.classList.add('grid-container');

            const iconContainer = document.createElement('span');
            gridContainer.append(iconContainer)
            iconContainer.classList.add('icon-container');
            const inputOutputState = relatedFile.getInputOutputState();
            //Input, Output or default icon
            let listIconString = noneDocSymbol;
            if (inputOutputState === "Input") {
                listIconString = "corner-left-down";
            } else if (inputOutputState === "Output") {
                listIconString = "corner-right-up";
            }
            setIcon(iconContainer, listIconString);

            //Metadata File Link
            const metadataContainer = document.createElement('span');
            gridContainer.append(metadataContainer)
            metadataContainer.classList.add('metadata-file-container');
            const metadataFragment = document.createDocumentFragment();
            this.createCellMetadatalink(metadataFragment, component, relatedFile);
            metadataContainer.appendChild(metadataFragment);

            //Date
            const dateContainer = document.createElement('span');
            gridContainer.append(dateContainer)
            dateContainer.classList.add('date-container');
            new EditableDataView(dateContainer, component)
                .addDate(date => date
                    .setValue(relatedFile.data.date ?? "na")
                    .setTitle("Document Date")
                    .setFormator((value: string) => Helper.formatDate(value, Helper.formatDate(value, dateFormatShort))
                    ));

            const textContainer = document.createElement('span');
            gridContainer.append(textContainer)
            textContainer.classList.add('data-container');
            const linkFragment = document.createDocumentFragment();
            //Title and Link
            this.createCellFileLink(linkFragment, component, relatedFile, false);
            textContainer.append(linkFragment);
        });
    }

    public static createCellSenderRecipient(
        documentModel: DocumentModel,
        component: Component,
        models: DocumentModel[]): DocumentFragment {
        const senderRecipient = document.createDocumentFragment();
        const container = document.createElement('div');
        senderRecipient.appendChild(container);
        container.classList.add('senderRecipient');

        const inputOutputState = documentModel.getInputOutputState();
        const sender = documentModel.data.sender ?? null;
        const recipient = documentModel.data.recipient ?? null;

        if (sender && inputOutputState !== "Output") {
            const senderContainer = document.createElement('div');
            senderContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt("From");
            senderContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            senderContainer.appendChild(name);
            this.createEDVSenderRecipient(name, component, sender, "Sender", (value: string) => {
                documentModel.data.sender = value;
                return Promise.resolve();
            }, models);

            container.appendChild(senderContainer);
        }
        if (recipient && inputOutputState !== "Input") {
            const recipientContainer = document.createElement('div');
            recipientContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt("To");
            recipientContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            recipientContainer.appendChild(name);
            this.createEDVSenderRecipient(name, component, recipient, "Recipient", (value: string) => {
                documentModel.data.recipient = value;
                return Promise.resolve();
            }, models);

            container.appendChild(recipientContainer);
        }
        return senderRecipient;
    }

    private static createEDVSenderRecipient(
        name: HTMLElement | DocumentFragment,
        component: Component,
        value: string,
        title: string,
        onSaveCallback: (value: string) => Promise<void>,
        models: DocumentModel[] = []) {
        return new EditableDataView(name, component)
            .addText(text => text
                .setValue(value)
                .setTitle(title)
                .enableEditability()
                .setSuggester((inputValue: string) => {
                    const suggestions = StaticDocumentModel.getAllSenderRecipients()
                        .filter(suggestion => suggestion.toLowerCase().includes(inputValue.toLowerCase()))
                        .slice(0, 100)
                        .map(suggestion => { return { value: suggestion, label: suggestion } });
                    return suggestions;
                })
                .onSave((newValue: string) => onSaveCallback(newValue))
            );
    }

    public static createCellFileLink(
        fileLink: DocumentFragment,
        component: Component,
        documentModel: DocumentModel,
        editability = true) {
        const fileCache = Global.getInstance().fileCache;
        const app = Global.getInstance().app;
        new EditableDataView(fileLink, component)
            .addLink(link => {
                link.setValue(documentModel.data.title ?? "")
                    .setTitle(Lng.gt("PDF file"))
                    .setLinkType("file")
                    .setFormator((value: string) => {
                        const baseFileData = Helper.extractDataFromWikilink(documentModel.data.file);
                        const baseFile = fileCache.findFileByLinkText(baseFileData.filename ?? "", documentModel.file.path);
                        let baseFilePath = baseFileData.filename ?? "";
                        if (baseFile && baseFile instanceof TFile) {
                            baseFilePath = baseFile.path;
                        }
                        let docFragment: DocumentFragment | undefined = undefined;
                        if (Helper.isPossiblyMarkdown(value)) {
                            docFragment = document.createDocumentFragment();
                            const div = document.createElement('div');
                            MarkdownRenderer.render(app, value ?? "", div, "", component);
                            docFragment.appendChild(div);
                        }
                        return { href: `${baseFilePath}`, text: `${value}`, html: docFragment };
                    });
                if (editability) {
                    link.enableEditability()
                        .onSave((value: string) => {
                            documentModel.data.title = value;
                            return Promise.resolve();
                        });
                }
            });
    }

    public static createCellMetadatalink(
        metadataLink: DocumentFragment,
        component: Component,
        documentModel: DocumentModel) {
        const settings = Global.getInstance().settings;
        new EditableDataView(metadataLink, component)
            .addLink(link => link
                .setValue(documentModel.file.path)
                .setTitle("Open metadata file")
                .setLinkType("file")
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    let iconString = "x-circle";
                    if (documentModel.data.hide === true) {
                        iconString = settings.documentSettings.hideSymbol;
                    } else {
                        if (documentModel.data.subType === "Cluster") {
                            iconString = settings.documentSettings.clusterSymbol;
                        } else {
                            iconString = settings.documentSettings.symbol;
                        }
                    }
                    setIcon(icon as unknown as HTMLDivElement, iconString);
                    return { href: `${value}`, text: `${value}`, html: icon };
                }
                ));
    }
}
