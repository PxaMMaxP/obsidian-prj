import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import type { IFlow_, IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import {
    IButton,
    IButtonFluentAPI,
    IButtonProtected,
    IButtonSettings,
    OnClickCallback,
} from './interfaces/IButton';
import type { SettingColumnConfigurator } from '../interfaces/ISettingColumn';
import type { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * A button field.
 */
@Register('SettingFields.button')
export class Button
    extends DIComponent
    implements IButton, IButtonProtected, IButtonFluentAPI
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;
    @Inject('IFlow_')
    protected readonly _IFlow_!: IFlow_;

    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        cfg: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        cfg.appendChildEl('button', (cfg) => {
            cfg.getEl((el) => (this._buttonEl = el))
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

    private _buttonEl: HTMLButtonElement;
    private readonly _settings: IButtonSettings = {
        text: '',
        cta: false,
        onClick: undefined,
        isDisabled: false,
    };
    /**
     * @inheritdoc
     */
    public readonly parentSettingItem: ISettingRowProtected;
    private readonly _configurator?: SettingColumnConfigurator<IButtonFluentAPI>;

    /**
     * @inheritdoc
     */
    public get elements(): {
        buttonEl: HTMLButtonElement;
    } {
        return { buttonEl: this._buttonEl };
    }

    /**
     * Creates a new instance of the button field.
     * @param parentSettingItem The parent setting item.
     * @param configurator The configurator of the button field.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<IButtonFluentAPI>,
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

        const flow = new this._IFlow_(
            this.parentSettingItem.inputEl,
            this._flowConfig,
        );

        this.addChild(flow);
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
