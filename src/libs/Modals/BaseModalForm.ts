import { App, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import {
    FormConfiguration,
    IFormResult,
    IModalForm,
    IResultData,
} from 'src/types/ModalFormType';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Tags from 'src/libs/Tags';

export default abstract class BaseModalForm {
    protected app: App = Global.getInstance().app;
    protected settings = Global.getInstance().settings;
    protected global = Global.getInstance();
    protected logger = Logging.getLogger('BaseModalForm');
    protected modalFormApi: IModalForm | null | undefined = null;

    /**
     * Creates an instance an loads the ModalForms API.
     */
    constructor() {
        if (this.modalFormApi === undefined) {
            this.logger.error('ModalForms API not found');
        } else {
            this.modalFormApi = this.setApi();
        }
    }

    /**
     * Checks if the ModalForms API is available
     * @returns {boolean} True if the API is available
     * @remarks Log an error if the API is not available
     */
    protected isApiAvailable(): boolean {
        if (this.modalFormApi === undefined)
            this.logger.error('ModalForms API not found');

        if (this.modalFormApi === null) {
            this.modalFormApi = this.setApi();
        }

        if (this.modalFormApi === null) return false;

        return true;
    }

    protected getApi(): IModalForm {
        if (this.modalFormApi === undefined || this.modalFormApi === null) {
            this.logger.error('ModalForms API not found');
            throw new Error('ModalForms API not found');
        } else {
            return this.modalFormApi;
        }
    }

    private setApi(): IModalForm | undefined {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modalFormApi = (this.app as any).plugins.plugins.modalforms
            .api as IModalForm;

        if (!modalFormApi) {
            this.logger.error('ModalForms API not found');

            return undefined;
        } else {
            this.logger.trace('ModalForms API found');

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
     * @deprecated Use {@link Tags.getTagsFromFile} instead
     */
    public static getTags(activeFile: TFile | undefined): string[] {
        const tags: string[] = [];

        if (activeFile) {
            const cache =
                Global.getInstance().metadataCache.getEntry(activeFile);

            if (
                cache &&
                cache.metadata &&
                cache.metadata.frontmatter &&
                cache.metadata.frontmatter.tags
            ) {
                if (Array.isArray(cache.metadata.frontmatter.tags)) {
                    tags.push(...cache.metadata.frontmatter.tags);
                } else {
                    tags.push(cache.metadata.frontmatter.tags);
                }
            }
        }

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
