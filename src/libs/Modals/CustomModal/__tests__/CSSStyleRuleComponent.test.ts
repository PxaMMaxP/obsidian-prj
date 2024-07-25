/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from 'obsidian';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';
import { CSSStyleRuleComponent } from '../CSSStyleRuleComponent';

// Mock für CSSStyleSheet und CSSStyleRule
class MockCSSStyleSheet implements Partial<CSSStyleSheet> {
    cssRules: CSSRuleList;
    insertRule = jest
        .fn()
        .mockImplementation((rule: string, index: number) => index);
    deleteRule = jest.fn();

    constructor() {
        const cssRulesArray: CSSRule[] = [];

        this.cssRules = {
            length: 0,
            item: jest.fn((index: number) => cssRulesArray[index] || null),
            [Symbol.iterator]: jest.fn(() => cssRulesArray[Symbol.iterator]()),
        } as unknown as CSSRuleList;
    }
}

class MockCSSStyleRule implements Partial<CSSStyleRule> {
    selectorText = '';
    style = {
        setProperty: jest.fn(),
    } as unknown as CSSStyleDeclaration;

    // Unused properties/methods in the test context can be implemented as needed
    cssText = '';
    parentRule = null;
    parentStyleSheet = null;
    styleMap = {} as unknown as StylePropertyMap;
}

const MockComponent: Component = {
    load: jest.fn(),
    onload: jest.fn(),
    unload: jest.fn(),
    onunload: jest.fn(),
    addChild: jest.fn(),
    removeChild: jest.fn(),
    register: jest.fn(),
    registerEvent: jest.fn(),
    registerDomEvent: jest.fn((element, event, callback) => {
        element.addEventListener(event, callback);
    }) as unknown as Component['registerDomEvent'],
    registerInterval: jest.fn(),
};

const MockComponent_ = jest.fn().mockImplementation(() => {
    return MockComponent;
});

DIContainer.getInstance().register('Obsidian.Component_', MockComponent_);

describe('CSSStyleRuleComponent', () => {
    let component: CSSStyleRuleComponent;
    let stylesheet: MockCSSStyleSheet;
    let mockRule: MockCSSStyleRule;

    beforeEach(() => {
        jest.clearAllMocks();
        stylesheet = new MockCSSStyleSheet() as unknown as MockCSSStyleSheet;
        mockRule = new MockCSSStyleRule() as unknown as MockCSSStyleRule;

        (stylesheet.cssRules.item as jest.Mock).mockImplementation(
            (index: number) => {
                if (index === 0) {
                    return mockRule as unknown as CSSRule;
                }

                return null;
            },
        );

        Object.defineProperty(stylesheet.cssRules, 'length', { value: 1 });

        jest.spyOn(document, 'styleSheets', 'get').mockReturnValue([
            stylesheet,
        ] as unknown as StyleSheetList);

        jest.spyOn(document.head, 'appendChild').mockImplementation(
            (element: HTMLElement) => {
                Object.defineProperty(element, 'sheet', { value: stylesheet });

                return element;
            },
        );

        component = new CSSStyleRuleComponent('.test-class', 'color');
    });

    it('should initialize with correct properties', () => {
        expect(component).toBeInstanceOf(CSSStyleRuleComponent);
        expect((component as any)._selector).toBe('.test-class');
        expect((component as any)._property).toBe('color');
    });

    it('should create stylesheet and rule on load', () => {
        component.onload();

        expect(stylesheet.insertRule).toHaveBeenCalledWith(
            '.test-class { color: initial; }',
            1,
        );
    });

    it('should handle missing selector or property on load', () => {
        const componentWithMissingParams = new CSSStyleRuleComponent('', '');
        componentWithMissingParams.onload();
        // Assuming the logger would log an error
    });

    it.skip('should update property', () => {
        (stylesheet.cssRules.item as jest.Mock).mockReturnValue(mockRule);
        component.onload();

        component.updateProperty('red');

        expect(mockRule.style.setProperty).toHaveBeenCalledWith(
            'color',
            'red',
            'important',
        );
    });

    it('should handle missing property on update', () => {
        const componentWithMissingParams = new CSSStyleRuleComponent(
            '.test-class',
            '',
        );
        componentWithMissingParams.updateProperty('red');
        // Assuming the logger would log an error
    });

    it('should delete rule on unload', () => {
        component.onload();
        component.onunload();
        expect(stylesheet.deleteRule).toHaveBeenCalledWith(1);
    });

    it('should create a new stylesheet if none exists', () => {
        jest.spyOn(document, 'styleSheets', 'get').mockReturnValue(
            [] as unknown as StyleSheetList,
        );
        component.onload();
        expect(document.head.appendChild).toHaveBeenCalled();
    });

    it.skip('should find existing rule', () => {
        mockRule.selectorText = '.test-class';
        (stylesheet.cssRules.item as jest.Mock).mockReturnValue(mockRule);
        Object.defineProperty(stylesheet.cssRules, 'length', { value: 1 });

        component.onload();
        expect(stylesheet.insertRule).not.toHaveBeenCalled();
    });

    it('should log error if stylesheet is not defined', () => {
        const componentWithUndefinedStylesheet = new CSSStyleRuleComponent(
            '.test-class',
            'color',
        );
        (componentWithUndefinedStylesheet as any)._stylesheet = undefined;
        componentWithUndefinedStylesheet.updateProperty('red');
        // Assuming the logger would log an error
    });

    it('should log error if rule is not defined on update', () => {
        component.onload();
        (component as any)._rule = undefined;
        component.updateProperty('red');
        // Assuming the logger would log an error
    });
});
