import { Component } from 'obsidian';

/**
 * Static interface for the CSS Style Rule Component.
 * @see {@link ICSSStyleRuleComponent}
 */
export interface ICSSStyleRuleComponent_ {
    /**
     * Creates a new instance of CSSStyleRuleComponent.
     * @param selector The CSS selector to target.
     * @param property The CSS property to manage.
     */
    new (selector: string, property: string): ICSSStyleRuleComponent;
}

/**
 * Interface for the CSS Style Rule Component.
 */
export interface ICSSStyleRuleComponent extends Component {
    /**
     * Get or create the CSS Style Rule.
     */
    onload(): void;

    /**
     * Delete the CSS Rule.
     */
    onunload(): void;

    /**
     * Updates the CSS property with the given value.
     * @param value The new value for the CSS property.
     */
    updateProperty(value: string): void;
}
