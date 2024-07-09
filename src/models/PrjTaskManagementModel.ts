import { TFile, moment } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import { Path } from 'src/classes/Path';
import { ILogger } from 'src/interfaces/ILogger';
import Helper from 'src/libs/Helper';
import { Tag } from 'src/libs/Tags/Tag';
import PrjTypes, { Status } from 'src/types/PrjTypes';
import BaseData from './Data/BaseData';
import ProjectData from './Data/ProjectData';
import TaskData from './Data/TaskData';
import TopicData from './Data/TopicData';
import { FileModel } from './FileModel';
import IPrjData from '../interfaces/IPrjData';
import IPrjModel from '../interfaces/IPrjModel';
import IPrjTaskManagement from '../interfaces/IPrjTaskManagement';

/**
 * Represents a project, task or topic.
 */
export class PrjTaskManagementModel<
        T extends IPrjData & IPrjTaskManagement & BaseData<unknown>,
    >
    extends FileModel<T>
    implements IPrjModel<T>
{
    protected logger: ILogger = Logging.getLogger('PrjTaskManagementModel');

    /**
     * The data of the model.
     */
    public get data(): Partial<T> {
        return this._data;
    }
    /**
     * The data of the model.
     */
    public set data(value: Partial<T>) {
        this._data = value;
    }

    /**
     * Creates a new instance of the PrjTaskManagementModel.
     * @param file The file to create the PrjTaskManagementModel from.
     * @param ctor The constructor of the data class.
     */
    constructor(file: TFile | undefined, ctor: new (data?: Partial<T>) => T) {
        super(file, ctor, undefined);
    }

    /**
     * Returns the corosponding symbol for the model from the settings.
     * @returns The corosponding symbol for the model. (Lucide icon string)
     */
    public getCorospondingSymbol(): string {
        switch (this.data.type) {
            case 'Topic':
                return this.global.settings.prjSettings.topicSymbol;
            case 'Project':
                return this.global.settings.prjSettings.projectSymbol;
            case 'Task':
                return this.global.settings.prjSettings.taskSymbol;
            default:
                return 'x-circle';
        }
    }

    /**
     * Returns the acronym of the title of the model.
     * @returns The acronym of the title.
     * @remarks - If the title is not available, an empty string is returned.
     * - Override if the acronym should be generated differently!
     */
    public getAcronym(): string {
        return Helper.generateAcronym(this.data.title as string);
    }

    /**
     * Check if the `newStatus` is valid and change the status of the model.
     * @param newStatus The new status to set.
     * @remarks - A history entry will be added if the status changes.
     * - This function will start and finish a transaction if no transaction is currently running.
     */
    public changeStatus(newStatus: unknown): void {
        const status = PrjTypes.isValidStatus(newStatus);

        if (!status) return;

        if (this.data.status !== status) {
            let internalTransaction = false;

            if (!this.isTransactionActive) {
                this.startTransaction();
                internalTransaction = true;
            }
            this.data.status = status;
            this.addHistoryEntry(status);

            if (internalTransaction) this.finishTransaction();
        }
    }

    /**
     * Returns the urgency of the model.
     */
    public get urgency(): number {
        return PrjTaskManagementModel.calculateUrgency(
            this as unknown as PrjTaskManagementModel<
                TaskData | TopicData | ProjectData
            >,
        );
    }

    /**
     * Add a new history entry to the model.
     * @param status The status to add to the history. If not provided, the current status of the model will be used.
     * @remarks - This function will not start or finish a transaction.
     * - If no status is provided and the model has no status, an error will be logged and the function will return.
     */
    private addHistoryEntry(status?: Status | undefined): void {
        if (!status) {
            if (this.data.status) status = this.data.status;
            else {
                this.logger.error('No status aviable to add to history');

                return;
            }
        }

        if (!this.data.history) this.data.history = [];

        this.data.history.push({
            status: status,
            date: moment().format('YYYY-MM-DDTHH:mm'),
        });
    }

    /**
     * Returns the aliases of the model as an array of strings
     * @returns Array of strings containing the aliases
     */
    public getAliases(): string[] {
        const aliases = this.data.aliases;
        let formattedAliases: string[] = [];

        if (aliases && typeof aliases === 'string') {
            formattedAliases = [aliases];
        } else if (Array.isArray(aliases)) {
            formattedAliases = [...aliases];
        }

        return formattedAliases;
    }

    /**
     * Retrieves the automatic filename based on the title and aliases.
     * @returns The automatic filename or undefined if the title or aliases are not available.
     * @remarks If the file's parent path is available, a new filename is generated by combining the last alias, title, and file extension.
     * @remarks If the title or aliases are not available, a warning message is logged and undefined is returned.
     */
    public getAutomaticFilename(): string | undefined {
        const title = this.data.title;

        const aliases =
            this.getAliases().length > 0
                ? new Tag(
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      this.getAliases().first()!,
                  ).getElements()
                : undefined;

        let filename: string;

        if (!title) {
            this.logger.warn(`No title found for file ${this.file?.path}`);

            return;
        }

        if (!aliases) {
            this.logger.info(`No aliases found for file ${this.file?.path}`);
            filename = title;
        } else {
            filename = `${aliases.last()} - ${title}`;
        }

        if (this.file.parent?.path) {
            const newFileName = Path.sanitizeFilename(filename);

            this.logger.debug(
                `New filename for ${this.file.path}: ${newFileName}`,
            );

            return newFileName;
        }
    }

    /**
     * Static API for the PrjTaskManagementModel class.
     */
    //#region Static API

    /**
     * The model factories for the PrjTaskManagementModel class.
     */
    private static _modelFactories = new Map<
        string,
        (
            file: TFile,
        ) => PrjTaskManagementModel<
            IPrjData & IPrjTaskManagement & BaseData<unknown>
        >
    >();

    /**
     * Registers a new model factory for the given type.
     * @param type The type to register the factory for.
     * @param factory The factory to register.
     */
    public static registerModelFactory(
        type: string,
        factory: (
            file: TFile,
        ) => PrjTaskManagementModel<
            IPrjData & IPrjTaskManagement & BaseData<unknown>
        >,
    ) {
        PrjTaskManagementModel._modelFactories.set(type, factory);
    }

    /**
     * Retrieves the corresponding model based on the file type.
     * @param file The file for which to retrieve the corresponding model.
     * @returns The corresponding model if found, otherwise undefined.
     */
    public static getCorospondingModel(
        file: TFile,
    ):
        | PrjTaskManagementModel<
              IPrjData & IPrjTaskManagement & BaseData<unknown>
          >
        | undefined {
        const entry = Global.getInstance().metadataCache.getEntry(file);

        if (!entry) return undefined;
        const type = entry.metadata.frontmatter?.type;
        const factory = PrjTaskManagementModel._modelFactories.get(type);

        return factory ? factory(file) : undefined;
    }

    /**
     * Sorts the models by urgency descending
     * @param models Array of PrjTaskManagementModels to sort
     * @remarks This function sorts the array in place
     * @see {@link statusToNumber}
     * @see {@link calculateUrgency}
     * @see {@link getLastHistoryDate}
     * @remarks The sorting is done as follows:
     * - If both are `done`, sort by last history entry
     * - If `a` or `b` is done, sort it lower
     * - Both are not done, sort by urgency
     * - Both have the same urgency, sort by status
     * - Both have the same status, sort by priority
     * - Fallback to sorting by last history entry
     * - Fallback to stop sorting
     */
    public static sortModelsByUrgency(
        models: PrjTaskManagementModel<TaskData | TopicData | ProjectData>[],
    ): void {
        models.sort((a, b) => {
            // If both are `done`, sort by last history entry
            const aDate = this.getLastHistoryDate(a);
            const bDate = this.getLastHistoryDate(b);

            if (a.data.status === 'Done' && b.data.status === 'Done') {
                if (aDate && bDate) {
                    return bDate.getTime() - aDate.getTime();
                }
            }

            // If `a` is done, sort it lower
            if (a.data.status === 'Done') {
                return 1;
            }

            // If `b` is done, sort it lower
            if (b.data.status === 'Done') {
                return -1;
            }

            // Both are not done, sort by urgency
            const aUrgency = this.calculateUrgency(a);
            const bUrgency = this.calculateUrgency(b);

            if (bUrgency !== aUrgency) {
                return bUrgency - aUrgency;
            }

            // Both have the same urgency, sort by status
            const aStatus = this.statusToNumber(a.data.status);

            const bStatus = this.statusToNumber(b.data.status);

            if (bStatus !== aStatus) {
                return bStatus - aStatus;
            }

            // Both have the same status, sort by priority
            const aPrirority = a.data.priority ?? 0;
            const bPrirority = b.data.priority ?? 0;

            if (bPrirority !== aPrirority) {
                return bPrirority - aPrirority;
            }

            // Fallback to sorting by last history entry
            if (aDate && bDate) {
                return bDate.getTime() - aDate.getTime();
            }

            // Fallback to stop sorting
            return 0;
        });
    }

    /**
     * Returns the number representation of the status.
     * @param status The status to convert.
     * @returns The number representation of the status.
     * @remarks The number representation is:
     * - `Active` = 3
     * - `Waiting` = 2
     * - `Later` = 1
     * - `Someday` = 0
     * - `undefined` = -1
     */
    private static statusToNumber(status: Status | undefined | null): number {
        switch (status) {
            case 'Active':
                return 3;
            case 'Waiting':
                return 2;
            case 'Later':
                return 1;
            case 'Someday':
                return 0;
            default:
                return -1;
        }
    }

    /**
     * Calculates the urgency of the model.
     * @param model The model to calculate the urgency for.
     * @returns The urgency of the model.
     * @remarks The urgency is calculated as follows:
     * - No `status` or `status` is 'Done' = -2
     * - No `due` or `status` is 'Someday' = -1
     * - Due date is today or in the past = 3
     * - Due date is in the next 3 days = 2
     * - Due date is in the next 7 days = 1
     * - Due date is in more the future = 0
     */
    public static calculateUrgency(
        model: PrjTaskManagementModel<TaskData | TopicData | ProjectData>,
    ): number {
        if (!model.data.status || model.data.status === 'Done') {
            return -2;
        }

        if (model.data.status === 'Someday') {
            return -1;
        }

        if (!model.data.due) {
            return 0;
        }

        const dueDate = new Date(model.data.due);
        dueDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const differenceInDays =
            (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

        let urgency = 0;

        if (differenceInDays <= 0) {
            urgency = 3;
        } else if (differenceInDays <= 3) {
            urgency = 2;
        } else if (differenceInDays <= 7) {
            urgency = 1;
        }

        return urgency;
    }

    /**
     * Returns the date of the last history entry.
     * @param model The model to get the last history entry date from.
     * @returns The date of the last history entry.
     */
    private static getLastHistoryDate(
        model: PrjTaskManagementModel<TaskData | TopicData | ProjectData>,
    ): Date | null {
        if (
            model.data.history &&
            Array.isArray(model.data.history) &&
            model.data.history.length > 0
        ) {
            const history = model.data.history;
            const lastEntry = history[history.length - 1];

            return new Date(lastEntry.date);
        } else {
            return null;
        }
    }

    /**
     * Synchronizes the title of the file with its filename.
     * @param file - The file to synchronize the title and filename.
     * @see {@link PrjTaskManagementModel.getAutomaticFilename()}
     */
    public static syncTitleToFilename(file: TFile) {
        const logger = Logging.getLogger(
            'StaticPrjTaskManagementModel/syncTitleToFilename',
        );

        const model = PrjTaskManagementModel.getCorospondingModel(file);

        if (!model) {
            logger.warn(`No model found for file ${file.path}`);

            return;
        }

        const automaticFilename = model.getAutomaticFilename();

        if (!automaticFilename) {
            logger.warn(`No automatic filename found for file ${file.path}`);

            return;
        }

        model.renameFile(automaticFilename);
    }

    /**
     * Syncs the status of the model to the path.
     * @param file The file to sync the status for.
     */
    public static syncStatusToPath(file: TFile) {
        const model = PrjTaskManagementModel.getCorospondingModel(file);

        if (!model) {
            return;
        }
        const status = model.data.status;

        if (!status) {
            return;
        }
        const settings = Global.getInstance().settings.prjSettings;
        let parentPath: string | undefined;

        if (model.file.parent?.path) {
            switch (model.data.type) {
                case 'Topic':
                    if (settings.topicFolder) {
                        parentPath = settings.topicFolder;
                    }
                    break;
                case 'Project':
                    if (settings.projectFolder) {
                        parentPath = settings.projectFolder;
                    }
                    break;
                case 'Task':
                    if (settings.taskFolder) {
                        parentPath = settings.taskFolder;
                    }
                    break;
                default:
                    return;
            }
        }

        if (parentPath) {
            let movePath: string;

            if (model.data.status === 'Done') {
                movePath = Path.join(parentPath, 'Archiv');
            } else if (PrjTypes.isValidStatus(model.data.status)) {
                movePath = parentPath;
            } else {
                return;
            }

            model.moveFile(movePath);
        }
    }

    //#endregion
}
