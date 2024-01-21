import Global from 'src/classes/Global';
import Helper from 'src/libs/Helper';
import { NoteModel } from '../NoteModel';
import Tags from 'src/libs/Tags';

/**
 * Static API for StaticNoteModel
 */
export class StaticNoteModel {
    /**
     * Generates a filename based on the provided NoteModel.
     *
     * @param model The NoteModel object used to generate the filename.
     * @returns The generated filename as a string.
     */
    public static generateFilename(model: NoteModel): string {
        const newFileName: string[] = [];

        if (model.data.date) {
            newFileName.push(
                `${Helper.formatDate(model.data.date, Global.getInstance().settings.dateFormat)}`,
            );
        }

        if (model.data.tags) {
            const tags = Tags.getValidTags(model.data.tags);
            const firstTag = tags.first();

            if (firstTag && firstTag !== undefined) {
                const seperateTags = Tags.getTagElements(firstTag);
                const lastTagElement = seperateTags.last();
                lastTagElement && newFileName.push(lastTagElement);
            }
        }

        if (model.data.title) {
            newFileName.push(model.data.title);
        }

        return Helper.sanitizeFilename(newFileName.join(' - '));
    }
}
