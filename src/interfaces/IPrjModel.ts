import { TFile } from 'obsidian';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import { Tags } from 'src/libs/Tags/Tags';

export default interface IPrjModel<T> {
    get data(): Partial<T>;
    set data(value: Partial<T>);

    get file(): TFile;
    set file(value: TFile);

    get tags(): Tags;
    set tags(value: ITags | string | string[] | undefined | null);

    toString(): string;
}
