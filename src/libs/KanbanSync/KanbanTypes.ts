import { Status } from 'src/types/PrjTypes';

export const CompletedString = '**Fertiggestellt**';
export const ArchivedString = 'Archiv';

export type KanbanStatus = Status | typeof ArchivedString;
