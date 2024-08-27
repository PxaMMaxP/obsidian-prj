import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { EventsParameters } from 'src/libs/HTMLFlow/types/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import {
    IDropdown,
    IDropdownElements,
    IDropdownFluentApi,
    IDropdownProtected,
    IDropdownSettings,
} from './interfaces/IDropdown';
import { ISettingColumn_ } from './interfaces/ISettingColumn';
import { SettingColumn } from './SettingColumn';
import {
    OnChangeCallback,
    SelectItem,
    SelectOptions,
    SelectOptionsCallback,
} from './types/Dropdown';
import type { SettingColumnConfigurator } from './types/General';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a dropdown field.
 */
@Register('SettingFields.dropdown')
@ImplementsStatic<ISettingColumn_<typeof Dropdown>>()
export class Dropdown
    extends SettingColumn<
        IDropdownFluentApi,
        IDropdownElements,
        IDropdownSettings,
        IDropdownProtected
    >
    implements IDropdown, IDropdownProtected, IDropdownFluentApi
{
    protected readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        parent: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        parent.appendChildEl('select', (selectEl) => {
            selectEl.set({
                El: (el) => (this.elements.selectEl = el),
                Classes: ['dropdown'],
                Events: ((): EventsParameters<'select'> => {
                    const events: EventsParameters<'select'> = [];

                    if (this._settings.onChangeCallback != null)
                        events.push([
                            'change',
                            (_, __, ___) => {
                                this._settings.onChangeCallback?.(
                                    this.getSelectedValue(),
                                );
                            },
                        ]);

                    return events;
                })(),
            });

            this._settings.options?.().forEach((option) => {
                selectEl.appendChildEl('option', (optionEl) => {
                    optionEl.set({
                        value: option.key,
                        TextContent: option.value,
                    });
                });
            });

            selectEl.then((_ctx, el) => {
                if (
                    this._settings.value != null &&
                    this.elements.selectEl.querySelector(
                        `option[value="${this._settings.value.key}"]`,
                    ) != null
                )
                    el.value = this._settings.value.key;
                else el.value = el.options[0].value;
            });
        });
    };

    /**
     * Creates a new dropdown field.
     * @param parentSettingItem The setting item that the input field belongs to.
     * @param configurator A function that configures the dropdown field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IDropdownFluentApi>,
    ) {
        super(parentSettingItem, configurator, {
            value: undefined,
            onChangeCallback: undefined,
            options: undefined,
        });
    }

    /**
     * @inheritdoc
     */
    getSelectedValue(): SelectItem {
        return {
            key: this.elements.selectEl.value,
            value: this.elements.selectEl.selectedOptions[0].text,
        };
    }

    /**
     * @inheritdoc
     */
    setValue(key: string, value: string): IDropdownFluentApi {
        this._settings.value = {
            key,
            value,
        };

        return this;
    }

    /**
     * @inheritdoc
     */
    onChange(callback: OnChangeCallback): IDropdownFluentApi {
        this._settings.onChangeCallback = callback;

        return this;
    }

    /**
     * @inheritdoc
     */
    setOptions(
        options: SelectOptions | SelectOptionsCallback,
    ): IDropdownFluentApi {
        if (typeof options === 'function') {
            this._settings.options = options;
        } else {
            this._settings.options = (): SelectOptions => options;
        }

        return this;
    }
}
