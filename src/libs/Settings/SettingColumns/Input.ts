import createFuzzySearch from '@nozbe/microfuzz';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { emitEvent, onEvent } from 'src/libs/DIComponent';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import type { IFlow_, IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { EventsParameters } from 'src/libs/HTMLFlow/types/IFlow';
import {
    IFlowConfig,
    IFlowEventCallback,
} from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import { ConfigurationError } from './interfaces/Exceptions';
import {
    IInput,
    IInputFluentApi,
    IInputProtected,
    InputType,
    OnChangeCallback,
} from './interfaces/IInput';
import type {
    IGenericSuggest_,
    IGenericSuggest,
    GetSuggestionsCallback,
} from '../components/interfaces/IGenericSuggest';
import type {
    ISettingColumn_,
    SettingColumnConfigurator,
    TransformerDelegate,
    ValidatorDelegate,
} from '../interfaces/ISettingColumn';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents an input field.
 */
@Register('SettingFields.input')
@ImplementsStatic<ISettingColumn_<typeof Input>>()
export class Input
    extends DIComponent
    implements IInput, IInputProtected, IInputFluentApi
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;
    @Inject('IFlow_')
    protected readonly __IFlow!: IFlow_;
    @Inject('IGenericSuggest_')
    private readonly __IGenericSuggest!: IGenericSuggest_<string>;

    /**
     * @inheritdoc
     */
    public readonly parentSettingItem: ISettingRowProtected;

    /**
     * @inheritdoc
     */
    public readonly elements: {
        /**
         * @inheritdoc
         */
        inputEl: HTMLInputElement | HTMLTextAreaElement;
    } = { inputEl: null as never };

    /**
     * Configurations for the input field.
     * @param parent The parent setting row.
     */
    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        parent: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        const opts = this._settings;

        parent.appendChildEl(opts.inputElType, (inputEl) => {
            inputEl.set({
                El: (el) => (this.elements.inputEl = el),
                placeholder: opts.placeholder,
                value: opts.value,
                disabled: opts.isDisabled ? 'true' : null,
                spellcheck: opts.shouldSpellCheck ? 'true' : 'false',
                type: opts.inputElType === 'input' ? opts.inputType : null,
                Events: ((): EventsParameters<'input' | 'textarea'> => {
                    const events: EventsParameters<'input' | 'textarea'> = [];

                    if (opts.inputElType === 'textarea')
                        events.push(['input', this.updateMinHeight]);

                    if (opts.onChangeCallback != null || opts.key !== '')
                        events.push([
                            opts.inputElType === 'textarea'
                                ? 'input'
                                : 'change',
                            () => {
                                const value = this.elements.inputEl.value;
                                opts.onChangeCallback?.(value);
                                this.emitResult(value);
                            },
                        ]);

                    return events;
                })(),
                Then:
                    opts.getSuggestionsCallback != null
                        ? (_ctx, el) =>
                              this.buildSuggester(el as HTMLInputElement)
                        : undefined,
            });
        });
    };

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
                    this._logger?.debug('The suggestions are null.');

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
     * Emits the result event if the key is not empty.
     * @param value The value to emit.
     */
    private emitResult(value: string): void {
        if (this._settings.key !== '')
            this[emitEvent](
                'result',
                this._settings.key,
                this._settings.transformer?.(value) ?? value,
            );
    }

    private readonly _configurator?: SettingColumnConfigurator<IInputFluentApi>;
    private readonly _settings = new InputSettings();
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
        super();

        this.parentSettingItem = parentSettingItem;

        this._configurator = configurator;
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        this._configurator?.(this);

        const flow = new this.__IFlow(
            this.parentSettingItem.inputEl,
            this._flowConfig,
        );

        this.addChild(flow);

        /**
         * Adds the common window classes to the suggester container.
         */
        this[onEvent]('common-window-classes', (classes: string[]) => {
            this._suggester?.suggestContainerEl?.classList.add(...classes);
        });

        /**
         * Register on the modal-loaded event to emit the required results.
         */
        this[onEvent]('loaded', () => {
            if (this._settings.key !== '')
                this[emitEvent](
                    'required-results',
                    this._settings.key,
                    this._settings.isRequired,
                );
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

    /**
     * @inheritdoc
     */
    setResultKey(
        key: string,
        transformer?: TransformerDelegate,
    ): IInputFluentApi {
        this._settings.key = key;
        this._settings.transformer = transformer ?? this._settings.transformer;

        return this;
    }

    /**
     * @inheritdoc
     */
    setRequired(test: unknown, required?: unknown): IInputFluentApi {
        const _test: ValidatorDelegate | undefined =
            typeof test === 'function'
                ? (test as ValidatorDelegate)
                : undefined;
        const _required: boolean = _test != null ? true : (test as boolean);

        this._settings.isRequired = _test != undefined ? _test : _required;

        return this;
    }

    /**
     * @inheritdoc
     */
    then(callback: (input: IInputProtected) => void): IInputFluentApi {
        try {
            callback?.(this);
        } catch (error) {
            this._logger?.error(
                'An error occurred while executing the `then` callback.',
                'The Component will be unloaded.',
                'Error:',
                error,
            );
            this.unload();
            throw new ConfigurationError(`then-Callback`, error);
        }

        return this;
    }
}

/**
 * Represents the settings for the input field.
 */
class InputSettings {
    /**
     * Gets the element type of the input field
     * as either `input` or `textarea`.
     */
    public get inputElType(): 'input' | 'textarea' {
        return this.inputType === 'textarea' ? 'textarea' : 'input';
    }

    /**
     * The type of the input field.
     * @default 'text'
     */
    public inputType: InputType = 'text';

    /**
     * The key of the input field
     * for the result event.
     * @default ''
     */
    public key: string = '';

    /**
     * A transformer that transforms the value of the input field
     * before it is emitted in the result event.
     * @default
     * @inheritdoc
     */
    public transformer: TransformerDelegate | undefined = (value) => value;

    /**
     * Tells whether the input field is required.
     * @default false
     */
    isRequired: boolean | ValidatorDelegate = false;

    /**
     * The value of the input field.
     * @default ''
     */
    public value = '';

    /**
     * The placeholder of the input field.
     * @default ''
     */
    public placeholder = '';

    /**
     * A callback that is called when the value of the input field changes.
     * @default undefined
     */
    public onChangeCallback?: OnChangeCallback;

    /**
     * A callback that is called to get suggestions for the input field.
     * @default undefined
     * @remarks The suggestions are only shown if the callback is set.
     */
    public getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * Whether the toggle is disabled.
     * @default false
     */
    public isDisabled = false;

    /**
     * Whether the input field should be spell checked.
     * @default false
     */
    shouldSpellCheck = false;
}
