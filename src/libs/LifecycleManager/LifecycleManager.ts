/* eslint-disable jsdoc/require-description */
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import {
    ILifecycleCallback,
    ILifecycleManager,
    ILifecycleManager_,
} from './interfaces/ILifecycleManager';

/**
 * Lifecycle manager class.
 * @singleton See {@link Singleton|@Singleton} for more details.
 * @remarks
 * - Register callbacks to be called when the application is initialized, loaded, or unloaded.
 * - The `registerOnInit`, `registerOnLoad`, and `registerOnUnload` methods are used to register callbacks.
 * - Call the `onInit`, `onLoad`, and `onUnload` methods when the application is initialized, loaded, or unloaded.
 * - The `LifecycleManager` class is a singleton: you get the same instance every time you call the constructor.
 */
@ImplementsStatic<ILifecycleManager_>()
@Singleton
export class LifecycleManager implements ILifecycleManager {
    private _isInitPerformed = false;
    /**
     * Get whether the application is initialized.
     */
    private get isInitPerformed(): boolean {
        return this._isInitPerformed;
    }
    /**
     * Set the application as initialized.
     */
    private initPerfomed(): void {
        this._isInitPerformed = true;
    }
    private _isLoadPerformed = false;
    /**
     * Get whether the application is loaded.
     */
    private get isLoadPerformed(): boolean {
        return this._isLoadPerformed;
    }
    /**
     * Set the application as loaded.
     */
    private loadPerformed(): void {
        this._isLoadPerformed = true;
    }
    private _isUnloadPerformed = false;
    /**
     * Get whether the application is unloaded.
     */
    private get isUnloadPerformed(): boolean {
        return this._isUnloadPerformed;
    }
    /**
     * Set the application as unloaded.
     */
    private unloadPerformed(): void {
        this._isUnloadPerformed = true;
    }
    private _initCallbacks: Array<ILifecycleCallback> = [];
    private _loadCallbacks: Array<ILifecycleCallback> = [];
    private _unloadCallbacks: Array<ILifecycleCallback> = [];

    /**
     * Run this method when the application is initialized.
     */
    async onInit(): Promise<void> {
        for (const callback of this._initCallbacks) {
            await callback();
        }
        this.initPerfomed();
    }

    /**
     * Run this method when the application is loaded.
     */
    async onLoad(): Promise<void> {
        for (const callback of this._loadCallbacks) {
            await callback();
        }
        this.loadPerformed();
    }

    /**
     * Run this method when the application is unloaded.
     */
    async onUnload(): Promise<void> {
        for (const callback of this._unloadCallbacks) {
            await callback();
        }
        this.unloadPerformed();
    }

    /**
     * Register a callback to be called when the application is initialized
     * or call the callback if the application is already initialized.
     * @param callback The callback to register.
     */
    private async registerOnInit(callback: ILifecycleCallback): Promise<void> {
        if (this.isInitPerformed) {
            await callback();
        } else {
            this._initCallbacks.push(callback);
        }
    }

    /**
     * Register a callback to be called when the application is loaded
     * or call the callback if the application is already loaded.
     * @param callback The callback to register.
     */
    private async registerOnLoad(callback: ILifecycleCallback): Promise<void> {
        if (this.isLoadPerformed) {
            await callback();
        } else {
            this._loadCallbacks.push(callback);
        }
    }

    /**
     * Register a callback to be called when the application is unloaded
     * or call the callback if the application is already unloaded.
     * @param callback The callback to register.
     */
    private async registerOnUnload(
        callback: ILifecycleCallback,
    ): Promise<void> {
        if (this.isUnloadPerformed) {
            await callback();
        } else {
            this._unloadCallbacks.push(callback);
        }
    }

    /**
     * Register a callback to be called when the application is initialized.
     * @param callback The callback to register.
     */
    public static async registerOnInit(
        callback: ILifecycleCallback,
    ): Promise<void> {
        await new LifecycleManager().registerOnInit(callback);
    }

    /**
     * Register a callback to be called when the application is loaded.
     * @param callback The callback to register.
     */
    public static async registerOnLoad(
        callback: ILifecycleCallback,
    ): Promise<void> {
        await new LifecycleManager().registerOnLoad(callback);
    }

    /**
     * Register a callback to be called when the application is unloaded.
     * @param callback The callback to register.
     */
    public static async registerOnUnload(
        callback: ILifecycleCallback,
    ): Promise<void> {
        await new LifecycleManager().registerOnUnload(callback);
    }
}
