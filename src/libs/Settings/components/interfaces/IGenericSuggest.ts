/* eslint-disable @typescript-eslint/no-empty-interface */

import { AbstractInputSuggest } from 'obsidian';

/**
 * Static interface for the `GenericSuggest` class.
 */
export interface IGenericSuggest_<T> {
    /**
     * Creates a new instance of GenericSuggest.
     * @param inputEl The input element to bind the suggestions to.
     * @param onSelect The callback to be called when a suggestion is selected.
     * @param getSuggestions The callback to retrieve suggestions based on the input string.
     * @param renderSuggestion The callback to render suggestions.
     */
    new (
        inputEl: HTMLInputElement,
        onSelect: SelectCallback<T>,
        getSuggestions: GetSuggestionsCallback<T>,
        renderSuggestion?: RenderSuggestionCallback<T>,
    ): IGenericSuggest<T>;
}

/**
 * Static interface for the `GenericSuggest` class.
 */
export interface IGenericSuggest<T> extends AbstractInputSuggest<T> {
    /**
     * The input element on which the suggestions are bound.
     */
    get inputEl(): HTMLInputElement;

    /**
     * The container element for the suggestions.
     */
    get suggestContainerEl(): HTMLElement;
}

/**
 * A generic delegate type for the selection callback.
 * @template T - The type of the selected value.
 * @param value - The selected value.
 * @example
 * ```
 * const onSelect: SelectCallback<string> = (el, value) => {
 *     console.log('Selected:', value);
 *     // Attach the selected value to the input element.
 *    el.value = value;
 * };
 * ```
 */
export type SelectCallback<T> = (value: T, el: HTMLInputElement) => void;

/**
 * A generic delegate type for retrieving suggestions.
 * @template T The type of the suggestions.
 * @param inputStr The input string to retrieve suggestions for.
 * @returns A list of suggestions.
 * @example
 * ```
 * const getSuggestions: GetSuggestionsCallback<string> = (inputStr) => {
 *     const lowerCaseInputStr = inputStr.toLocaleLowerCase();
 *     return [...content].filter((item) =>
 *         item.toLocaleLowerCase().includes(lowerCaseInputStr)
 *     );
 * };
 * ```
 */
export type GetSuggestionsCallback<T> = (inputStr: string) => T[];

/**
 * A generic delegate type for rendering suggestions.
 * @template T - The type of the suggestion.
 * @param suggestion - The suggestion to render.
 * @param el - The HTML element in which the suggestion should be rendered.
 * @example
 * ```
 * const renderSuggestion: RenderSuggestionCallback<string> = (suggestion, el) => {
 *     el.setText(suggestion);
 * };
 * ```
 */
export type RenderSuggestionCallback<T> = (
    suggestion: T,
    el: HTMLElement,
) => void;
