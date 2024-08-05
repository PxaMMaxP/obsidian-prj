/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from 'obsidian';

export const isLoaded = Symbol('isLoaded');
export const shouldRemoveOnUnload = Symbol('shouldAutoRemove');
export const _IDIComponent = Symbol('isLoaded');

export interface IDIComponent extends Component {
    /**
     * A reference to the IDIComponent,
     * if the component is an instance of it.
     */
    readonly [_IDIComponent]?: IDIComponent;

    /**
     * Gets whether the component is loaded.
     */
    readonly [isLoaded]: boolean;

    /**
     * Gets whether the component should be automatically removed
     * from the parent component when unloaded.
     * Only works if both components are instances of IDIComponent.
     */
    [shouldRemoveOnUnload]: boolean;
}

/**
 * Checks whether the component is an instance of IDIComponent.
 * @param component The component to check.
 * @returns Whether the component is an instance of IDIComponent.
 */
export function isIDIComponent(
    component: Component,
): component is Required<IDIComponent> {
    return (component as IDIComponent)[_IDIComponent] !== undefined;
}

export interface IComponent extends Component {
    /**
     * Tells whether the component is loaded.
     */
    _loaded?: boolean;

    /**
     * Registered child components.
     * @see {@link Component.addChild}
     * @see {@link Component.removeChild}
     */
    _children?: unknown[];

    /**
     * Registered on unloading events.
     * @see {@link Component.register}
     */
    _events?: unknown[];
}
