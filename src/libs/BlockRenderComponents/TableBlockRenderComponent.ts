import Global from "src/classes/Global";
import { IProcessorSettings } from "../../interfaces/IProcessorSettings";
import { MarkdownRenderChild, setIcon } from "obsidian";
import Table, { TableHeader } from "../Table";
import Helper from "../Helper";
import RedrawableBlockRenderComponent from "./RedrawableBlockRenderComponent";
import IPrjModel from "src/interfaces/IPrjModel";
import Lng from "src/classes/Lng";

export default abstract class TableBlockRenderComponent<T extends IPrjModel<unknown>> implements RedrawableBlockRenderComponent {
    //#region General properties
    protected global = Global.getInstance();
    protected logger = this.global.logger;
    protected metadataCache = this.global.metadataCache.Cache;
    protected fileCache = this.global.fileCache;
    //#endregion
    //#region Component properties
    protected processorSettings: IProcessorSettings;
    protected component: MarkdownRenderChild;
    protected settings: unknown;
    //#endregion
    //#region Models
    protected models: T[];
    //#endregion
    //#region HTML properties
    protected table: Table;
    protected tableHeaders: TableHeader[]
    protected headerContainer: HTMLElement;
    protected tableContainer: HTMLElement;
    //#endregion

    constructor(settings: IProcessorSettings) {
        this.processorSettings = settings;
        this.component = new MarkdownRenderChild(this.processorSettings.container);
        //this.parseSettings();
    }

    /**
     * Builds the component first time.
     * @remarks Calls the `draw` method.
     */
    public async build(): Promise<void> {
        return this.draw();
    }

    /**
     * Builds the `tableContainer` and `headerContainer` elements.
     * @remarks - Call this method to build the base structure first.
     * - Override this method to build the other elements.
     * @remarks - Build the `tableContainer` and `headerContainer` elements.
     * - Build the `controle block` => add a refresh button which calls the `redraw` method.
     */
    protected async draw(): Promise<void> {
        //Create header container
        this.headerContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.headerContainer);
        this.headerContainer.classList.add('header-container');

        //Create controle block
        const blockControle = document.createElement('div');
        this.headerContainer.appendChild(blockControle);
        blockControle.classList.add('block-controle');

        //Create refresh Button
        const refreshButton = document.createElement('a');
        blockControle.appendChild(refreshButton);
        refreshButton.classList.add('refresh-button');
        refreshButton.title = Lng.gt("Refresh");
        refreshButton.href = "#";
        setIcon(refreshButton, "refresh-cw");
        this.component.registerDomEvent(refreshButton, 'click', async (event: MouseEvent) => {
            event.preventDefault();
            this.redraw();
        });

        this.tableContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.tableContainer);
        this.tableContainer.classList.add('table-container');
    }

    /**
     * Redraws the component on request. Clears the container and calls the `draw` method.
     * @remarks This methode clears the container and calls the `draw` methode.
     */
    public async redraw(): Promise<void> {
        this.processorSettings.container.innerHTML = "";
        return this.draw();
    }

    /**
     * Normalizes the header.
     * @remarks - Removes the `disable` class from the header.
     * - The header is not grayed out anymore.
     */
    protected normalizeHeader() {
        this.headerContainer.removeClass('disable');
    }

    /**
     * Grays out the header.
     * @remarks - Adds the `disable` class to the header.
     * - The header is grayed out.
     */
    protected grayOutHeader() {
        this.headerContainer.addClass('disable');
    }

    /**
     * Parse the settings from the Markdown code block.
     * @remarks Override this method to parse the settings.
     */
    protected abstract parseSettings(): void;

    protected getUID(model: T): string {
        return Helper.generateUID(model.file.path);
    }

    /**
     * Returns the models.
     * @remarks Override this method to return the models.
     */
    protected abstract getModels(): Promise<T[]>
}
