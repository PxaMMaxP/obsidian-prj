/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */

import MockLogger, {
    registerEmptyMockLogger,
    registerMockLogger,
    resetMockLogger,
} from 'src/__mocks__/ILogger.mock';
import { _componentInstance } from 'src/libs/DIComponent/types/IDIComponentSymbols';
import {
    registerMockComponent,
    resetMockComponent,
} from 'src/libs/Modals/Modal/__mocks__/Component.mock';
import { Flow } from '../Flow';
import { IFlowConfig } from '../types/IFlowDelegates';

describe('FLOW = Fluent HTML API', () => {
    let flow: Flow<keyof HTMLElementTagNameMap>;

    beforeEach(() => {
        registerMockLogger();
        registerMockComponent();
    });

    afterEach(() => {
        resetMockLogger();
        resetMockComponent();
    });

    test('should create a new instance', () => {
        flow = new Flow('div', (flow) => {
            flow.setId('test');
        });

        expect(flow).toBeDefined();

        const el = flow.build();

        expect(el).toBeDefined();
        expect(el.tagName).toBe('DIV');
        expect(el.id).toBe('test');
    });

    test('should set innerHTML', () => {
        flow = new Flow('div', (flow) => {
            flow.setInnerHTML('<p>Test</p>');
        });

        const el = flow.build();

        expect(el.innerHTML).toBe('<p>Test</p>');
    });

    test('should set text content', () => {
        flow = new Flow('div', (flow) => {
            flow.setTextContent('Test Content');
        });

        const el = flow.build();

        expect(el.textContent).toBe('Test Content');
    });

    test('should set and add classes', () => {
        flow = new Flow('div', (flow) => {
            flow.setClass('test-class');
        });

        const el = flow.build();

        expect(el.className).toBe('test-class');

        flow.addClass('additional-class');
        expect(el.classList.contains('additional-class')).toBe(true);

        flow.addClass(['another-class', 'yet-another-class']);
        expect(el.classList.contains('another-class')).toBe(true);
        expect(el.classList.contains('yet-another-class')).toBe(true);
    });

    test('should remove classes', () => {
        flow = new Flow('div', (flow) => {
            flow.setClass('test-class additional-class');
        });

        const el = flow.build();

        flow.removeClass('additional-class');
        expect(el.classList.contains('additional-class')).toBe(false);

        flow.removeClass(['test-class', 'non-existent-class']);
        expect(el.classList.contains('test-class')).toBe(false);
    });

    test('should set styles', () => {
        flow = new Flow('div', (flow) => {
            flow.setStyles({
                color: 'red',
                fontSize: '16px',
            });
        });

        const el = flow.build();

        expect(el.style.color).toBe('red');
        expect(el.style.fontSize).toBe('16px');
    });

    test('should set and remove attributes', () => {
        flow = new Flow('div', (flow) => {
            flow.setAttribute('data-test', 'value');
        });

        const el = flow.build();

        expect(el.getAttribute('data-test')).toBe('value');

        flow.setAttribute({ 'data-another-test': 'another-value' });
        expect(el.getAttribute('data-another-test')).toBe('another-value');

        flow.removeAttribute('data-test');
        expect(el.getAttribute('data-test')).toBeNull();
    });

    test('should append and remove child elements', () => {
        flow = new Flow('div', (flow) => {
            flow.appendChildEl('span', (childFlow) => {
                childFlow.setTextContent('Child');
            });
        });

        const el = flow.build();
        const child = el.querySelector('span');

        expect(child).toBeDefined();
        expect(child?.textContent).toBe('Child');

        flow.removeChildEl(child!);
        expect(el.querySelector('span')).toBeNull();
    });

    test('should find an remove a child element', () => {
        flow = new Flow('div', (flow) => {
            flow.appendChildEl('span', (childFlow) => {
                childFlow.setTextContent('Child').setId('child');
            }).removeChildEl((f) => {
                const el = f.element;
                const childEl = el.querySelector('#child') as HTMLElement;

                return childEl;
            });
        });

        const el = flow.build();
        const child = el.querySelector('#child');

        expect(child).toBeNull();
    });

    test('should log an error if removing child throws', () => {
        flow = new Flow('div', (flow) => {
            flow.appendChildEl('span', (childFlow) => {
                childFlow.setTextContent('Child').setId('child');
                throw new Error('Test Error');
            }).removeChildEl((f) => {
                const el = f.element;
                const childEl = el.querySelector('#child') as HTMLElement;

                return childEl;
            });
        });

        const el = flow.build();
        const child = el.querySelector('#child');

        expect(child).toBeNull();

        expect(MockLogger.error).toHaveBeenCalled();
    });

    test('should append to another element', () => {
        const parent = document.createElement('div');

        flow = new Flow('span', (flow) => {
            flow.setTextContent('Child').appendToEl(parent);
        });

        flow.load();

        const child = parent.querySelector('span');

        expect(child).toBeDefined();
        expect(child?.textContent).toBe('Child');
    });

    test('should append a child element', () => {
        const childEl = new Flow('span', (flow) => {
            flow.setTextContent('Child');
        }).build();

        flow = new Flow('div', (flow) => {
            flow.appendChildEl(childEl);
        });

        const el = flow.build();
        const child = el.querySelector('span');

        expect(child).toBeDefined();
        expect(child?.textContent).toBe('Child');
    });

    test('should add event listeners', () => {
        flow = new Flow('button', (flow) => {
            flow.setTextContent('Click me');
        });

        const el = flow.build();
        const mockCallback = jest.fn();

        flow.addEventListener('click', mockCallback);

        el.click();
        expect(mockCallback).toHaveBeenCalled();
    });

    test('should use `then` method correctly', () => {
        flow = new Flow('div', (flow) => {
            flow.then((f) => (f.element.id = 'test'));
        });

        const el = flow.build();

        expect(el.id).toBe('test');
    });

    test('should log error in configuration', () => {
        flow = new Flow('div', (flow) => {
            throw new Error('Test Error');
        });

        flow.load();

        expect(MockLogger.error).toHaveBeenCalled();
    });

    test('should not log error in configuration without logger', () => {
        registerEmptyMockLogger();

        flow = new Flow('div', (flow) => {
            throw new Error('Test Error');
        });

        flow.load();

        expect(MockLogger.error).not.toHaveBeenCalled();
    });

    test('should recognize a tagged element as loaded', () => {
        const _Flow = Flow as unknown as Flow<keyof HTMLElementTagNameMap> & {
            injectedCfg(
                cfg: IFlowConfig<keyof HTMLElementTagNameMap>,
                injectCfg: IFlowConfig<keyof HTMLElementTagNameMap>,
            ): IFlowConfig<keyof HTMLElementTagNameMap>;
        };
        const injectedCfgSpy = jest.spyOn(_Flow, 'injectedCfg');

        const taggedEl = new Flow('div', (flow) => {}).build();

        const _flowInstance = new Flow(taggedEl, (flow) => {});

        expect(injectedCfgSpy).not.toHaveBeenCalled();

        // expect(MockLogger.warn).toHaveBeenCalledWith(
        //     'The configuration cannot be changed after the element is loaded.',
        // );

        injectedCfgSpy.mockRestore();
    });

    test('should warn if the element is loaded on set config', () => {
        const taggedObj = new Flow('div', (flow) => {});
        taggedObj.build();

        taggedObj.config = (flow) => {};

        expect(MockLogger.warn).toHaveBeenCalledWith(
            'The configuration cannot be changed after the element is loaded.',
        );
    });

    test('should warn if the element is loaded on set config', () => {
        const taggedObj = new Flow(
            'div',
            undefined as unknown as IFlowConfig<keyof HTMLElementTagNameMap>,
        );

        const cfg = (flow: unknown) => {};

        expect(taggedObj.config).toBeUndefined();
        taggedObj.config = cfg;
        expect(taggedObj.config).toBe(cfg);
    });

    test('should recognize a tagged element as not loaded and inject config', () => {
        const _Flow = Flow as unknown as Flow<keyof HTMLElementTagNameMap> & {
            injectedCfg(
                cfg: IFlowConfig<keyof HTMLElementTagNameMap>,
                injectCfg: IFlowConfig<keyof HTMLElementTagNameMap>,
            ): IFlowConfig<keyof HTMLElementTagNameMap>;
        };
        const injectedCfgSpy = jest.spyOn(_Flow, 'injectedCfg');

        const taggedObj = new Flow('div', (flow) => {});
        const taggedEl = taggedObj.build();
        taggedObj[_componentInstance]._loaded = false;

        const _flowInstance = new Flow(taggedEl, (flow) => {});

        expect(injectedCfgSpy).toHaveBeenCalled();

        injectedCfgSpy.mockRestore();
    });
});
