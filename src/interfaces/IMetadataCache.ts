import { TFile } from 'obsidian';
import IFileMetadata from './IFileMetadata';
import { IMetadataCacheEvents } from './IMetadataCacheEvents';
import { IEvent } from 'src/libs/GenericEvents';

export default interface IMetadataCache {
    get cache(): IFileMetadata[];
    isCacheReady(): boolean;
    waitForCacheReady(): Promise<void>;
    getEntry(file: TFile): IFileMetadata | undefined;
    getEntryByPath(path: string): IFileMetadata | undefined;
    getEntryByLink(link: string, path: string): IFileMetadata | undefined;
    getBacklinks(file: TFile): TFile[];

    on<K extends keyof IMetadataCacheEvents['events']>(
        eventName: K,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (
            file: IMetadataCacheEvents['events'][K]['data'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => IMetadataCacheEvents['events'][K] extends IEvent<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any,
            infer TReturn
        >
            ? TReturn
            : void,
    ): void;

    off<K extends keyof IMetadataCacheEvents['events']>(
        eventName: K,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (
            file: IMetadataCacheEvents['events'][K]['data'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => IMetadataCacheEvents['events'][K] extends IEvent<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any,
            infer TReturn
        >
            ? TReturn
            : void,
    ): void;
}
