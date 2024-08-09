import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import {
    ICSSStyleRuleComponent,
    ICSSStyleRuleComponent_,
} from './interfaces/ICSSStyleRuleComponent';
import { DIComponent } from '../../DIComponent/DIComponent';

/**
 * CSS Style Rule Component class.
 */
@Register('ICSSStyleRuleComponent_')
@ImplementsStatic<ICSSStyleRuleComponent_>()
export class CSSStyleRuleComponent
    extends DIComponent
    implements ICSSStyleRuleComponent
{
    @Inject(
        'ILogger_',
        (x: ILogger_) => x.getLogger('CSSStyleRuleComponent'),
        false,
    )
    protected readonly _logger?: ILogger;

    private _stylesheet?: CSSStyleSheet;
    private _rule?: CSSStyleRule;
    private _ruleIndex?: number;

    private readonly _selector?: string;
    private readonly _property?: string;

    /**
     * Get or create the CSS Style Rule.
     */
    onload(): void {
        if (!this._selector || !this._property) {
            this._logger?.error('Selector and property must be defined');

            return;
        }

        this._stylesheet = this.getOrCreateStylesheet();
        this._ruleIndex = this.getOrCreateRule(this._selector, this._property);

        this._rule =
            this._ruleIndex != null
                ? (this._stylesheet.cssRules[this._ruleIndex] as CSSStyleRule)
                : undefined;
    }

    /**
     * Delete the CSS Rule.
     */
    onunload(): void {
        if (this._ruleIndex != null)
            this._stylesheet?.deleteRule(this._ruleIndex);
    }

    /**
     * Creates a new instance of CSSStyleRuleComponent.
     * @param selector The CSS selector to target.
     * @param property The CSS property to manage.
     */
    constructor(selector: string, property: string) {
        super();
        this._selector = selector;
        this._property = property;
    }

    /**
     * Updates the CSS property with the given value.
     * @param value The new value for the CSS property.
     */
    public updateProperty(value: string): void {
        if (this._property == null) {
            this._logger?.error('Property must be defined');

            return;
        }

        this._rule?.style.setProperty(this._property, value, 'important');
    }

    /**
     * Finds or creates a new stylesheet to manage the CSS rule.
     * @returns The stylesheet to manage the CSS rule.
     */
    private getOrCreateStylesheet(): CSSStyleSheet {
        let stylesheet = Array.from(document.styleSheets).find(
            (sheet) => sheet instanceof CSSStyleSheet,
        ) as CSSStyleSheet;

        if (!stylesheet) {
            const styleElement = document.createElement('style');
            document.head.appendChild(styleElement);
            stylesheet = styleElement.sheet as CSSStyleSheet;
        }

        return stylesheet;
    }

    /**
     * Finds or creates a CSS rule with the given selector.
     * @param selector The CSS selector to target.
     * @param property The CSS property to initialize.
     * @returns The index of the CSS rule.
     */
    private getOrCreateRule(
        selector: string,
        property: string,
    ): number | undefined {
        if (!this._stylesheet) {
            this._logger?.error('Stylesheet must be defined');

            return undefined;
        }

        for (let i = 0; i < this._stylesheet.cssRules.length; i++) {
            const rule = this._stylesheet.cssRules[i];

            if (
                rule instanceof CSSStyleRule &&
                rule.selectorText === selector
            ) {
                return i;
            }
        }

        const ruleIndex = this._stylesheet.insertRule(
            `${selector} { ${property}: initial; }`,
            this._stylesheet.cssRules.length,
        );

        return ruleIndex;
    }
}
