import { Status, Priority, Energy, HistoryEntries } from 'src/types/PrjTypes';

/**
 * Represents task management data
 * form a Task, Project or Topic.
 */
export interface IPrjTaskManagementData {
    /**
     * Get the **status** of the task.
     */
    get status(): Status | null | undefined;
    /**
     * Set the **status** of the task.
     */
    set status(value: Status | null | undefined);

    /**
     * Get the **priority** of the task.
     */
    get priority(): Priority | null | undefined;
    /**
     * Set the **priority** of the task.
     */
    set priority(value: Priority | null | undefined);

    /**
     * Get the **energy** of the task.
     */
    get energy(): Energy | null | undefined;
    /**
     * Set the **energy** of the task.
     */
    set energy(value: Energy | null | undefined);

    /**
     * Get the **due** date of the task.
     */
    get due(): string | null | undefined;
    /**
     * Set the **due** date of the task.
     */
    set due(value: string | null | undefined);

    /**
     * Get the **history** of the task.
     */
    get history(): HistoryEntries | null | undefined;
    /**
     * Set the **history** of the task.
     */
    set history(value: HistoryEntries | null | undefined);

    /**
     * Get the **aliases** of the task.
     */
    get aliases(): string[] | null | undefined;
    /**
     * Set the **aliases** of the task.
     */
    set aliases(value: string[] | null | undefined);
}
