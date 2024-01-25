import { Component } from 'obsidian';
import Lng from 'src/classes/Lng';
import Logging from 'src/classes/Logging';

/**
 * Search input component class for `TableBlockRenderComponent`.
 *
 * This class provides methods to create and manage a search input component.
 * It includes functionality for setting up the search box and handling input events.
 *
 * @see {@link create} for details about creating a search input component.
 * @see {@link SearchCallback} for details about the search callback.
 */
export default class SearchInput {
    /**
     * Creates a new search input component.
     * @param component The component to register the events to.
     * @param onSearch The callback to call when the search box value changes. Passes the search box value and the key that was pressed.
     * @returns The created search input component as `DocumentFragment`.
     * @remarks - The search input component consists of a label, an input sizer and a search box.
     * - CSS classes:
     *  - `filter-search` - The container of the search input component.
     *  - `filter-text` - The label of the search input component.
     *  - `search-box-sizer` - The sizer of the search input component.
     *  - `search-box` - The search box of the search input component.
     */
    public static create(
        component: Component,
        onSearch: SearchCallback,
        defaultText?: string,
    ): DocumentFragment {
        const logger = Logging.getLogger('SearchInput');
        const headerItemContainer = document.createDocumentFragment();

        const searchLabelContainer = document.createElement('div');
        headerItemContainer.appendChild(searchLabelContainer);
        searchLabelContainer.classList.add('filter-search');

        SearchInput.createSearchLabel(searchLabelContainer);

        const searchBoxSizer =
            SearchInput.createSearchBoxSizer(searchLabelContainer);
        const searchBoxInput = SearchInput.createSearchBoxInput(searchBoxSizer);

        if (defaultText) {
            this.setSearchBoxSizerValue(searchBoxSizer, defaultText);
            this.setSearchBoxInputValue(searchBoxInput, defaultText);
        }

        /**
         * Register input event to set the search box sizer value.
         */
        component.registerDomEvent(
            searchBoxInput,
            'input',
            async (event: InputEvent) => {
                this.setSearchBoxSizerValue(
                    searchBoxSizer,
                    searchBoxInput.value,
                );
            },
        );

        /**
         * Register keydown event to call the search callback.
         * @remarks - The return value of the callback is used to set the search box value and the search box sizer value.
         */
        component.registerDomEvent(
            searchBoxInput,
            'keydown',
            async (event: KeyboardEvent) => {
                let value = searchBoxInput.value;

                try {
                    value = await onSearch(searchBoxInput.value, event.key);
                } catch (error) {
                    logger.error(
                        'The `onSearch` callback threw an error!',
                        error,
                    );
                } finally {
                    this.setSearchBoxSizerValue(searchBoxSizer, value);
                    this.setSearchBoxInputValue(searchBoxInput, value);
                }
            },
        );

        return headerItemContainer;
    }

    /**
     * Creates the search label.
     * @param searchLabelContainer The container to append the label to.
     * @remarks - The label is a `HTMLSpanElement`.
     * - The label text is `Search`-value of the translation.
     * - The label element has the class `filter-text`.
     */
    private static createSearchLabel(searchLabelContainer: HTMLDivElement) {
        const filterLabel = document.createElement('span');
        searchLabelContainer.appendChild(filterLabel);
        filterLabel.classList.add('filter-text');
        filterLabel.textContent = Lng.gt('Search') + ':';
    }

    /**
     * Creates the search box sizer.
     * @param searchLabelContainer The container to append the sizer to.
     * @returns The created search box sizer.
     * @remarks - The sizer is a `HTMLLabelElement`.
     * - The sizer has the class `search-box-sizer`.
     */
    private static createSearchBoxSizer(searchLabelContainer: HTMLDivElement) {
        const searchBoxSizer = document.createElement('label');
        searchLabelContainer.appendChild(searchBoxSizer);
        searchBoxSizer.classList.add('search-box-sizer');

        return searchBoxSizer;
    }

    /**
     * Creates the search box input.
     * @param searchBoxSizer The container to append the input to.
     * @returns The created search box input.
     * @remarks - The input is a `HTMLInputElement`.
     * - The input type is `text`.
     * - The input placeholder is `Search`-value of the translation.
     * - The input element has the class `search-box`.
     */
    private static createSearchBoxInput(searchBoxSizer: HTMLLabelElement) {
        const searchBoxInput = document.createElement('input');
        searchBoxSizer.appendChild(searchBoxInput);
        searchBoxInput.classList.add('search-box');
        searchBoxInput.type = 'text';
        searchBoxInput.placeholder = Lng.gt('Search');
        searchBoxInput.value = '';

        return searchBoxInput;
    }

    /**
     * Sets the search box sizer value.
     * @param searchBoxSizer The search box sizer to set the value to.
     * @param value The value to set.
     */
    private static setSearchBoxSizerValue(
        searchBoxSizer: HTMLElement,
        value: string,
    ) {
        searchBoxSizer.dataset.value = '_' + value + '_';
    }

    /**
     * Sets the search box input value.
     * @param searchBoxInput The search box input to set the value to.
     * @param value The value to set.
     */
    private static setSearchBoxInputValue(
        searchBoxInput: HTMLInputElement,
        value: string,
    ) {
        searchBoxInput.value = value;
    }
}

/**
 * The search callback.
 * @param searchboxValue The value of the search box.
 * @param eventKey The key that was pressed.
 * @returns The value to set to the search box and the search box sizer.
 * @remarks - Use the `eventKey` to determine which key was pressed.
 * - Start search on `Enter` key.
 * - Clear search on `Escape` key.
 */
type SearchCallback = (
    searchboxValue: string,
    eventKey: string,
) => Promise<string>;
