import { Component, setIcon } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import EditableDataView from 'src/libs/EditableDataView/EditableDataView';
import { FileType } from 'src/libs/FileType/FileType';
import { HelperGeneral } from 'src/libs/Helper/General';

/**
 * General components class for `BlockRenderComponent`.
 */
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
        corospondingSymbol: string,
    ) {
        new EditableDataView(container, component).addLink((link) =>
            link
                .setValue(path)
                .setTitle(Lng.gt(type?.valueOf() ?? 'File'))
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
     * Create a cell with a date.
     * @param date The container to append the date to.
     * @param component The component to register the events to.
     * @param title The title of the date.
     * @param format The format of the date.
     * @param onRead The function to read the date from model.
     * @param onWrite The function to write the date to model.
     */
    public static createCellDate(
        date: DocumentFragment,
        component: Component,
        title: string,
        format: string,
        onRead: () => string,
        onWrite: (value: string) => void,
    ) {
        new EditableDataView(date, component).addDate((date) =>
            date
                .setValue(onRead())
                .setTitle(title)
                .enableEditability()
                .setFormator((value: string) =>
                    HelperGeneral.formatDate(value, format),
                )
                .onSave((value: string) => {
                    onWrite(value);

                    return Promise.resolve();
                }),
        );
    }

    /**
     * Create a cell with tags as links.
     * @param tagContainer The container to append the tags to.
     * @param component The component to register the events to.
     * @param tags The tags to create links for.
     */
    public static createCellTags(
        tagContainer: DocumentFragment,
        component: Component,
        tags: string[],
    ) {
        tags.forEach((tag) => {
            new EditableDataView(tagContainer, component).addLink((link) =>
                link
                    .setValue(tag)
                    .setTitle('Tag')
                    .setLinkType('tag')
                    .setFormator((value: string) => {
                        const baseTag =
                            Global.getInstance().settings.baseTag + '/';
                        let valueReduced = value;

                        if (
                            valueReduced &&
                            valueReduced !== '' &&
                            valueReduced.startsWith(baseTag)
                        ) {
                            valueReduced = valueReduced.substring(
                                baseTag.length,
                            );
                        }

                        return { href: `#${value}`, text: `#${valueReduced}` };
                    }),
            );
        });
    }
}
