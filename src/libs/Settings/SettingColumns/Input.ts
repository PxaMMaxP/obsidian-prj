import createFuzzySearch from '@nozbe/microfuzz';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { onEvent } from 'src/libs/DIComponent';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { EventsParameters } from 'src/libs/HTMLFlow/types/IFlow';
import {
    IFlowConfig,
    IFlowEventCallback,
} from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import {
    IInput,
    IInputElements,
    IInputFluentApi,
    IInputProtected,
    IInputSettings,
    InputType,
    OnChangeCallback,
} from './interfaces/IInput';
import { SettingColumn } from './SettingColumn';
import {
    GetSuggestionsCallback,
    IGenericSuggest,
} from '../components/interfaces/IGenericSuggest';
import type {
    ISettingColumn_,
    SettingColumnConfigurator,
} from '../interfaces/ISettingColumn';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents an input field.
 */
@Register('SettingFields.input')
@ImplementsStatic<ISettingColumn_<typeof Input>>()
export class Input
    extends SettingColumn<
        IInputFluentApi,
        IInputElements,
        IInputSettings,
        IInputProtected
    >
    implements IInput, IInputProtected, IInputFluentApi
{
    private _suggester?: IGenericSuggest<unknown>;

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
                        events.push(['input', this.updateMinHeight]);

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
    public setDisabled(shouldDisabled: boolean): IInputFluentApi {
        this._settings.isDisabled = shouldDisabled;

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
