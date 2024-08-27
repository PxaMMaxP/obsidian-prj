import createFuzzySearch from '@nozbe/microfuzz';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { onEvent } from 'src/libs/DIComponent';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import type { ITag, ITag_ } from 'src/libs/Tags/interfaces/ITag';
import type { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import { DisplayField } from './DisplayField';
import type { IDisplay, IDisplayFluentApi } from './interfaces/IDisplayField';
import type { ISettingColumn_ } from './interfaces/ISettingColumn';
import {
    ITagSearch,
    ITagSearchElements,
    ITagSearchFluentAPI,
    ITagSearchProtected,
    ITagSearchSettings,
} from './interfaces/ITagSearch';
import { SettingColumn } from './SettingColumn';
import type { GetEntriesDelegate } from './types/DisplayField';
import type { SettingColumnConfigurator } from './types/General';
import type {
    IGenericSuggest,
    GetSuggestionsCallback,
} from '../components/interfaces/IGenericSuggest';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a tag search field.
 */
@Register('SettingFields.tagsearch')
export class TagSearch
    extends SettingColumn<
        ITagSearchFluentAPI,
        ITagSearchElements,
        ITagSearchSettings,
        ITagSearchProtected
    >
    implements ITagSearch, ITagSearchProtected, ITagSearchFluentAPI
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    private readonly _logger?: ILogger;
    @Inject('SettingFields.display')
    private readonly __IDisplayField!: ISettingColumn_<typeof DisplayField>;
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('ITags_')
    protected readonly _ITags_!: ITags_;
    @Inject('ITag_')
    protected readonly _ITag_!: ITag_;

    protected _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        parent: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        parent.appendChildEl('div', (searchContainer) => {
            searchContainer
                .set({
                    El: (el) => (this.elements.searchContainerEl = el),
                    Classes: ['search-input-container'],
                })
                .appendChildEl('input', (inputEl) => {
                    inputEl
                        .set({
                            El: (el) => (this.elements.inputEl = el),
                            type: 'search',
                            enterKeyHint: 'search',
                            spellcheck: false,
                            placeholder: this._settings.placeholder,
                        })
                        .then((_ctx, el) => {
                            this.buildDisplayField();
                            this.buildSuggester(el);
                        })
                        .appendChildEl('div', (clearButton) => {
                            clearButton.set({
                                El: (el) => (this.elements._clearButtonEl = el),
                                Classes: ['search-input-clear-button'],
                                Events: [
                                    [
                                        'click',
                                        () => {
                                            this.elements.inputEl.value = '';
                                            this.elements.inputEl.focus();
                                        },
                                    ],
                                ],
                            });
                        });
                });
        });
    };

    get list(): ITags | undefined {
        throw new Error('Method not implemented.');
    }

    private _displayField?: IDisplay<ITag, ITags> &
        IDisplayFluentApi<ITag, ITags>;
    private _suggester?: IGenericSuggest<unknown>;

    /**
     * Creates a new input field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator The function that configures the input field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<ITagSearchFluentAPI>,
    ) {
        super(parentSettingItem, configurator, {
            placeholder: '',
            getSuggestionsCallback: undefined,
            list: undefined,
            defaultEntries: undefined,
        });
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        super.onload();

        /**
         * Adds the common window classes to the suggester container.
         */
        this[onEvent]('common-window-classes', (classes: string[]) => {
            this._suggester?.suggestContainerEl?.classList.add(...classes);
        });
    }

    /**
     * Build the display.
     */
    private buildDisplayField(): void {
        this._displayField = new this.__IDisplayField(
            this.parentSettingItem,
            (field) => {
                field
                    .setList(() => {
                        if (this._settings.list == null) {
                            this._settings.list = new this._ITags_(undefined);

                            return this._settings.list;
                        } else {
                            return this._settings.list;
                        }
                    })
                    .setListClasses(['custom-form', 'tag-list'])
                    .setDefaultEntries(
                        this._settings.defaultEntries ?? (() => []),
                    )
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
        ) as IDisplay<ITag, ITags> & IDisplayFluentApi<ITag, ITags>;

        this.addChild(this._displayField);
    }

    /**
     * Builds the suggester for the input field.
     * @param inputEl The input element.
     */
    private buildSuggester(inputEl: HTMLInputElement): void {
        if (this._settings.getSuggestionsCallback == null) {
            return;
        }

        this._suggester = new this.__IGenericSuggest(
            inputEl,
            (value: string) => {
                const tag = new this._ITag_(value);
                this._displayField?.addEntry(tag);
            },
            (input: string) => {
                const suggestions =
                    this._settings.getSuggestionsCallback?.(input);

                if (suggestions == null) {
                    this.__logger?.debug('The suggestions are null.');

                    return [];
                }

                return createFuzzySearch(
                    suggestions.map((value) => ({ value })),
                    { getText: (item) => [item.value] },
                )(input).map((result) => result.item.value);
            },
        );
    }

    /**
     * @inheritdoc
     */
    public setPlaceholder(placeholder: string): ITagSearchFluentAPI {
        this._settings.placeholder = placeholder;

        return this;
    }

    /**
     * @inheritdoc
     */
    public addSuggestion(
        getSuggestionsCb: GetSuggestionsCallback<string>,
    ): ITagSearchFluentAPI {
        this._settings.getSuggestionsCallback = getSuggestionsCb;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setList(list: ITags): ITagSearchFluentAPI {
        this._settings.list = list;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDefaultEntries(
        defaultEntries: GetEntriesDelegate<ITag>,
    ): ITagSearchFluentAPI {
        this._settings.defaultEntries = defaultEntries;

        return this;
    }
}
