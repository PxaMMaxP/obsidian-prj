import {
    IOptsInspector,
    IOptsWrapper,
    isOperator,
    Operator,
} from './interfaces/IOpts';
import { Register } from '../DependencyInjection/decorators/Register';

/**
 * Options inspector factory.
 * @see {@link Opts.inspect}
 */
@Register('Opts')
export class Opts {
    /**
     * Creates a new instance of the OptsInspector.
     * @param options The options object to inspect.
     * @returns The options inspector.
     */
    public static inspect<Type extends object, Key extends keyof Type>(
        options: Type,
    ): IOptsInspector<Type, Key> {
        return new Proxy(options, {
            get(target, prop) {
                const value = target[prop as keyof Type];

                if (typeof value === 'boolean') {
                    return value;
                } else {
                    return new OptsWrapper(value);
                }
            },
        }) as IOptsInspector<Type, Key>;
    }
}

/**
 * Wrapper for the options object.
 */
export class OptsWrapper<T> implements IOptsWrapper<T> {
    constructor(private readonly _value: T) {}

    /**
     * @inheritdoc
     */
    public get value(): T {
        return this.value;
    }

    /**
     * @inheritdoc
     */
    is(operator?: unknown, value?: T): boolean {
        const op = isOperator(operator) ? operator : false;
        const val = op === false ? (operator as T) : value;

        if (op === false && val === undefined) {
            return this?._value != null;
        } else {
            return this._is(val, op !== false ? op : undefined);
        }
    }

    /**
     * Check if the value is equal to the provided value using the provided operator.
     * @param value The value to compare.
     * @param operator The operator to use: `==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=`.
     * @returns `true` if the value is equal, otherwise `false`.
     */
    private _is<Op extends Operator>(value?: T, operator?: Op): boolean {
        const _operator = operator != null ? operator : '===';
        const isValueNotNull = value != null;

        switch (_operator) {
            case '==':
                return this._value == value;
            case '===':
                return this._value === value;
            case '!=':
                return this._value != value;
            case '!==':
                return this._value !== value;
            case '>':
                return isValueNotNull && this._value > value;
            case '<':
                return isValueNotNull && this._value < value;
            case '>=':
                return isValueNotNull && this._value >= value;
            case '<=':
                return isValueNotNull && this._value <= value;
            default:
                return null as never;
        }
    }
}
