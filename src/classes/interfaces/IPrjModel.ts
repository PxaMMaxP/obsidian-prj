import { TFile } from "obsidian";

export default interface IPrjModel<T> {
    get data(): Partial<T>
    set data(value: Partial<T>)

    get frontmatter(): Record<string, unknown>
    set frontmatter(value: Record<string, unknown>)

    get file(): TFile
}
