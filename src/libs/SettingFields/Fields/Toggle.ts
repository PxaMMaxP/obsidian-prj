import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
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

    /**
     * Gets the value of the toggle.
     */
    private get _checked(): boolean {
        if (this.toggleEl[_value] == null)
            this.toggleEl[_value] = this._settings.isToggled ?? false;

        return this.toggleEl[_value];
    }

    /**
     * Sets the value of the toggle.
     */
    private set _checked(value: boolean) {
        this.toggleEl[_value] = value;
    }

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: Toggle) => {
        const toggleEl = document.createElement('input');
        toggleEl.type = 'checkbox';
        ctx._toggleContainerEl.appendChild(toggleEl);

        return toggleEl;
    }, 'Readonly')
    public readonly toggleEl: HTMLInputElement & IToggleValue;

    /**
     * The container of the toggle.
     */
    @LazzyLoading((ctx: Toggle) => {
        const toggleEl = document.createElement('div');
        toggleEl.addClasses(['checkbox-container']);
        ctx.parentSettingItem.inputEl.appendChild(toggleEl);

        return toggleEl;
    }, 'Readonly')
    private readonly _toggleContainerEl: HTMLElement;

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
    public isToggled(): boolean {
        return this._checked;
    }

    private readonly _toggleEvent: (ev: Event) => unknown = (ev) => {
        const newState = !this._checked;
        this._configureToggleState(newState);
        this._settings.onChangeCallback?.(newState);
    };

    /**
     * @inheritdoc
     */
    public override onload(): void {
        this._configurator?.(this);

        this._configureToggleState(this._settings.isToggled ?? false);

        // If the toggle is disabled, do not register the click event.
        if (this._settings.isDisabled !== true) {
            this.registerDomEvent(
                this._toggleContainerEl,
                'click',
                this._toggleEvent,
            );
        }

        try {
            this._settings.thenCallback?.(this);
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
    }

    /**
     * Set the toggle state.
     * @param isToggled The state of the toggle.
     */
    private _configureToggleState(isToggled: boolean): void {
        this._checked = isToggled;

        if (isToggled) {
            this._toggleContainerEl.removeClass('is-disabled');
            this._toggleContainerEl.addClass('is-enabled');
        } else {
            this._toggleContainerEl.removeClass('is-enabled');
            this._toggleContainerEl.addClass('is-disabled');
        }
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
        this._settings.thenCallback = callback;

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

/**
 * Extends the HTMLInputElement to store the value of the toggle.
 */
interface IToggleValue extends HTMLInputElement {
    /**
     * The value of the toggle.
     */
    [_value]?: boolean;
}
