import { isIDIComponent } from './isIDIComponent';
import { IDIComponentEvents } from '../interfaces/IDIComponent';

/**
 * The constructor of the component class.
 */
export const _componentClass = Symbol('componentClass');

/**
 * The instance of the component class.
 */
export const _componentInstance = Symbol('componentInstance');

/**
 * The original methods of the component.
 */
export const _componentOriginalMethods = Symbol('componentOriginalMethods');

/**
 * Tells whether the component is loaded.
 */
export const isLoaded = Symbol('isLoaded');

/**
 * Gets whether the component should be automatically removed
 * from the parent component when unloaded.
 */
export const shouldRemoveOnUnload = Symbol('shouldAutoRemove');

/**
 * A reference to the IDIComponent,
 * if the component is an instance of it.
 * @see {@link isIDIComponent}
 */
export const _IDIComponent = Symbol('IDIComponent');

/**
 * The parent component of the component.
 */
export const _parentComponent = Symbol('parentComponent');

/**
 * The children components of the component.
 */
export const _childrenComponents = Symbol('childrenComponents');

/**
 * The registered events of the component.
 * @see {@link IDIComponentEvents}
 */
export const _registeredEvents = Symbol('registeredEvents');
