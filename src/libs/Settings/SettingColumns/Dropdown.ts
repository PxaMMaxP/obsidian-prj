import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import {
    IDropdown,
    IDropdownFluentApi,
    IDropdownProtected,
    OnChangeCallback,
    SelectItem,
    SelectOptions,
    SelectOptionsCallback,
} from './interfaces/IDropdown';
import type {
    ISettingColumn_,
    SettingColumnConfigurator,
} from '../interfaces/ISettingColumn';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a dropdown field.
 */
@Register('SettingFields.dropdown')
@ImplementsStatic<ISettingColumn_<typeof Dropdown>>()
export class Dropdown
    extends DIComponent
    implements IDropdown, IDropdownProtected, IDropdownFluentApi
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('Dropdown'), false)
    protected _logger?: ILogger;

    public readonly parentSettingItem: ISettingRowProtected & Component;

    /**
     * @inheritdoc
     */
    public get elements(): {
        selectEl: HTMLSelectElement;
    } {
        return { selectEl: this._selectEl };
    }

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: Dropdown) => {
        const selectEl = document.createElement('select');
        selectEl.addClass('dropdown');
        ctx.parentSettingItem.inputEl.appendChild(selectEl);

        return selectEl;
    }, 'Readonly')
    private readonly _selectEl: HTMLSelectElement;

    private _value?: SelectItem;

    private _onChangeCallback?: OnChangeCallback;
    private _options?: SelectOptionsCallback;

    /**
     * Creates a new dropdown field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator A function that configures the dropdown field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IDropdownFluentApi>,
    ) {
        super();

        this.parentSettingItem = parentSettingItem;

        this._configurator = configurator;
    }

    private readonly _configurator?: SettingColumnConfigurator<IDropdownFluentApi>;

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
    getSelectedValue(): SelectItem {
        return {
            key: this._selectEl.value,
            value: this._selectEl.selectedOptions[0].text,
        };
    }

    /**
     * @inheritdoc
     */
    build(): void {
        this.registerDomEvent(this._selectEl, 'change', () => {
            if (this._onChangeCallback) {
                this._onChangeCallback(this.getSelectedValue());
            }
        });

        if (this._options) {
            const options = this._options();

            options.forEach((option) => {
                const optionEl = document.createElement('option');
                optionEl.value = option.key;
                optionEl.text = option.value;

                this._selectEl.appendChild(optionEl);
            });
        }

        if (
            this._value != null &&
            this._selectEl.querySelector(
                `option[value="${this._value.key}"]`,
            ) != null
        ) {
            this._selectEl.value = this._value.key;
        } else {
            this._selectEl.value = this._selectEl.options[0].value;
        }
    }

    /**
     * @inheritdoc
     */
    setDisabled(shouldDisabled: boolean): IDropdownFluentApi {
        throw new Error('Method not implemented.');
    }

    /**
     * @inheritdoc
     */
    setValue(key: string, value: string): IDropdownFluentApi {
        this._value = {
            key,
            value,
        };

        return this;
    }

    /**
     * @inheritdoc
     */
    onChange(callback: OnChangeCallback): IDropdownFluentApi {
        this._onChangeCallback = callback;

        return this;
    }

    /**
     * @inheritdoc
     */
    setOptions(
        options: SelectOptions | SelectOptionsCallback,
    ): IDropdownFluentApi {
        if (typeof options === 'function') {
            this._options = options;
        } else {
            this._options = (): SelectOptions => options;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    then(callback: (dropdown: IDropdownProtected) => void): IDropdownFluentApi {
        throw new Error('Method not implemented.');
    }
}
