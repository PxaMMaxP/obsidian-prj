import { PrjSettings } from 'src/types/PrjSettings';
import { Plugin } from 'obsidian';
import MarkdownBlockProcessor from 'src/libs/MarkdownBlockProcessor';
import { SettingTab } from 'src/classes/SettingsTab';
import { DEFAULT_SETTINGS } from './types/PrjSettings';
import Global from './classes/Global';
import GetMetadata from './libs/ContextMenus/GetMetadata';
import API from './classes/API';
import CreateNewMetadataModal from './libs/Modals/CreateNewMetadataModal';
import ChangeStatusModal from './libs/Modals/ChangeStatusModal';

export default class Prj extends Plugin {
	public settings: PrjSettings;
	public api: API;

	async onload() {
		console.log("Loading plugin 'PRJ'")
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		if (this.app.workspace.layoutReady) {
			await this.onLayoutReady();
		} else {
			this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		}
	}

	async onLayoutReady(): Promise<void> {
		console.log("Layout ready");

		new Global(this, this.app, this.settings);
		await Global.getInstance().awaitCacheInitialization();

		this.registerMarkdownCodeBlockProcessor('prj', MarkdownBlockProcessor.parseSource);

		this.app.workspace.updateOptions();

		// Get Metadata File Context Menu & Command
		GetMetadata.getInstance();

		// Create New Metadata File Command
		CreateNewMetadataModal.registerCommand();

		// Change Status Command
		ChangeStatusModal.registerCommand();

		// API
		this.api = new API();

	}

	onunload() {
		console.log("Unloading plugin 'PRJ'")
		GetMetadata.deconstructor();
		Global.deconstructor();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}