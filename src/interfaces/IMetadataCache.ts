import { TFile } from 'obsidian';
import { IEvent } from 'src/libs/GenericEvents';
import IFileMetadata from './IFileMetadata';
import { IMetadataCacheEvents } from './IMetadataCacheEvents';

export default interface IMetadataCache {
    /**
     * Get the metadata cache
     * @description This method returns the metadata cache as an array of FileMetadata objects. The FileMetadata object contains the file and the cached metadata.
     * @remarks - The reference of the array is returned and will be the same on every call.
     * - If the cache is updated, the array is emptied and repopulated with the current values from the metadata cache.
     * - You can use the array permanently, but you should not rely on the order of the entries.
     */
    get cache(): IFileMetadata[];
    /**
     * Check if the metadata cache is ready
     * @returns True if the metadata cache is ready, false otherwise
     */
    isCacheReady(): boolean;
    /**
     * Wait for the metadata cache to be ready
     * @returns Promise that resolves when the metadata cache is ready
     * @description This method returns a promise that resolves when the metadata cache is ready.
     */
    waitForCacheReady(): Promise<void>;
    /**
     * Get the metadata cache entry for a file.
     * @param file The file to get from the metadata cache.
     * @returns The metadata cache entry for the file.
     * @remarks - This method returns undefined if the metadata cache is not ready.
     * - As key the file path is used!
     */
    getEntry(file: TFile): IFileMetadata | undefined;
    /**
     * Get the metadata cache entry for a file path.
     * @param path The file path to get from the metadata cache.
     * @returns The metadata cache entry for the file path.
     * @remarks - This method returns undefined if the metadata cache is not ready or if no entry is found.
     */
    getEntryByPath(path: string): IFileMetadata | undefined;
    /**
     * Get the metadata cache entry for a file link.
     * @param link The file link to get from the metadata cache.
     * @param path The path of the file where the link is located.
     * @returns The metadata cache entry for the file link.
     */
    getEntryByLink(link: string, path: string): IFileMetadata | undefined;
    /**
     * Get the backlinks for a file.
     * @param file The file to get the backlinks for.
     * @returns Array of files that link to the file.
     */
    getBacklinks(file: TFile): TFile[];
    /**
     * Get the file object for a file link.
     * @param link The file link to get the file object for.
     * @param path The path of the file where the link is located.
     * @returns The file object for the file link or undefined if no file is found.
     */
    getFileByLink(link: string, path: string): TFile | undefined;

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

    /**
     * Deconstructor for the MetadataCache class
     * @description This method is used to unregister the event handlers for the metadata cache.
     */
    onUnload(): void;
}
