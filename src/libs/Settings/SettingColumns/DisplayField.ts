import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import {
    AddDelegate,
    CreateEntryDelegate,
    IDisplayEntry,
    IDisplayFluentApi,
    entryObject,
    NewListDelegate,
    RemoveDelegate,
    GetEntriesDelegate,
    IDisplay,
} from './interfaces/IDisplayField';
import type {
    ISettingColumn_,
    SettingColumnConfigurator,
} from '../interfaces/ISettingColumn';
import { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a display field.
 */
@Register('SettingFields.display')
@ImplementsStatic<ISettingColumn_<typeof DisplayField>>()
export class DisplayField<EntryType, ListType>
    extends DIComponent
    implements
        IDisplay<EntryType, ListType>,
        IDisplayFluentApi<EntryType, ListType>
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('Display'), false)
    protected _logger?: ILogger;

    private readonly _parentSettingItem: ISettingRowProtected & Component;
    private readonly _configurator?: SettingColumnConfigurator<
        IDisplayFluentApi<EntryType, ListType>
    >;

    @LazzyLoading((context: DisplayField<EntryType, ListType>) => {
        const listContainerEl = document.createElement('div');
        listContainerEl.addClass(...context._classes);

        context._parentSettingItem.displayEl.appendChild(listContainerEl);

        return listContainerEl;
    }, 'Readonly')
    private readonly _listContainerEl?: HTMLElement;

    private _list?: ListType;

    /**
     * @inheritdoc
     */
    public get entries(): ListType | undefined {
        return this._list;
    }

    private _newListDelegate?: NewListDelegate<ListType>;
    private _addDelegate?: AddDelegate<EntryType, ListType>;
    private _removeDelegate?: RemoveDelegate<EntryType, ListType>;
    private _createEntryDelegate?: CreateEntryDelegate<EntryType>;
    private _classes: string[] = [];
    private _defaultEntries?: GetEntriesDelegate<EntryType>;

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
        super();
        this._parentSettingItem = parentSettingItem;
        this._configurator = configurator;
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        this._configurator?.(this);
        this.build();
    }

    /**
     * Build the display.
     */
    private build(): void {
        this._list = this._newListDelegate?.();
        this._listContainerEl;

        if (this._list != null) {
            this._defaultEntries?.().forEach((entry) => {
                this.addEntry(entry);
            });
        }
    }

    /**
     * @inheritdoc
     */
    public addEntry(entryToAdd: EntryType): boolean {
        if (this._list != null && this._addDelegate != null) {
            try {
                const isAdded = this._addDelegate(this._list, entryToAdd);

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
        const el = this._createEntryDelegate?.(
            entryToAdd,
        ) as IDisplayEntry<EntryType>;

        el[entryObject] = entryToAdd;

        this.registerDomEvent(el, 'click', (event) => {
            event.preventDefault();
            el.remove();
            this.removeEntry(entryToAdd);
        });

        this._listContainerEl?.appendChild(el);
    }

    /**
     * @inheritdoc
     */
    public removeEntry(entryToRemove: EntryType): boolean {
        if (this._list != null && this._removeDelegate != null) {
            try {
                const isRemoved = this._removeDelegate(
                    this._list,
                    entryToRemove,
                );

                if (isRemoved) {
                    this.removeListEntryEl(entryToRemove);
                }

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

    /**
     * Remove a list entry element from the display.
     * @param entryToRemove The entry to remove from the list.
     */
    private removeListEntryEl(entryToRemove: EntryType): void {
        const childs = this._listContainerEl?.children;

        if (childs != null) {
            for (let i = 0; i < childs.length; i++) {
                const child = childs[i];

                if (child instanceof HTMLElement) {
                    const listEntry = (child as IDisplayEntry<EntryType>)[
                        entryObject
                    ];

                    if (listEntry === entryToRemove) {
                        this._listContainerEl?.removeChild(child);
                        break;
                    }
                }
            }
        }
    }

    //#region Fluent API

    /**
     * @inheritdoc
     */
    public setList(
        newListDelegate: NewListDelegate<ListType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._newListDelegate = newListDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setListClasses(
        classes: string[],
    ): IDisplayFluentApi<EntryType, ListType> {
        this._classes = classes;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setAddDelegate(
        addDelegate: AddDelegate<EntryType, ListType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._addDelegate = addDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setCreateEntryDelegate(
        createEntryDelegate: CreateEntryDelegate<EntryType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._createEntryDelegate = createEntryDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setRemoveDelegate(
        removeDelegate: RemoveDelegate<EntryType, ListType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._removeDelegate = removeDelegate;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDefaultEntries(
        entriesDelegate: GetEntriesDelegate<EntryType>,
    ): IDisplayFluentApi<EntryType, ListType> {
        this._defaultEntries = entriesDelegate;

        return this;
    }

    //#endregion Fluent API
}
