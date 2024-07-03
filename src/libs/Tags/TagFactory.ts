import IMetadataCache from 'src/interfaces/IMetadataCache';
import { ITag } from './interfaces/ITag';
import { ITagFactory } from './interfaces/ITagFactory';
import Tag from './Tag';

/**
 * A tag factory for {@link Tag} which implements {@link ITag}.
 */

export class TagFactory implements ITagFactory {
    create(value: string, metadataCache: IMetadataCache): ITag {
        return new Tag(value, metadataCache);
    }
}
