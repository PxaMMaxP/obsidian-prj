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

        // Log Level
        new Setting(containerEl)
            .setName('Log Level')
            .setDesc('The log level to use')
            .addText(text => text
                .setPlaceholder('none | debug | info | warn | error')
                .setValue(this.plugin.settings.logLevel)
                .onChange(async (value) => {
                    this.plugin.settings.logLevel = value;
                    await this.plugin.saveSettings();
                }));

        // Localisation
        new Setting(containerEl)
            .setHeading()
            .setName('Localisation');

        // Language
        new Setting(containerEl)
            .setName('Language')
            .setDesc('The language to use')
            .addText(text => text
                .setPlaceholder('en | de')
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                }));

        // Date format
        new Setting(containerEl)
            .setName('Date Format')
            .setDesc('The Date format to use')
            .addText(text => text
                .setPlaceholder('DD.MM.YYYY')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value;
                    await this.plugin.saveSettings();
                }));

        // Date format short
        new Setting(containerEl)
            .setName('Short date format')
            .setDesc('The short Date format to use')
            .addText(text => text
                .setPlaceholder('DD.MM.YY')
                .setValue(this.plugin.settings.dateFormatShort)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormatShort = value;
                    await this.plugin.saveSettings();
                }));

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

        // User Name
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

        // User Name Short
        new Setting(containerEl)
            .setName('User: Short name')
            .setDesc('Your name short name')
            .addText(text => text
                .setPlaceholder('Your name shortened')
                .setValue(this.plugin.settings.user.shortName)
                .onChange(async (value) => {
                    this.plugin.settings.user.shortName = value;
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

        // Default Max Show
        new Setting(containerEl)
            .setName('Default Max Show')
            .setDesc('The default max show for Table Entrys')
            .addText(text => text
                .setPlaceholder('200')
                .setValue(this.plugin.settings.defaultMaxShow.toString())
                .onChange(async (value) => {
                    this.plugin.settings.defaultMaxShow = value as unknown as number;
                    await this.plugin.saveSettings();
                }));

        // Symbol
        new Setting(containerEl)
            .setName('Document Symbol')
            .setDesc('The Symbol for regular Documents')
            .addText(text => text
                .setPlaceholder('file-text')
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
                .setPlaceholder('file-minus-2')
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
                .setPlaceholder('library')
                .setValue(this.plugin.settings.documentSettings.clusterSymbol)
                .onChange(async (value) => {
                    this.plugin.settings.documentSettings.clusterSymbol = value;
                    await this.plugin.saveSettings();
                }));
    }
}
