import { TFile } from 'obsidian';

export default interface IPrjModel<T> {
    /**
     * Get **data** of the model.
     */
    get data(): Partial<T>;
    /**
     * Set **data** of the model
     */
    set data(value: Partial<T>);

    /**
     * Get the **file** of the model.
     */
    get file(): TFile;
    /**
     * Set the **file** of the model.
     */
    set file(value: TFile);
}
