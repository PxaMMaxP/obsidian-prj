import createFuzzySearch from '@nozbe/microfuzz';
import { Implements_ } from 'src/classes/decorators/Implements';
import { onEvent } from 'src/libs/DIComponent';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { EventsParameters } from 'src/libs/HTMLFlow/types/IFlow';
import {
    IFlowConfig,
    IFlowEventCallback,
} from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import type {
    IInput,
    IInputElements,
    IInputFluentApi,
    IInputProtected,
    IInputSettings,
} from './interfaces/IInput';
import type { ISettingColumn_ } from './interfaces/ISettingColumn';
import { SettingColumn } from './SettingColumn';
import type { SettingColumnConfigurator } from './types/General';
import type { InputType, OnChangeCallback } from './types/Input';
import {
    GetSuggestionsCallback,
    IGenericSuggest,
} from '../components/interfaces/IGenericSuggest';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents an input field.
 */
@Register('SettingFields.input')
@Implements_<ISettingColumn_<typeof Input>>()
export class Input
    extends SettingColumn<
        IInputFluentApi,
        IInputElements,
        IInputSettings,
        IInputProtected
    >
    implements IInput, IInputProtected, IInputFluentApi
{
    protected _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        parent: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        const inputTypeEl =
            this._settings.inputType === 'textarea' ? 'textarea' : 'input';

        parent.appendChildEl(inputTypeEl, (inputEl) => {
            inputEl.set({
                El: (el) => (this.elements.inputEl = el),
                placeholder: this._settings.placeholder,
                value: this._settings.value,
                disabled: this._settings.isDisabled ? 'true' : null,
                spellcheck: this._settings.shouldSpellCheck ? 'true' : 'false',
                type: inputTypeEl === 'input' ? this._settings.inputType : null,
                Events: ((): EventsParameters<'input' | 'textarea'> => {
                    const events: EventsParameters<'input' | 'textarea'> = [];

                    if (inputTypeEl === 'textarea')
                        events.push(
                            ['input', this.updateMinHeight],
                            ['keydown', this.reactToArrowKeys],
                        );

                    if (
                        this._settings.onChangeCallback != null ||
                        this._settings.key !== ''
                    )
                        events.push([
                            inputTypeEl === 'textarea' ? 'input' : 'change',
                            () => {
                                const value = this.elements.inputEl.value;
                                this._settings.onChangeCallback?.(value);
                                this.emitResult(value);
                            },
                        ]);

                    return events;
                })(),
                Then:
                    this._settings.getSuggestionsCallback != null
                        ? (_ctx, el) =>
                              this.buildSuggester(el as HTMLInputElement)
                        : undefined,
            });
        });
    };

    private _suggester?: IGenericSuggest<unknown>;

    /**
     * Creates a new input field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator The function that configures the input field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IInputFluentApi>,
    ) {
        super(parentSettingItem, configurator, {
            inputType: 'text',
            value: '',
            placeholder: '',
            shouldSpellCheck: false,
        });
    }

    /**
     * Updates the minimum height of the input field.
     * @param el The input field element.
     * @param ev The event.
     * @param flow The flow API.
     * @remarks This method will only be registered if the input field is a textarea.
     */
    private readonly updateMinHeight: IFlowEventCallback<
        'textarea' | 'input',
        'void' | keyof HTMLElementEventMap
    > = (el, ev, flow): void => {
        const lineCount = el.value?.split('\n').length ?? 1;
        el.style.minHeight = `${Math.max(lineCount + 1, 4)}lh`;
    };

    /**
     * Reacts to the arrow keys being pressed.
     * This method will move the cursor to the left or right when the arrow keys are pressed.
     * Obsidian prevents the default behavior of the arrow keys, so this method is necessary to move the cursor.
     * @param el The textarea element.
     * @param event The event.
     */
    private readonly reactToArrowKeys: IFlowEventCallback<
        'textarea',
        'keydown'
    > = (el, event) => {
        let cursorAdjustment = 0;

        if (
            !(event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
        ) {
            if (event.key === 'ArrowLeft') cursorAdjustment = -1;
            else if (event.key === 'ArrowRight') cursorAdjustment = 1;

            const cursorPos = el.selectionStart ?? 0;

            el.setSelectionRange(
                cursorPos + cursorAdjustment,
                cursorPos + cursorAdjustment,
            );
        }
    };

    /**
     * Builds the suggester for the input field.
     * @param inputEl The input element on which the suggester should be built.
     */
    private buildSuggester(inputEl: HTMLInputElement): void {
        if (
            this._settings.getSuggestionsCallback == null ||
            !(inputEl instanceof HTMLInputElement)
        )
            return;

        this._suggester = new this.__IGenericSuggest(
            inputEl,
            (value: string) => {
                inputEl.value = value;
                this._settings.onChangeCallback?.(inputEl.value);

                this.emitResult(value);
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
     * @inheritdoc
     */
    public getValue(): string {
        return this.elements.inputEl.value;
    }

    /**
     * @inheritdoc
     */
    public get value(): string {
        return this.elements.inputEl.value;
    }

    /**
     * @inheritdoc
     */
    public setType(type: InputType): IInputFluentApi {
        this._settings.inputType = type;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setValue(value: string): IInputFluentApi {
        this._settings.value = value;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setPlaceholder(placeholder: string): IInputFluentApi {
        this._settings.placeholder = placeholder;

        return this;
    }

    /**
     * @inheritdoc
     */
    public onChange(callback: OnChangeCallback): IInputFluentApi {
        this._settings.onChangeCallback = callback;

        return this;
    }

    /**
     * @inheritdoc
     */
    public addSuggestion(
        getSuggestionsCb: GetSuggestionsCallback<string>,
    ): IInputFluentApi {
        this._settings.getSuggestionsCallback = getSuggestionsCb;

        return this;
    }

    /**
     * @inheritdoc
     */
    setSpellcheck(shouldSpellcheck: boolean): IInputFluentApi {
        this._settings.shouldSpellCheck = shouldSpellcheck;

        return this;
    }
}
