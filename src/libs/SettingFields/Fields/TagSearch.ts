import createFuzzySearch from '@nozbe/microfuzz';
import { Component } from 'obsidian';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import type { ITag, ITag_ } from 'src/libs/Tags/interfaces/ITag';
import type { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
import { DisplayField } from './DisplayField';
import type {
    GetEntriesDelegate,
    IDisplayFieldFluentAPI,
} from './interfaces/IDisplayField';
import {
    ITagSearchFluentAPI,
    ITagSearchInternal,
} from './interfaces/ITagSearch';
import type {
    IGenericSuggest_,
    GetSuggestionsCallback,
    IGenericSuggest,
} from '../Components/interfaces/IGenericSuggest';
import type {
    ISettingField_,
    SettingFieldConfigurator,
} from '../interfaces/ISettingField';
import type { IInternalSettingItem } from '../interfaces/SettingItem';

/**
 * Represents a tag search field.
 */
@Register('SettingFields.tagsearch')
export class TagSearch extends DIComponent implements ITagSearchInternal {
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    private readonly _logger?: ILogger;
    @Inject('SettingFields.display')
    private readonly _IDisplayField_!: ISettingField_<typeof DisplayField>;
    @Inject('IGenericSuggest_')
    private readonly _IGenericSuggest_!: IGenericSuggest_<string>;
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('ITags_')
    protected readonly _ITags_!: ITags_;
    @Inject('ITag_')
    protected readonly _ITag_!: ITag_;

    public readonly parentSettingItem: IInternalSettingItem & Component;
    private _displayField?: IDisplayFieldFluentAPI<ITag, ITags>;
    private _suggester?: IGenericSuggest<unknown>;
    private readonly _configurator?: SettingFieldConfigurator<ITagSearchFluentAPI>;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: TagSearch) => {
        const searchContainerEl = document.createElement('div');
        searchContainerEl.addClass('search-input-container');
        ctx.parentSettingItem.inputEl.appendChild(searchContainerEl);

        return searchContainerEl;
    }, 'Readonly')
    public readonly searchContainerEl: HTMLInputElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: TagSearch) => {
        const inputEl = document.createElement('input');
        inputEl.type = 'search';
        inputEl.enterKeyHint = 'search';
        inputEl.spellcheck = false;
        inputEl.placeholder = ctx._placeholder;
        ctx.searchContainerEl.prepend(inputEl);

        return inputEl;
    }, 'Readonly')
    public readonly inputEl: HTMLInputElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: TagSearch) => {
        const clearButtonEl = document.createElement('div');
        clearButtonEl.addClass('search-input-clear-button');
        ctx.searchContainerEl.appendChild(clearButtonEl);

        ctx.registerDomEvent(clearButtonEl, 'click', () => {
            ctx.inputEl.value = '';
            ctx.inputEl.focus();
        });

        return clearButtonEl;
    }, 'Readonly')
    private readonly _clearButtonEl: HTMLDivElement;

    private _placeholder = '';
    private _list?: ITags;

    /**
     * @inheritdoc
     */
    public get list(): ITags | undefined {
        return this._list;
    }

    private _defaultEntries: GetEntriesDelegate<ITag> = () => [];

    private _getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * Creates a new input field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator The function that configures the input field.
     */
    constructor(
        parentSettingItem: IInternalSettingItem,
        configurator?: SettingFieldConfigurator<ITagSearchFluentAPI>,
    ) {
        super();

        this.parentSettingItem = parentSettingItem;

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
        this._displayField = new this._IDisplayField_(
            this.parentSettingItem,
            (field) => {
                field
                    .setList(() => {
                        if (this._list == null) {
                            return new this._ITags_(undefined);
                        } else {
                            return this._list;
                        }
                    })
                    .setListClasses(['custom-form', 'tag-list'])
                    .setDefaultEntries(this._defaultEntries)
                    .setAddDelegate((list: ITags, tag: ITag) => {
                        return list.add(tag);
                    })
                    .setRemoveDelegate((list: ITags, tag: ITag) => {
                        return list.remove(tag);
                    })
                    .setCreateEntryDelegate((entry: ITag) => {
                        return entry.getObsidianLink();
                    });
            },
        ) as IDisplayFieldFluentAPI<ITag, ITags>;

        this.addChild(this._displayField);

        this.searchContainerEl;
        this.inputEl;
        this._clearButtonEl;

        this.buildSuggester();
    }

    /**
     * Builds the suggester for the input field.
     */
    private buildSuggester(): void {
        if (this._getSuggestionsCallback != null) {
            this._suggester = new this._IGenericSuggest_(
                this.inputEl,
                (value: string) => {
                    const tag = new this._ITag_(value);
                    this._displayField?.addEntry(tag);
                },
                (input: string) => {
                    const suggestions = this._getSuggestionsCallback?.(input);

                    if (suggestions == null) {
                        this._logger?.warn('The suggestions are null.');

                        return [];
                    }

                    const items = suggestions.map((suggestion) => ({
                        value: suggestion,
                    }));

                    const fuzzySearch = createFuzzySearch(items, {
                        getText: (item) => [item.value],
                    });

                    const results = fuzzySearch(input);

                    const filteredItems = results.map(
                        (result) => result.item.value,
                    );

                    return filteredItems;
                },
            );

            this._suggester.suggestContainerEl?.classList.add(
                this.parentSettingItem?.parentModal?.draggableClassName || '',
            );
        }
    }

    /**
     * @inheritdoc
     */
    public setPlaceholder(placeholder: string): ITagSearchFluentAPI {
        this._placeholder = placeholder;

        return this;
    }

    /**
     * @inheritdoc
     */
    public addSuggestion(
        getSuggestionsCb: GetSuggestionsCallback<string>,
    ): ITagSearchFluentAPI {
        this._getSuggestionsCallback = getSuggestionsCb;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setList(list: ITags): ITagSearchFluentAPI {
        this._list = list;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDefaultEntries(
        defaultEntries: GetEntriesDelegate<ITag>,
    ): ITagSearchFluentAPI {
        this._defaultEntries = defaultEntries;

        return this;
    }
}
