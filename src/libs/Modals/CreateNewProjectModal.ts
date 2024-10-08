import Lng from 'src/classes/Lng';
import { ILogger_ } from 'src/interfaces/ILogger';
import { IPrj } from 'src/interfaces/IPrj';
import { Field, FormConfiguration } from 'src/types/ModalFormType';
import { resolve } from 'ts-injex';
import CreateNewTaskManagementModal from './CreateNewTaskManagementModal';
import { HelperObsidian } from '../Helper/Obsidian';

/**
 * Represents a modal to create a new project.
 */
export default class CreateNewProjectModal extends CreateNewTaskManagementModal {
    /**
     * Create a new `FormConfiguration` for the modal
     * @returns The form configuration
     */
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
            this._IPrjSettings.prjSettings.subProjectTemplates?.map(
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
        const plugin = resolve<IPrj>('IPrj');

        const logger = resolve<ILogger_>('ILogger_').getLogger(
            'CreateNewProjectModal',
        );
        logger.trace("Registering 'CreateNewProjectModal' commands");

        plugin.addCommand({
            id: 'create-new-project-file',
            name: `${Lng.gt('New project')}`,
            /**
             *
             */
            callback: async () => {
                const modal = new CreateNewProjectModal();
                const result = await modal.openForm();

                if (result) {
                    const prj = await modal.evaluateForm(result);

                    if (prj) await HelperObsidian.openFile(prj.file);
                }
            },
        });
    }
}
