import { Component, MarkdownRenderer, setIcon } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import EditableDataView from 'src/libs/EditableDataView/EditableDataView';
import { FileTypes } from 'src/libs/FileType/interfaces/IFileType';
import { HelperGeneral } from 'src/libs/Helper/General';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { Status, UrgencySymbols } from 'src/types/PrjTypes';

/**
 * Represents the project components.
 */
export default class ProjectComponents {
    /**
     * Creates a title component.
     * @param container The container to append the title to.
     * @param component The component to register the events to.
     * @param path The path to the file.
     * @param onRead On read callback. Returns the title.
     * @param onWrite On write callback. Passes the new title.
     */
    public static createTitle(
        container: DocumentFragment,
        component: Component,
        path: string,
        onRead: () => string,
        onWrite: (value: string) => void,
    ) {
        new EditableDataView(container, component).addLink((link) => {
            link.setValue(onRead())
                .setTitle(Lng.gt('Title'))
                .setPlaceholder(Lng.gt('Title'))
                .setLinkType('file')
                .setFormator((value: string) => {
                    let title: DocumentFragment | undefined =
                        document.createDocumentFragment();

                    if (value === '') {
                        setIcon(
                            title as unknown as HTMLDivElement,
                            'paperclip',
                        );
                    } else if (HelperGeneral.containsMarkdown(value)) {
                        const div = document.createElement('div');

                        MarkdownRenderer.render(
                            Global.getInstance().app,
                            value ?? '',
                            div,
                            '',
                            component,
                        );
                        title.appendChild(div);
                    } else {
                        title = undefined;
                    }

                    return { href: `${path}`, text: `${value}`, html: title };
                })
                .enableEditability()
                .onSave((value: string) => {
                    onWrite(value);

                    return Promise.resolve();
                });
        });
    }

    /**
     * Creates a summary component.
     * @param container The container to append the summary to.
     * @param component The component to register the events to.
     * @param description The description to display.
     * @param onWrite On write callback. Passes the new description.
     */
    public static createSummary(
        container: DocumentFragment,
        component: Component,
        description: string,
        onWrite: (value: string) => void,
    ) {
        new EditableDataView(container, component).addTextarea((text) =>
            text
                .setValue(description)
                .setTitle(Lng.gt('Description'))
                .setPlaceholder(Lng.gt('Description'))
                .enableEditability()
                .setRenderMarkdown()
                .onSave((value: string) => {
                    onWrite(value);

                    return Promise.resolve();
                }),
        );
    }

    /**
     * Creates a status component.
     * @param container The container to append the status to.
     * @param component The component to register the events to.
     * @param onRead On read callback. Should return the status.
     * @param onWrite On write callback. Should write the new status to the file.
     */
    public static createStatus(
        container: DocumentFragment,
        component: Component,
        onRead: () => string,
        onWrite: (value: string) => void,
    ) {
        new EditableDataView(container, component).addDropdown((dropdown) =>
            dropdown
                .setOptions([
                    { value: 'Active', text: Lng.gt('StatusActive') },
                    { value: 'Waiting', text: Lng.gt('StatusWaiting') },
                    { value: 'Later', text: Lng.gt('StatusLater') },
                    { value: 'Someday', text: Lng.gt('StatusSomeday') },
                    { value: 'Done', text: Lng.gt('StatusDone') },
                ])
                .setTitle(Lng.gt('Status'))
                .setValue(onRead())
                .onSave(async (value) => {
                    onWrite(value);
                })
                .enableEditability()
                .setFormator((value: string) => {
                    const status = value as Status;
                    let iconString: string;

                    switch (status) {
                        case 'Active':
                            iconString = '⚡';
                            break;
                        case 'Waiting':
                            iconString = '⏳';
                            break;
                        case 'Later':
                            iconString = '🔜';
                            break;
                        case 'Someday':
                            iconString = '📆';
                            break;
                        case 'Done':
                            iconString = '✔️';
                            break;
                        default:
                            iconString = '⚡';
                            break;
                    }

                    return { text: `${iconString}`, html: undefined };
                }),
        );
    }

    /**
     * Creates a priority component.
     * @param container The container to append the priority to.
     * @param component The component to register the events to.
     * @param onRead On read callback. Returns the priority.
     * @param onWrite On write callback. Passes the new priority.
     */
    public static createPriority(
        container: DocumentFragment,
        component: Component,
        onRead: () => string,
        onWrite: (value: string) => void,
    ) {
        new EditableDataView(container, component).addDropdown((dropdown) =>
            dropdown
                .setOptions([
                    { value: '3', text: Lng.gt('HighPriority') },
                    { value: '2', text: Lng.gt('MediumPriority') },
                    { value: '1', text: Lng.gt('LowPriority') },
                    { value: '0', text: Lng.gt('NoPriority') },
                ])
                .setTitle(Lng.gt('PriorityText'))
                .setValue(onRead())
                .onSave(async (value) => {
                    onWrite(value);
                })
                .enableEditability()
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    let iconString: string;

                    switch (value) {
                        case '3':
                            iconString = 'signal';
                            break;
                        case '2':
                            iconString = 'signal-medium';
                            break;
                        case '1':
                            iconString = 'signal-low';
                            break;
                        case '0':
                            iconString = 'signal-zero';
                            break;
                        default:
                            iconString = 'signal-zero';
                            break;
                    }
                    setIcon(icon as unknown as HTMLDivElement, iconString);

                    return { text: `${value}`, html: icon };
                }),
        );
    }

    /**
     * Creates a link to the file at `path` with the `corospondingSymbol` as icon.
     * @param container The container to append the link to.
     * @param component The component to register the events to.
     * @param path The path to the file.
     * @param type The type of the file.
     * @param corospondingSymbol The corosponding symbol for the file type.
     */
    public static createMetadataLink(
        container: DocumentFragment,
        component: Component,
        path: string,
        type: FileTypes | undefined | null,
        corospondingSymbol: string,
    ) {
        new EditableDataView(container, component).addLink((link) =>
            link
                .setValue(path)
                .setTitle(Lng.gt(type ?? 'File'))
                .setLinkType('file')
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    const iconString = corospondingSymbol;
                    setIcon(icon as unknown as HTMLDivElement, iconString);

                    return { href: `${value}`, text: `${value}`, html: icon };
                }),
        );
    }

    /**
     * Creates a span with the to `urgency` corresponding urgency symbol.
     * @param container The container to append the span to.
     * @param urgency The urgency to get the symbol for. (3 to -2)
     * @see {@link PrjTaskManagementModel.calculateUrgency}
     * @see {@link UrgencySymbols}
     */
    public static createTraficLight(
        container: DocumentFragment,
        urgency: number,
    ) {
        const traficLightSpan = document.createElement('span');
        container.appendChild(traficLightSpan);
        let iconString: UrgencySymbols;

        switch (urgency) {
            case 3:
                iconString = '🔴';
                break;
            case 2:
                iconString = '🟠';
                break;
            case 1:
                iconString = '🟡';
                break;
            case 0:
                iconString = '🟢';
                break;
            case -1:
                iconString = '🟢';
                break;
            case -2:
                iconString = '🔵';
                break;
            default:
                iconString = '🔴';
                break;
        }
        traficLightSpan.textContent = iconString;
    }
}
