/**
 * Abstract class representing a search element.
 * This class serves as the base class for different types of search elements, such as search terms and search operators.
 */
export default abstract class SearchElement {
    protected _value: string;
    protected _isNegated = false;

    /**
     * Constructs a new SearchElement with the given value.
     * @param value The value of the search element.
     * @param negated The negated value of the search element.
     */
    constructor(value: string, negated = false) {
        this._value = value;
        this._isNegated = negated;
    }

    /**
     * Abstract getter to determine if the element is an operator.
     * This method should be implemented by subclasses to specify whether the element is an operator.
     * @returns {boolean} True if the element is an operator, otherwise false.
     */
    abstract get isOperator(): boolean;

    /**
     * Gets the value of the search element.
     */
    public get value(): string {
        return this._value;
    }

    /**
     * Sets the value of the search element.
     * @param newValue - The new value to be set.
     */
    public set value(newValue: string) {
        this._value = newValue;
    }

    /**
     * Gets the negated value of the search element.
     */
    public get isNegated(): boolean {
        return this._isNegated;
    }

    /**
     * Sets the negated value of the search element.
     * @param newValue - The new negated value to be set.
     */
    public set isNegated(newValue: boolean) {
        this._isNegated = newValue;
    }
}
