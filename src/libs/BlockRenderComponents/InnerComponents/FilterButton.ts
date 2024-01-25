import { Component, setIcon } from 'obsidian';
import Lng from 'src/classes/Lng';
import Logging from 'src/classes/Logging';

/**
 * Max shown models input component class for `TableBlockRenderComponent`.
 *
 * This class provides methods to create and manage a filter button component with a symbol.
 * It includes functionality for toggling the filter button and handling click events.
 *
 * @see {@link create} for details about creating a filter button component.
 * @see {@link FilterCallback} for details about the filter callback.
 */
export default class FilterButton {
    /**
     * Creates a new filter button.
     * @param component The component to register the events to.
     * @param type The type of the filter button.
     * @param symbol The symbol of the filter button.
     * @param status The initial status of the filter button.
     * @param onFilter The callback to call when the filter button is clicked. Passes the type of the filter button and the status of the filter button.
     * @returns The created filter button as `DocumentFragment`.
     * @remarks - The filter button consists of a filter button container and a filter button.
     * - CSS classes:
     * - `filter-symbol` - The filter button.
     * - `filter-symbol-hide` - Additional class for the filter button to hide it.
     */
    public static create(
        component: Component,
        type: string,
        symbol: string,
        status: boolean,
        onFilter: FilterCallback,
    ): DocumentFragment {
        const headerItemContainer = document.createDocumentFragment();

        const filterButtonContainer = document.createElement('div');
        headerItemContainer.appendChild(filterButtonContainer);

        const filter = FilterButton.createFilterButton(
            status,
            type,
            symbol,
            component,
            onFilter,
        );
        filterButtonContainer.appendChild(filter);

        return headerItemContainer;
    }

    /**
     * Creates the filter button.
     * @param status The initial status of the filter button.
     * @param type The type of the filter button.
     * @param symbol The symbol of the filter button.
     * @param component The component to register the events to.
     * @param filterCallback The callback to call when the filter button is clicked. Passes the type of the filter button and the status of the filter button.
     * @returns The created filter button as `DocumentFragment`.
     * @remarks - The filter button is a `HTMLAnchorElement`.
     * - CSS classes:
     * - `filter-symbol` - The filter button.
     * - `filter-symbol-hide` - Additional class for the filter button to hide it.
     */
    private static createFilterButton(
        status: boolean,
        type: string,
        symbol: string,
        component: Component,
        filterCallback: FilterCallback,
    ): DocumentFragment {
        const logger = Logging.getLogger('FilterButton');
        const filterButtonContainer = document.createDocumentFragment();

        const filter = document.createElement('a');
        filterButtonContainer.appendChild(filter);
        filter.classList.add('filter-symbol');

        if (!status) {
            filter.classList.add('filter-symbol-hide');
        }
        filter.title = Lng.gt(type);
        filter.href = '#';
        setIcon(filter, symbol);

        component.registerDomEvent(
            filter,
            'click',
            async (event: MouseEvent) => {
                filter.classList.toggle('filter-symbol-hide');

                try {
                    await filterCallback(
                        type,
                        filter.classList.contains('filter-symbol-hide'),
                    );
                } catch (error) {
                    logger.error(
                        'The `onFilter` callback threw an error!',
                        error,
                    );
                }
            },
        );

        return filterButtonContainer;
    }
}

/**
 * The callback which is called when the filter button is clicked.
 * @param type The type of the filter button.
 * @param status The status of the filter button. `true` if the filter button is active, `false` if not.
 * @remarks - The callback is called when the filter button is clicked.
 */
type FilterCallback = (type: string, status: boolean) => Promise<void>;
