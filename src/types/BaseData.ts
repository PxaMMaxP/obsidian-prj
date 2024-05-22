/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToStringField } from 'src/classes/ToStringFieldDecorator';

/**
 * An abstract base class that provides a common toString method.
 * The toString method will include all properties marked with the @toStringField decorator.
 */
export default abstract class BaseData {
    /**
     * Returns the metadata of the document as a string.
     * Only properties marked with the @toStringField decorator will be included in the output.
     * @returns A string containing the concatenated values of the marked properties.
     */
    public toString(): string {
        const fields = (this.constructor as any)[ToStringField] as (
            | string
            | symbol
        )[];
        const dataFields = fields.map((field) => (this as any)[field] ?? '');

        return dataFields.join(' ');
    }
}
