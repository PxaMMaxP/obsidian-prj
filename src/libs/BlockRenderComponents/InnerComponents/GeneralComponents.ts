import { Component, setIcon } from "obsidian";
import Lng from "src/classes/Lng";
import EditableDataView from "src/libs/EditableDataView/EditableDataView";
import Helper from "src/libs/Helper";
import { FileType } from "src/types/PrjTypes";

export default class GeneralComponents {

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
        type: FileType | undefined | null,
        corospondingSymbol: string) {
        new EditableDataView(container, component)
            .addLink(link => link
                .setValue(path)
                .setTitle(Lng.gt(type ?? "File"))
                .setLinkType("file")
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    const iconString = corospondingSymbol;
                    setIcon(icon as unknown as HTMLDivElement, iconString);
                    return { href: `${value}`, text: `${value}`, html: icon };
                }
                ));
    }

    public static createCellDate(
        date: DocumentFragment,
        component: Component,
        title: string,
        format: string,
        onRead: () => string,
        onWrite: (value: string) => void) {
        new EditableDataView(date, component)
            .addDate(date => date
                .setValue(onRead())
                .setTitle(title)
                .enableEditability()
                .setFormator((value: string) => Helper.formatDate(value, format))
                .onSave((value: string) => {
                    onWrite(value);
                    return Promise.resolve();
                })
            );
    }

}
