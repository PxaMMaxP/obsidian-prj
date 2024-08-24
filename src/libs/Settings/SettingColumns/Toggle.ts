import { Component } from 'obsidian';
import { Implements_ } from 'src/classes/decorators/Implements';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { emitEvent, onEvent } from 'src/libs/DIComponent';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import { Flow } from 'src/libs/HTMLFlow/Flow';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { EventsParameters } from 'src/libs/HTMLFlow/types/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import { ConfigurationError } from './interfaces/Exceptions';
import {
    IToggleFluentAPI,
    IToggleProtected,
    OnChangeCallback,
} from './interfaces/IToggle';
import type {
    ISettingColumn_,
    SettingColumnConfigurator,
    TransformerDelegate,
    ValidatorDelegate,
} from '../interfaces/ISettingColumn';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a toggle field.
 */
@Register('SettingFields.toggle')
@Implements_<ISettingColumn_<typeof Toggle>>()
export class Toggle extends DIComponent implements IToggleProtected {
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;

    /**
     * @inheritdoc
     */
    public readonly parentSettingItem: ISettingRowProtected & Component;

    /**
     * @inheritdoc
     */
    public readonly elements: {
        /**
         * @inheritdoc
         */
        toggleEl: HTMLInputElement;
        /**
         * The container of the toggle.
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _toggleContainerEl: HTMLDivElement;
    } = {
        toggleEl: null as never,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _toggleContainerEl: null as never,
    };

    /**
     * @inheritdoc
     */
    public get isToggled(): boolean {
        return this._isToggled;
    }

    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        parent: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        parent.appendChildEl('div', (checkboxContainer) => {
            checkboxContainer
                .set({
                    El: (el) => (this.elements._toggleContainerEl = el),
                    Classes: [
                        'checkbox-container',
                        this._isToggled ? 'is-enabled' : 'is-disabled',
                    ],
                    Events: ((): EventsParameters<'div'> => {
                        if (this._settings.isDisabled === true)
                            return [
                                'click',
                                (_, __, flow) => {
                                    this._isToggled = !this._isToggled;

                                    flow?.toggleClass([
                                        'is-enabled',
                                        'is-disabled',
                                    ]);

                                    this._settings.onChangeCallback?.(
                                        this._isToggled,
                                    );

                                    this.emitResultEvent();
                                },
                            ];
                        else return [];
                    })(),
                })
                .appendChildEl('input', (checkbox) => {
                    checkbox.set({
                        El: (el) => (this.elements.toggleEl = el),
                        type: 'checkbox',
                    });
                });
        });
    };

    private _isToggled = false;
    private readonly _configurator?: SettingColumnConfigurator<IToggleFluentAPI>;
    private readonly _settings: IToggleSettings = {
        key: '',
        transformer: undefined,
        isRequired: false,
    };

    /**
     * Creates a new toggle field.
     * @param parentSettingItem The setting item that the field belongs to.
     * @param configurator A function that configures the field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IToggleFluentAPI>,
    ) {
        super();

        this.parentSettingItem = parentSettingItem;
        this._configurator = configurator;
    }

    /**
     * Emits the result event
     * if the key is not empty.
     */
    private emitResultEvent(): void {
        if (this._settings.key !== '') {
            this[emitEvent](
                'result',
                this._settings.key,
                this._settings.transformer?.(this._isToggled) ??
                    this._isToggled,
            );
        }
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        this._configurator?.(this);
        this._isToggled = this._settings.isToggled ?? false;
        const flow = new Flow(this.parentSettingItem.inputEl, this._flowConfig);
        this.addChild(flow);

        /**
         * Register on the loaded event to emit the required results
         * after all components are loaded.
         */
        this[onEvent]('loaded', () => {
            if (this._settings.key !== '') {
                this[emitEvent](
                    'required-results',
                    this._settings.key,
                    this._settings.isRequired,
                );
            }
        });
    }

    /**
     * @inheritdoc
     */
    setToggled(isToggled: boolean): IToggleFluentAPI {
        this._settings.isToggled = isToggled;

        return this;
    }

    /**
     * @inheritdoc
     */
    setDisabled(isDisabled: boolean): IToggleFluentAPI {
        this._settings.isDisabled = isDisabled;

        return this;
    }

    /**
     * @inheritdoc
     */
    onChange(callback: OnChangeCallback): IToggleFluentAPI {
        this._settings.onChangeCallback = callback;

        return this;
    }

    /**
     * @inheritdoc
     */
    setResultKey(
        key: string,
        transformer?: TransformerDelegate,
    ): IToggleFluentAPI {
        this._settings.key = key;
        this._settings.transformer = transformer ?? this._settings.transformer;

        return this;
    }

    /**
     * @inheritdoc
     */
    setRequired(test: unknown, required?: unknown): IToggleFluentAPI {
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
    then(callback: (toggle: IToggleProtected) => void): IToggleFluentAPI {
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
 * Represents the settings for the toggle field.
 */
interface IToggleSettings {
    /**
     * The value of the toggle.
     */
    isToggled?: boolean;

    /**
     * Whether the toggle is disabled.
     */
    isDisabled?: boolean;

    /**
     * A callback that is called when the value of the toggle changes.
     */
    onChangeCallback?: OnChangeCallback;

    /**
     * The key of the input field
     * for the result event.
     */
    key: string;

    /**
     * A transformer that transforms the value of the input field
     * before it is emitted in the result event.
     */
    transformer: TransformerDelegate | undefined;

    /**
     * Tells whether the input field is required.
     */
    isRequired: boolean | ValidatorDelegate;
}
