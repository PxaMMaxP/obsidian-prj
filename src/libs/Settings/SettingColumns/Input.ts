import createFuzzySearch from '@nozbe/microfuzz';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import type { IFlow_, IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import {
    IFlowConfig,
    IFlowEventCallback,
} from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { ConfigurationError } from './interfaces/Exceptions';
import {
    IInput,
    IInputFluentApi,
    IInputProtected,
    InputElementType,
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
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;
    @Inject('IFlow_')
    protected readonly _IFlow_!: IFlow_;
    @Inject('IGenericSuggest_')
    private readonly _IGenericSuggest_!: IGenericSuggest_<string>;

    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        cfg: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        cfg.appendChildEl(this._settings.inputElType, (cfg) => {
            // Add the suggestions if `getSuggestionsCallback` is set.
            cfg.getEl((el) => (this.elements.inputEl = el))
                .setId('inputEl')
                .setAttribute('placeholder', this._settings.placeholder)
                .setAttribute('value', this._settings.value)
                .setAttribute(
                    'disabled',
                    this._settings.isDisabled ? 'true' : undefined,
                )
                // If the input element is a textarea, the type attribute is not set.
                .setAttribute(
                    this._settings.inputElType === 'textarea'
                        ? undefined
                        : 'type',
                    this._settings.inputType,
                )
                // If the input element is a textarea,
                // a event listener is added to update the minimum height of the textarea.
                .addEventListener(
                    this._settings.inputElType === 'textarea'
                        ? 'input'
                        : 'void',
                    this.updateMinHeight,
                )
                // If a change callback is set, a event listener is added to the input element.
                .addEventListener(
                    this._settings.onChangeCallback != null ? 'change' : 'void',
                    () => {
                        this._settings.onChangeCallback?.(
                            this.elements.inputEl.value,
                        );
                    },
                )
                // Add the suggestions if `getSuggestionsCallback` is set.
                .then(
                    this._settings.getSuggestionsCallback != null
                        ? (el) => {
                              const inputEl = el.element as HTMLInputElement;
                              this.buildSuggester(inputEl);
                          }
                        : undefined,
                );
        });
    };

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

        this._suggester = new this._IGenericSuggest_(
            inputEl,
            (value: string) => {
                inputEl.value = value;
                this._settings.onChangeCallback?.(inputEl.value);
            },
            (input: string) => {
                const suggestions =
                    this._settings.getSuggestionsCallback?.(input);

                if (suggestions == null) {
                    this._logger?.warn('The suggestions are null.');

                    return [];
                }

                return createFuzzySearch(
                    suggestions.map((value) => ({ value })),
                    { getText: (item) => [item.value] },
                )(input).map((result) => result.item.value);
            },
        );

        this._suggester.suggestContainerEl?.classList.add(
            this.parentSettingItem?.parentModal?.draggableClassName || '',
        );
    }

    public readonly parentSettingItem: ISettingRowProtected;
    private readonly _configurator?: SettingColumnConfigurator<IInputFluentApi>;
    private readonly _settings: IInputSettings = new InputSettings();
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

        const flow = new this._IFlow_(
            this.parentSettingItem.inputEl,
            this._flowConfig,
        );

        this.addChild(flow);
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
    public setInputElType(inputType: InputElementType): IInputFluentApi {
        this._settings.inputElType = inputType;

        return this;
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
class InputSettings implements IInputSettings {
    private _inputElType: InputElementType = 'HTMLInputElement';

    /**
     * @inheritdoc
     */
    public set inputElType(value: InputElementType) {
        this._inputElType = value;
    }

    /**
     * @inheritdoc
     */
    public get inputElType(): 'input' | 'textarea' {
        return this._inputElType === 'HTMLInputElement' ? 'input' : 'textarea';
    }

    /**
     * @inheritdoc
     */
    public inputType: InputType = 'text';

    /**
     * @inheritdoc
     */
    public value = '';

    /**
     * @inheritdoc
     */
    public placeholder = '';

    /**
     * @inheritdoc
     */
    public onChangeCallback?: OnChangeCallback;

    /**
     * @inheritdoc
     */
    public getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * @inheritdoc
     */
    public isDisabled = false;
}

/**
 * Represents an interface for the settings for the input field.
 */
interface IInputSettings {
    /**
     * Sets the element type of the input field.
     * @param value The element type of the input field
     * as either `HTMLInputElement` or `HTMLTextAreaElement`.
     */
    set inputElType(value: InputElementType);

    /**
     * Gets the element type of the input field.
     * @returns The element type of the input field
     * as either `input` or `textarea`.
     * @default 'input'
     */
    get inputElType(): 'input' | 'textarea';

    /**
     * The type of the input field.
     * @default 'text'
     */
    inputType: InputType;

    /**
     * The value of the input field.
     * @default ''
     */
    value: string;

    /**
     * The placeholder of the input field.
     * @default ''
     */
    placeholder: string;

    /**
     * A callback that is called when the value of the input field changes.
     * @default undefined
     */
    onChangeCallback?: OnChangeCallback;

    /**
     * A callback that is called to get suggestions for the input field.
     * @default undefined
     * @remarks The suggestions are only shown if the callback is set.
     */
    getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * Whether the toggle is disabled.
     * @default false
     */
    isDisabled: boolean;
}