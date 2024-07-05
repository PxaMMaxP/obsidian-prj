import { TFile } from 'obsidian';

export default interface IPrjModel<T> {
    get data(): Partial<T>;
    set data(value: Partial<T>);

    get file(): TFile;
    set file(value: TFile);

    /**
     * The tags of the document.
     * @deprecated Use the `data.tags` property instead.
     */
    get tags(): string[];

    /**
     * The tags of the document.
     * @deprecated Use the `data.tags` property instead.
     */
    set tags(value: string[]);

    toString(): string;
}
