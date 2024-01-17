import { Component, MarkdownRenderChild } from "obsidian";

export interface Suggestion {
    value: string;
    label: string;
}

export type Suggestions = Suggestion[];

export class SuggestorChild extends MarkdownRenderChild {
    constructor(container: HTMLElement) {
        super(container);
    }

    override onunload(): void {
        super.onunload();
    }
}

export default class SuggestionComponent {
    private suggestionsContainer: HTMLSpanElement;
    private _inputElement: HTMLElement;
    private _component: Component;
    private _suggester: ((value: string) => Suggestions) | undefined;
    private _suggestions: Suggestions;
    private _activeSuggestions: Suggestions;
    private _suggestorChild: SuggestorChild | undefined;
    private _lastSuggestionIndex = 0;
    private _relativeSuggestion: boolean;

    constructor(inputElement: HTMLElement, component: Component) {
        this._inputElement = inputElement;
        this._component = component;
    }

    public setSuggestions(suggestions: Suggestions) {
        this._suggestions = suggestions;
        return this;
    }

    public setSuggester(suggester: (value: string) => Suggestions) {
        this._suggester = suggester;
        return this;
    }

    private setSuggestion() {
        console.log(`Last suggestion index: ${this._lastSuggestionIndex}`);

        let suggestion: Suggestion | undefined;
        if (!this._relativeSuggestion) {
            suggestion = this._activeSuggestions.filter(suggestion => suggestion.value.toLowerCase().startsWith(this._inputElement.textContent?.toLowerCase() ?? '')).first();
            this._lastSuggestionIndex = 0;
        } else {
            const index = this._lastSuggestionIndex;
            if (index < 0) {
                suggestion = this._activeSuggestions.last();
                this._lastSuggestionIndex = this._activeSuggestions.length - 1;
            } else if (index >= this._activeSuggestions.length) {
                suggestion = this._activeSuggestions.first();
                this._lastSuggestionIndex = 0;
            } else {
                suggestion = this._activeSuggestions[index];
                this._lastSuggestionIndex = index;
            }
        }

        if (suggestion) {
            if (suggestion.value.toLowerCase().startsWith(this._inputElement.textContent?.toLowerCase() ?? '')) {
                const suggestionText = suggestion.value.slice(this.inputTextLength);
                this.suggestionsContainer.innerText = suggestionText;
            } else {
                const length = this._inputElement.textContent?.length ?? 1;
                this._inputElement.textContent = suggestion.value.slice(0, length);
                this.suggestionsContainer.innerText = suggestion.value.slice(length);
                this.setInputCursorAbsolutePosition(length);
            }
        }

        if (this._activeSuggestions.length > 0) {
            this.suggestionsContainer.style.display = 'block';
        } else {
            this.suggestionsContainer.style.display = 'none';
        }
    }

    private refreshActiveSuggestions() {
        this._activeSuggestions = this._suggester ? this._suggester(this._inputElement.textContent ?? '') : this._suggestions;
    }

    public enableSuggestior() {
        this.setInputCursorAbsolutePosition(Number.MAX_SAFE_INTEGER);
        this._suggestorChild = new SuggestorChild(this.suggestionsContainer);
        this._component.addChild(this._suggestorChild);
        this.buildSuggestionsContainer();
        this._suggestorChild.load();
        this._suggestorChild.registerDomEvent(this._inputElement, 'input', () => {
            this._relativeSuggestion = false;
            this.refreshActiveSuggestions();
            console.log(`Suggestions:`, this._activeSuggestions);
            this.setSuggestion();
        });
        this._suggestorChild.registerDomEvent(this._inputElement, 'keydown', (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                this._relativeSuggestion = true;
                if (event.key === 'ArrowUp') {
                    this._lastSuggestionIndex++;
                } else if (event.key === 'ArrowDown') {
                    this._lastSuggestionIndex--;
                }
                this.setSuggestion();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                console.log(`Arrow left`);
                this.setInputCursorRelativePosition(-1);
                this.refreshActiveSuggestions();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                console.log(`Arrow right`);
                this.adoptSuggestionCharacter() ?
                    this.setInputCursorAbsolutePosition(this.inputTextLength) :
                    this.setInputCursorRelativePosition(1);
                this.refreshActiveSuggestions();
            } else if (event.key === 'Tab') {
                event.preventDefault();
                this.adoptSuggestion();
            } else if (event.ctrlKey && event.key === 'a') {
                event.preventDefault();
                this.selectText(0, Number.MAX_SAFE_INTEGER);
            }
        });
    }

    private adoptSuggestion() {
        this._inputElement.textContent += this.suggestionsContainer.innerText;
        const suggestion = this._activeSuggestions.find(suggestion => suggestion.value.toLowerCase().startsWith(this._inputElement.textContent?.toLowerCase() ?? ''))
        this._inputElement.textContent = suggestion ? suggestion.value : this._inputElement.textContent;
        this.suggestionsContainer.innerText = '';
        this.setInputCursorAbsolutePosition(Number.MAX_SAFE_INTEGER);
    }

    private adoptSuggestionCharacter(): boolean {
        if (this.cursorPosition === this.inputTextLength) {
            this._inputElement.textContent += this.suggestionsContainer.innerText.slice(0, 1);
            this.suggestionsContainer.innerText = this.suggestionsContainer.innerText.slice(1);
            return true;
        }
        return false;
    }

    private get inputTextLength() {
        return this._inputElement.textContent?.length ?? 0;
    }

    private get cursorPosition() {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const currentRange = selection.getRangeAt(0);
            return currentRange.endOffset;
        }
        return 0;
    }

    private setInputCursorRelativePosition(relativPosition: number) {
        this.setInputCursorAbsolutePosition(this.cursorPosition + relativPosition);
    }

    private setInputCursorAbsolutePosition(position: number) {
        const selection = window.getSelection();
        const range = document.createRange();

        if (selection && selection.rangeCount > 0) {

            const safePosition = Math.max(0, Math.min(position, this._inputElement.textContent?.length ?? 0));

            if (this._inputElement.firstChild) {
                range.setStart(this._inputElement.firstChild, safePosition);
                range.setEnd(this._inputElement.firstChild, safePosition);
            }

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    private selectText(startPosition: number, endPosition: number) {
        const selection = window.getSelection();
        const range = document.createRange();

        if (selection && this._inputElement.firstChild) {
            const safeStartPosition = Math.max(0, Math.min(startPosition, this._inputElement.textContent?.length ?? 0));
            const safeEndPosition = Math.max(0, Math.min(endPosition, this._inputElement.textContent?.length ?? 0));

            range.setStart(this._inputElement.firstChild, safeStartPosition);
            range.setEnd(this._inputElement.firstChild, safeEndPosition);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }


    private buildSuggestionsContainer() {
        this.suggestionsContainer = document.createElement('span');
        this.suggestionsContainer.classList.add('editable-data-view', 'suggestions-container');
        this._inputElement.parentElement?.appendChild(this.suggestionsContainer);

        // On click
        this._suggestorChild?.registerDomEvent(this.suggestionsContainer, 'click', () => {
            this.setInputCursorAbsolutePosition(Number.MAX_SAFE_INTEGER);
        });
    }

    public disableSuggestor() {
        this._suggestorChild?.unload();
        this.suggestionsContainer.remove();
    }
}
