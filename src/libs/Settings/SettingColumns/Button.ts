import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import {
    IButton,
    IButtonElements,
    IButtonFluentAPI,
    IButtonProtected,
    IButtonSettings,
} from './interfaces/IButton';
import { SettingColumn } from './SettingColumn';
import { OnClickCallback } from './types/Button';
import type { SettingColumnConfigurator } from './types/General';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * A button field.
 */
@Register('SettingFields.button')
export class Button
    extends SettingColumn<
        IButtonFluentAPI,
        IButtonElements,
        IButtonSettings,
        IButtonProtected
    >
    implements IButton, IButtonProtected, IButtonFluentAPI
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;

    protected readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        cfg: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        cfg.appendChildEl('button', (cfg) => {
            cfg.getEl((el) => (this.elements.buttonEl = el))
                .addClass(this._settings.cta ? 'mod-cta' : '')
                .setTextContent(this._settings.text)
                .setAttribute(
                    'disabled',
                    this._settings.isDisabled ? 'true' : undefined,
                )
                .addEventListener('click', (el, ev, flow) => {
                    this._settings.onClick?.(ev);
                });
        });
    };

    /**
     * Creates a new instance of the button field.
     * @param parentSettingItem The parent setting item.
     * @param configurator The configurator of the button field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IButtonFluentAPI>,
    ) {
        super(parentSettingItem, configurator, {
            text: '',
            cta: false,
            onClick: undefined,
            isDisabled: false,
        });
    }

    /**
     * @inheritdoc
     */
    setCta(isCtaEnabled: boolean): IButtonFluentAPI {
        this._settings.cta = isCtaEnabled;

        return this;
    }
    /**
     * @inheritdoc
     */
    onClick(onClick: OnClickCallback): IButtonFluentAPI {
        this._settings.onClick = onClick;

        return this;
    }
    /**
     * @inheritdoc
     */
    setButtonText(text: string): IButtonFluentAPI {
        this._settings.text = text;

        return this;
    }
    /**
     * @inheritdoc
     */
    setDisabled(shouldDisabled: boolean): IButtonFluentAPI {
        this._settings.isDisabled = shouldDisabled;

        return this;
    }
}
