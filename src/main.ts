import { Plugin } from 'obsidian';
import { SettingTab } from 'src/classes/SettingsTab';
import MarkdownBlockProcessor from 'src/libs/MarkdownBlockProcessor';
import { PrjSettings } from 'src/types/PrjSettings';
import API from './classes/API';
import Global from './classes/Global';
import Lng from './classes/Lng';
import { Logging } from './classes/Logging';
import { CopyMarkdownLink } from './libs/ContextMenus/CopyMarkdownLink';
import GetMetadata from './libs/ContextMenus/GetMetadata';
import { DIContainer } from './libs/DependencyInjection/DIContainer';
import { IDIContainer } from './libs/DependencyInjection/interfaces/IDIContainer';
import Helper from './libs/Helper';
import KanbanSync from './libs/KanbanSync/KanbanSync';
import AddAnnotationModal from './libs/Modals/AddAnnotationModal';
import ChangeStatusModal from './libs/Modals/ChangeStatusModal';
import CreateNewMetadataModal from './libs/Modals/CreateNewMetadataModal';
import CreateNewNoteModal from './libs/Modals/CreateNewNoteModal';
import CreateNewProjectModal from './libs/Modals/CreateNewProjectModal';
import CreateNewTaskManagementModal from './libs/Modals/CreateNewTaskManagementModal';
import CreateNewTaskModal from './libs/Modals/CreateNewTaskModal';
import { Tag } from './libs/Tags/Tag';
import { Tags } from './libs/Tags/Tags';
import { TranslationService } from './libs/TranslationService/TranslationService';
import { ProjectModel } from './models/ProjectModel';
import { TaskModel } from './models/TaskModel';
import { TopicModel } from './models/TopicModel';
import { Translations } from './translations/Translations';
import { DEFAULT_SETTINGS } from './types/PrjSettings';

/**
 * The main plugin class
 */
export default class Prj extends Plugin {
    private _dependencies: IDIContainer;
    public settings: PrjSettings;
    public api: API = API;

    /**
     * Will be called when the plugin is loaded
     */
    async onload() {
        // eslint-disable-next-line no-console
        console.log("Loading plugin 'PRJ'");
        await this.loadSettings();

        this.addSettingTab(new SettingTab(this.app, this));

        if (this.app.workspace.layoutReady) {
            await this.onLayoutReady();
        } else {
            this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
        }
    }

    /**
     * Will be called when the layout is ready
     */
    async onLayoutReady(): Promise<void> {
        // eslint-disable-next-line no-console
        console.log('Layout ready');

        // Translation Service
        new TranslationService(Translations, this.settings, undefined);

        // Register Model Factories
        ProjectModel.registerThisModelFactory();
        TaskModel.registerThisModelFactory();
        TopicModel.registerThisModelFactory();

        new Global(this, this.app, this.settings);
        await Global.getInstance().awaitCacheInitialization();

        this._dependencies = DIContainer.getInstance();
        this.registerDependencies();

        this.registerMarkdownCodeBlockProcessor(
            'prj',
            MarkdownBlockProcessor.parseSource,
        );

        this.app.workspace.updateOptions();

        // Get Metadata File Context Menu & Command
        GetMetadata.getInstance();

        // Copy Markdown Link Context Menu
        //CopyMarkdownLink.getInstance();

        // Register Commands and Events
        this.registerCommandsAndEvents();

        /**
         * Run rebuild active view after 500ms
         * This is a workaround for the problem
         * that the plugin is not loaded when the
         * start page is loaded.
         */
        setTimeout(() => {
            // Possibly no longer necessary with the current Obsidian version...
            Helper.rebuildActiveView();
        }, 500);
    }

    /**
     * Register the Obsidian Commands an Events
     */
    private registerCommandsAndEvents(): void {
        new CopyMarkdownLink();

        // Create New Metadata File Command
        CreateNewMetadataModal.registerCommand();

        // Create new Task Managment Command
        CreateNewTaskManagementModal.registerCommand();
        // Create new Task Command
        CreateNewTaskModal.registerCommand();
        // Create new Project Command
        CreateNewProjectModal.registerCommand();
        // Add Annotation Command
        AddAnnotationModal.registerCommand();
        // Add new note Command
        CreateNewNoteModal.registerCommand();

        // Change Status Command
        ChangeStatusModal.registerCommand();

        //Register event on `Status` change..
        Global.getInstance().metadataCache.on(
            'prj-task-management-changed-status-event',
            (file) => {
                API.prjTaskManagementModel.syncStatusToPath(file);
            },
        );

        //Register event on `task-file` change..
        Global.getInstance().metadataCache.on(
            'prj-task-management-file-changed-event',
            (file) => {
                API.prjTaskManagementModel.syncTitleToFilename(file);
            },
        );

        //Register event on `Document Metadata` change..
        Global.getInstance().metadataCache.on(
            'document-changed-metadata-event',
            (file) => {
                API.documentModel.syncMetadataToFile(file);
            },
        );

        //Register event Kanban Check
        KanbanSync.registerEvent();

        // Register rebuild View command:
        this.addCommand({
            id: 'rebuild-active-view',
            name: Lng.gt('Rebuild active view'),
            /**
             * Rebuild the active view
             */
            callback: async () => {
                Helper.rebuildActiveView();
            },
        });
    }

    /**
     * Register the dependencies
     */
    private registerDependencies(): void {
        this._dependencies.register('App', this.app);

        this._dependencies.register(
            'IMetadataCache',
            Global.getInstance().metadataCache,
        );

        this._dependencies.register('ITag', Tag);
        this._dependencies.register('ITags', Tags);

        this._dependencies.register('ILogger_', Logging);

        this._dependencies.register(
            'ITranslationService',
            TranslationService.getInstance(),
        );

        this._dependencies.register('Prj', this);
        this._dependencies.register('App', this.app);
    }

    /**
     * Will be called when the plugin is unloaded
     */
    onunload() {
        // eslint-disable-next-line no-console
        console.log("Unloading plugin 'PRJ'");
        GetMetadata.deconstructor();
        new CopyMarkdownLink().deconstructor();
        Global.deconstructor();
    }

    /**
     * Load the settings
     */
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    /**
     * Save the settings
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
}
