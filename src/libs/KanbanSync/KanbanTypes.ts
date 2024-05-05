import { Status } from 'src/types/PrjTypes';

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
export type KanbanStatus = Status | typeof ArchivedString;
