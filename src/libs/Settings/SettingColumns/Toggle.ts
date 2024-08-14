import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import { Flow } from 'src/libs/HTMLFlow/Flow';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
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
} from '../interfaces/ISettingColumn';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a toggle field.
 */
@Register('SettingFields.toggle')
@ImplementsStatic<ISettingColumn_<typeof Toggle>>()
export class Toggle extends DIComponent implements IToggleProtected {
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
            cfg.getEl((el) => (this.elements._toggleContainerEl = el))
                .setId('checkbox-containerEl')
                .addClass(['checkbox-container'])
                .addClass(this._isToggled ? 'is-enabled' : 'is-disabled')
                .addEventListener(
                    this._settings.isDisabled !== true ? 'click' : 'void',
                    (_, __, flow) => {
                        flow?.toggleClass(['is-enabled', 'is-disabled']);
                        this._isToggled = !this._isToggled;
                        this._settings.onChangeCallback?.(this._isToggled);
                    },
                )

                .appendChildEl('input', (cfg) => {
                    cfg.getEl((el) => (this.elements.toggleEl = el))
                        .setId('toggleEl')
                        .setAttribute('type', 'checkbox');
                });
        });
    };

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
    public readonly parentSettingItem: ISettingRowProtected & Component;
    private readonly _configurator?: SettingColumnConfigurator<IToggleFluentAPI>;
    private readonly _settings: IToggleSettings = {};

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
}

const _value = Symbol('ListEntry');
