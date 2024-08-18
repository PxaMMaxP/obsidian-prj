import { Component } from 'obsidian';

export interface IDIComponentCore_ {
    new (): IDIComponentCore;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDIComponentCore extends IComponent {
    // Empty
}

/**
 * Private and reverse engineered interface of the component.
 */
export interface IComponent extends Component {
    /**
     * Tells whether the component is loaded.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _loaded?: boolean;

    /**
     * Registered child components.
     * @see {@link Component.addChild}
     * @see {@link Component.removeChild}
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _children?: unknown[];

    /**
     * Registered on unloading events.
     * @see {@link Component.register}
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _events?: unknown[];
}
