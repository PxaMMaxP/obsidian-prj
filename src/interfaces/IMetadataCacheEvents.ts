import { TFile } from 'obsidian';
import { ICallback, IEvent } from 'src/libs/GenericEvents';

export interface IMetadataCacheEvents extends ICallback {
    events: {
        'prj-task-management-changed-status-event': IEvent<
            TFile,
            undefined | void
        >;
        'prj-task-management-file-changed-event': IEvent<
            TFile,
            undefined | void
        >;
        'document-changed-metadata-event': IEvent<TFile, undefined | void>;
        'changes-in-kanban-event': IEvent<TFile, undefined | void>;
        'file-rename-event': IEvent<
            { oldPath: string; newPath: string },
            undefined | void
        >;
    };
}
