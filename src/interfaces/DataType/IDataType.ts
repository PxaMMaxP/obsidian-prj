/**
 * Static interface for data types.
 */
export interface IDataType_<Type> {
    /**
     * Create a new instance of the data type.
     */
    new (value: unknown): Type;
}
