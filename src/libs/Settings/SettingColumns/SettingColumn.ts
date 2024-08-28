import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { DIComponent, emitEvent, onEvent } from 'src/libs/DIComponent';
import type { IFlow_ } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import { Inject } from 'ts-injex';
import { ConfigurationError } from './interfaces/Exceptions';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnProtected,
    ISettingColumnSettings,
} from './interfaces/ISettingColumn';
import {
    SettingColumnConfigurator,
    TransformerDelegate,
    ValidatorDelegate,
} from './types/General';
import type { IGenericSuggest_ } from '../components/interfaces/IGenericSuggest';
import { ISettingRowProtected } from '../interfaces/ISettingRow';

/**
 * Represents a setting column.
 */
export abstract class SettingColumn<
        FluentApiType = unknown,
        ElementsType extends ISettingColumnElements = ISettingColumnElements,
        SettingsType extends ISettingColumnSettings = ISettingColumnSettings,
        ProtectedType extends ISettingColumnProtected = ISettingColumnProtected,
    >
    extends DIComponent
    implements ISettingColumn<FluentApiType, ElementsType, ProtectedType>
{
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('SettingColumn'), false)
    protected readonly __logger?: ILogger;
    @Inject('IFlow_')
    protected readonly __IFlow!: IFlow_;
    @Inject('IGenericSuggest_')
    protected readonly __IGenericSuggest!: IGenericSuggest_<string>;

    public readonly elements: ElementsType = {} as ElementsType;

    public readonly parentSettingItem: ISettingRowProtected;

    protected _settings: SettingsType = {
        key: '',
        transformer: undefined,
        isRequired: false,
        isDisabled: false,
    } as SettingsType;

    protected abstract readonly _flowConfig: IFlowConfig<
        keyof HTMLElementTagNameMap
    >;

    private readonly _configurator?: SettingColumnConfigurator<FluentApiType>;

    /**
     * Creates a new setting column.
     * @param parentSettingItem The parent setting row.
     * @param configurator A function that configures the setting column.
     * @param settings The settings of the setting column.
     * @param elements The elements of the setting column.
     */
    constructor(
        parentSettingItem: ISettingRowProtected,
        configurator?: SettingColumnConfigurator<FluentApiType>,
        settings?: Partial<SettingsType>,
        elements?: Partial<ElementsType>,
    ) {
        super();

        this.parentSettingItem = parentSettingItem;
        this.elements.parentEl = parentSettingItem.inputEl;
        this._configurator = configurator;

        if (settings != null)
            for (const key in settings)
                if (settings[key] != null) this._settings[key] = settings[key];

        if (elements != null)
            for (const key in elements)
                if (elements[key] != null) this.elements[key] = elements[key];
    }

    /**
     * Applies the configuration, initializes the flow and
     * listens for the loaded event.
     * @overload
     */
    public override onload(): void {
        try {
            this._configurator?.(this as unknown as FluentApiType);
        } catch (error) {
            this.__logger?.error(
                'An error occurred while applying the configuration.',
                'The Component will be unloaded.',
                'Error:',
                error,
            );
            this.unload();
            throw new ConfigurationError(`configurator-calback`, error);
        }
        this._initializeFlow();
        this[onEvent]('loaded', () => this.afterLoaded());
    }

    /**
     * Initializes the flow with the parent element (elements.parentEl)
     * and the flow configuration (_flowConfig).
     * After that, the flow is added as a child of this component.
     * @overload
     */
    protected _initializeFlow(): void {
        const flow = new this.__IFlow(this.elements.parentEl, this._flowConfig);
        this.addChild(flow);
    }

    /**
     * After all components are loaded
     * this method is called and the required results are emitted.
     * @overload
     */
    protected afterLoaded(): void {
        if (this._settings.key !== '')
            this[emitEvent](
                'required-results',
                this._settings.key,
                this._settings.isRequired,
            );
    }

    /**
     * Emits the result event if the key is not empty
     * and uses the transformer to transform the value
     * if it is set.
     * @param value The value to emit.
     * @overload
     */
    protected emitResult(value: unknown): void {
        if (this._settings.key !== '')
            this[emitEvent](
                'result',
                this._settings.key,
                this._settings.transformer?.(value) ?? value,
            );
    }

    /**
     * @inheritdoc
     */
    setResultKey(
        key: string,
        transformer?: TransformerDelegate,
    ): FluentApiType {
        this._settings.key = key;
        this._settings.transformer = transformer ?? this._settings.transformer;

        return this as unknown as FluentApiType;
    }

    /**
     * @inheritdoc
     */
    setRequired(test: unknown, required?: unknown): FluentApiType {
        const _test: ValidatorDelegate | undefined =
            typeof test === 'function'
                ? (test as ValidatorDelegate)
                : undefined;
        const _required: boolean = _test != null ? true : (test as boolean);

        this._settings.isRequired = _test != undefined ? _test : _required;

        return this as unknown as FluentApiType;
    }

    public setDisabled(isDisabled: boolean): FluentApiType {
        this._settings.isDisabled = isDisabled;

        return this as unknown as FluentApiType;
    }

    /**
     * @inheritdoc
     */
    then(callback: (input: ProtectedType) => void): FluentApiType {
        try {
            callback?.(this as unknown as ProtectedType);
        } catch (error) {
            this.__logger?.error(
                'An error occurred while executing the `then` callback.',
                'The Component will be unloaded.',
                'Error:',
                error,
            );
            this.unload();
            throw new ConfigurationError(`then-Callback`, error);
        }

        return this as unknown as FluentApiType;
    }
}
