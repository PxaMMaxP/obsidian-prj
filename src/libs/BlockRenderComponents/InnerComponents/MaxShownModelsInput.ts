import { Component, setIcon } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';

/**
 * Max shown models input component class for `TableBlockRenderComponent`.
 *
 * This class provides methods to create and manage a max shown models input component.
 * It includes functionality for setting up the max shown models input and handling input events.
 *
 * @see {@link create} for details about creating a max shown models input component.
 * @see {@link MaxShownModelsCallback} for details about the max shown models callback.
 */
export default class MaxShownModelsInput {
    /**
     * Creates a new max shown models input component.
     * @param component The component to register the events to.
     * @param defaultValue The default value of the max shown models number.
     * @param batchSize The batch size to add or subtract.
     * @param onChange The callback to call when the max shown models number changes. Passes the max shown models number. You can return a new max shown models number.
     * @returns The created max shown models input component as `DocumentFragment`.
     * @remarks - The max shown models input component consists of a container, a minus symbol, a presentation span and a plus symbol.
     * - CSS classes:
     * - `filter-max-models` - The container of the max shown models input component.
     * - `filter-max-number` - The presentation span of the max shown models input component.
     * - `minus-batch-button` - The minus symbol of the max shown models input component.
     * - `plus-batch-button` - The plus symbol of the max shown models input component.
     */
    public static create(
        component: Component,
        defaultValue: number,
        batchSize: number,
        onChange: MaxShownModelsCallback,
    ): DocumentFragment {
        const headerItemContainer = document.createDocumentFragment();
        const logger = Global.getInstance().logger;
        let debounceTimer: NodeJS.Timeout;

        const maxShownModels: MaxShownModelNumber = {
            maxShownModels:
                !isNaN(parseFloat(defaultValue as unknown as string)) &&
                isFinite(defaultValue)
                    ? Number(defaultValue)
                    : 0,
        };

        const filterMaxModelsContainer = document.createElement('div');
        headerItemContainer.appendChild(filterMaxModelsContainer);
        filterMaxModelsContainer.classList.add('filter-max-models');

        const number = this.createNumberPresentation(
            maxShownModels,
            component,
            batchSize,
        );

        const debounceOnChange = () => {
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(async () => {
                try {
                    maxShownModels.maxShownModels =
                        (await onChange(maxShownModels.maxShownModels)) ??
                        maxShownModels.maxShownModels;
                } catch (error) {
                    logger.error(
                        'The `onChange` callback threw an error!',
                        error,
                    );
                } finally {
                    number.number.textContent =
                        maxShownModels.maxShownModels.toString();
                }
            }, 500);
        };

        MaxShownModelsInput.createNumberPresentationEvent(
            component,
            number.number,
            maxShownModels,
            batchSize,
            debounceOnChange,
        );

        const minus = this.createSymbol(
            'minus',
            number.number,
            component,
            maxShownModels,
            batchSize,
            debounceOnChange,
        );

        const plus = this.createSymbol(
            'plus',
            number.number,
            component,
            maxShownModels,
            batchSize,
            debounceOnChange,
        );

        filterMaxModelsContainer.appendChild(minus);
        filterMaxModelsContainer.appendChild(number.container);
        filterMaxModelsContainer.appendChild(plus);

        return headerItemContainer;
    }

    /**
     * Create the presentation span for the max shown models number.
     * @param maxShownModels The container for the max shown models number.
     * @returns - The created presentation span as `DocumentFragment`
     * - The created presentation span as `HTMLSpanElement`
     * - The span element has the class `filter-max-number`.
     */
    private static createNumberPresentation(
        maxShownModels: MaxShownModelNumber,
        component: Component,
        batchSize: number,
    ): { container: DocumentFragment; number: HTMLSpanElement } {
        const filterMaxModelsContainer = document.createDocumentFragment();

        const maxShownNumber = document.createElement('span');
        filterMaxModelsContainer.appendChild(maxShownNumber);
        maxShownNumber.classList.add('filter-max-number');
        maxShownNumber.title = Lng.gt('MaxShownEntrys');
        maxShownNumber.textContent = maxShownModels.maxShownModels.toString();

        return { container: filterMaxModelsContainer, number: maxShownNumber };
    }

    /**
     * Creates the mouse wheel events for the max shown models number presentation span.
     * @param component The component to register the events to.
     * @param maxShownNumber The presentation span of the max shown models number.
     * @param maxShownModels The container for the max shown models number.
     * @param batchSize The batch size to add or subtract.
     * @param onMaxShownModelsChange The callback to call when the max shown models number changes.
     */
    private static createNumberPresentationEvent(
        component: Component,
        maxShownNumber: HTMLSpanElement,
        maxShownModels: MaxShownModelNumber,
        batchSize: number,
        onMaxShownModelsChange: () => void,
    ) {
        component.registerDomEvent(
            maxShownNumber,
            'wheel',
            async (event: WheelEvent) => {
                event.preventDefault();

                if (event.deltaY > 0) {
                    this.changeValue(
                        'minus',
                        maxShownModels,
                        batchSize,
                        maxShownNumber,
                        onMaxShownModelsChange,
                    );
                } else {
                    this.changeValue(
                        'plus',
                        maxShownModels,
                        batchSize,
                        maxShownNumber,
                        onMaxShownModelsChange,
                    );
                }
            },
            { passive: false },
        );
    }

    /**
     * Creates a symbol for the max shown models number.
     * @param type The type of the symbol. Can be `plus` or `minus`.
     * @param maxShownNumber The presentation span of the max shown models number.
     * @param component The component to register the events to.
     * @param maxShownModels The container for the max shown models number.
     * @param batchSize The batch size to add or subtract.
     * @param onMaxShownModelsChange The callback to call when the max shown models number changes.
     * @returns The created symbol as `DocumentFragment`.
     * @remarks - The symbol is a `HTMLAnchorElement`.
     * - The symbol has the class `plus-batch-button` or `minus-batch-button`.
     */
    private static createSymbol(
        type: 'plus' | 'minus',
        maxShownNumber: HTMLSpanElement,
        component: Component,
        maxShownModels: MaxShownModelNumber,
        batchSize: number,
        onMaxShownModelsChange: () => void,
    ): DocumentFragment {
        const filterMaxModelsContainer = document.createDocumentFragment();

        const maxShownDocMinus = document.createElement('a');
        filterMaxModelsContainer.appendChild(maxShownDocMinus);
        maxShownDocMinus.classList.add(`${type}-batch-button`);
        maxShownDocMinus.title = type;
        maxShownDocMinus.href = '#';
        setIcon(maxShownDocMinus, type);

        component.registerDomEvent(
            maxShownDocMinus,
            'click',
            async (event: MouseEvent) => {
                this.changeValue(
                    type,
                    maxShownModels,
                    batchSize,
                    maxShownNumber,
                    onMaxShownModelsChange,
                );
            },
        );

        return filterMaxModelsContainer;
    }

    /**
     * Changes the max shown models number.
     * @param type The type of the symbol. Can be `plus` or `minus`.
     * @param maxShownModels The container for the max shown models number.
     * @param batchSize The batch size to add or subtract.
     * @param maxShownNumber The presentation span of the max shown models number.
     * @param onMaxShownModelsChange The callback to call when the max shown models number changes.
     */
    private static changeValue(
        type: string,
        maxShownModels: MaxShownModelNumber,
        batchSize: number,
        maxShownNumber: HTMLSpanElement,
        onMaxShownModelsChange: () => void,
    ) {
        if (type === 'minus') {
            if (maxShownModels.maxShownModels >= batchSize) {
                // Subtracts either the remainder (to arrive at the next multiple of `batchSize`) or `batchSize` itself
                maxShownModels.maxShownModels -=
                    maxShownModels.maxShownModels % batchSize || batchSize;
            } else {
                maxShownModels.maxShownModels = 0;
            }
        } else {
            // Adds either the remainder (to arrive at the next multiple of `batchSize`) or `batchSize` itself
            maxShownModels.maxShownModels +=
                batchSize - (maxShownModels.maxShownModels % batchSize);
        }
        maxShownNumber.textContent = maxShownModels.maxShownModels.toString();
        onMaxShownModelsChange();
    }
}

/**
 * The callback for a change of the max shown models number.
 * @param value The current max shown models number.
 * @returns - The new max shown models number.
 * - If you return `undefined` the max shown models number is not changed.
 * @remarks The callback is called when the max shown models number is changed.
 */
type MaxShownModelsCallback = (value: number) => Promise<number | undefined>;

/**
 * A container for the max shown models number.
 * @param maxShownModels The max shown models number.
 * @remarks The container is used to pass the max shown models number by reference.
 */
type MaxShownModelNumber = { maxShownModels: number };
