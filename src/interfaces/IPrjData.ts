import { Tags } from 'src/libs/Tags/Tags';

export default interface IPrjData {
    tags: Tags | string[] | string | null | undefined;
}
