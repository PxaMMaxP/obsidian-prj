import { AbstractInputSuggest, App } from 'obsidian';

/**
 * A generic delegate type for the selection callback.
 * @template T - The type of the selected value.
 * @param value - The selected value.
 * @example
 * const onSelect: SelectCallback<string> = (value) => {
 *     console.log('Selected:', value);
 * };
 */
export type SelectCallback<T> = (value: T) => void;

/**
 * A generic delegate type for rendering suggestions.
 * @template T - The type of the suggestion.
 * @param suggestion - The suggestion to render.
 * @param el - The HTML element in which the suggestion should be rendered.
 * @example
 * const renderSuggestion: RenderSuggestionCallback<string> = (suggestion, el) => {
 *     el.setText(suggestion);
 * };
 */
export type RenderSuggestionCallback<T> = (
    suggestion: T,
    el: HTMLElement,
) => void;

/**
 * A generic delegate type for retrieving suggestions.
 * @template T - The type of the suggestions.
 * @param inputStr - The input string to retrieve suggestions for.
 * @returns A list of suggestions.
 * @example
 * const getSuggestions: GetSuggestionsCallback<string> = (inputStr) => {
 *     const lowerCaseInputStr = inputStr.toLocaleLowerCase();
 *     return [...content].filter((item) =>
 *         item.toLocaleLowerCase().includes(lowerCaseInputStr)
 *     );
 * };
 */
export type GetSuggestionsCallback<T> = (inputStr: string) => T[];

/**
 * A generic class for multi-suggest inputs.
 * @template T - The type of the content to be suggested.
 * @example
 * const inputElement = document.querySelector('input');
 * const content = new Set(['Option 1', 'Option 2', 'Option 3']);
 *
 * const onSelect: SelectCallback<string> = (value) => {
 *     console.log('Selected:', value);
 * };
 *
 * const getSuggestions: GetSuggestionsCallback<string> = (inputStr) => {
 *     const lowerCaseInputStr = inputStr.toLocaleLowerCase();
 *     return [...content].filter((item) =>
 *         item.toLocaleLowerCase().includes(lowerCaseInputStr)
 *     );
 * };
 *
 * const renderSuggestion: RenderSuggestionCallback<string> = (suggestion, el) => {
 *     el.setText(suggestion);
 * };
 *
 * const app = new App(); // Assuming an App instance exists
 *
 * const genericSuggest = new GenericSuggest<string>(
 *     inputElement,
 *     content,
 *     onSelect,
 *     getSuggestions,
 *     renderSuggestion,
 *     app
 * );
 */
export class GenericSuggest<T> extends AbstractInputSuggest<T> {
    private readonly _content: Set<T>;

    /**
     * The container element for the suggestions.
     */
    get suggestContainer(): HTMLElement {
        return (this as this & { suggestEl: HTMLElement }).suggestEl;
    }

    /**
     * Creates a new instance of GenericSuggest.
     * @param inputEl - The input element to bind the suggestions to.
     * @param content - The set of content to be suggested.
     * @param onSelectCb - The callback to be called when a suggestion is selected.
     * @param getSuggestionsCb - The callback to retrieve suggestions based on the input string.
     * @param renderSuggestionCb - The callback to render suggestions.
     * @param app - The Obsidian app instance.
     */
    constructor(
        private readonly inputEl: HTMLInputElement,
        content: Set<T>,
        private readonly onSelectCb: SelectCallback<T>,
        private readonly getSuggestionsCb: GetSuggestionsCallback<T>,
        private readonly renderSuggestionCb: RenderSuggestionCallback<T>,
        app: App,
    ) {
        super(app, inputEl);
        this._content = content;
    }

    /**
     * Retrieves suggestions based on the input string.
     * @param inputStr - The input string to retrieve suggestions for.
     * @returns A list of suggestions.
     */
    getSuggestions(inputStr: string): T[] {
        return this.getSuggestionsCb(inputStr);
    }

    /**
     * Renders a suggestion.
     * @param suggestion - The suggestion to render.
     * @param el - The HTML element in which the suggestion should be rendered.
     */
    renderSuggestion(suggestion: T, el: HTMLElement): void {
        this.renderSuggestionCb(suggestion, el);
    }

    /**
     * Selects a suggestion.
     * @param suggestion - The selected suggestion.
     * @param evt - The event that triggered the selection.
     */
    selectSuggestion(suggestion: T, evt: MouseEvent | KeyboardEvent): void {
        this.inputEl.value = '';
        this.inputEl.blur();
        this.close();
        this.onSelectCb(suggestion);
    }
}
