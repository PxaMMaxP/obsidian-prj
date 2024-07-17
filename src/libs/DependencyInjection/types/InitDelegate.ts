/**
 * A function type representing an initializer that transforms an input of type `T`
 * into an output of type `U`.
 * @template T - The type of the input parameter.
 * @template U - The type of the output parameter.
 * @param x - The input parameter of type `T`.
 * @returns The transformed output of type `U`.
 */
export type InitDelegate<T, U> = (x: T) => U;
