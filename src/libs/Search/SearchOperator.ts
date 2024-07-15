import SearchElement from './SearchElement';
import { SearchOperatorType } from './SearchOperatorTypes';

/**
 * Class representing a search operator.
 * This class extends the SearchElement class and is used to handle operators in a search query.
 */
export default class SearchOperator extends SearchElement {
    /**
     * Constructs a new SearchOperator with the given operator.
     * @param operator - The operator value, which can be '&', '|' or '!'.
     */
    constructor(operator: SearchOperatorType) {
        super(operator);
    }

    /**
     * Gets the operator value of the search element.
     */
    public get operator(): SearchOperatorType {
        return this._value as SearchOperatorType;
    }

    /**
     * Sets the operator value of the search element.
     * @param value - The new operator value to be set.
     */
    public set operator(value: SearchOperatorType) {
        this._value = value;
    }

    /**
     * Determines if the element is an operator.
     * This method overrides the abstract method in the base class.
     */
    public get isOperator(): boolean {
        return true;
    }
}
