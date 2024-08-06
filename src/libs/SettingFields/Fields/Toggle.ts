import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Flow } from 'src/libs/HTMLFlow/Flow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { DIComponent } from 'src/libs/Modals/CustomModal/DIComponent';
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
@ImplementsStatic<ISettingField_<typeof Toggle>>()
export class Toggle extends DIComponent implements IToggleInternal {
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;

    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        cfg,
    ) => {
        cfg.appendChildEl('div', (cfg) => {
            cfg.setId('checkbox-containerEl')
                .addClass(['checkbox-container'])
                .getEl((el) => (this._toggleContainerEl = el))

                .if(this._settings.isDisabled !== true, (cfg) => {
                    cfg.addEventListener('click', this._toggleEvent).addClass(
                        'is-disabled',
                    );
                })

                .appendChildEl('input', (cfg) => {
                    cfg.setId('toggleEl')
                        .setAttribute('type', 'checkbox')
                        .getEl((el) => {
                            this.toggleEl = el as HTMLInputElement;
                        });
                });
        });
    };

    private readonly _toggleEvent: (
        el: HTMLElement,
        ev: MouseEvent,
    ) => unknown = (el, ev) => {
        this._configureToggleState(el, !this.isToggled());
        this._settings.onChangeCallback?.(this.isToggled());
    };

    /**
     * Set the toggle state.
     * @param container The container of the toggle.
     * @param isToggled The state of the toggle.
     */
    private _configureToggleState(
        container: HTMLElement,
        isToggled: boolean,
    ): void {
        if (isToggled) {
            container.removeClass('is-disabled');
            container.addClass('is-enabled');
        } else {
            container.removeClass('is-enabled');
            container.addClass('is-disabled');
        }
    }

    /**
     * @inheritdoc
     */
    public toggleEl: HTMLInputElement;

    /**
     * The container of the toggle.
     */
    private _toggleContainerEl: HTMLElement;

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

        const flow = new Flow(this.parentSettingItem.inputEl, this._flowConfig);
        this.addChild(flow);
    }

    /**
     * @inheritdoc
     */
    public isToggled(): boolean {
        return this._toggleContainerEl.classList.contains('is-enabled');
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

    /**
     * A callback that is called after the toggle field is configured.
     * @param toggle The toggle field.
     * @returns The new toggle field.
     */
    thenCallback?: (toggle: IToggleInternal) => void;
}

const _value = Symbol('ListEntry');
