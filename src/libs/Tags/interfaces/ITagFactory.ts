import IMetadataCache from "src/interfaces/IMetadataCache";
import { ITag } from "./ITag";

/**
 * Represents a tag factory.
 */

export interface ITagFactory {
    /**
     * Creates a new tag.
     * @param tag The tag to create.
     * @returns The created tag.
     */
    create(tag: string, metadataCache: IMetadataCache): ITag;
}
