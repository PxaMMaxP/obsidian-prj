import { App, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import { Logging } from 'src/classes/Logging';
import { Tags } from 'src/libs/Tags/Tags';
import {
    FormConfiguration,
    IFormResult,
    IModalForm,
    IResultData,
} from 'src/types/ModalFormType';
import { HelperObsidian } from '../Helper/Obsidian';

/**
 * Represents a base class for modal forms.
 */
export default abstract class BaseModalForm {
    protected _app: App = Global.getInstance().app;
    protected _settings = Global.getInstance().settings;
    protected _global = Global.getInstance();
    protected _logger = Logging.getLogger('BaseModalForm');
    protected _modalFormApi: IModalForm | null | undefined = null;

    /**
     * Creates an instance an loads the ModalForms API.
     */
    constructor() {
        if (this._modalFormApi === undefined) {
            this._logger.error('ModalForms API not found');
        } else {
            this._modalFormApi = this.setApi();
        }
    }

    /**
     * Checks if the ModalForms API is available
     * @returns True if the API is available
     * @remarks Log an error if the API is not available
     */
    protected isApiAvailable(): boolean {
        if (this._modalFormApi === undefined)
            this._logger.error('ModalForms API not found');

        if (this._modalFormApi === null) {
            this._modalFormApi = this.setApi();
        }

        if (this._modalFormApi === null) return false;

        return true;
    }

    /**
     * Returns the ModalForms API
     * @returns The ModalForms API
     */
    protected getApi(): IModalForm {
        if (this._modalFormApi === undefined || this._modalFormApi === null) {
            this._logger.error('ModalForms API not found');
            throw new Error('ModalForms API not found');
        } else {
            return this._modalFormApi;
        }
    }

    /**
     * Sets the ModalForms API
     * @returns The ModalForms API or undefined if not found
     */
    private setApi(): IModalForm | undefined {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modalFormApi = (this._app as any).plugins.plugins.modalforms
            .api as IModalForm;

        if (!modalFormApi) {
            this._logger.error('ModalForms API not found');

            return undefined;
        } else {
            this._logger.trace('ModalForms API found');

            return modalFormApi;
        }
    }

    public abstract evaluateForm(
        result: IFormResult,
    ): Promise<unknown | undefined>;

    public abstract openForm(): Promise<IFormResult | undefined>;

    protected abstract constructForm(): FormConfiguration;

    /**
     * Returns the tags from the file.
     * @param activeFile The file to get the tags from.
     * @returns The tags from the file.
     */
    protected getTagsFromActiveFile(
        activeFile: TFile | undefined = HelperObsidian.getActiveFile(),
    ): string[] {
        const activeFileTags = new Tags(undefined);
        activeFileTags.loadTagsFromFile(activeFile);

        const tags: string[] = activeFileTags.toStringArray();

        return tags;
    }

    /**
     * Converts a preset object to an IResultData object
     * @param preset The preset object to convert, like DocumentData etc.
     * @returns The converted IResultData object
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected convertPresetToIResultData<T extends Record<string, any>>(
        preset: Partial<T> | undefined,
    ): IResultData {
        const convertedPreset: IResultData = {};

        if (preset) {
            for (const [key, value] of Object.entries(preset)) {
                if (typeof value === 'function') continue;
                convertedPreset[key] = value ?? '';
            }
        }

        return convertedPreset;
    }
}
