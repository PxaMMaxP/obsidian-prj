/**
 * Represents a abstract class which provides methods
 * - to determine whether the specified object is an instance of the current class.
 * - to get the frontmatter object.
 */
export default abstract class BaseComplexDataType {
    /**
     * Determines whether the specified object is an instance of the current class.
     * @param this The class to check against.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the current class.
     */
    public static isInstanceOf<T>(
        this: new (...args: never[]) => T,
        obj: unknown,
    ): obj is T {
        return obj instanceof this;
    }

    /**
     * Gets a frontmatter compatible object.
     */
    abstract getFrontmatterObject():
        | Record<string, unknown>
        | Array<unknown>
        | string
        | null
        | undefined;
}
