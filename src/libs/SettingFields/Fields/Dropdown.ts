import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import {
    IDropdownFluentAPI,
    IInternalDropdown,
    OnChangeCallback,
    SelectItem,
    SelectOptions,
    SelectOptionsCallback,
} from './interfaces/IDropdown';
import type {
    ISettingField_,
    SettingFieldConfigurator,
} from '../interfaces/ISettingField';
import type { IInternalSettingItem } from '../interfaces/SettingItem';

/**
 * Represents a dropdown field.
 */
@Register('SettingFields.dropdown')
@ImplementsStatic<ISettingField_<typeof Dropdown>>()
export class Dropdown extends DIComponent implements IInternalDropdown {
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;

    public readonly parentSettingItem: IInternalSettingItem & Component;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: Dropdown) => {
        const selectEl = document.createElement('select');
        selectEl.addClass('dropdown');
        ctx.parentSettingItem.inputEl.appendChild(selectEl);

        return selectEl;
    }, 'Readonly')
    public readonly selectEl: HTMLSelectElement;

    private _value?: SelectItem;

    private _onChangeCallback?: OnChangeCallback;
    private _options?: SelectOptionsCallback;

    /**
     * Creates a new dropdown field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator A function that configures the dropdown field.
     */
    constructor(
        parentSettingItem: IInternalSettingItem,
        configurator?: SettingFieldConfigurator<IDropdownFluentAPI>,
    ) {
        super();

        this.parentSettingItem = parentSettingItem;

        this._configurator = configurator;
    }

    private readonly _configurator?: SettingFieldConfigurator<IDropdownFluentAPI>;

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
            key: this.selectEl.value,
            value: this.selectEl.selectedOptions[0].text,
        };
    }

    /**
     * @inheritdoc
     */
    build(): void {
        this.registerDomEvent(this.selectEl, 'change', () => {
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

                this.selectEl.appendChild(optionEl);
            });
        }

        if (
            this._value != null &&
            this.selectEl.querySelector(`option[value="${this._value.key}"]`) !=
                null
        ) {
            this.selectEl.value = this._value.key;
        } else {
            this.selectEl.value = this.selectEl.options[0].value;
        }
    }

    /**
     * @inheritdoc
     */
    setDisabled(shouldDisabled: boolean): IDropdownFluentAPI {
        throw new Error('Method not implemented.');
    }

    /**
     * @inheritdoc
     */
    setValue(key: string, value: string): IDropdownFluentAPI {
        this._value = {
            key,
            value,
        };

        return this;
    }

    /**
     * @inheritdoc
     */
    onChange(callback: OnChangeCallback): IDropdownFluentAPI {
        this._onChangeCallback = callback;

        return this;
    }

    /**
     * @inheritdoc
     */
    setOptions(
        options: SelectOptions | SelectOptionsCallback,
    ): IDropdownFluentAPI {
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
    then(callback: (dropdown: IInternalDropdown) => void): IDropdownFluentAPI {
        throw new Error('Method not implemented.');
    }
}
