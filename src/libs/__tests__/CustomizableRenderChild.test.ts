/**
 * @jest-environment jsdom
 */

jest.mock('obsidian');

import { MarkdownRenderChild } from 'obsidian'; // Dies wird das Mock-Modul verwenden
import MockLogger from 'src/__mocks__/ILogger.mock';
import { ILogger } from 'src/interfaces/ILogger';
import CustomizableRenderChild from '../CustomizableRenderChild/CustomizableRenderChild';

describe('CustomizableRenderChild', () => {
    let container: HTMLElement;
    const logger: ILogger = MockLogger;
    let onLoad: jest.Mock;
    let onUnload: jest.Mock;

    beforeEach(() => {
        container = document.createElement('div');
        onLoad = jest.fn();
        onUnload = jest.fn();
    });

    test('should initialize correctly with all parameters', () => {
        const child = new CustomizableRenderChild(
            container,
            onLoad,
            onUnload,
            logger,
        );
        expect(child).toBeInstanceOf(CustomizableRenderChild);
    });

    test('should initialize correctly without optional parameters', () => {
        const child = new CustomizableRenderChild(
            container,
            undefined,
            undefined,
        );
        expect(child).toBeInstanceOf(CustomizableRenderChild);
    });

    test('should call custom onLoad function and log message', () => {
        const child = new CustomizableRenderChild(
            container,
            onLoad,
            undefined,
            logger,
        );

        // Hier überschreiben wir die Methoden des Mock-Objekts
        const onloadSpy = jest.spyOn(MarkdownRenderChild.prototype, 'onload');
        child.onload();
        expect(logger.trace).toHaveBeenCalledWith('On Load');
        expect(onLoad).toHaveBeenCalled();
        expect(onloadSpy).toHaveBeenCalled();
    });

    test('should call custom onUnload function and log message', () => {
        const child = new CustomizableRenderChild(
            container,
            undefined,
            onUnload,
            logger,
        );

        // Hier überschreiben wir die Methoden des Mock-Objekts
        const onunloadSpy = jest.spyOn(
            MarkdownRenderChild.prototype,
            'onunload',
        );
        child.onunload();
        expect(logger.trace).toHaveBeenCalledWith('On Unload');
        expect(onUnload).toHaveBeenCalled();
        expect(onunloadSpy).toHaveBeenCalled();
    });

    test('should call base onLoad function if custom onLoad is not defined', () => {
        const child = new CustomizableRenderChild(
            container,
            undefined,
            undefined,
            logger,
        );

        const onloadSpy = jest.spyOn(MarkdownRenderChild.prototype, 'onload');
        child.onload();
        expect(onloadSpy).toHaveBeenCalled();
    });

    test('should call base onUnload function if custom onUnload is not defined', () => {
        const child = new CustomizableRenderChild(
            container,
            undefined,
            undefined,
            logger,
        );

        const onunloadSpy = jest.spyOn(
            MarkdownRenderChild.prototype,
            'onunload',
        );
        child.onunload();
        expect(onunloadSpy).toHaveBeenCalled();
    });

    test('should initialize correctly without logger', () => {
        const child = new CustomizableRenderChild(container, onLoad, onUnload);
        expect(child).toBeInstanceOf(CustomizableRenderChild);
    });

    test('should call custom onLoad and unUnload function correctly without logger', () => {
        const child = new CustomizableRenderChild(container, onLoad, onUnload);

        const onloadSpy = jest.spyOn(MarkdownRenderChild.prototype, 'onload');

        const onunloadSpy = jest.spyOn(
            MarkdownRenderChild.prototype,
            'onunload',
        );
        child.onload();
        child.onunload();
        expect(onLoad).toHaveBeenCalled();
        expect(onUnload).toHaveBeenCalled();
        expect(onloadSpy).toHaveBeenCalled();
        expect(onunloadSpy).toHaveBeenCalled();
    });
});
