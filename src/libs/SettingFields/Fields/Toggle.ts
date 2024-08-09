import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import { Flow } from 'src/libs/HTMLFlow/Flow';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { ConfigurationError } from './interfaces/Exceptions';
import {
    IToggleFluentAPI,
    IToggleInternal,
    OnChangeCallback,
} from './interfaces/IToggle';
import type {
    ISettingField_,
    SettingFieldConfigurator,
} from '../interfaces/ISettingField';
import type { IInternalSettingItem } from '../interfaces/SettingItem';

/**
 * Represents a toggle field.
 */
@Register('SettingFields.toggle')
@ImplementsStatic<ISettingField_<typeof Toggle>>()
export class Toggle extends DIComponent implements IToggleInternal {
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;

    private _isToggled = false;
    /**
     * @inheritdoc
     */
    public get isToggled(): boolean {
        return this._isToggled;
    }

    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        cfg: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        cfg.appendChildEl('div', (cfg) => {
            cfg.getEl((el) => (this._toggleContainerEl = el))
                .setId('checkbox-containerEl')
                .addClass(['checkbox-container'])
                .addClass(this._isToggled ? 'is-enabled' : 'is-disabled')
                .addEventListener(
                    this._settings.isDisabled !== true ? 'click' : 'void',
                    (_, __, flow) => {
                        flow?.toggleClass(['is-enabled', 'is-disabled']);
                        this._isToggled = !this._isToggled;
                    },
                )

                .appendChildEl('input', (cfg) => {
                    cfg.getEl((el) => (this.toggleEl = el))
                        .setId('toggleEl')
                        .setAttribute('type', 'checkbox');
                });
        });
    };

    /**
     * @inheritdoc
     */
    public toggleEl: HTMLInputElement;

    /**
     * The container of the toggle.
     */
    private _toggleContainerEl: HTMLDivElement;

    /**
     * @inheritdoc
     */
    public readonly parentSettingItem: IInternalSettingItem & Component;
    private readonly _configurator?: SettingFieldConfigurator<IToggleFluentAPI>;
    private readonly _settings: IToggleSettings = {};

    /**
     * Creates a new toggle field.
     * @param parentSettingItem The setting item that the field belongs to.
     * @param configurator A function that configures the field.
     */
    constructor(
        parentSettingItem: IInternalSettingItem,
        configurator?: SettingFieldConfigurator<IToggleFluentAPI>,
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
        this._isToggled = this._settings.isToggled ?? false;
        const flow = new Flow(this.parentSettingItem.inputEl, this._flowConfig);
        this.addChild(flow);
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
    then(callback: (toggle: IToggleInternal) => void): IToggleFluentAPI {
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
}

const _value = Symbol('ListEntry');
