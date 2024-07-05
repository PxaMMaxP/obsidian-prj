import { ITagDependencies, TagConstructorType } from './interfaces/ITag';
import { ITagsDependencies } from './interfaces/ITags';
import Tag from './Tag';
import Tags from './Tags';
import MetadataCache from '../MetadataCache';

const getMetadataCacheInstance = () => MetadataCache.getInstance();

/**
 * Represents the default dependencies for the {@link Tags} class.
 */
export const TagsDefaultDependencies = {
    get metadataCache() {
        return getMetadataCacheInstance();
    },
    tagClass: Tag as unknown as TagConstructorType,
    logger: undefined,
} as ITagsDependencies;

/**
 * Represents the default dependencies for the {@link Tag} class.
 */
export const TagDefaultDependencies = {
    get metadataCache() {
        return getMetadataCacheInstance();
    },
    tagClass: Tag as unknown as TagConstructorType,
    logger: undefined,
} as ITagDependencies;
