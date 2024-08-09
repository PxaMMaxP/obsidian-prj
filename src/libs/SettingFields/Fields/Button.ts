import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIComponent } from 'src/libs/DIComponent/DIComponent';
import type { IFlow_, IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import {
    IButtonFluentAPI,
    IButtonInternal,
    OnClickCallback,
} from './interfaces/IButton';
import type { SettingFieldConfigurator } from '../interfaces/ISettingField';
import type { IInternalSettingItem } from '../interfaces/SettingItem';

/**
 * A button field.
 */
@Register('SettingFields.button')
export class Button extends DIComponent implements IButtonInternal {
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
    public readonly parentSettingItem: IInternalSettingItem;
    private readonly _configurator?: SettingFieldConfigurator<IButtonFluentAPI>;

    /**
     * @inheritdoc
     */
    get buttenEl(): HTMLButtonElement {
        return this._buttonEl;
    }

    /**
     * Creates a new instance of the button field.
     * @param parentSettingItem The parent setting item.
     * @param configurator The configurator of the button field.
     */
    constructor(
        parentSettingItem: IInternalSettingItem,
        configurator?: SettingFieldConfigurator<IButtonFluentAPI>,
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

/**
 * Represents the settings of a button field.
 */
interface IButtonSettings {
    /**
     * The text of the button.
     */
    text: string;
    /**
     * Whether **Call to Action** is enabled.
     */
    cta: boolean;
    /**
     * The callback that is called when the button is clicked.
     */
    onClick?: OnClickCallback;
    /**
     * Whether the button is disabled.
     */
    isDisabled: boolean;
}
