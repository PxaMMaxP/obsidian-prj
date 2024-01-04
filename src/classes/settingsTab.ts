import { App, PluginSettingTab, Setting } from 'obsidian';
import Prj from 'src/main';


export class SettingTab extends PluginSettingTab {
    plugin: Prj;

    constructor(app: App, plugin: Prj) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // Base tag for all related files
        new Setting(containerEl)
            .setName('Base Tag')
            .setDesc('The Base Tag for all Elements')
            .addText(text => text
                .setPlaceholder('#YourBaseTag')
                .setValue(this.plugin.settings.baseTag)
                .onChange(async (value) => {
                    this.plugin.settings.baseTag = value;
                    await this.plugin.saveSettings();
                }));

        // Template Folder
        new Setting(containerEl)
            .setName('Template Folder')
            .setDesc('The Folder where all Templates are stored')
            .addText(text => text
                .setPlaceholder('YourTemplateFolder')
                .setValue(this.plugin.settings.templateFolder)
                .onChange(async (value) => {
                    this.plugin.settings.templateFolder = value;
                    await this.plugin.saveSettings();
                }));

        // User information
        new Setting(containerEl)
            .setName('User Information')
            .setDesc('The User Information for the Project')
            .addText(text => text
                .setPlaceholder('Your name')
                .setValue(this.plugin.settings.user.name)
                .onChange(async (value) => {
                    this.plugin.settings.user.name = value;
                    await this.plugin.saveSettings();
                }));
    }
}
