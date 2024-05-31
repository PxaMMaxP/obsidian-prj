/**
 * Abstract class representing a search element.
 * This class serves as the base class for different types of search elements, such as search terms and search operators.
 */
export default abstract class SearchElement {
    protected _value: string;
    protected _negated = false;

    /**
     * Constructs a new SearchElement with the given value.
     * @param {string} value - The value of the search element.
     */
    constructor(value: string, negated = false) {
        this._value = value;
        this._negated = negated;
    }

    /**
     * Abstract getter to determine if the element is an operator.
     * This method should be implemented by subclasses to specify whether the element is an operator.
     * @returns {boolean} True if the element is an operator, otherwise false.
     */
    abstract get isOperator(): boolean;

    /**
     * Gets the value of the search element.
     * @returns {string} The value of the search element.
     */
    public get value(): string {
        return this._value;
    }

    /**
     * Sets the value of the search element.
     * @param {string} newValue - The new value to be set.
     */
    public set value(newValue: string) {
        this._value = newValue;
    }

    /**
     * Gets the negated value of the search element.
     * @returns {boolean} The negated value of the search element.
     */
    public get negated(): boolean {
        return this._negated;
    }

    /**
     * Sets the negated value of the search element.
     * @param {boolean} newValue - The new negated value to be set.
     */
    public set negated(newValue: boolean) {
        this._negated = newValue;
    }
}
