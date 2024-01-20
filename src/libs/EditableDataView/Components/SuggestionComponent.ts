import { Component, MarkdownRenderChild } from 'obsidian';

/**
 * A suggestion.
 */
export interface Suggestion {
    value: string;
    label: string;
}

/**
 * A list of suggestions.
 */
export type Suggestions = Suggestion[];

/**
 * A cursor position.
 * @remarks - The cursor position can be a number, 'start' or 'end'.
 * @see {@link SuggestionComponent.getCursorPositionNumber}
 */
type CursorPosition = number | 'start' | 'end';

/**
 * A child for the suggestor.
 * @remarks - This child is used to register the events for the suggestor.
 * - After the suggestor is unloaded, the events are unregistered.
 */
export class SuggestorChild extends MarkdownRenderChild {
    constructor(container: HTMLElement) {
        super(container);
    }

    override onunload(): void {
        super.onunload();
    }
}

export default class SuggestionComponent {
    private _component: Component;
    private _suggester: ((value: string) => Suggestions) | undefined;

    private suggestionsContainer: HTMLSpanElement;
    private _inputElement: HTMLElement;

    private _suggestions: Suggestions;
    private _activeSuggestions: Suggestions;
    private _suggestorChild: SuggestorChild | undefined;
    private _suggestionIndex = 0;
    private _scrollMode: boolean;

    /**
     * Creates a new instance of the suggestion component.
     * @param inputElement The input element to register the suggestor to.
     * @param component The component to register the suggestor to.
     * @remarks - The input element should have a parent element, on which the suggestions container is appended.
     */
    constructor(inputElement: HTMLElement, component: Component) {
        this._inputElement = inputElement;
        this._component = component;
    }

    /**
     * Sets the suggestions.
     * @param suggestions The suggestions to set.
     * @returns The component itself.
     * @remarks If the suggestions are set, a suggestor is not needed.
     */
    public setSuggestions(suggestions: Suggestions) {
        this._suggestions = suggestions;

        return this;
    }

    /**
     * Sets the suggester.
     * @param suggester The suggester to set.
     * @returns The component itself.
     * @remarks If the suggester is set, the suggestions are not needed and will be ignored.
     */
    public setSuggester(suggester: (value: string) => Suggestions) {
        this._suggester = suggester;

        return this;
    }

    private setSuggestion() {
        let suggestion: Suggestion | undefined;

        if (!this._scrollMode) {
            // If the scroll mode is disabled, the first suggestion is shown.
            // The first suggestion is the suggestion that starts with the text in the input element. (case insensitive)
            suggestion = this._activeSuggestions
                .filter((suggestion) =>
                    suggestion.value
                        .toLowerCase()
                        .startsWith(
                            this._inputElement.textContent?.toLowerCase() ?? '',
                        ),
                )
                .first();
            this._suggestionIndex = 0;
        } else {
            // In scroll mode, the suggestion at the index is displayed. This index can be changed beforehand using the arrow buttons.
            const index = this._suggestionIndex;

            if (index < 0) {
                suggestion = this._activeSuggestions.last();
                this._suggestionIndex = this._activeSuggestions.length - 1;
            } else if (index >= this._activeSuggestions.length) {
                suggestion = this._activeSuggestions.first();
                this._suggestionIndex = 0;
            } else {
                suggestion = this._activeSuggestions[index];
                this._suggestionIndex = index;
            }
        }

        if (suggestion) {
            if (
                suggestion.value
                    .toLowerCase()
                    .startsWith(
                        this._inputElement.textContent?.toLowerCase() ?? '',
                    )
            ) {
                // If the suggestion starts with the text in the input element, the text in the input element is adopted.
                const suggestionText = suggestion.value.slice(
                    this.inputTextLength,
                );
                this.suggestionsContainer.innerText = suggestionText;
            } else {
                // If the suggestion does not start with the text in the input element, the text in the input element is replaced with the suggestion.
                const length = this._inputElement.textContent?.length ?? 1;

                this._inputElement.textContent = suggestion.value.slice(
                    0,
                    length,
                );

                this.suggestionsContainer.innerText =
                    suggestion.value.slice(length);
                this.setInputCursorAbsolutePosition(length);
            }
        }

        if (this._activeSuggestions.length > 0) {
            this.suggestionsContainer.style.display = '';
        } else {
            this.suggestionsContainer.style.display = 'none';
        }
    }

    /**
     * Refreshes the active suggestions.
     */
    private refreshActiveSuggestions() {
        this._activeSuggestions = this._suggester
            ? this._suggester(this._inputElement.textContent ?? '')
            : this._suggestions;
    }

    /**
     * Enables the suggestor.
     * @remarks Run this, if you want to enable the suggestor. (e.g. on enable edit mode)
     * @remarks - The suggestor is a child of the component.
     * - The suggestor is used to display the suggestions.
     * - The suggestor has the css class `suggestions-container`.
     * - The suggestor is loaded and registered to the input element.
     */
    public enableSuggestior() {
        this._suggestorChild = new SuggestorChild(this.suggestionsContainer);
        this._suggestorChild.load();
        this._component.addChild(this._suggestorChild);

        // Set the cursor to the end of the input element.
        this.setInputCursorAbsolutePosition('end');

        this.buildSuggestionsContainer();

        this._suggestorChild.registerDomEvent(
            this._inputElement,
            'input',
            this.onInput.bind(this),
        );

        this._suggestorChild.registerDomEvent(
            this._inputElement,
            'keydown',
            this.onKeydown.bind(this),
        );
    }

    /**
     * Handles the input event for the suggestion component.
     * @remarks Disables the scroll mode, refreshes the active suggestions, and sets the suggestion.
     */
    private onInput() {
        // Disable the scroll mode.
        this._scrollMode = false;

        // Refresh the active suggestions and the shown suggestion.
        this.refreshActiveSuggestions();
        this.setSuggestion();
    }

    /**
     * Handles the keydown event for the suggestion component.
     * @param event The keyboard event.
     * @remarks - The 'ArrowUp' and 'ArrowDown' buttons are used to scroll through the suggestions.
     * - The 'ArrowLeft' and 'ArrowRight' buttons are used to move the cursor in the input element.
     * If the cursor is at the end of the input element, the first character of the suggestions container is adopted.
     * - The 'Tab' button is used to adopt the complete suggestion.
     * - The 'Ctrl' + 'a' button is used to select the text in the input element.
     */
    private onKeydown(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            // If the 'ArrowUp' or 'ArrowDown' button is pressed, the suggestions are scrolled through.
            event.preventDefault();

            this._scrollMode = true;

            if (event.key === 'ArrowUp') {
                this._suggestionIndex++;
            } else if (event.key === 'ArrowDown') {
                this._suggestionIndex--;
            }
            // Refresh the shown suggestion.
            this.setSuggestion();
        } else if (event.key === 'ArrowLeft') {
            // If the 'ArrowLeft' button is pressed, the cursor is moved to the left.
            event.preventDefault();

            this.setInputCursorRelativePosition(-1);

            this.refreshActiveSuggestions();
        } else if (event.key === 'ArrowRight') {
            // If the 'ArrowRight' button is pressed, the cursor is moved to the right.
            event.preventDefault();

            // If the cursor is at the end of the input element, the first character of the suggestions container is adopted.
            this.adoptSuggestionCharacter()
                ? this.setInputCursorAbsolutePosition(this.inputTextLength)
                : this.setInputCursorRelativePosition(1);

            this.refreshActiveSuggestions();
        } else if (event.key === 'Tab') {
            // If the 'Tab' button is pressed, the complete suggestion is adopted.
            event.preventDefault();

            this.adoptSuggestion();
        } else if (event.ctrlKey && event.key === 'a') {
            // If the 'Ctrl' + 'a' button is pressed, the text in the input element is selected.
            event.preventDefault();

            this.selectText(0, 'end');
        }
    }

    /**
     * Adopts the complete suggestion in the suggestions container.
     */
    private adoptSuggestion() {
        this._inputElement.textContent += this.suggestionsContainer.innerText;

        const suggestion = this._activeSuggestions.find((suggestion) =>
            suggestion.value
                .toLowerCase()
                .startsWith(
                    this._inputElement.textContent?.toLowerCase() ?? '',
                ),
        );

        this._inputElement.textContent = suggestion
            ? suggestion.value
            : this._inputElement.textContent;
        this.suggestionsContainer.innerText = '';
        this.setInputCursorAbsolutePosition('end');
    }

    /**
     * Adopts the first character of the suggestions container if the cursor is at the end of the input element.
     * @returns `true` if the character was adopted, otherwise `false`.
     */
    private adoptSuggestionCharacter(): boolean {
        if (this.cursorPosition === this.inputTextLength) {
            this._inputElement.textContent +=
                this.suggestionsContainer.innerText.slice(0, 1);

            this.suggestionsContainer.innerText =
                this.suggestionsContainer.innerText.slice(1);

            return true;
        }

        return false;
    }

    /**
     * Returns the length of the text in the input element.
     */
    private get inputTextLength() {
        return this._inputElement.textContent?.length ?? 0;
    }

    /**
     * Returns the current cursor position in the input element.
     */
    private get cursorPosition() {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const currentRange = selection.getRangeAt(0);

            return currentRange.endOffset;
        }

        return 0;
    }

    /**
     * Sets the cursor position relative to the current cursor position.
     * @param relativPosition Relative position to set the cursor to.
     * @remarks The position is clamped to the length of the input element and minimum 0.
     */
    private setInputCursorRelativePosition(relativPosition: number) {
        this.setInputCursorAbsolutePosition(
            this.cursorPosition + relativPosition,
        );
    }

    /**
     * Sets the cursor position in the input element.
     * @param position Position to set the cursor to.
     * @remarks The position is clamped to the length of the input element.
     */
    private setInputCursorAbsolutePosition(position: CursorPosition) {
        position = this.getCursorPositionNumber(position);

        const selection = window.getSelection();
        const range = document.createRange();

        if (selection && selection.rangeCount > 0) {
            const safePosition = Math.max(
                0,
                Math.min(position, this._inputElement.textContent?.length ?? 0),
            );

            if (this._inputElement.firstChild) {
                range.setStart(this._inputElement.firstChild, safePosition);
                range.setEnd(this._inputElement.firstChild, safePosition);
            }

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * Returns the cursor position as a number.
     * @param position Position to convert. Can be a number, 'start' or 'end'.
     * @returns The cursor position as a number.
     */
    private getCursorPositionNumber(position: CursorPosition): number {
        if (position === 'start') {
            position = 0;
        } else if (position === 'end') {
            position = Number.MAX_SAFE_INTEGER;
        }

        return position;
    }

    /**
     * Selects the text in the input element.
     * @param startPosition Start position of the selection.
     * @param endPosition End position of the selection.
     */
    private selectText(
        startPosition: CursorPosition,
        endPosition: CursorPosition,
    ) {
        startPosition = this.getCursorPositionNumber(startPosition);
        endPosition = this.getCursorPositionNumber(endPosition);

        const selection = window.getSelection();
        const range = document.createRange();

        if (selection && this._inputElement.firstChild) {
            const safeStartPosition = Math.max(
                0,
                Math.min(
                    startPosition,
                    this._inputElement.textContent?.length ?? 0,
                ),
            );

            const safeEndPosition = Math.max(
                0,
                Math.min(
                    endPosition,
                    this._inputElement.textContent?.length ?? 0,
                ),
            );

            range.setStart(this._inputElement.firstChild, safeStartPosition);
            range.setEnd(this._inputElement.firstChild, safeEndPosition);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * Builds the suggestions container.
     * @remarks - The suggestions container is a span element that is appended to the parent of the input element.
     * - The suggestions container is used to display the suggestions.
     * - The suggestions container has a click event listener that sets the cursor to the end of the input element.
     * - The suggestions container has the css classes `editable-data-view` & `suggestions-container`.
     */
    private buildSuggestionsContainer() {
        this.suggestionsContainer = document.createElement('span');

        this.suggestionsContainer.classList.add(
            'editable-data-view',
            'suggestions-container',
        );

        this._inputElement.parentElement?.appendChild(
            this.suggestionsContainer,
        );

        // On click on the suggestions container, the cursor should be set to the end of the input element.
        this._suggestorChild?.registerDomEvent(
            this.suggestionsContainer,
            'click',
            () => {
                this.setInputCursorAbsolutePosition('end');
            },
        );
    }

    /**
     * Disables the suggestor.
     * @remarks Run this, if you want to disable the suggestor. (e.g. on disable edit mode)
     * @remarks Removes the suggestions container and unload the suggestor child.
     */
    public disableSuggestor() {
        this._suggestorChild?.unload();
        this.suggestionsContainer.remove();
    }
}
