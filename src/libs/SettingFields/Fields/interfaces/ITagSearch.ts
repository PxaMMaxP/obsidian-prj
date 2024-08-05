/* eslint-disable @typescript-eslint/no-empty-interface */
import { Component } from 'obsidian';
import { GetSuggestionsCallback } from 'src/libs/Modals/Components/GenericSuggest';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import { GetEntriesDelegate } from './IDisplayField';

/**
 * The internal tag search interface.
 * @see {@link ITagSearch}
 */
export interface ITagSearchInternal extends ITagSearchFluentAPI {
    /**
     * The parent setting item.
     */
    get parentSettingItem(): Component;

    /**
     * The search container element.
     */
    get searchContainerEl(): HTMLInputElement;

    /**
     * The input field element.
     */
    get inputEl(): HTMLInputElement | HTMLTextAreaElement;
}

/**
 * Represents a tag search field.
 * @see {@link ITagSearchInternal}
 * @see {@link ITagSearchFluentAPI}
 */
export interface ITagSearch extends Component {
    /**
     * The list of tags which are displayed in the tag search.
     */
    get list(): ITags | undefined;
    /**
     * Loads the tag search.
     */
    onload(): void;
}

/**
 * The fluent API for the tag search field.
 * @see {@link ITagSearch}
 */
export interface ITagSearchFluentAPI extends ITagSearch {
    /**
     * Sets the placeholder of the tag search.
     * @param placeholder The placeholder of the tag search.
     * @returns The tag search fluent API.
     */
    setPlaceholder(placeholder: string): ITagSearchFluentAPI;

    /**
     * Adds a suggestion to the tag search.
     * @param getSuggestionsCb The callback that gets the suggestions.
     * @returns The tag search fluent API.
     */
    addSuggestion(
        getSuggestionsCb: GetSuggestionsCallback<string>,
    ): ITagSearchFluentAPI;

    /**
     * Sets the list of tags.
     * @param list The list of tags.
     */
    setList(list: ITags): ITagSearchFluentAPI;

    /**
     * Sets the default entries of the tag display
     * @param defaultEntries The default entries of the tag display.
     * @returns The tag display fluent API.
     */
    setDefaultEntries(
        defaultEntries: GetEntriesDelegate<ITag>,
    ): ITagSearchFluentAPI;
}
