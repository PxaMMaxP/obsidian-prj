/**
 * Represents a dropdown field entry.
 * @param key The key of the dropdown field value.
 * @param value The value of the dropdown field.
 */

export type SelectItem = {
    key: string;
    value: string;
};
/**
 * A callback that is called when the value of the dropdown field changes.
 * @param item The key & value of the dropdown field: {@link SelectItem}.
 * @returns The new value of the dropdown field.
 */
export type OnChangeCallback = (item: SelectItem) => void;
/**
 * Represents the options of the dropdown field.
 * @see {@link SelectItem}
 */
export type SelectOptions = SelectItem[];
/**
 * A callback that returns the options of the dropdown field.
 * @returns The options of the dropdown field: {@link SelectOptions}.
 */
export type SelectOptionsCallback = () => SelectItem[];
