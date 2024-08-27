/**
 * A function that configures a setting column.
 */
export type SettingColumnConfigurator<SettingColumnInstance> = (
    instance: SettingColumnInstance,
) => void;

/**
 * A function that transforms a value before it is sent to the modal.
 */
export type TransformerDelegate<ValueType = unknown, ResultType = unknown> = (
    value: ValueType,
) => ResultType;

/**
 * A function that validates a value.
 */
export type ValidatorDelegate<ValueType = unknown> = (
    value: ValueType,
) => boolean;
