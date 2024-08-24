import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { broadcastEvent, DIComponent, onEvent } from 'src/libs/DIComponent';
import type { IFlow_, IFlowApi } from 'src/libs/HTMLFlow/interfaces/IFlow';
import { Opts } from 'src/libs/HTMLFlow/Opts';
import { IFlowConfig } from 'src/libs/HTMLFlow/types/IFlowDelegates';
import type { ILifecycleManager_ } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import { ValidatorDelegate } from 'src/libs/Settings/interfaces/ISettingColumn';
import type {
    ISettingRow_,
    SettingConfigurator,
} from 'src/libs/Settings/interfaces/ISettingRow';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import { CallbackError, MissingCallbackError } from './interfaces/Exceptions';
import type {
    IDraggableElement,
    IDraggableElement_,
} from './interfaces/IDraggableElement';
import { IModal, IModal_, IModalFluentApi } from './interfaces/IModal';
import { IModalSettings } from './interfaces/IModalSettings';
import {
    ICloseCallback,
    IOpenCallback,
    IShouldOpenCallback,
} from './types/IModalCallbacks';

/**
 * Represents a custom modal, which can be dragged around
 * and don't dim the background.
 */
@Register('IModal_')
@ImplementsStatic<IModal_>()
export class Modal extends DIComponent implements IModal, IModalFluentApi {
    @Inject('IFlow_')
    protected readonly _IFlow_!: IFlow_;
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('CustomModal'), false)
    protected readonly _logger?: ILogger;
    @Inject('ILifecycleManager_')
    private readonly _ILifecycleManager_!: ILifecycleManager_;
    @Inject('IDraggableElement_')
    private readonly _IDraggableElement_!: IDraggableElement_;
    @Inject('ISettingRow_')
    private readonly _ISetting_: ISettingRow_;

    private readonly _flowConfig: IFlowConfig<keyof HTMLElementTagNameMap> = (
        cfg: IFlowApi<keyof HTMLElementTagNameMap>,
    ) => {
        const opts = Opts.inspect(this._settings);

        cfg.appendChildEl('div', (modalContainer) => {
            modalContainer
                .getEl(
                    (modalContainerEl) =>
                        (this._modalContainer = modalContainerEl),
                )
                .set({
                    Classes: ['modal-container', 'mod-dim'],
                    Styles: {
                        pointerEvents:
                            opts.willDimBackground === false
                                ? 'none'
                                : undefined,
                    },
                })
                .appendChildEl(
                    // If the model is draggable, the background can't be dimmed.
                    opts.willDimBackground === true && opts.isDraggable !== true
                        ? 'div'
                        : 'void',
                    (dimmedBackground) => {
                        dimmedBackground.set({
                            Classes: 'modal-bg',
                            Styles: { opacity: '0.85' },
                            Events: ['click', this.close.bind(this)],
                        });
                    },
                )
                .appendChildEl('div', (modal) => {
                    modal
                        .set({
                            Classes: 'modal',
                            Styles: {
                                pointerEvents: 'auto',
                            },
                        })
                        .appendChildEl('div', (closeButton) => {
                            closeButton.set({
                                Classes: 'modal-close-button',
                                Events: ['click', this.close.bind(this)],
                            });
                        })
                        .appendChildEl('div', (title) => {
                            title
                                .getEl((titleEl) => (this._title = titleEl))
                                .set({
                                    Classes: 'modal-title',
                                    TextContent: opts.title.value,
                                });
                        })
                        .appendChildEl('div', (content) => {
                            content
                                .getEl(
                                    (contentEl) => (this.content = contentEl),
                                )
                                .set({ Classes: 'modal-content' })
                                .appendChildEl(opts.additonalContent.value);
                        });
                });
        });
    };

    /**
     * @inheritdoc
     */
    public content: HTMLDivElement;

    /**
     * @inheritdoc
     */
    public get draggableClassName(): string | undefined {
        return this._draggableElement?.className;
    }

    /**
     * @inheritdoc
     */
    public readonly result: Record<string, unknown> = {};
    public readonly requiredResultKeys: Record<
        string,
        undefined | boolean | ValidatorDelegate
    > = {};

    /**
     * @inheritdoc
     */
    public get isRequiredFullfilled(): boolean {
        return Object.keys(this.requiredResultKeys).every((key) => {
            const value = this.result[key];
            const required = this.requiredResultKeys[key];

            if (required == null || required === false) {
                return true;
            } else if (typeof required === 'function') {
                const validator = required;

                return validator(value);
            } else {
                if (typeof value === 'string') {
                    return value.trim().length > 0;
                } else {
                    return value != null;
                }
            }
        });
    }

    private _modalContainer: HTMLDivElement;
    private _title: HTMLDivElement;
    private _draggableElement?: IDraggableElement;

    private readonly _settings: IModalSettings = new ModalSettings();

    /**
     * Creates a new Modal.
     */
    constructor() {
        super();

        this.unload = this.unload.bind(this);
    }

    /**
     * @inheritdoc
     */
    public open(): void {
        this.load();
    }

    /**
     * @inheritdoc
     */
    private _open(): void {
        if (this._settings.onOpen == null) {
            this._logger?.error('The onOpen callback must be set.');
            this.unload();
            throw new MissingCallbackError('onOpen');
        }

        try {
            // Check if the modal can be opened
            if (this._settings.shouldOpen?.() === false) return;
        } catch (error) {
            this._logger?.error('Error in shouldOpen callback', error);
            this.unload();
            throw new CallbackError('shouldOpen', error);
        }

        // Register the before unload event
        // to close the modal when the plugin is unloaded.
        this.initializeUnloadHandler();

        const flow = new this._IFlow_(document.body, this._flowConfig);

        this.addChild(flow);

        if (this._settings.isDraggable) {
            this._draggableElement = new this._IDraggableElement_(
                this._modalContainer,
                this._title,
                this,
            );

            this._draggableElement.enableDragging();
        }

        try {
            this._settings.onOpen?.(this);
        } catch (error) {
            this._logger?.error('Error in onOpen callback', error);
            this.unload();
            throw new CallbackError('onOpen', error);
        }
    }

    /**
     * Registers the before unload event to unload the modal
     * on plugin unload.
     * @see {@link cleanupUnloadHandler}
     */
    private initializeUnloadHandler(): void {
        this._ILifecycleManager_.register('before', 'unload', this.unload);
    }

    /**
     * Unregisters the before unload event to unload the modal
     * on plugin unload.
     * @see {@link initializeUnloadHandler}
     */
    private cleanupUnloadHandler(): void {
        this._ILifecycleManager_.unregister('before', 'unload', this.unload);
    }

    /**
     * @inheritdoc
     */
    public close(): void {
        this._close();
        this.unload();
    }

    /**
     * @inheritdoc
     */
    private _close(): void {
        try {
            this._settings.onClose?.(this);
        } catch (error) {
            this._logger?.error('Error in onClose callback', error);
            this.unload();
            throw new CallbackError('onClose', error);
        }
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        this._open();

        /**
         * Broadcast the common window classes to the plugin.
         */
        if (this._draggableElement?.className != null) {
            this[broadcastEvent]('common-window-classes', [
                this._draggableElement.className,
            ]);
        }

        /**
         * Register on `result` event to get the result of the modal.
         */
        this[onEvent]('result', (key: string, value: string) => {
            this.result[key] = value;
        });

        /**
         * Register on `required-results` event to get the required results of the modal.
         */
        this[onEvent](
            'required-results',
            (key: string, required: boolean | ValidatorDelegate) => {
                this.requiredResultKeys[key] = required;
            },
        );

        /**
         * Broadcast the modal loaded event to the plugin.
         */
        this[broadcastEvent]('loaded');
    }

    /**
     * @inheritdoc
     */
    public override onunload(): void {
        this._modalContainer?.remove();
        this.cleanupUnloadHandler();
    }

    /**
     * @inheritdoc
     */
    public setShouldOpen(shouldOpen: IShouldOpenCallback): this {
        this._settings.shouldOpen = shouldOpen;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setOnOpen(onOpen: IOpenCallback): this {
        this._settings.onOpen = onOpen;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setOnClose(onClose: ICloseCallback): this {
        this._settings.onClose = onClose;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setTitle(title: string): this {
        this._settings.title = title;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setContent(content: DocumentFragment): this {
        this._settings.additonalContent = content;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDraggableEnabled(isDraggable: boolean): this {
        this._settings.isDraggable = isDraggable;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setBackgroundDimmed(willDimBackground: boolean): this {
        this._settings.willDimBackground = willDimBackground;

        return this;
    }

    /**
     * @inheritdoc
     */
    public addSettingRow(configure: SettingConfigurator): IModalFluentApi {
        new this._ISetting_(this, configure);

        return this;
    }

    /**
     * @inheritdoc
     */
    public then(
        callback: (modal: IModal & IModalFluentApi) => unknown,
    ): IModalFluentApi {
        callback(this);

        return this;
    }
}

/**
 * Settings for the modal.
 * The settings will be set with the fluent API of {@link IModal}
 */
class ModalSettings implements IModalSettings {
    private _title?: string;

    /**
     * @inheritdoc
     */
    public set title(value: string) {
        this._title = value;
    }

    /**
     * @inheritdoc
     */
    public get title(): string {
        return typeof this._title === 'string' && this._title.trim().length > 0
            ? this._title
            : '\u00A0';
    }

    private readonly _additonalContent: DocumentFragment =
        new DocumentFragment();

    /**
     * @inheritdoc
     */
    public set additonalContent(value: DocumentFragment) {
        this._additonalContent.appendChild(value);
    }

    /**
     * @inheritdoc
     */
    public get additonalContent(): DocumentFragment {
        return this._additonalContent;
    }

    /**
     * @inheritdoc
     */
    public isDraggable: boolean = false;
    /**
     * @inheritdoc
     */
    public willDimBackground: boolean = true;
    /**
     * @inheritdoc
     */
    public shouldOpen?: IShouldOpenCallback;
    /**
     * @inheritdoc
     */
    public onOpen?: IOpenCallback;
    /**
     * @inheritdoc
     */
    public onClose?: ICloseCallback;
}
