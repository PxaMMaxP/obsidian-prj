import { Plugin } from 'obsidian';
import Global from 'src/classes/global';
import FileCacheLib from 'src/classes/libs/FileCacheLib';
import MarkdownBlockProcessor from 'src/classes/libs/MarkdownBlockProcessor';
import MetadataCache from 'src/classes/libs/MetadataCache';
import { SettingTab } from 'src/classes/settingsTab';

// Remember to rename these classes and interfaces!

export interface PrjSettings {
	baseTag: string;
	templateFolder: string;
}

const DEFAULT_SETTINGS: PrjSettings = {
	baseTag: 'PRJ',
	templateFolder: 'Vorlagen/'
}

export default class Prj extends Plugin {
	settings: PrjSettings;

	async onload() {
		console.log("Loading plugin 'PRJ'")
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		if (this.app.workspace.layoutReady) {
			this.onLayoutReady();
		} else {
			this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		}
	}

	onLayoutReady(): void {
		console.log("Layout ready");

		new Global(this.app, this.settings);

		this.registerMarkdownCodeBlockProcessor('prj', MarkdownBlockProcessor.parseSource);

		this.app.workspace.updateOptions();
	}

	onunload() {
		console.log("Unloading plugin 'PRJ'")
		Global.deconstructor();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}