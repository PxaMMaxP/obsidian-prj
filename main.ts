import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Global from 'src/classes/global';
import FileCacheLib from 'src/classes/libs/FileCacheLib';
import MarkdownBlockProcessor from 'src/classes/libs/MarkdownBlockProcessor';
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

		new Global(this.app, this.settings);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('prj', MarkdownBlockProcessor.parseSource);

		//Todo: Add Workspace.onLayoutReady and await this for Caches
	}


	onunload() {
		console.log("Unloading plugin 'PRJ'")
		FileCacheLib.deconstructor();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}