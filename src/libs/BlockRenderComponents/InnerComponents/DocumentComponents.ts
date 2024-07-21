import { Component, MarkdownRenderer, TFile, setIcon } from 'obsidian';
import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import { IApp } from 'src/interfaces/IApp';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import { Resolve } from 'src/libs/DependencyInjection/functions/Resolve';
import EditableDataView from 'src/libs/EditableDataView/EditableDataView';
import { HelperGeneral } from 'src/libs/Helper/General';
import { Wikilink } from 'src/libs/Wikilink/Wikilink';
import { DocumentModel } from 'src/models/DocumentModel';
import { IPrjSettings } from 'src/types/PrjSettings';

/**
 * Represents a collection of static methods for creating various components related to documents.
 */
export default class DocumentComponents {
    /**
     * Creates a cell summary for a document.
     * @param documentModel - The document model.
     * @param component - The component.
     * @param summaryRelatedFiles - The related files for the summary.
     */
    public static createCellSummary(
        documentModel: DocumentModel,
        component: Component,
        summaryRelatedFiles: DocumentFragment,
    ): void {
        const description = documentModel.data.description ?? '';

        new EditableDataView(summaryRelatedFiles, component).addTextarea(
            (textarea) => {
                textarea
                    .setValue(description)
                    .setTitle('Summary')
                    .enableEditability()
                    .setRenderMarkdown()
                    .onSave((value: string) => {
                        documentModel.data.description = value;

                        return Promise.resolve();
                    });
            },
        );
    }

    /**
     * Creates a list of related files and appends it to the specified document fragment.
     * @param relatedFilesList - The document fragment to which the related files list will be appended.
     * @param component - The component associated with the related files list.
     * @param documentModel - The document model containing the related files.
     * @param noneDocSymbol - The symbol to be used when there are no related files.
     * @param dateFormatShort - The short date format to be used for displaying dates.
     */
    public static createRelatedFilesList(
        relatedFilesList: DocumentFragment,
        component: Component,
        documentModel: DocumentModel,
        noneDocSymbol: string,
        dateFormatShort: string,
    ): void {
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

        relatedFiles.forEach((relatedFile) => {
            const listEntry = document.createElement('li');
            list.append(listEntry);

            const gridContainer = document.createElement('div');
            listEntry.appendChild(gridContainer);
            gridContainer.classList.add('grid-container');

            const iconContainer = document.createElement('span');
            gridContainer.append(iconContainer);
            iconContainer.classList.add('icon-container');
            const inputOutputState = relatedFile.getInputOutputState();
            //Input, Output or default icon
            let listIconString = noneDocSymbol;

            if (inputOutputState === 'Input') {
                listIconString = 'corner-left-down';
            } else if (inputOutputState === 'Output') {
                listIconString = 'corner-right-up';
            }
            setIcon(iconContainer, listIconString);

            //Metadata File Link
            const metadataContainer = document.createElement('span');
            gridContainer.append(metadataContainer);
            metadataContainer.classList.add('metadata-file-container');
            const metadataFragment = document.createDocumentFragment();

            this.createCellMetadatalink(
                metadataFragment,
                component,
                relatedFile,
            );
            metadataContainer.appendChild(metadataFragment);

            //Date
            const dateContainer = document.createElement('span');
            gridContainer.append(dateContainer);
            dateContainer.classList.add('date-container');

            new EditableDataView(dateContainer, component).addDate((date) => {
                date.setValue(relatedFile.data.date ?? 'na')
                    .setTitle('Document Date')
                    .setFormator((value: string) =>
                        HelperGeneral.formatDate(
                            value,
                            HelperGeneral.formatDate(value, dateFormatShort),
                        ),
                    );
            });

            const textContainer = document.createElement('span');
            gridContainer.append(textContainer);
            textContainer.classList.add('data-container');
            const linkFragment = document.createDocumentFragment();

            //Title and Link
            this.createCellFileLink(
                linkFragment,
                component,
                relatedFile,
                false,
            );
            textContainer.append(linkFragment);
        });
    }

    /**
     * Creates a cell sender recipient document fragment.
     * @param documentModel - The document model.
     * @param component - The component.
     * @param models - The document models.
     * @returns The created document fragment.
     */
    public static createCellSenderRecipient(
        documentModel: DocumentModel,
        component: Component,
        models: DocumentModel[],
    ): DocumentFragment {
        const senderRecipient = document.createDocumentFragment();
        const container = document.createElement('div');
        senderRecipient.appendChild(container);
        container.classList.add('senderRecipient');

        const inputOutputState = documentModel.getInputOutputState();
        const sender = documentModel.data.sender ?? null;
        const recipient = documentModel.data.recipient ?? null;

        if (sender && inputOutputState !== 'Output') {
            const senderContainer = document.createElement('div');
            senderContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt('From');
            senderContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            senderContainer.appendChild(name);

            this.createEDVSenderRecipient(
                name,
                component,
                sender,
                'Sender',
                (value: string) => {
                    documentModel.data.sender = value;

                    return Promise.resolve();
                },
                models,
            );

            container.appendChild(senderContainer);
        }

        if (recipient && inputOutputState !== 'Input') {
            const recipientContainer = document.createElement('div');
            recipientContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt('To');
            recipientContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            recipientContainer.appendChild(name);

            this.createEDVSenderRecipient(
                name,
                component,
                recipient,
                'Recipient',
                (value: string) => {
                    documentModel.data.recipient = value;

                    return Promise.resolve();
                },
                models,
            );

            container.appendChild(recipientContainer);
        }

        return senderRecipient;
    }

    /**
     * Creates an instance of EditableDataView with sender/recipient functionality.
     * @param name - The name of the element or document fragment.
     * @param component - The component to be added to the EditableDataView.
     * @param value - The initial value for the EditableDataView.
     * @param title - The title for the EditableDataView.
     * @param onSaveCallback - The callback function to be called when the value is saved.
     * @param models - An optional array of DocumentModel objects.
     * @returns An instance of EditableDataView with sender/recipient functionality.
     */
    private static createEDVSenderRecipient(
        name: HTMLElement | DocumentFragment,
        component: Component,
        value: string,
        title: string,
        onSaveCallback: (value: string) => Promise<void>,
        models: DocumentModel[] = [],
    ): EditableDataView {
        return new EditableDataView(name, component).addText((text) => {
            text.setValue(value)
                .setTitle(title)
                .enableEditability()
                .setSuggester((inputValue: string) => {
                    const suggestions = API.documentModel
                        .getAllSenderRecipients()
                        .filter((suggestion) =>
                            suggestion
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()),
                        )
                        .slice(0, 100)
                        .map((suggestion) => {
                            return { value: suggestion, label: suggestion };
                        });

                    return suggestions;
                })
                .onSave((newValue: string) => onSaveCallback(newValue));
        });
    }

    /**
     * Creates a cell file link.
     * @param fileLink - The document fragment representing the file link.
     * @param component - The component associated with the file link.
     * @param documentModel - The document model containing the data for the file link.
     * @param editability - Optional. Specifies whether the file link should be editable. Default is true.
     */
    public static createCellFileLink(
        fileLink: DocumentFragment,
        component: Component,
        documentModel: DocumentModel,
        editability = true,
    ): void {
        const metadataCache = Resolve<IMetadataCache>('IMetadataCache');
        const app = Resolve<IApp>('IApp');

        new EditableDataView(fileLink, component).addLink((link) => {
            link.setValue(documentModel.data.title ?? '')
                .setTitle(Lng.gt('PDF file'))
                .setLinkType('file')
                .setFormator((value: string) => {
                    const baseFileData = new Wikilink(documentModel.data.file);

                    const baseFile = metadataCache.getFileByLink(
                        baseFileData.filename ?? '',
                        documentModel.file.path,
                    );
                    let baseFilePath = baseFileData.filename ?? '';

                    if (baseFile && baseFile instanceof TFile) {
                        baseFilePath = baseFile.path;
                    }
                    let docFragment: DocumentFragment | undefined = undefined;

                    if (HelperGeneral.containsMarkdown(value)) {
                        docFragment = document.createDocumentFragment();
                        const div = document.createElement('div');

                        MarkdownRenderer.render(
                            app,
                            value ?? '',
                            div,
                            '',
                            component,
                        );
                        docFragment.appendChild(div);
                    }

                    return {
                        href: `${baseFilePath}`,
                        text: `${value}`,
                        html: docFragment,
                    };
                });

            if (editability) {
                link.enableEditability().onSave((value: string) => {
                    documentModel.data.title = value;

                    return Promise.resolve();
                });
            }
        });
    }

    /**
     * Creates a cell metadata link.
     * @param metadataLink - The document fragment representing the metadata link.
     * @param component - The component associated with the metadata link.
     * @param documentModel - The document model containing the metadata.
     */
    public static createCellMetadatalink(
        metadataLink: DocumentFragment,
        component: Component,
        documentModel: DocumentModel,
    ): void {
        const settings = Resolve<IPrjSettings>('IPrjSettings');

        new EditableDataView(metadataLink, component).addLink((link) => {
            link.setValue(documentModel.file.path)
                .setTitle('Open metadata file')
                .setLinkType('file')
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    let iconString = 'x-circle';

                    if (documentModel.data.hide === true) {
                        iconString = settings.documentSettings.hideSymbol;
                    } else {
                        if (documentModel.data.subType === 'Cluster') {
                            iconString =
                                settings.documentSettings.clusterSymbol;
                        } else {
                            iconString = settings.documentSettings.symbol;
                        }
                    }
                    setIcon(icon as unknown as HTMLDivElement, iconString);

                    return { href: `${value}`, text: `${value}`, html: icon };
                });
        });
    }
}
