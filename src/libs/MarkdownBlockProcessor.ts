/* eslint-disable no-case-declarations */
// Note: MarkdownBlockProcessor Class

import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import * as yaml from 'js-yaml';
import Global from "../classes/Global";
import DocumentBlockRenderComponent from "./BlockRenderComponents/DocumentBlockRenderComponent";
import { IProcessorSettings } from "../interfaces/IProcessorSettings";
import ProjectBlockRenderComponent from "./BlockRenderComponents/ProjectBlockRenderComponent";
import NoteBlockRenderComponent from "./BlockRenderComponents/NoteBlockRenderComponent";
import Logging from "src/classes/Logging";
import Helper from "./Helper";

class mdRenderChild extends MarkdownRenderChild {
    constructor(container: HTMLElement) {
        super(container);
    }

    override onunload(): void {
        console.trace("On Unload");
        super.onunload();
    }
}

/**
 * Class for the markdown block processor.
 */
export default class MarkdownBlockProcessor {

    static async parseSource(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const startTime = Date.now();
        const global = Global.getInstance();
        await global.metadataCache.waitForCacheReady();
        const logger = Logging.getLogger("BlockProcessor");
        logger.trace(`DocId: ${ctx.docId}`);

        const uid = Helper.generateUID(source.trim(), 15);
        const setting: IProcessorSettings = yaml.load(source) as IProcessorSettings;

        // Remove the cm-embed-block class from the parent element
        // and add the prj-block class.
        // This remove the Block-Hover-Effekt from the block
        // and with CSS we remove the Block-Edit-Button
        const parent = el.closest('div.cm-preview-code-block.cm-embed-block.markdown-rendered');
        if (parent) {
            parent.classList.remove('cm-embed-block');
            parent.addClass('prj-block');
        }

        let viewState: string | null = null;
        const viewStateParent = el.closest('.workspace-leaf-content');
        const same = viewStateParent?.querySelectorAll(`#${uid}`);
        if (viewStateParent) {
            viewState = viewStateParent.getAttribute('data-mode');
            console.log("Same:", same);
            const observer = new MutationObserver((mutations) => {
                console.log("Observer changes:", mutations);
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-mode') {
                        const newViewState = viewStateParent.getAttribute('data-mode');
                        const source = viewStateParent?.querySelector(`#${uid}[data-mode='source']`);
                        const preview = viewStateParent?.querySelector(`#${uid}[data-mode='preview']`);
                        if (newViewState === "preview" && source && preview) {
                            while (source.firstChild) {
                                preview.appendChild(source.firstChild);
                            }
                        } else if (newViewState === "source" && source && preview) {
                            while (preview.firstChild) {
                                source.appendChild(preview.firstChild);
                            }
                        }
                    }
                }
            });

            observer.observe(viewStateParent, {
                attributes: true
            });
        }




        let show = true;
        let thisViewState: string | null = null;
        // Get the view state of the block
        const sourceView = el.closest('.markdown-source-view');
        const readingView = el.closest('.markdown-reading-view');
        if (sourceView) {
            thisViewState = "source";
        } else if (readingView) {
            thisViewState = "preview";
        }

        const diffContainer = document.createElement('div');
        el.append(diffContainer);
        diffContainer.id = uid;
        diffContainer.setAttribute('data-mode', thisViewState ?? "none");

        const cmp = new mdRenderChild(diffContainer);
        setting.component = cmp;
        ctx.addChild(cmp);

        if (thisViewState && viewState && thisViewState === viewState && same && same.length < 1) {
            show = true;
        } else {
            const source = viewStateParent?.querySelector(`#${uid}[data-mode='source']`);
            const preview = viewStateParent?.querySelector(`#${uid}[data-mode='preview']`);
            let move = false;
            if (thisViewState === "preview" && source && preview) {
                while (source.firstChild) {

                    if (source.firstChild.childNodes.length > 0) {
                        move = true;
                        logger.trace("Move:", source.firstChild);
                        diffContainer.appendChild(source.firstChild);
                    }

                }
            } else if (thisViewState === "source" && source && preview) {
                while (preview.firstChild) {

                    if (preview.firstChild.childNodes.length > 0) {
                        move = true;
                        logger.trace("Move:", preview.firstChild);
                        diffContainer.appendChild(preview.firstChild);
                    }

                }
            }

            if (move) {
                const endTime = Date.now();
                logger.debug(`MarkdownBlockProcessor runs for ${endTime - startTime}ms`);
                return;
            }
        }

        const blockContainer = document.createElement('div');
        diffContainer.append(blockContainer);
        blockContainer.classList.add('prj-block-container');
        blockContainer.lang = global.settings.language;
        if (setting.styles) {
            setting.styles.forEach(style => {
                blockContainer.classList.add(style);
            });
        }


        setting.source = ctx.sourcePath;
        setting.frontmatter = global.metadataCache.cache.filter(file => file.file.path === ctx.sourcePath).first()?.metadata.frontmatter;
        setting.container = blockContainer;
        setting.ctx = ctx;

        if (setting && show) {
            switch (setting.type) {
                case "Documents":
                    const documentBlock = new DocumentBlockRenderComponent(setting)
                    await documentBlock.build();
                    break;
                case "Tasks":
                case "Projects":
                case "Topics":
                    const projectBlock = new ProjectBlockRenderComponent(setting)
                    await projectBlock.build();
                    break;
                case "Notes":
                    const noteBlock = new NoteBlockRenderComponent(setting)
                    await noteBlock.build();
                    break;
                case "Debug":
                    console.log("Debug Mode");
                    console.log(`Settings: ${setting}`);
                    break;
                default:
                    break;
            }

            const endTime = Date.now();
            logger.debug(`MarkdownBlockProcessor runs for ${endTime - startTime}ms`);
        }

    }
}

