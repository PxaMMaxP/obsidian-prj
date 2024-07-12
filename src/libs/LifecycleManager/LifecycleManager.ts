/* eslint-disable jsdoc/require-description */
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
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
@ImplementsStatic<ILifecycleManager_>()
@Singleton
export class LifecycleManager implements ILifecycleManager {
    private _isInitPerformed = false;
    private _isLoadPerformed = false;
    private _isUnloadPerformed = false;

    /**
     *
     */
    private get isInitPerformed(): boolean {
        return this._isInitPerformed;
    }

    /**
     *
     */
    private initPerfomed(): void {
        this._isInitPerformed = true;
    }

    /**
     *
     */
    private get isLoadPerformed(): boolean {
        return this._isLoadPerformed;
    }

    /**
     *
     */
    private loadPerformed(): void {
        this._isLoadPerformed = true;
    }

    /**
     *
     */
    private get isUnloadPerformed(): boolean {
        return this._isUnloadPerformed;
    }

    /**
     *
     */
    private unloadPerformed(): void {
        this._isUnloadPerformed = true;
    }

    private _callbacks: {
        [key in ILifecycleState]?: {
            [key in ILifecycleTime]?: Array<ILifecycleCallback>;
        };
    } = {
        init: { before: [], on: [], after: [] },
        load: { before: [], on: [], after: [] },
        unload: { before: [], on: [], after: [] },
    };

    /**
     *
     */
    async onInit(): Promise<void> {
        await this.executeCallbacks('init', 'before');
        await this.executeCallbacks('init', 'on');
        await this.executeCallbacks('init', 'after');
        this.initPerfomed();
    }

    /**
     *
     */
    async onLoad(): Promise<void> {
        await this.executeCallbacks('load', 'before');
        await this.executeCallbacks('load', 'on');
        await this.executeCallbacks('load', 'after');
        this.loadPerformed();
    }

    /**
     *
     */
    async onUnload(): Promise<void> {
        await this.executeCallbacks('unload', 'before');
        await this.executeCallbacks('unload', 'on');
        await this.executeCallbacks('unload', 'after');
        this.unloadPerformed();
    }

    /**
     *
     * @param state
     * @param time
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
     *
     * @param time
     * @param state
     * @param callback
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
            this._callbacks[state]![time]!.push(callback);
        }
    }

    /**
     *
     * @param time
     * @param state
     * @param callback
     */
    public static async register(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): Promise<void> {
        await new LifecycleManager().registerOn(time, state, callback);
    }
}
