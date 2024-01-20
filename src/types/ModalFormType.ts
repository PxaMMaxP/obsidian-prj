/**
 * This interface defines the methods for opening a modal form.
 * @see https://github.com/danielo515/obsidian-modal-form
 * @license
 * @tutorial modalforms.api You can get the Api like this:
 * ```ts
 * const modalFormsApi = (app as any).plugins.plugins.modalforms.api;
 * ```
 * @remarks You should check if the Api is available before using it:
 * ```ts
 * if (!modalFormsApi) {
 *    console.error("ModalForms API not found");
 * } else {
 *   // Use the API
 * }
 * ```
 */
export interface IModalForm {
    /**
     * This method opens a modal form. The form is defined by the configuration object.
     * @param config The configuration object for the form.
     * @param options The options object for the form. `values` is a key-value pair of the form data.
     * @returns A promise that resolves to the form data.
     * @see {@link IFormResult}
     */
    openForm(
        config: FormConfiguration,
        options?: { values: IResultData },
    ): Promise<IFormResult>;
}

export type ResultStatus = 'ok' | 'cancelled';
export interface IResultData {
    [key: string]: string | string[] | number | boolean;
}

export interface IFormResult {
    /**
     * This method returns the form data as a string of frontmatter.
     * Each key-value pair in the form data is converted into a string in the format `key: value`.
     */
    asFrontmatterString(): string;
    /**
     * This method returns the form data as a string of dataview properties.
     * Each key-value pair in the form data is converted into a string in the format `key = value`.
     */
    asDataviewProperties(): string;
    /**
     * This method returns the form data as a clone of the original data object.
     * @remarks The returned object is a clone of the original data object, so you can modify it without changing the original data.
     */
    getData(): IResultData;
    /**
     * This method returns the form data as a string. If a template is given, in the template string the keys are replaced with the values.
     * @param template The template string to use for formatting the form data. Use they keys as placeholders in the format {{key}}.
     */
    asString(template: string): string;
    data: IResultData;
    status: ResultStatus;
}

/**
 * This interface defines the configuration object for a modal form.
 */
export type FormConfiguration = {
    /**
     * The title of the form.
     */
    title: string;
    /**
     * The name of the form.
     */
    name: string;
    /**
     * The custom classname for the form.
     */
    customClassname: string;
    /**
     * The fields of the form.
     * @see {@link Field}
     */
    fields: Field[];
};

/**
 * This interface defines the configuration object for a field of a modal form.
 */
export type Field = {
    /**
     * The name of the field. This is the key of the field in the form data.
     */
    name: string;
    /**
     * The label of the field.
     */
    label: string;
    /**
     * The description of the field.
     */
    description: string;
    /**
     * Defines if the field is required.
     */
    isRequired: boolean;
    /**
     * The input of the field.
     * @see {@link Input}
     */
    input: Input;
};

export type Input =
    | TextInput
    | TextareaInput
    | DateInput
    | DocumentBlock
    | Time
    | SliderInput
    | SelectInput
    | DataViewInput
    | ToggleInput
    | TagInput;

export type TextInput = {
    type: 'text';
};

export type Time = {
    type: 'time';
};

export type DocumentBlock = {
    type: 'document_block';
    body: string;
};

export type TextareaInput = {
    type: 'textarea';
};

export type DateInput = {
    type: 'date';
};

export type SliderInput = {
    type: 'slider';
    min: number;
    max: number;
};

export type SelectInput = {
    type: 'select';
    source: 'fixed';
    options: Option[];
};

export type DataViewInput = {
    type: 'dataview';
    query: string;
};

export type ToggleInput = {
    type: 'toggle';
};

export type TagInput = {
    type: 'tag';
};

export type Option = {
    value: string;
    label: string;
};
