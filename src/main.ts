import { Plugin } from 'obsidian';
import { SettingTab } from 'src/classes/SettingsTab';
import { PrjSettings } from 'src/types/PrjSettings';
import API from './classes/API';
import Global from './classes/Global';
import Lng from './classes/Lng';
import { Logging } from './classes/Logging';
import { DIContainer } from './libs/DependencyInjection/DIContainer';
import { IDIContainer } from './libs/DependencyInjection/interfaces/IDIContainer';
import Helper from './libs/Helper';
import KanbanSync from './libs/KanbanSync/KanbanSync';
import { LifecycleManager } from './libs/LifecycleManager/LifecycleManager';
import AddAnnotationModal from './libs/Modals/AddAnnotationModal';
import ChangeStatusModal from './libs/Modals/ChangeStatusModal';
import CreateNewMetadataModal from './libs/Modals/CreateNewMetadataModal';
import CreateNewNoteModal from './libs/Modals/CreateNewNoteModal';
import CreateNewProjectModal from './libs/Modals/CreateNewProjectModal';
import CreateNewTaskManagementModal from './libs/Modals/CreateNewTaskManagementModal';
import CreateNewTaskModal from './libs/Modals/CreateNewTaskModal';
import { TranslationService } from './libs/TranslationService/TranslationService';
import { Translations } from './translations/Translations';
import { DEFAULT_SETTINGS } from './types/PrjSettings';
import './auto-imports'; //

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

        LifecycleManager.register('before', 'init', () => {
            // eslint-disable-next-line no-console
            console.log('Layout ready');
        });

        LifecycleManager.register(
            'before',
            'init',
            () =>
                // Initialize the translation service
                new TranslationService(Translations, this.settings, undefined),
        );

        LifecycleManager.register(
            'before',
            'init',
            () => new Global(this, this.app, this.settings),
        );

        LifecycleManager.register('on', 'init', () =>
            Global.getInstance().awaitCacheInitialization(),
        );

        LifecycleManager.register('after', 'init', () => this.onLayoutReady());

        if (this.app.workspace.layoutReady) {
            new LifecycleManager().onInit();
        } else {
            this.app.workspace.onLayoutReady(() => {
                new LifecycleManager().onInit();
            });
        }
    }

    /**
     * Will be called when the layout is ready
     */
    async onLayoutReady(): Promise<void> {
        this._dependencies = DIContainer.getInstance();
        this.registerDependencies();

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

        new LifecycleManager().onLoad();
    }

    /**
     * Register the Obsidian Commands an Events
     */
    private registerCommandsAndEvents(): void {
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

        //
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
        new LifecycleManager().onUnload();

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
