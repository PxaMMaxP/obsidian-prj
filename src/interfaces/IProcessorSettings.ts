import { FrontMatterCache, MarkdownPostProcessorContext } from "obsidian";
import { IProcessorOptions } from "src/interfaces/IProcessorOptions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import MarkdownBlockProcessor from "src/libs/MarkdownBlockProcessor";

/**
 * Interface for the processor settings.
 * @remarks - This interface is used to pass the settings to the processor.
 * @see {@link IProcessorOptions}
 */
export interface IProcessorSettings {
    /**
     * The type of the processor.
     * @remarks - This property is used to determine which processor should be used.
     * @example - "Documents" | "Tasks" | "Projects" | "Topics" | "Debug"
     * @see {@link MarkdownBlockProcessor}
     */
    type: string;

    /**
     * The options of the processor.
     * @remarks - This property is used to pass the options to the processor.
     * @example - [{label: "Tags", value: "this"}, {label: "maxDocuments", value: "100"}]
     */
    options: IProcessorOptions[];

    /**
     * The source of the processor.
     * @remarks - This property is used to pass the source to the processor.
     * @example - "path/to/file.md"
     */
    source: string;

    /**
     * The frontmatter of the file which contains the processor.
     * @remarks - This property is used to pass the frontmatter to the processor.
     */
    frontmatter: FrontMatterCache | null | undefined;

    /**
     * The container of the processor.
     * @remarks - This property is used to pass the container to the processor.
     */
    container: HTMLElement;

    /**
     * The context of the processor.
     * @remarks - This property is used to pass the context to the processor.
     */
    ctx: MarkdownPostProcessorContext;

    /**
     * The styles of the processor.
     * @remarks - This property is used to pass the styles to the processor.
     * - The styles are used to style the main container.
     */
    styles: string[];
}
