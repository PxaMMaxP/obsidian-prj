/**
 * Interface for the processor options.
 * @remarks - This interface is used to pass the options to the processor.
 * @example - [{label: "Tags", value: "this"}, {label: "maxDocuments", value: "100"}]
 * @see {@link IProcessorSettings}
 */
export interface IProcessorOptions {
    /**
     * The label of the option.
     */
    label: string;

    /**
     * The value of the option.
     */
    value: never;
}
