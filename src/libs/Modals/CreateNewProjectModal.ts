import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import Logging from 'src/classes/Logging';
import { Field, FormConfiguration } from 'src/types/ModalFormType';
import CreateNewTaskManagementModal from './CreateNewTaskManagementModal';
import Helper from '../Helper';

export default class CreateNewProjectModal extends CreateNewTaskManagementModal {
    protected override constructForm(): FormConfiguration {
        const form = super.constructForm();
        form.title = `${Lng.gt('New')} ${Lng.gt('Project')}`;

        const typeFieldIndex = form.fields.findIndex(
            (field) => field.name === 'type',
        );

        if (
            typeFieldIndex !== -1 &&
            form.fields[typeFieldIndex].input.type === 'select'
        ) {
            const selectInput = form.fields[typeFieldIndex].input as {
                type: 'select';
                options: { value: string; label: string }[];
            };

            selectInput.options = [
                { value: 'Project', label: Lng.gt('Project') },
            ];
        }

        // SubType
        const subType: Field = {
            name: 'subtype',
            label: Lng.gt('SubType'),
            description: Lng.gt('SubTypeDescription'),
            isRequired: false,
            input: {
                type: 'select',
                source: 'fixed',
                options: [],
            },
        };

        const taskSubTypes =
            this.global.plugin.settings.prjSettings.subProjectTemplates?.map(
                (value) => ({ value: value.template, label: value.label }),
            );

        if (taskSubTypes && subType.input.type === 'select') {
            subType.input.options.push({ value: '', label: Lng.gt('None') });
            subType.input.options.push(...taskSubTypes);
        }

        // Fügen Sie das subType-Feld direkt nach dem typeField ein
        if (typeFieldIndex !== -1) {
            form.fields.splice(typeFieldIndex + 1, 0, subType);
        }

        return form;
    }

    /**
     * Registers the command to open the modal
     * @remarks No cleanup needed
     */
    public static registerCommand(): void {
        const global = Global.getInstance();
        const logger = Logging.getLogger('CreateNewProjectModal');
        logger.trace("Registering 'CreateNewProjectModal' commands");

        global.plugin.addCommand({
            id: 'create-new-project-file',
            name: `${Lng.gt('New project')}`,
            callback: async () => {
                const modal = new CreateNewProjectModal();
                const result = await modal.openForm();

                if (result) {
                    const prj = await modal.evaluateForm(result);

                    if (prj) await Helper.openFile(prj.file);
                }
            },
        });
    }
}
