import Lng from 'src/classes/Lng';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import Prj from 'src/main';
import { Field, FormConfiguration } from 'src/types/ModalFormType';
import { Inject } from 'ts-injex';
import CreateNewTaskManagementModal from './CreateNewTaskManagementModal';
import { HelperObsidian } from '../Helper/Obsidian';

/**
 * Represents a modal to create a new task.
 */
export default class CreateNewTaskModal extends CreateNewTaskManagementModal {
    /**
     * Constructs the form configuration
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

            selectInput.options = [{ value: 'Task', label: Lng.gt('Task') }];
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
            this._IPrjSettings.prjSettings.subTaskTemplates?.map((value) => ({
                value: value.template,
                label: value.label,
            }));

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

    @Inject('IPrj')
    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected static _IPrj: Prj;
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('CreateNewTaskModal'))
    protected static _ILogger: ILogger;

    /**
     * Registers the command to open the modal
     * @remarks No cleanup needed
     */
    public static registerCommand(): void {
        this._ILogger.trace("Registering 'CreateNewTaskModal' commands");

        this._IPrj.addCommand({
            id: 'create-new-task-file',
            name: `${Lng.gt('New task')}`,
            /**
             *
             */
            callback: async () => {
                const modal = new CreateNewTaskModal();
                const result = await modal.openForm();

                if (result) {
                    const prj = await modal.evaluateForm(result);

                    if (prj) await HelperObsidian.openFile(prj.file);
                }
            },
        });
    }
}
