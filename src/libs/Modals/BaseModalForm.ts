import { App, TFile } from "obsidian";
import Global from "src/classes/Global";
import { FormConfiguration, IFormResult, IModalForm } from "src/types/ModalFormType";

export default abstract class BaseModalForm {
    protected app: App = Global.getInstance().app;
    protected settings = Global.getInstance().settings;
    protected global = Global.getInstance();
    protected logger = Global.getInstance().logger;
    protected modalFormApi: IModalForm | null | undefined = null;

    /**
     * Creates an instance an loads the ModalForms API.
     */
    constructor() {
        if (this.modalFormApi === undefined) {
            this.logger.error("ModalForms API not found");
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
        if (this.modalFormApi === undefined) this.logger.error("ModalForms API not found");
        if (this.modalFormApi === null) {
            this.modalFormApi = this.setApi();
        }
        if (this.modalFormApi === null) return false;
        return true;
    }

    protected getApi(): IModalForm {
        if (this.modalFormApi === undefined || this.modalFormApi === null) {
            this.logger.error("ModalForms API not found");
            throw new Error("ModalForms API not found");
        } else {
            return this.modalFormApi;
        }
    }

    private setApi(): IModalForm | undefined {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modalFormApi = (this.app as any).plugins.plugins.modalforms.api as IModalForm;
        if (!modalFormApi) {
            this.logger.error("ModalForms API not found");
            return undefined;
        } else {
            this.logger.trace("ModalForms API found");
            return modalFormApi;
        }
    }

    public abstract evaluateForm(result: IFormResult): Promise<unknown | undefined>

    public abstract openForm(): Promise<IFormResult | undefined>;

    protected abstract constructForm(): FormConfiguration;

    public static getTags(activeFile: TFile | undefined): string[] {
        const tags: string[] = [];
        if (activeFile) {
            const cache = Global.getInstance().metadataCache.getEntry(activeFile);
            if (cache && cache.metadata && cache.metadata.frontmatter && cache.metadata.frontmatter.tags) {
                if (Array.isArray(cache.metadata.frontmatter.tags)) {
                    tags.push(...cache.metadata.frontmatter.tags);
                } else {
                    tags.push(cache.metadata.frontmatter.tags);
                }
            }
        }
        return tags;
    }
}
