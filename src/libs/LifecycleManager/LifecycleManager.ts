/* eslint-disable jsdoc/require-description */
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import { Register } from 'ts-injex';
import {
    ILifecycleCallback,
    ILifecycleManager,
    ILifecycleManager_,
    ILifecycleState,
    ILifecycleTime,
} from './interfaces/ILifecycleManager';

/**
 * Lifecycle manager class.
 * @singleton See {@link Singleton|@Singleton} for more details.
 * @remarks
 * - Register callbacks to be called when the application is initialized, loaded, or unloaded.
 * - The `registerOn` method is used to register callbacks.
 * - Call the `onInit`, `onLoad`, and `onUnload` methods when the application is initialized, loaded, or unloaded.
 * - The `LifecycleManager` class is a singleton: you get the same instance every time you call the constructor.
 */
@Register('ILifecycleManager_')
@ImplementsStatic<ILifecycleManager_>()
@Singleton
export class LifecycleManager implements ILifecycleManager {
    private _isInitPerformed = false;
    private _isLoadPerformed = false;
    private _isUnloadPerformed = false;

    /**
     * Gets whether the initialization has been performed.
     */
    private get isInitPerformed(): boolean {
        return this._isInitPerformed;
    }

    /**
     * Sets the initialization as performed.
     */
    private initPerfomed(): void {
        this._isInitPerformed = true;
    }

    /**
     * Gets whether the loading has been performed.
     */
    private get isLoadPerformed(): boolean {
        return this._isLoadPerformed;
    }

    /**
     * Sets the loading as performed.
     */
    private loadPerformed(): void {
        this._isLoadPerformed = true;
    }

    /**
     * Gets whether the unloading has been performed.
     */
    private get isUnloadPerformed(): boolean {
        return this._isUnloadPerformed;
    }

    /**
     * Sets the unloading as performed.
     */
    private unloadPerformed(): void {
        this._isUnloadPerformed = true;
    }

    private readonly _callbacks: {
        [key in ILifecycleState]?: {
            [key in ILifecycleTime]?: Array<ILifecycleCallback>;
        };
    } = {
        init: { before: [], on: [], after: [] },
        load: { before: [], on: [], after: [] },
        unload: { before: [], on: [], after: [] },
    };

    /**
     * Executes the registered callbacks for the initialization, loading, or unloading state and time.
     * @param state - The lifecycle state (init, load, unload).
     * @param time - The lifecycle time (before, on, after).
     */
    private async executeCallbacks(
        state: ILifecycleState,
        time: ILifecycleTime,
    ): Promise<void> {
        const callbacks = this._callbacks[state]?.[time] || [];

        for (const callback of callbacks) {
            await callback();
        }
    }

    /**
     * Registers a callback to be executed on a specific lifecycle time and state.
     * @param time - The lifecycle time (before, on, after).
     * @param state - The lifecycle state (init, load, unload).
     * @param callback - The callback function to be executed.
     */
    private async registerOn(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): Promise<void> {
        if (
            (state === 'init' && this.isInitPerformed) ||
            (state === 'load' && this.isLoadPerformed) ||
            (state === 'unload' && this.isUnloadPerformed)
        ) {
            await callback();
        } else {
            this._callbacks[state]?.[time]?.push(callback);
        }
    }

    /**
     * Unregisters a callback to be executed on a specific lifecycle time and state.
     * @param time  The lifecycle time (before, on, after).
     * @param state  The lifecycle state (init, load, unload).
     * @param callback  The callback function to be executed.
     */
    private registerOff(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): void {
        const index = this._callbacks[state]?.[time]?.indexOf(callback);

        if (index !== undefined && index !== -1) {
            this._callbacks[state]?.[time]?.splice(index, 1);
        }
    }

    /**
     * Registers a callback to be executed on a specific lifecycle time and state.
     * @param time - The lifecycle time (before, on, after).
     * @param state - The lifecycle state (init, load, unload).
     * @param callback - The callback function to be executed.
     */
    public static async register(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): Promise<void> {
        await new LifecycleManager().registerOn(time, state, callback);
    }

    /**
     * Unregisters a callback to be executed on a specific lifecycle time and state.
     * @param time - The lifecycle time (before, on, after).
     * @param state - The lifecycle state (init, load, unload).
     * @param callback - The callback function to be executed.
     */
    public static unregister(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): void {
        new LifecycleManager().registerOff(time, state, callback);
    }

    /**
     * Executes the registered callbacks for the initialization state.
     */
    async onInit(): Promise<void> {
        await this.executeCallbacks('init', 'before');
        await this.executeCallbacks('init', 'on');
        await this.executeCallbacks('init', 'after');
        this.initPerfomed();
    }

    /**
     * Executes the registered callbacks for the loading state.
     */
    async onLoad(): Promise<void> {
        await this.executeCallbacks('load', 'before');
        await this.executeCallbacks('load', 'on');
        await this.executeCallbacks('load', 'after');
        this.loadPerformed();
    }

    /**
     * Executes the registered callbacks for the unloading state.
     */
    async onUnload(): Promise<void> {
        await this.executeCallbacks('unload', 'before');
        await this.executeCallbacks('unload', 'on');
        await this.executeCallbacks('unload', 'after');
        this.unloadPerformed();
    }
}
