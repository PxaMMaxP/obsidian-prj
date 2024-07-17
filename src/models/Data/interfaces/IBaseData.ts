import { ToStringFieldSymbol } from 'src/classes/decorators/ToStringFieldDecorator';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { YamlKeyMap } from 'src/types/YamlKeyMap';

export interface IBaseData_<T> {
    /**
     * Initializes a new instance of the BaseData class.
     * @param data The optional data to merge into the current instance.
     * @param dependencies The optional dependencies to use for the model.
     */
    new (data: Partial<T>, dependencies?: IDIContainer): unknown;
    /**
     * The mapping of YAML keys to the corresponding properties.
     * @remarks This property should be overridden in
     * derived classes to provide the mapping if necessary.
     */
    yamlKeyMap: YamlKeyMap | undefined;
    /**
     * Gets the default data for the current data model `T`.
     */
    get defaultData(): Partial<T>;
    /**
     * Returns the metadata of the document as a string.
     * Only properties marked with the {@link ToStringFieldSymbol|@toStringField} decorator will be included in the output.
     * @returns A string containing the concatenated values of the marked properties.
     */
    toString(): string;
}

//export interface IBaseData<T> {}
