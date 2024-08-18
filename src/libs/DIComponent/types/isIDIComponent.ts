import { _IDIComponent } from './IDIComponentSymbols';
import { IDIComponent } from '../interfaces/IDIComponent';

/**
 * Checks whether the component is an instance of IDIComponent.
 * @param component The component to check.
 * @returns Whether the component is an instance of IDIComponent.
 */
export function isIDIComponent(
    component: unknown,
): component is Required<IDIComponent> {
    return (component as IDIComponent)[_IDIComponent] !== undefined;
}
