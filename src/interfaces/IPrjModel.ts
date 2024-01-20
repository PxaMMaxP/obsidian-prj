import { TFile } from 'obsidian';

export default interface IPrjModel<T> {
    get data(): Partial<T>;
    set data(value: Partial<T>);

    get file(): TFile;
    set file(value: TFile);

    get tags(): string[];
    set tags(value: string[]);

    toString(): string;
}
