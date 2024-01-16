import { TFile } from "obsidian";
import { FileModel } from "./FileModel";
import { YamlKeyMap } from "src/types/YamlKeyMap";

export default class BaseModel<T extends object> extends FileModel<T> {

    constructor(file: TFile | undefined, ctor: new (data?: Partial<T>) => T, yamlKeyMap: YamlKeyMap | undefined) {
        super(file, ctor, yamlKeyMap);
    }

}
