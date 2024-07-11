/**
 * Represents a static interface for a deconstructor.
 */
export interface IDeconstructor_ {
    /**
     * Represents a static interface for a deconstructor.
     * @remarks This static deconstructor should be clean up resources for **all** instances of the class.
     * @see {@link IDeconstructor} for an instance deconstructor.
     */
    deconstructor(): void;
}

/**
 * Represents an interface for a deconstructor.
 */
export interface IDeconstructor {
    /**
     * Represents an interface for a deconstructor.
     * @remarks This deconstructor should be used to clean up resources for **an** instance of the class.
     * @see {@link IDeconstructor_} for a static deconstructor.
     */
    deconstructor(): void;
}
