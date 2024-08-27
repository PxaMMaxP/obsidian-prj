import { Implements_ } from 'src/classes/decorators/Implements';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { EventsParameters } from 'src/libs/HTMLFlow/types/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import { ISettingColumn_ } from './interfaces/ISettingColumn';
import {
    IToggle,
    IToggleElements,
    IToggleFluentApi,
    IToggleProtected,
    IToggleSettings,
} from './interfaces/IToggle';
import { SettingColumn } from './SettingColumn';
import type { SettingColumnConfigurator } from './types/General';
import { OnChangeCallback } from './types/Toggle';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a toggle field.
 */
@Register('SettingFields.toggle')
@Implements_<ISettingColumn_<typeof Toggle>>()
export class Toggle
    extends SettingColumn<
        IToggleFluentApi,
        IToggleElements,
        IToggleSettings,
        IToggleProtected
    >
    implements IToggle, IToggleProtected, IToggleFluentApi
{
    private _isToggled = false;

    /**
     * @inheritdoc
     */
    public get isToggled(): boolean {
        return this._isToggled;
    }

    protected readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
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
                        if (this._settings.isDisabled !== true)
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

                                    this.emitResult(this._isToggled);
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

    /**
     * Creates a new toggle field.
     * @param parentSettingItem The setting item that the field belongs to.
     * @param configurator A function that configures the field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IToggleFluentApi>,
    ) {
        super(parentSettingItem, configurator, {
            isToggled: false,
            onChangeCallback: undefined,
        });
    }

    /**
     * @inheritdoc
     */
    setToggled(isToggled: boolean): IToggleFluentApi {
        this._settings.isToggled = isToggled;

        return this;
    }

    /**
     * @inheritdoc
     */
    onChange(callback: OnChangeCallback): IToggleFluentApi {
        this._settings.onChangeCallback = callback;

        return this;
    }
}
