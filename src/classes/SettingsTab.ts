import { App, PluginSettingTab, Setting } from 'obsidian';
import Prj from 'src/main';
import Logging, { LoggingLevel } from './Logging';

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
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        none: 'none',
                        trace: 'trace',
                        debug: 'debug',
                        info: 'info',
                        warn: 'warn',
                        error: 'error',
                    })
                    .setValue(this.plugin.settings.logLevel)
                    .onChange(async (value) => {
                        this.plugin.settings.logLevel = value;

                        Logging.getInstance().setLogLevel(
                            value as LoggingLevel,
                        );
                        await this.plugin.saveSettings();
                    }),
            );

        // Editability
        new Setting(containerEl)
            .setName('Performance Mode (only Mobile)')
            .setDesc(
                'The performance of the plugin is affected by this setting. If disabled, the editability of the blocks is disabled. No effect on Desktop!',
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.mobile)
                    .onChange(async (value) => {
                        this.plugin.settings.mobile = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Localisation
        new Setting(containerEl).setHeading().setName('Localisation');

        // Language (Dropdown)
        new Setting(containerEl)
            .setName('Language')
            .setDesc('The language to use')
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        en: 'English',
                        de: 'Deutsch',
                    })
                    .setValue(this.plugin.settings.language)
                    .onChange(async (value) => {
                        this.plugin.settings.language = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Date format
        new Setting(containerEl)
            .setName('Date Format')
            .setDesc('The Date format to use')
            .addText((text) =>
                text
                    .setPlaceholder('DD.MM.YYYY')
                    .setValue(this.plugin.settings.dateFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.dateFormat = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Date format short
        new Setting(containerEl)
            .setName('Short date format')
            .setDesc('The short Date format to use')
            .addText((text) =>
                text
                    .setPlaceholder('DD.MM.YY')
                    .setValue(this.plugin.settings.dateFormatShort)
                    .onChange(async (value) => {
                        this.plugin.settings.dateFormatShort = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Base tag for all related files
        new Setting(containerEl)
            .setName('Base Tag')
            .setDesc('The Base Tag for all Elements')
            .addText((text) =>
                text
                    .setPlaceholder('YourBaseTag (without / and #)')
                    .setValue(this.plugin.settings.baseTag)
                    .onChange(async (value) => {
                        this.plugin.settings.baseTag = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Template Folder
        new Setting(containerEl)
            .setName('Template Folder')
            .setDesc('The Folder where all Templates are stored')
            .addText((text) =>
                text
                    .setPlaceholder('YourTemplateFolder')
                    .setValue(this.plugin.settings.templateFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.templateFolder = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // PDF Folder
        new Setting(containerEl)
            .setName('PDF Folder')
            .setDesc(
                'The Folder where all PDFs are stored. {YYYY} is replaced with the current year and {MM} with the current month.',
            )
            .addText((text) =>
                text
                    .setPlaceholder('YourPDFFolder')
                    .setValue(this.plugin.settings.documentSettings.pdfFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.pdfFolder = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Ignore PDF Folders
        new Setting(containerEl)
            .setName('Ignore PDF Folders')
            .setDesc(
                'The Folders to ignore for PDFs (Renaming, moving etc.) Newline separated.',
            )
            .addTextArea((text) =>
                text
                    .setPlaceholder('YourPDFFolder')
                    .setValue(
                        !Array.isArray(
                            this.plugin.settings.documentSettings
                                .ignorePdfFolders,
                        ) ||
                            this.plugin.settings.documentSettings
                                .ignorePdfFolders.length === 0
                            ? ''
                            : this.plugin.settings.documentSettings.ignorePdfFolders.join(
                                  '\n',
                              ),
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.ignorePdfFolders =
                            value.split('\n');
                        await this.plugin.saveSettings();
                    }),
            );

        // User information
        new Setting(containerEl).setHeading().setName('User Information');

        // User Name
        new Setting(containerEl)
            .setName('User: Name')
            .setDesc('Your name')
            .addText((text) =>
                text
                    .setPlaceholder('Your name')
                    .setValue(this.plugin.settings.user.name)
                    .onChange(async (value) => {
                        this.plugin.settings.user.name = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // User Name Short
        new Setting(containerEl)
            .setName('User: Short name')
            .setDesc('Your name short name')
            .addText((text) =>
                text
                    .setPlaceholder('Your name shortened')
                    .setValue(this.plugin.settings.user.shortName)
                    .onChange(async (value) => {
                        this.plugin.settings.user.shortName = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // User Email
        new Setting(containerEl)
            .setName('User: Email')
            .setDesc('Your E-Mail adress')
            .addText((text) =>
                text
                    .setPlaceholder('Your email')
                    .setValue(this.plugin.settings.user.email)
                    .onChange(async (value) => {
                        this.plugin.settings.user.email = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // User Street
        new Setting(containerEl)
            .setName('User: Street')
            .setDesc('Your street')
            .addText((text) =>
                text
                    .setPlaceholder('Your street')
                    .setValue(this.plugin.settings.user.street)
                    .onChange(async (value) => {
                        this.plugin.settings.user.street = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // User City
        new Setting(containerEl)
            .setName('User: City')
            .setDesc('Your city')
            .addText((text) =>
                text
                    .setPlaceholder('Your city')
                    .setValue(this.plugin.settings.user.city)
                    .onChange(async (value) => {
                        this.plugin.settings.user.city = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // User Zip
        new Setting(containerEl)
            .setName('User: Zip Code')
            .setDesc('Your zip code')
            .addText((text) =>
                text
                    .setPlaceholder('Your zip')
                    .setValue(this.plugin.settings.user.zip)
                    .onChange(async (value) => {
                        this.plugin.settings.user.zip = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // User Country
        new Setting(containerEl)
            .setName('User: Country')
            .setDesc('Your country')
            .addText((text) =>
                text
                    .setPlaceholder('Your country')
                    .setValue(this.plugin.settings.user.country)
                    .onChange(async (value) => {
                        this.plugin.settings.user.country = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Document Settings
        new Setting(containerEl).setHeading().setName('Document Settings');

        // Default Max Show
        new Setting(containerEl)
            .setName('Default Max Show')
            .setDesc('The default max show for Table Entrys')
            .addText((text) =>
                text
                    .setPlaceholder('200')
                    .setValue(this.plugin.settings.defaultMaxShow.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.defaultMaxShow =
                            value as unknown as number;
                        await this.plugin.saveSettings();
                    }),
            );

        // Symbol
        new Setting(containerEl)
            .setName('Document Symbol')
            .setDesc('The Symbol for regular Documents')
            .addText((text) =>
                text
                    .setPlaceholder('file-text')
                    .setValue(this.plugin.settings.documentSettings.symbol)
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.symbol = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Hide Symbol
        new Setting(containerEl)
            .setName('Hide Symbol')
            .setDesc('The Symbol for hidden Documents')
            .addText((text) =>
                text
                    .setPlaceholder('file-minus-2')
                    .setValue(this.plugin.settings.documentSettings.hideSymbol)
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.hideSymbol =
                            value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Cluster Symbol
        new Setting(containerEl)
            .setName('Cluster Symbol')
            .setDesc('The Symbol for Cluster Documents')
            .addText((text) =>
                text
                    .setPlaceholder('library')
                    .setValue(
                        this.plugin.settings.documentSettings.clusterSymbol,
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.clusterSymbol =
                            value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Default Folder
        new Setting(containerEl)
            .setName('Default Folder')
            .setDesc('The default folder for new Documents')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(
                        this.plugin.settings.documentSettings.defaultFolder,
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.defaultFolder =
                            value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Template file
        new Setting(containerEl)
            .setName('Template File')
            .setDesc('The Template file for new Documents')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.documentSettings.template)
                    .onChange(async (value) => {
                        this.plugin.settings.documentSettings.template = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Note Settings
        new Setting(containerEl).setHeading().setName('Note Settings');

        // Default Folder
        new Setting(containerEl)
            .setName('Default Folder')
            .setDesc('The default folder for new Notes')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.noteSettings.defaultFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.noteSettings.defaultFolder = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Template file
        new Setting(containerEl)
            .setName('Template File')
            .setDesc('The Template file for new Notes')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.noteSettings.template)
                    .onChange(async (value) => {
                        this.plugin.settings.noteSettings.template = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Project Settings
        new Setting(containerEl).setHeading().setName('Project Settings');

        // Topic Symbol
        new Setting(containerEl)
            .setName('Topic Symbol')
            .setDesc('The Symbol for Topics')
            .addText((text) =>
                text
                    .setPlaceholder('album')
                    .setValue(this.plugin.settings.prjSettings.topicSymbol)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.topicSymbol = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Topic Folder
        new Setting(containerEl)
            .setName('Topic Folder')
            .setDesc('The default folder for new Topics')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.prjSettings.topicFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.topicFolder = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Template file
        new Setting(containerEl)
            .setName('Template File')
            .setDesc('The Template file for new Topics')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.prjSettings.topicTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.topicTemplate = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Project Symbol
        new Setting(containerEl)
            .setName('Project Symbol')
            .setDesc('The Symbol for Projects')
            .addText((text) =>
                text
                    .setPlaceholder('album')
                    .setValue(this.plugin.settings.prjSettings.projectSymbol)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.projectSymbol = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Project Folder
        new Setting(containerEl)
            .setName('Project Folder')
            .setDesc('The default folder for new Projects')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.prjSettings.projectFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.projectFolder = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Template file
        new Setting(containerEl)
            .setName('Template File')
            .setDesc('The Template file for new Projects')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.prjSettings.projectTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.projectTemplate =
                            value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Sub Templates
        new Setting(containerEl)
            .setName('Sub Templates')
            .setDesc(
                'The Project Sub Templates. \nOne per line and Label and File separated by a semicolon.',
            )
            .addTextArea((text) =>
                text
                    .setPlaceholder('Sub Templates')
                    .setValue(
                        this.plugin.settings.prjSettings.subProjectTemplates
                            ?.map((value) => `${value.label};${value.template}`)
                            .join('\n'),
                    )
                    .onChange(async (value) => {
                        const lines = value.split('\n');

                        this.plugin.settings.prjSettings.subProjectTemplates =
                            lines.map((line) => {
                                const parts = line.split(';');

                                return {
                                    label: parts[0],
                                    template: parts[1],
                                };
                            });
                        await this.plugin.saveSettings();
                    }),
            );

        // Task Symbol
        new Setting(containerEl)
            .setName('Task Symbol')
            .setDesc('The Symbol for Tasks')
            .addText((text) =>
                text
                    .setPlaceholder('album')
                    .setValue(this.plugin.settings.prjSettings.taskSymbol)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.taskSymbol = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Task Folder
        new Setting(containerEl)
            .setName('Task Folder')
            .setDesc('The default folder for new Tasks')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.prjSettings.taskFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.taskFolder = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Template file
        new Setting(containerEl)
            .setName('Template File')
            .setDesc('The Template file for new Tasks')
            .addText((text) =>
                text
                    .setPlaceholder('')
                    .setValue(this.plugin.settings.prjSettings.taskTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.prjSettings.taskTemplate = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Sub Templates
        new Setting(containerEl)
            .setName('Sub Templates')
            .setDesc(
                'The Task Sub Templates. \nOne per line and Label and File separated by a semicolon.',
            )
            .addTextArea((text) =>
                text
                    .setPlaceholder('Sub Templates')
                    .setValue(
                        this.plugin.settings.prjSettings.subTaskTemplates
                            ?.map((value) => `${value.label};${value.template}`)
                            .join('\n'),
                    )
                    .onChange(async (value) => {
                        const lines = value.split('\n');

                        this.plugin.settings.prjSettings.subTaskTemplates =
                            lines.map((line) => {
                                const parts = line.split(';');

                                return {
                                    label: parts[0],
                                    template: parts[1],
                                };
                            });
                        await this.plugin.saveSettings();
                    }),
            );
    }
}
