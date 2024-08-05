import createFuzzySearch from '@nozbe/microfuzz';
import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type {
    GenericSuggest,
    GetSuggestionsCallback,
    IGenericSuggest_,
} from 'src/libs/Modals/Components/GenericSuggest';
import { DIComponent } from 'src/libs/Modals/CustomModal/DIComponent';
import {
    IInputFluentAPI,
    IInternalInput,
    InputElementType,
    InputType,
    OnChangeCallback,
} from './interfaces/IInput';
import type {
    ISettingField_,
    SettingFieldConfigurator,
} from '../interfaces/ISettingField';
import type { IInternalSettingItem } from '../interfaces/SettingItem';

/**
 * Represents an input field.
 */
@ImplementsStatic<ISettingField_<typeof Input>>()
export class Input extends DIComponent implements IInternalInput {
    @Inject('IApp')
    protected readonly _IApp!: IApp;

    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;

    public readonly parentSettingItem: IInternalSettingItem & Component;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: Input) => {
        const inputEl = document.createElement(ctx._inputElType);
        ctx.parentSettingItem.inputEl.appendChild(inputEl);

        if (inputEl instanceof HTMLTextAreaElement) {
            ctx.registerDomEvent(inputEl, 'input', () => {
                ctx.updateMinHeight(inputEl);
            });
        }

        return inputEl;
    }, 'Readonly')
    public readonly inputEl: HTMLInputElement | HTMLTextAreaElement;

    private _suggester?: GenericSuggest<unknown>;

    private __inputElType: InputElementType = 'HTMLInputElement';

    /**
     * Updates the minimum height of the input field.
     * @param inputEl The input field.
     */
    private updateMinHeight(inputEl: HTMLTextAreaElement): void {
        const lineCount = inputEl.value?.split('\n').length ?? 1;
        inputEl.style.minHeight = `${Math.max(lineCount + 1, 4)}lh`;
    }

    /**
     * Sets the element type of the input field.
     */
    private set _inputElType(value: InputElementType) {
        this.__inputElType = value;
    }
    /**
     * Gets the element type of the input field
     * as a string => 'input' or 'textarea'.
     */
    private get _inputElType(): 'input' | 'textarea' {
        return this.__inputElType === 'HTMLInputElement' ? 'input' : 'textarea';
    }
    private _inputType: InputType = 'text';
    private _value = '';
    private _placeholder = '';
    private _onChangeCallback?: OnChangeCallback;
    @Inject('IGenericSuggest_')
    private readonly _IGenericSuggest_!: IGenericSuggest_<string>;
    private _getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * Creates a new input field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator The function that configures the input field.
     */
    constructor(
        parentSettingItem: IInternalSettingItem,
        configurator?: SettingFieldConfigurator<IInputFluentAPI>,
    ) {
        super();

        this.parentSettingItem = parentSettingItem;

        this._configurator = configurator;
    }

    private readonly _configurator?: SettingFieldConfigurator<IInputFluentAPI>;

    /**
     * @inheritdoc
     */
    public override onload(): void {
        this._configurator?.(this);
        this.build();
    }

    /**
     * @inheritdoc
     */
    public getValue(): string {
        return this.inputEl.value;
    }

    /**
     * @inheritdoc
     */
    public build(): void {
        this.inputEl.placeholder = this._placeholder;
        this.inputEl.value = this._value;

        if (this.inputEl instanceof HTMLInputElement)
            this.inputEl.type = this._inputType;
        else this.updateMinHeight(this.inputEl);

        this.registerDomEvent(this.inputEl, 'change', () => {
            if (this._onChangeCallback)
                this._onChangeCallback(this.inputEl.value);
        });

        this.buildSuggester();
    }

    /**
     * Builds the suggester for the input field.
     */
    private buildSuggester(): void {
        if (
            this._getSuggestionsCallback != null &&
            this.inputEl instanceof HTMLInputElement
        ) {
            this._suggester = new this._IGenericSuggest_(
                this.inputEl,
                (value: string) => {
                    this.inputEl.value = value;

                    if (this._onChangeCallback)
                        this._onChangeCallback(this.inputEl.value);
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
                (suggestion: string, el) => {
                    el.setText(suggestion);
                },
                this._IApp,
            );

            if (
                this.parentSettingItem?.parentModal?.draggableClassName != null
            ) {
                this._suggester.suggestContainer?.classList.add(
                    this.parentSettingItem?.parentModal?.draggableClassName,
                );
            }
        } else {
            if (
                this._getSuggestionsCallback == null &&
                this.inputEl instanceof HTMLInputElement
            ) {
                this._logger?.warn(
                    'Suggester cannot be built because the input element is not an instance of HTMLInputElement.',
                );
            }
        }
    }

    /**
     * @inheritdoc
     */
    public setInputElType(inputType: InputElementType): IInputFluentAPI {
        this._inputElType = inputType;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setType(type: InputType): IInputFluentAPI {
        this._inputType = type;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDisabled(shouldDisabled: boolean): IInputFluentAPI {
        throw new Error('Method not implemented.');
    }

    /**
     * @inheritdoc
     */
    public setValue(value: string): IInputFluentAPI {
        this._value = value;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setPlaceholder(placeholder: string): IInputFluentAPI {
        this._placeholder = placeholder;

        return this;
    }

    /**
     * @inheritdoc
     */
    public onChange(callback: OnChangeCallback): IInputFluentAPI {
        this._onChangeCallback = callback;

        return this;
    }

    /**
     * @inheritdoc
     */
    public addSuggestion(
        getSuggestionsCb: GetSuggestionsCallback<string>,
    ): IInputFluentAPI {
        this._getSuggestionsCallback = getSuggestionsCb;

        return this;
    }

    /**
     * @inheritdoc
     */
    then(callback: (input: IInternalInput) => void): IInputFluentAPI {
        throw new Error('Method not implemented.');
    }
}
