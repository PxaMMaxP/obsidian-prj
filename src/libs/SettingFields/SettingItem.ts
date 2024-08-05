import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { InstantiationError, SettingError } from './interfaces/Exceptions';
import type {
    IInternalSettingItem,
    ISettingItem,
    ISettingItem_,
    ISettingItemFluentAPI,
    SettingConfigurator,
} from './interfaces/SettingItem';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { Register } from '../DependencyInjection/decorators/Register';
import { DIComponent } from '../Modals/CustomModal/DIComponent';
import type { ICustomModal } from '../Modals/CustomModal/interfaces/ICustomModal';

/**
 * Implementation of {@link ISettingItem}.
 * Represents a setting item block.
 */
@Register('ISettingItem_')
@ImplementsStatic<ISettingItem_>()
export class SettingItem extends DIComponent implements IInternalSettingItem {
    //#region Dependencies
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('SettingItem'), false)
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
    public readonly parentModal: ICustomModal | undefined;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingItem) => {
        const settingFieldEl = document.createElement('div');
        settingFieldEl.classList.add('setting-item');
        ctx.parentContainerEl.appendChild(settingFieldEl);

        return settingFieldEl;
    }, 'Readonly')
    public readonly settingFieldEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingItem) => {
        const infoEl = document.createElement('div');
        infoEl.classList.add('setting-item-info');
        ctx.settingFieldEl.insertBefore(infoEl, ctx.settingFieldEl.firstChild);

        return infoEl;
    }, 'Readonly')
    public readonly infoEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingItem) => {
        const nameEl = document.createElement('div');
        nameEl.classList.add('setting-item-name');
        ctx.infoEl.insertBefore(nameEl, ctx.infoEl.firstChild);

        return nameEl;
    }, 'Readonly')
    public readonly nameEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingItem) => {
        const descriptionEl = document.createElement('div');
        descriptionEl.classList.add('setting-item-description');
        ctx.infoEl.appendChild(descriptionEl);

        return descriptionEl;
    }, 'Readonly')
    public readonly descriptionEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingItem) => {
        const displayEl = document.createElement('div');
        displayEl.classList.add('setting-item-display');
        ctx.settingFieldEl.insertBefore(displayEl, ctx.inputEl);

        return displayEl;
    }, 'Readonly')
    public readonly displayEl: HTMLElement;

    /**
     * @inheritdoc
     */
    @LazzyLoading((ctx: SettingItem) => {
        const inputEl = document.createElement('div');
        inputEl.classList.add('setting-item-control');
        ctx.settingFieldEl.appendChild(inputEl);

        return inputEl;
    }, 'Readonly')
    public readonly inputEl: HTMLElement;

    /**
     * Creates a new setting block.
     * @param parentModal The `ICustomModal` instance that the setting field belongs to.
     * @param configure A function that configures the setting field {@link SettingItem.onload|on load}.
     * @param parentContainerEl The container element to add the setting block.
     * Only if `modal` is `undefined`.
     * @param parentComponent The component that the setting field belongs to.
     * It is used to register the setting block as a child of the component.
     * Only if `modal` is `undefined`.
     */
    constructor(
        parentModal: ICustomModal | undefined,
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
                'Invalid arguments for `SettingItem` constructor.',
                'Arguments:',
                parentModal,
                configure,
                parentContainerEl,
                parentComponent,
            );

            throw new SettingError(
                'Invalid arguments for `SettingItem` constructor.',
            );
        }

        this._configurator = configure;

        this.parentComponent.addChild(this);
    }

    /**
     * The configurator function that configures the setting item.
     */
    private readonly _configurator?: SettingConfigurator;

    /**
     * Apply the {@link SettingConfigurator} to the setting item.
     */
    public override onload(): void {
        if (this._configurator) {
            this._configurator(this);
        }
    }

    /**
     * @inheritdoc
     */
    setClass(className: string | string[]): ISettingItemFluentAPI {
        if (Array.isArray(className)) {
            this.settingFieldEl.classList.add(...className);
        } else {
            this.settingFieldEl.classList.add(className);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setName(name: string | DocumentFragment): ISettingItemFluentAPI {
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
    ): ISettingItemFluentAPI {
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
    setDisplay(display: string | DocumentFragment): ISettingItemFluentAPI {
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
    setDisabled(shouldDisabled: boolean): ISettingItemFluentAPI {
        throw new Error('Method not implemented.');
    }

    /**
     * Adds a setting field to the setting.
     * @param settingField The setting field to add.
     * @param configure A function that configures the setting field.
     * @returns The setting field.
     */
    add<Type extends new (...args: unknown[]) => unknown>(
        settingField: Type,
        configure: ConstructorParameters<Type>[1],
    ): ISettingItemFluentAPI {
        let settingFieldInstance: unknown;

        try {
            settingFieldInstance = new settingField(this, configure);
        } catch (error) {
            this._logger?.error(
                `Error instantiating ${settingField.name}: ${error.message}`,
            );
            this._unload();
            throw new InstantiationError(settingField.name, error);
        }

        this.addChild(settingFieldInstance as Component);

        return this;
    }

    /**
     * @inheritdoc
     */
    private _unload(): void {
        this._logger?.warn('`SettingItem` forced to unload.');
        this.parentComponent.removeChild(this);
    }

    /**
     * @inheritdoc
     */
    then(
        callback: (settingField: ISettingItem) => ISettingItemFluentAPI,
    ): ISettingItemFluentAPI {
        try {
            return callback(this);
        } catch (error) {
            this._logger?.error(`Error in then callback: ${error.message}`);
            this._unload();
            throw new InstantiationError('then', error);
        }
    }
}
