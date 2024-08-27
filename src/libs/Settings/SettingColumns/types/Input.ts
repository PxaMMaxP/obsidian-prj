/**
 * Input types of {@link IInput}.
 */

export type InputType = 'textarea' | 'text' | 'password' | 'number' | 'date';
/**
 * Element types of {@link IInput}.
 */

export type InputElementType = 'HTMLInputElement' | 'HTMLTextAreaElement';
/**
 * A callback that is called when the value of the input field changes.
 * @param value The value of the input field.
 * @returns The new value of the input field.
 */

export type OnChangeCallback = (value: string) => void;
