import { Component } from 'obsidian';
import { Implements_ } from 'src/classes/decorators/Implements';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Inject, Register } from 'ts-injex';
import {
    IDisplay,
    IDisplayFieldElements,
    IDisplayFieldSettings,
    IDisplayFluentApi,
} from './interfaces/IDisplayField';
import { ISettingColumn_ } from './interfaces/ISettingColumn';
import { SettingColumn } from './SettingColumn';
import {
    AddDelegate,
    CreateEntryDelegate,
    GetEntriesDelegate,
    NewListDelegate,
    RemoveDelegate,
} from './types/DisplayField';
import type { SettingColumnConfigurator } from './types/General';
import { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a display field.
 */
@Register('SettingFields.display')
@Implements_<ISettingColumn_<typeof DisplayField>>()
export class DisplayField<EntryType, ListType>
    extends SettingColumn<
        IDisplayFluentApi<EntryType, ListType>,
        IDisplayFieldElements,
        IDisplayFieldSettings<EntryType, ListType>
    >
    implements
        IDisplay<EntryType, ListType>,
        IDisplayFluentApi<EntryType, ListType>
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('Display'), false)
    protected _logger?: ILogger;

    protected _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        parent: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        parent.appendChildEl('div', (listContainer) => {
            listContainer.set({
                El: (el) => (this.elements.listContainerEl = el),
                Classes: this._settings.classes,
            });
        });
    };

    /**
     * @inheritdoc
     */
    public get entries(): ListType | undefined {
        return this._settings.list;
    }

    /**
     * Creates a new display field.
     * @param parentSettingItem The setting item that the display field belongs to.
     * @param configurator The function that configures the display field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected & Component,
        configurator?: SettingColumnConfigurator<
            IDisplayFluentApi<EntryType, ListType>
        >,
    ) {
        super(
            parentSettingItem,
            configurator,
            {
                addDelegate: undefined,
                createEntryDelegate: undefined,
                defaultEntries: undefined,
                newListDelegate: undefined,
                removeDelegate: undefined,
                classes: [],
            },
            // Replace the default parent element (input) with the display element.
            { parentEl: parentSettingItem.displayEl },
        );
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        super.onload();

        this._settings.list = this._settings.newListDelegate?.();

        if (this._settings.list != null)
            this._settings.defaultEntries?.().forEach((entry) => {
                this.addEntry(entry);
            });
    }

    /**
     * @inheritdoc
     */
    public addEntry(entryToAdd: EntryType): boolean {
        if (this._settings.list != null && this._settings.addDelegate != null) {
            try {
                const isAdded = this._settings.addDelegate(
                    this._settings.list,
                    entryToAdd,
                );

                if (isAdded) {
                    this.addListEntryEl(entryToAdd);
                }

                return isAdded;
            } catch (error) {
                this._logger?.error(
                    `An error occurred while adding the entry: ${error}`,
                );
                this.unload();
            }
        }

        return false;
    }

    /**
     * Add a list entry element in the display.
     * @param entryToAdd The entry to add to the list.
     */
    private addListEntryEl(entryToAdd: EntryType): void {
        const el = this._settings.createEntryDelegate?.(entryToAdd);

        if (el == null) return;

        this.registerDomEvent(el, 'click', this.onClickRemote(entryToAdd));

        this.elements.listContainerEl?.appendChild(el);
    }

    /**
     * Returns a click event handler that removes the entry from
     * the display container and the list.
     * @param entryToAdd The entry to remove from the list.
     * @returns The click event handler.
     */
    private onClickRemote(
        entryToAdd: EntryType,
    ): (this: HTMLElement, event: MouseEvent) => void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _ctx = this;

        return function (this: HTMLElement, event: MouseEvent) {
            event.preventDefault();
            this.remove();
            _ctx.removeEntry(entryToAdd);
        };
    }

    /**
     * @inheritdoc
     */
    public removeEntry(entryToRemove: EntryType): boolean {
        if (
            this._settings.list != null &&
            this._settings.removeDelegate != null
        ) {
            try {
                const isRemoved = this._settings.removeDelegate(
                    this._settings.list,
                    entryToRemove,
                );

                return isRemoved;
            } catch (error) {
                this._logger?.error(
                    `An error occurred while removing the entry: ${error}`,
                );
                this.unload();
            }
        }

        return false;
    }

    //#region Fluent API

    /**
     * @inheritdoc
     */
    public setList(
        newListDelegate: NewListDelegate<ListType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._settings.newListDelegate = newListDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setListClasses(
        classes: string[],
    ): IDisplayFluentApi<EntryType, ListType> {
        this._settings.classes = classes;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setAddDelegate(
        addDelegate: AddDelegate<EntryType, ListType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._settings.addDelegate = addDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setCreateEntryDelegate(
        createEntryDelegate: CreateEntryDelegate<EntryType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._settings.createEntryDelegate = createEntryDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setRemoveDelegate(
        removeDelegate: RemoveDelegate<EntryType, ListType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._settings.removeDelegate = removeDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDefaultEntries(
        entriesDelegate: GetEntriesDelegate<EntryType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._settings.defaultEntries = entriesDelegate;

        return this;
    }

    //#endregion Fluent API
}
