import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';

export default interface IPrjData {
    get tags(): ITags | null | undefined;
    set tags(value: ITags | ITag | string[] | string | null | undefined);
}
