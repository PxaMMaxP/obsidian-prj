/**
 * Represents a abstract class which provides methods to check the type of an object.
 */
export default abstract class BaseTypeChecker {
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
}
