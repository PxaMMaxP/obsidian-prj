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
            .setHeading()
            .setName('User Information');

        // Unser Name
        new Setting(containerEl)
            .setName('User: Name')
            .setDesc('Your name')
            .addText(text => text
                .setPlaceholder('Your name')
                .setValue(this.plugin.settings.user.name)
                .onChange(async (value) => {
                    this.plugin.settings.user.name = value;
                    await this.plugin.saveSettings();
                }));

        // User Email
        new Setting(containerEl)
            .setName('User: Email')
            .setDesc('Your E-Mail adress')
            .addText(text => text
                .setPlaceholder('Your email')
                .setValue(this.plugin.settings.user.email)
                .onChange(async (value) => {
                    this.plugin.settings.user.email = value;
                    await this.plugin.saveSettings();
                }));

        // User Street
        new Setting(containerEl)
            .setName('User: Street')
            .setDesc('Your street')
            .addText(text => text
                .setPlaceholder('Your street')
                .setValue(this.plugin.settings.user.street)
                .onChange(async (value) => {
                    this.plugin.settings.user.street = value;
                    await this.plugin.saveSettings();
                }));

        // User City
        new Setting(containerEl)
            .setName('User: City')
            .setDesc('Your city')
            .addText(text => text
                .setPlaceholder('Your city')
                .setValue(this.plugin.settings.user.city)
                .onChange(async (value) => {
                    this.plugin.settings.user.city = value;
                    await this.plugin.saveSettings();
                }));

        // User Zip
        new Setting(containerEl)
            .setName('User: Zip Code')
            .setDesc('Your zip code')
            .addText(text => text
                .setPlaceholder('Your zip')
                .setValue(this.plugin.settings.user.zip)
                .onChange(async (value) => {
                    this.plugin.settings.user.zip = value;
                    await this.plugin.saveSettings();
                }));

        // User Country
        new Setting(containerEl)
            .setName('User: Country')
            .setDesc('Your country')
            .addText(text => text
                .setPlaceholder('Your country')
                .setValue(this.plugin.settings.user.country)
                .onChange(async (value) => {
                    this.plugin.settings.user.country = value;
                    await this.plugin.saveSettings();
                }));

        // Document Settings
        new Setting(containerEl)
            .setHeading()
            .setName('Document Settings');

        // Symbol
        new Setting(containerEl)
            .setName('Document Symbol')
            .setDesc('The Symbol for regular Documents')
            .addText(text => text
                .setPlaceholder('📄')
                .setValue(this.plugin.settings.documentSettings.symbol)
                .onChange(async (value) => {
                    this.plugin.settings.documentSettings.symbol = value;
                    await this.plugin.saveSettings();
                }));

        // Hide Symbol
        new Setting(containerEl)
            .setName('Hide Symbol')
            .setDesc('The Symbol for hidden Documents')
            .addText(text => text
                .setPlaceholder('🗞️')
                .setValue(this.plugin.settings.documentSettings.hideSymbol)
                .onChange(async (value) => {
                    this.plugin.settings.documentSettings.hideSymbol = value;
                    await this.plugin.saveSettings();
                }));

        // Cluster Symbol
        new Setting(containerEl)
            .setName('Cluster Symbol')
            .setDesc('The Symbol for Cluster Documents')
            .addText(text => text
                .setPlaceholder('🗂️')
                .setValue(this.plugin.settings.documentSettings.clusterSymbol)
                .onChange(async (value) => {
                    this.plugin.settings.documentSettings.clusterSymbol = value;
                    await this.plugin.saveSettings();
                }));

        // From
        new Setting(containerEl)
            .setName('From')
            .setDesc('The prefix for the from data')
            .addText(text => text
                .setPlaceholder('from:')
                .setValue(this.plugin.settings.documentSettings.from)
                .onChange(async (value) => {
                    this.plugin.settings.documentSettings.from = value;
                    await this.plugin.saveSettings();
                }));

        // To
        new Setting(containerEl)
            .setName('To')
            .setDesc('The prefix for the to data')
            .addText(text => text
                .setPlaceholder('to:')
                .setValue(this.plugin.settings.documentSettings.to)
                .onChange(async (value) => {
                    this.plugin.settings.documentSettings.to = value;
                    await this.plugin.saveSettings();
                }));
    }
}
