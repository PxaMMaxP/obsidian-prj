import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
    ISettingColumnSettings,
} from './ISettingColumn';
import { GetSuggestionsCallback } from '../../components/interfaces/IGenericSuggest';
import { GetEntriesDelegate } from '../types/DisplayField';

/**
 * Instance interface for the tag search field.
 * @see {@link ITagSearchProtected}
 * @see {@link ITagSearchFluentAPI}
 * @see {@link ITagSearchSettings}
 * @see {@link ITagSearchElements}
 */
export interface ITagSearch extends IDIComponent, ISettingColumn {
    /**
     * The list of tags which are displayed in the tag search.
     */
    get list(): ITags | undefined;
}

/**
 * Protected interface for the tag search field.
 */
export type ITagSearchProtected<
    ElementsType extends ISettingColumnElements = ITagSearchElements,
> = ISettingColumnProtected<ElementsType>;

/**
 * Fluent Api for the tag search field.
 */
export interface ITagSearchFluentAPI
    extends ISettingColumnFluentApi<ITagSearchFluentAPI> {
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

/**
 * Settings for the tag search field.
 */
export interface ITagSearchSettings extends ISettingColumnSettings {
    placeholder?: string;
    getSuggestionsCallback?: GetSuggestionsCallback<string>;
    list?: ITags;
    defaultEntries?: GetEntriesDelegate<ITag>;
}

/**
 * Public elements of the tag search field.
 */
export interface ITagSearchElements extends ISettingColumnElements {
    searchContainerEl: HTMLDivElement;
    inputEl: HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _clearButtonEl: HTMLDivElement;
}
