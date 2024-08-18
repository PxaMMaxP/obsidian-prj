import { isIDIComponent } from './isIDIComponent';
import { IDIComponentEvents } from '../interfaces/IDIComponent';

/**
 * The constructor of the component class.
 * @protected
 */
export const _componentClass = Symbol('componentClass');

/**
 * The instance of the component class.
 * @protected
 */
export const _componentInstance = Symbol('componentInstance');

/**
 * The original methods of the component.
 * @protected
 */
export const _componentOriginalMethods = Symbol('componentOriginalMethods');

/**
 * The registered events of the component.
 * @see {@link IDIComponentEvents}
 * @protected
 */
export const _registeredEvents = Symbol('registeredEvents');

/**
 * Tells whether the event is reflected.
 * @protected
 */
export const _isReflected = Symbol('isReflected');

/**
 * A reference to the IDIComponent,
 * if the component is an instance of it.
 * @see {@link isIDIComponent}
 * @public
 */
export const _IDIComponent = Symbol('IDIComponent');

/**
 * The parent component of the component.
 * @public
 */
export const _parentComponent = Symbol('parentComponent');

/**
 * The children components of the component.
 * @public
 */
export const _childrenComponents = Symbol('childrenComponents');

/**
 * Tells whether the component is loaded.
 * @public
 */
export const isLoaded = Symbol('isLoaded');

/**
 * Gets whether the component should be automatically removed
 * from the parent component when unloaded.
 * @public
 */
export const shouldRemoveOnUnload = Symbol('shouldAutoRemove');

/**
 * @see {@link IDIComponentEvents[emitEvent]}
 * @public
 */
export const emitEvent = Symbol('emitEvent');

/**
 * @see {@link IDIComponentEvents[broadcastEvent]}
 * @public
 */
export const broadcastEvent = Symbol('broadcastEvent');

/**
 * @see {@link IDIComponentEvents[onEvent]}
 * @public
 */
export const onEvent = Symbol('onEvent');
