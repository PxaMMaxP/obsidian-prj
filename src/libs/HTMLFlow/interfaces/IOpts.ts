/**
 * Interface for the options wrapper.
 */
export interface IOptsWrapper<T> {
    /**
     * The value of the wrapper.
     */
    get value(): T;

    /**
     * Check if the value is not `null` or `undefined`.
     * The comparison is done with the `!= null` operator.
     * @returns `true` if the value is not `null` or `undefined`, otherwise `false`.
     */
    is(): boolean;
    /**
     * Check if the value is equal to the provided value.
     * The comparison is done with the `===` operator.
     * @param value The value to compare.
     * @returns `true` if the value is equal, otherwise `false`.
     */
    is(value: Exclude<T, undefined>): boolean;

    /**
     * Check if the value is equal to the provided value using the provided operator.
     * @param operator The operator to use: `==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=`.
     * @param value The value to compare.
     * @returns `true` if the value is equal, otherwise `false`.
     */
    is<Op extends Operator>(operator: Op, value: T): boolean;
}

/**
 * Interface for the options inspector.
 */
export type IOptsInspector<Type, Key extends keyof Type> = {
    /**
     * Boolean value does not have an inspector,
     * so it is directly returned.
     * All other values are wrapped in an OptsWrapper.
     */
    [key in Key]: Type[key] extends boolean
        ? Type[key]
        : IOptsWrapper<Type[key]>;
};

enum OperatorEnum {
    '==' = '==',
    '===' = '===',
    '!=' = '!=',
    '!==' = '!==',
    '>' = '>',
    '<' = '<',
    '>=' = '>=',
    '<=' = '<=',
}

export function isOperator(value: unknown): value is OperatorEnum {
    return typeof value !== 'string'
        ? false
        : Object.values(OperatorEnum).includes(value as OperatorEnum);
}

export type Operator = '==' | '===' | '!=' | '!==' | '>' | '<' | '>=' | '<=';
