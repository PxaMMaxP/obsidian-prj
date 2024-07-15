/**
 * @jest-environment jsdom
 */

import { MarkdownPostProcessorContext } from 'obsidian';
import MockLogger from 'src/__mocks__/ILogger.mock';
import { ILogger } from 'src/interfaces/ILogger';
import SingletonBlockProcessor from '../SingletonBlockProcessor';

describe('SingletonBlockProcessor', () => {
    let mockEl: HTMLElement;
    let mockCtx: MarkdownPostProcessorContext;
    let mockLogger: ILogger;
    let processor: SingletonBlockProcessor;

    beforeEach(() => {
        mockEl = document.createElement('div');
        mockCtx = {} as MarkdownPostProcessorContext;

        mockLogger = MockLogger;

        processor = new SingletonBlockProcessor(
            'test-uid',
            mockEl,
            mockCtx,
            mockLogger,
        );
    });

    test('constructor initializes properties correctly', () => {
        expect(processor['_uid']).toBe('test-uid');
        expect(processor['_el']).toBe(mockEl);
        expect(processor['_ctx']).toBe(mockCtx);
        expect(processor['_logger']).toBe(mockLogger);
    });

    test('singletoneContainer creates and returns container', () => {
        const container = processor.singletoneContainer;
        expect(container.id).toBe('test-uid');
        expect(container.getAttribute('data-mode')).toBeDefined();
    });

    test('codeBlockViewState returns correct view state', () => {
        mockEl.classList.add('markdown-source-view');
        expect(processor.codeBlockViewState).toBe('source');

        mockEl.classList.remove('markdown-source-view');
        mockEl.classList.add('markdown-reading-view');
        expect(processor.codeBlockViewState).toBe('preview');

        mockEl.classList.remove('markdown-reading-view');
        expect(processor.codeBlockViewState).toBeUndefined();
    });

    test('workspaceLeafContent returns closest workspace leaf content', () => {
        const workspaceLeafContent = document.createElement('div');
        workspaceLeafContent.classList.add('workspace-leaf-content');
        workspaceLeafContent.appendChild(mockEl);
        document.body.appendChild(workspaceLeafContent);

        expect(processor['workspaceLeafContent']).toBe(workspaceLeafContent);
    });

    test('workspaceLeafState returns closest workspace leaf data-mode attribute', () => {
        const workspaceLeafContent = document.createElement('div');
        workspaceLeafContent.classList.add('workspace-leaf-content');
        workspaceLeafContent.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(mockEl);
        document.body.appendChild(workspaceLeafContent);

        expect(processor['workspaceLeafState']).toBe('source');
    });

    test('siblingBlocks returns all sibling blocks with the same uid', () => {
        const workspaceLeafContent = document.createElement('div');
        workspaceLeafContent.classList.add('workspace-leaf-content');
        workspaceLeafContent.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(mockEl);
        document.body.appendChild(workspaceLeafContent);

        const siblingBlock = document.createElement('div');
        siblingBlock.classList.add('singleton-block');
        siblingBlock.id = 'test-uid';
        workspaceLeafContent.appendChild(siblingBlock);

        const siblingBlock2 = document.createElement('div');
        siblingBlock2.classList.add('singleton-block');
        siblingBlock2.id = 'test-uid';
        workspaceLeafContent.appendChild(siblingBlock2);

        expect(processor['siblingBlocks']?.length).toBe(2);
    });

    test('sourceSiblingBlock returns source sibling block', () => {
        const workspaceLeafContent = document.createElement('div');
        workspaceLeafContent.classList.add('workspace-leaf-content');
        workspaceLeafContent.setAttribute('data-mode', 'preview');
        workspaceLeafContent.appendChild(mockEl);
        document.body.appendChild(workspaceLeafContent);

        const siblingBlock = document.createElement('div');
        siblingBlock.classList.add('singleton-block');
        siblingBlock.id = 'test-uid';
        siblingBlock.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(siblingBlock);

        const siblingBlock2 = document.createElement('div');
        siblingBlock2.classList.add('singleton-block');
        siblingBlock2.setAttribute('data-mode', 'preview');
        siblingBlock2.id = 'test-uid';
        workspaceLeafContent.appendChild(siblingBlock2);

        expect(processor['sourceSiblingBlock']).toBe(siblingBlock);
    });

    test('previewSiblingBlock returns preview sibling block', () => {
        const workspaceLeafContent = document.createElement('div');
        workspaceLeafContent.classList.add('workspace-leaf-content');
        workspaceLeafContent.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(mockEl);
        document.body.appendChild(workspaceLeafContent);

        const siblingBlock = document.createElement('div');
        siblingBlock.classList.add('singleton-block');
        siblingBlock.id = 'test-uid';
        siblingBlock.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(siblingBlock);

        const siblingBlock2 = document.createElement('div');
        siblingBlock2.classList.add('singleton-block');
        siblingBlock2.setAttribute('data-mode', 'preview');
        siblingBlock2.id = 'test-uid';
        workspaceLeafContent.appendChild(siblingBlock2);

        expect(processor['previewSiblingBlock']).toBe(siblingBlock2);
    });

    test('checkForSiblingBlocks returns true if sibling blocks exist', () => {
        const workspaceLeafContent = document.createElement('div');
        workspaceLeafContent.classList.add('workspace-leaf-content');
        workspaceLeafContent.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(mockEl);
        document.body.appendChild(workspaceLeafContent);

        const siblingBlock = document.createElement('div');
        siblingBlock.classList.add('markdown-source-view', 'singleton-block');
        siblingBlock.id = 'test-uid';
        siblingBlock.setAttribute('data-mode', 'source');
        workspaceLeafContent.appendChild(siblingBlock);

        const siblingBlock2 = document.createElement('div');
        siblingBlock2.classList.add('markdown-reading-view', 'singleton-block');
        siblingBlock2.setAttribute('data-mode', 'preview');
        siblingBlock2.id = 'test-uid';
        workspaceLeafContent.appendChild(siblingBlock2);

        expect(processor['checkForSiblingBlocks']()).toBe(true);
    });

    test('moveChilds moves children from source to target', () => {
        const source = document.createElement('div');
        const target = document.createElement('div');
        const child = document.createElement('div');
        const subChild0 = document.createElement('div');
        const subChild1 = document.createElement('div');
        child.appendChild(subChild0);
        child.appendChild(subChild1);
        source.appendChild(child);

        expect(processor['moveChilds'](source, target)).toBe(true);
        expect(target.children.length).toBe(1);
        expect(target.children[0].children.length).toBe(2);
        expect(source.children.length).toBe(0);
    });

    test('onUnloadCallback disconnects observer', () => {
        const disconnectSpy = jest.fn();

        processor['_observer'] = {
            disconnect: disconnectSpy,
        } as unknown as MutationObserver;

        processor['onUnloadCallback']();
        expect(disconnectSpy).toHaveBeenCalled();
    });
});
