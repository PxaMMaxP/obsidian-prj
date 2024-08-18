import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Inject, TSinjex } from 'ts-injex';
import { Register } from 'ts-injex';
import { InstantiationError, SettingRowError } from './interfaces/Exceptions';
import type {
    ISettingRowProtected,
    ISettingRow,
    ISettingRow_,
    ISettingRowFluentApi,
    SettingConfigurator,
} from './interfaces/ISettingRow';
import { DIComponent } from '../DIComponent/DIComponent';
import type { IModal } from '../Modals/CustomModal/interfaces/IModal';

/**
 * Implementation of {@link ISettingRow}.
 * Represents a setting row.
 */
@Register('ISettingRow_')
@ImplementsStatic<ISettingRow_>()
export class SettingRow extends DIComponent implements ISettingRowProtected {
    //#region Dependencies
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('SettingRow'), false)
    protected _logger?: ILogger;
    //#endregion

    /**
     * @inheritdoc
     */
    public readonly parentContainerEl: HTMLElement | DocumentFragment;
    /**
     * @inheritdoc
     */
    public readonly parentComponent: Component;
    /**
     * @inheritdoc
     */
    public readonly parentModal: IModal | undefined;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingRow) => {
        const settingFieldEl = document.createElement('div');
        settingFieldEl.classList.add('setting-item');
        ctx.parentContainerEl.appendChild(settingFieldEl);

        return settingFieldEl;
    }, 'Readonly')
    public readonly settingRowEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingRow) => {
        const infoEl = document.createElement('div');
        infoEl.classList.add('setting-item-info');
        ctx.settingRowEl.insertBefore(infoEl, ctx.settingRowEl.firstChild);

        return infoEl;
    }, 'Readonly')
    public readonly infoEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingRow) => {
        const nameEl = document.createElement('div');
        nameEl.classList.add('setting-item-name');
        ctx.infoEl.insertBefore(nameEl, ctx.infoEl.firstChild);

        return nameEl;
    }, 'Readonly')
    public readonly nameEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingRow) => {
        const descriptionEl = document.createElement('div');
        descriptionEl.classList.add('setting-item-description');
        ctx.infoEl.appendChild(descriptionEl);

        return descriptionEl;
    }, 'Readonly')
    public readonly descriptionEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingRow) => {
        const displayEl = document.createElement('div');
        displayEl.classList.add('setting-item-display');
        ctx.settingRowEl.insertBefore(displayEl, ctx.inputEl);

        return displayEl;
    }, 'Readonly')
    public readonly displayEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingRow) => {
        const inputEl = document.createElement('div');
        inputEl.classList.add('setting-item-control');
        ctx.settingRowEl.appendChild(inputEl);

        return inputEl;
    }, 'Readonly')
    public readonly inputEl: HTMLElement;

    /**
     * Creates a new setting row.
     * @param parentModal The `ICustomModal` instance that the setting row belongs to.
     * @param configure A function that configures the setting row {@link ISettingRow.onload|on load}.
     * @param parentContainerEl The container element to add the setting row.
     * Only if `modal` is `undefined`.
     * @param parentComponent The component that the setting row belongs to.
     * It is used to register the setting block as a child of the component.
     * Only if `modal` is `undefined`.
     */
    constructor(
        parentModal: IModal | undefined,
        configure?: SettingConfigurator,
        parentContainerEl?: HTMLElement | DocumentFragment,
        parentComponent?: Component,
    ) {
        super();

        if (parentModal != undefined) {
            this.parentContainerEl = parentModal.content;
            this.parentComponent = parentModal;
            this.parentModal = parentModal;
        } else if (
            parentContainerEl != undefined &&
            parentComponent != undefined
        ) {
            this.parentContainerEl = parentContainerEl;
            this.parentComponent = parentComponent;
            this.parentModal = undefined;
        } else {
            this._logger?.error(
                'Invalid arguments for `SettingRow` constructor.',
                'Arguments:',
                parentModal,
                configure,
                parentContainerEl,
                parentComponent,
            );

            throw new SettingRowError(
                'Invalid arguments for `SettingRow` constructor.',
            );
        }

        this._configurator = configure;

        this.parentComponent.addChild(this);
    }

    /**
     * The configurator function that configures the setting row.
     */
    private readonly _configurator?: SettingConfigurator;

    /**
     * @inheritdoc
     */
    public override onload(): void {
        if (this._configurator) {
            this._configurator(this);
        }
    }

    /**
     * @inheritdoc
     */
    setClass(className: string | string[]): ISettingRowFluentApi {
        if (Array.isArray(className)) {
            this.settingRowEl.classList.add(...className);
        } else {
            this.settingRowEl.classList.add(className);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setName(name: string | DocumentFragment): ISettingRowFluentApi {
        if (typeof name === 'string') {
            this.nameEl.innerText = name;
        } else {
            this.nameEl.appendChild(name);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setDescription(
        description: string | DocumentFragment,
    ): ISettingRowFluentApi {
        if (typeof description === 'string') {
            this.descriptionEl.innerText = description;
        } else {
            this.descriptionEl.appendChild(description);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setDisplay(display: string | DocumentFragment): ISettingRowFluentApi {
        if (typeof display === 'string') {
            this.displayEl.innerText = display;
        } else {
            this.displayEl.appendChild(display);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setDisabled(shouldDisabled: boolean): ISettingRowFluentApi {
        throw new Error('Method not implemented.');
    }

    /**
     * @inheritdoc
     */
    add<Type extends new (...args: unknown[]) => unknown>(
        settingField: Type,
        configure: ConstructorParameters<Type>[1],
    ): ISettingRowFluentApi {
        let settingField_: Type;
        let settingFieldInstance: unknown;

        if (typeof settingField === 'string') {
            settingField_ = TSinjex.getInstance().resolve<Type>(
                'SettingFields.' + settingField,
            );
        } else {
            settingField_ = settingField;
        }

        try {
            settingFieldInstance = new settingField_(this, configure);
        } catch (error) {
            this._logger?.error(
                `Error instantiating ${settingField_.name}: ${error.message}`,
            );
            this._unload();
            throw new InstantiationError(settingField_.name, error);
        }

        this.addChild(settingFieldInstance as Component);

        return this;
    }

    /**
     * @inheritdoc
     */
    private _unload(): void {
        this._logger?.warn('`SettingRow` forced to unload.');
        this.parentComponent.removeChild(this);
    }

    /**
     * @inheritdoc
     */
    then(
        callback: (settingField: ISettingRow) => ISettingRowFluentApi,
    ): ISettingRowFluentApi {
        try {
            return callback(this);
        } catch (error) {
            this._logger?.error(`Error in then callback: ${error.message}`);
            this._unload();
            throw new InstantiationError('then', error);
        }
    }
}
