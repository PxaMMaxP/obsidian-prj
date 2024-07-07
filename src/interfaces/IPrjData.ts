import Tag from 'src/libs/Tags/Tag';
import Tags from 'src/libs/Tags/Tags';

export default interface IPrjData {
    get tags(): Tags | null | undefined;
    set tags(value: Tags | Tag | string[] | string | null | undefined);
}
