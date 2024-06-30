import { CachedMetadata, TFile } from 'obsidian';

export default interface IFileMetadata {
    file: TFile;
    metadata: CachedMetadata;
}
