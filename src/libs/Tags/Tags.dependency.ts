import { ITagDependencies, TagConstructorType } from './interfaces/ITag';
import { ITagsDependencies } from './interfaces/ITags';
import Tag from './Tag';
import Tags from './Tags';
import DependencyRegistry from '../../classes/DependencyRegistry';
import MetadataCache from '../MetadataCache';

/**
 * @returns The metadata cache instance.
 */
const getMetadataCacheInstance = () => MetadataCache.getInstance();

/**
 * Represents the default dependencies for the {@link Tags} class.
 */
export const TagsDefaultDependencies = {
    /**
     *
     */
    get metadataCache() {
        return getMetadataCacheInstance();
    },
    tagClass: Tag as unknown as TagConstructorType,
    logger: undefined,
} as ITagsDependencies;

DependencyRegistry.getInstance().registerInstance(
    'ITagsDependencies',
    TagsDefaultDependencies,
);

/**
 * Represents the default dependencies for the {@link Tag} class.
 */
export const TagDefaultDependencies = {
    /**
     * 123
     */
    get metadataCache() {
        return getMetadataCacheInstance();
    },
} as ITagDependencies;

DependencyRegistry.getInstance().registerInstance(
    'ITagDependencies',
    TagDefaultDependencies,
);
