import { StatusTypes } from '../StatusType/interfaces/IStatusType';

/**
 * This string represents that the subsequent cards have been completed.
 */
export const CompletedString = '**Fertiggestellt**';

/**
 * This string represents that the subsequent cards are archived.
 */
export const ArchivedString = 'Archiv';

/**
 * Represents the status of a Kanban card.
 * This can be a valid status or the 'Archiv' status.
 */
export type KanbanStatus = StatusTypes | typeof ArchivedString;
