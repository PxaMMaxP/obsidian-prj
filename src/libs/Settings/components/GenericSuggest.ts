import { AbstractInputSuggest, App } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { TSinjex } from 'ts-injex';
import { Register } from 'ts-injex';
import type {
    GetSuggestionsCallback,
    IGenericSuggest,
    IGenericSuggest_,
    RenderSuggestionCallback,
    SelectCallback,
} from './interfaces/IGenericSuggest';

/**
 * A generic class for multi-suggest inputs.
 * @template T - The type of the content to be suggested.
 * @example
 * ```
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
 * ```
 */
@ImplementsStatic<IGenericSuggest_<unknown>>()
@Register('IGenericSuggest_')
export class GenericSuggest<T>
    extends AbstractInputSuggest<T>
    implements IGenericSuggest<T>
{
    private readonly _onSelect: SelectCallback<T>;

    private readonly _getSuggestions: GetSuggestionsCallback<T>;

    /**
     * Default callback to try render suggestions.
     * @param suggestion The suggestion to render.
     * @param el The HTML element in which the suggestion should be rendered.
     * @throws Error if the suggestion type is not string compatible.
     */
    private readonly _renderedSuggestions: RenderSuggestionCallback<T> = (
        suggestion: T,
        el,
    ) => {
        if (suggestion != null && typeof suggestion === 'string')
            el.setText(suggestion);
        else if (suggestion?.toString != null && typeof suggestion === 'object')
            el.setText(suggestion.toString());
        else throw new Error('Invalid suggestion type');
    };

    /**
     * The container element for the suggestions.
     */
    get suggestContainerEl(): HTMLElement {
        return (this as this & { suggestEl: HTMLElement }).suggestEl;
    }

    public readonly inputEl: HTMLInputElement;

    /**
     * Creates a new instance of GenericSuggest.
     * @param inputEl The input element to bind the suggestions to.
     * @param onSelect The callback to be called when a suggestion is selected.
     * @param getSuggestions The callback to retrieve suggestions based on the input string.
     * @param renderSuggestion The callback to render suggestions.
     */
    constructor(
        inputEl: HTMLInputElement,
        onSelect: SelectCallback<T>,
        getSuggestions: GetSuggestionsCallback<T>,
        renderSuggestion?: RenderSuggestionCallback<T>,
    ) {
        const app = TSinjex.getInstance().resolve<App>('IApp');
        super(app, inputEl);

        this.inputEl = inputEl;

        this._onSelect = onSelect;
        this._getSuggestions = getSuggestions;

        this._renderedSuggestions =
            renderSuggestion ?? this._renderedSuggestions;
    }

    /**
     * Retrieves suggestions based on the input string.
     * @param inputStr - The input string to retrieve suggestions for.
     * @returns A list of suggestions.
     */
    getSuggestions(inputStr: string): T[] {
        return this._getSuggestions(inputStr);
    }

    /**
     * Renders a suggestion.
     * @param suggestion - The suggestion to render.
     * @param el - The HTML element in which the suggestion should be rendered.
     */
    renderSuggestion(suggestion: T, el: HTMLElement): void {
        this._renderedSuggestions(suggestion, el);
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
        this._onSelect(suggestion, this.inputEl);
    }
}
