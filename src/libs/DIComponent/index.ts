/**
 * Export DIComponent.
 */
export { DIComponent } from './DIComponent';
/**
 * Export interfaces.
 */
export type { IDIComponent } from './interfaces/IDIComponent';
/**
 * Export public symbols.
 */
export {
    _childrenComponents,
    _IDIComponent,
    _parentComponent,
    isLoaded,
    shouldRemoveOnUnload,
    emitEvent,
    broadcastEvent,
    onEvent,
} from './types/IDIComponentSymbols';
/**
 * Export type guards.
 */
export { isIDIComponent } from './types/isIDIComponent';
