import { ILogger } from 'src/interfaces/ILogger';
import { HelperGeneral } from './Helper/General';

/**
 * Represents a HTML table.
 */
export default class Table {
    /**
     * The data of the table.
     */
    public get data(): StructedTable {
        return this._table;
    }
    private _logger: ILogger | undefined;
    private _table: StructedTable;
    /**
     * A list of row placeholders
     * @remarks - The row placeholders are used to keep the order of the rows when hiding and showing rows.
     * - The placeholders rows are empty and have the id `defaultIds.placeholder` (default: `placeholder-row`).
     */
    private _rowPlaceholders: RowPlaceholder[] = [];
    private _headers: TableHeader[];
    private _tableId: string;
    private _tableClassList: string[] | undefined;
    private _visibleRows = 0;
    private _hiddenRows = 0;
    //   Default classes  //
    private _defaultClasses = {
        table: ['prj-table'],
        header: ['prj-table-header'],
        headerRow: ['prj-table-header-row'],
        headerCell: ['prj-table-header-cell'],
        body: ['prj-table-body'],
        row: ['prj-table-row', 'prj-table-row-hover'],
        cell: ['prj-table-cell'],
        emojiCell: ['emoji-cell'],

        hiddenRow: 'hidden-row',
        evenRow: 'even-row',
        oddRow: 'odd-row',
    };
    // Default IDs
    private _defaultIds = {
        placeholder: 'placeholder-row',
    };
    // // //// // //// // //

    /**
     * Creates a new table
     * @param tableHeaders A list of table headers
     * @param id The ID of the table
     * @param classList The class list of the table
     * @param logger The logger to use
     */
    constructor(
        tableHeaders: TableHeader[],
        id: string,
        classList: string[] | undefined,
        logger?: ILogger,
    ) {
        this._headers = tableHeaders;
        this._tableId = id;
        this._tableClassList = classList;
        this._table = this.createTable();
        this._logger = logger;
    }

    /**
     * Delte the complete table
     */
    public deconstructor(): void {
        this._table.table.remove();
    }

    /**
     * Creates a structured table element with headers and body.
     * @returns The structured table object containing the table, header, header row, header cells, body, and rows.
     */
    private createTable(): StructedTable {
        const table = document.createElement('table');
        table.id = this._tableId;
        table.classList.add(...this._defaultClasses.table);

        if (this._tableClassList) {
            this._tableClassList.forEach((classItem) => {
                table.classList.add(classItem);
            });
        }

        const tableHeader = table.createTHead();
        tableHeader.classList.add(...this._defaultClasses.header);
        const tableHeaderRow = tableHeader.insertRow();
        tableHeaderRow.classList.add(...this._defaultClasses.headerRow);

        const tableHeaderCells: HTMLTableCellElement[] = [];

        this._headers.forEach((header) => {
            const tableHeaderCell = document.createElement('th');
            tableHeaderCell.classList.add(...this._defaultClasses.headerCell);
            tableHeaderCell.id = this.makeSafeForId(header.text);
            tableHeaderCell.textContent = header.text;

            if (header.headerClass) {
                header.headerClass.forEach((classItem) => {
                    tableHeaderCell.classList.add(classItem);
                });
            }
            tableHeaderCells.push(tableHeaderCell);
            tableHeaderRow.appendChild(tableHeaderCell);
        });
        const tableBody = table.createTBody();
        tableBody.classList.add(...this._defaultClasses.body);

        const structedTable = {
            table: table,
            header: tableHeader,
            headerRow: tableHeaderRow,
            headerCells: tableHeaderCells,
            body: tableBody,
            rows: [],
        };

        return structedTable;
    }

    /**
     * Adds a row to the table
     * @param row The row to add. See {@link Row} for more information.
     */
    public addRow(row: Row): void {
        this._addRow(row.rowUid, row.rowData, row.rowClassList, row.hidden);
    }

    /**
     * Adds multiple rows to the table
     * @param rows The rows to add
     * @param rows.rowUid The UID of the new row
     * @param rows.rowData The data of the new row
     * @param rows.rowClassList The class list of the new row
     * @param rows.hidden Whether the new row should be hidden
     * @remarks - The rows are added in the order of the array.
     * - The rows are added to the internal array.
     * - If the row is hidden, the row content is replaced with a placeholder.
     */
    public addRows(rows: Row[]): void {
        const collectedRows = document.createDocumentFragment();

        rows.forEach((row) => {
            const rowFragment = this.createRow(
                row.rowUid,
                row.rowData,
                row.rowClassList,
                row.hidden,
            );

            if (rowFragment) {
                this._table.rows.push(rowFragment);

                if (row.hidden) {
                    collectedRows.append(this._getPlaceholder(row.rowUid));
                } else {
                    collectedRows.append(rowFragment);
                }
            }
        });
        this._table.body.append(collectedRows);
    }

    /**
     * Adds a row to the table
     * @param rowUid The UID of the new row
     * @param rowData The data of the new row as an array of DocumentFragments. Each DocumentFragment represents a cell.
     * @param rowClassList The class list of the new row
     * @param hidden Whether the new row should be hidden
     * @remarks - The row is added to the internal array.
     * - If the row is hidden, the row content is replaced with a placeholder.
     */
    private _addRow(
        rowUid: string,
        rowData: DocumentFragment[],
        rowClassList: string[] | undefined,
        hidden: boolean,
    ): void {
        const tableRow = this.createRow(rowUid, rowData, rowClassList, hidden);
        this._table.rows.push(tableRow);

        if (hidden) {
            this._table.body.append(this._getPlaceholder(rowUid));
        } else {
            this._table.body.append(tableRow);
        }
    }

    /**
     * Creates a row
     * @param rowUid The UID of the row
     * @param rowData The data of the row as an array of DocumentFragments. Each DocumentFragment represents a cell.
     * @param rowClassList The class list of the row
     * @param hidden Whether the row should be hidden.
     * @remarks **If true, the row is hidden and the row content is later replaced with a placeholder.**
     * @returns The created row as an HTMLTableRowElement
     */
    private createRow(
        rowUid: string,
        rowData: DocumentFragment[],
        rowClassList: string[] | undefined,
        hidden: boolean,
    ): HTMLTableRowElement {
        const tableRow = document.createElement('tr');

        tableRow.classList.add(...this._defaultClasses.row);
        tableRow.setAttribute('row-uid', rowUid);

        if (rowClassList) {
            rowClassList.forEach((classItem) => {
                tableRow.classList.add(classItem);
            });
        }

        if (hidden) {
            tableRow.classList.add(this._defaultClasses.hiddenRow);
            this._hiddenRows++;
        } else {
            this.setRowOddOrEven(tableRow);
            this._visibleRows++;
        }

        rowData.forEach((data, index) => {
            const tableCell = tableRow.insertCell();
            tableCell.classList.add(...this._defaultClasses.cell);

            if (
                this._headers[index] !== undefined &&
                this._headers[index].columnClass
            ) {
                this._headers[index].columnClass?.forEach((classItem) => {
                    tableCell.classList.add(classItem);
                });
            }
            // Add Label attribute to the cell
            tableCell.setAttribute('data-label', this._headers[index].text);

            if (HelperGeneral.isEmoji(this._headers[index].text)) {
                tableCell.classList.add(...this._defaultClasses.emojiCell);
            }
            tableCell.appendChild(data);
        });

        return tableRow;
    }

    /**
     * Sets the row to odd or even
     * @param tableRow The row to set
     * @remarks - The row is set to odd or even based on the last visible row.
     * - If no visible row exists, the row is set to even.
     * @remarks It does not search for the last visible line in the HTML table itself, but in an internal array.
     */
    private setRowOddOrEven(tableRow: HTMLTableRowElement) {
        let lastVisibleRow;

        for (let i = this._table.rows.length - 1; i >= 0; i--) {
            if (
                !this._table.rows[i].classList.contains(
                    this._defaultClasses.hiddenRow,
                )
            ) {
                lastVisibleRow = this._table.rows[i];
                break;
            }
        }

        if (lastVisibleRow) {
            tableRow.classList.add(
                lastVisibleRow.classList.contains(this._defaultClasses.evenRow)
                    ? this._defaultClasses.oddRow
                    : this._defaultClasses.evenRow,
            );
        } else {
            tableRow.classList.add(this._defaultClasses.evenRow);
        }
    }

    /**
     * Returns the number of visible and hidden rows
     * @returns The number of visible and hidden rows
     * - `visibleRows` The number of visible rows
     * - `hiddenRows` The number of hidden rows
     */
    public getRowStats(): { visibleRows: number; hiddenRows: number } {
        return { visibleRows: this._visibleRows, hiddenRows: this._hiddenRows };
    }

    /**
     * Deletes the row with the given UID
     * @param rowUid The UID of the row
     * @remarks - The row is deleted from the table body and the internal array.
     * - If a placeholder exists, it is also deleted from the table body and the internal array.
     */
    public deleteRow(rowUid: string): void {
        const rowToDelete = this.getRow(rowUid);

        const rowVisible =
            rowToDelete &&
            !rowToDelete.classList.contains(this._defaultClasses.hiddenRow);

        if (rowVisible) {
            if (rowToDelete) {
                try {
                    this._table.body.removeChild(rowToDelete);
                } catch (error) {
                    this._logger?.warn(
                        'Row not active in the table. Error:',
                        error,
                    );
                }

                this._table.rows = this._table.rows.filter(
                    (row) => row.getAttribute('row-uid') !== rowUid,
                );
                this._removePlaceholder(rowUid);
            }
            this._visibleRows--;
            this.refreshRowEvenOddClass();
        } else {
            const placeholder = this._removePlaceholder(rowUid);

            if (placeholder) {
                try {
                    this._table.body.removeChild(placeholder);
                } catch (error) {
                    this._logger?.warn(
                        'Placeholder row not active in the table. Error:',
                        error,
                    );
                }
            }
            this._hiddenRows--;
        }
    }

    /**
     * Set a row to hidden
     * @param rowUid The UID of the row
     * @remarks - The row is set to hidden and the row content is replaced with a placeholder.
     * - Only if the state has changed, the calculation of the odd and even rows is updated.
     */
    public hideRow(rowUid: string): void {
        const changes = this._hideRow(rowUid);

        if (changes) this.refreshRowEvenOddClass();
    }

    /**
     * Set a row to hidden, replaces the row content with a placeholder and updates the row stats
     * @param rowUid The UID of the row
     * @returns Whether the state has changed. Returns `false` if the row is already hidden.
     */
    private _hideRow(rowUid: string): boolean {
        this._logger?.trace(`Row ${rowUid} should be hidden.`);

        const changes = this.togleRowClass(
            rowUid,
            [this._defaultClasses.hiddenRow],
            true,
        );
        this._logger?.trace(`Row ${rowUid} changes: ${changes}`);

        if (changes) {
            this._removeRowContent(rowUid);
            this._visibleRows--;
            this._hiddenRows++;
        }

        return changes;
    }

    /**
     * Set a row to visible
     * @param rowUid The UID of the row
     * @remarks - The row is set to visible and the row content is replaced with the original content.
     * - Only if the state has changed, the calculation of the odd and even rows is updated.
     */
    public showRow(rowUid: string): void {
        const changes = this._showRow(rowUid);

        if (changes) this.refreshRowEvenOddClass();
    }

    /**
     * Set a row to visible, replaces the placeholder with the original row content and updates the row stats
     * @param rowUid The UID of the row
     * @returns Whether the state has changed. Returns `false` if the row is already visible.
     */
    private _showRow(rowUid: string): boolean {
        this._logger?.trace(`Row ${rowUid} should be shown.`);

        const changes = this.togleRowClass(
            rowUid,
            [this._defaultClasses.hiddenRow],
            false,
        );
        this._logger?.trace(`Row ${rowUid} changes: ${changes}`);

        if (changes) {
            this._addRowContent(rowUid);
            this._visibleRows++;
            this._hiddenRows--;
        }

        return changes;
    }

    /**
     * Set the state of multiple rows to hidden or visible
     * @param rows The rows to change
     * @param rows.rowUid The UID of the row
     * @param rows.hidden Whether to hide or show the row
     */
    public async changeShowHideStateRows(rows: RowsState[]): Promise<void> {
        this._logger?.trace(`Change Show/Hide state of ${rows.length} rows.`);
        let changes = false;

        rows.forEach((row) => {
            this._logger?.trace(
                `Change Show/Hide state of Row: ${row.rowUid} to ${row.hidden}.`,
            );

            if (row.hidden) {
                this._logger?.trace(`Hide Row: ${row.rowUid}`);
                const result = this._hideRow(row.rowUid);
                changes ||= result;
            } else {
                this._logger?.trace(`Show Row: ${row.rowUid}`);
                const result = this._showRow(row.rowUid);
                changes ||= result;
            }
        });

        if (changes) this.refreshRowEvenOddClass();
    }

    /**
     * Replaces the row in table body with a placeholder
     * @param rowUid The UID of the row
     * @remarks - Search the row in the internal array,
     * - If found, get the placeholder from the internal array and replace the row in the table body with the placeholder.
     */
    private _removeRowContent(rowUid: string): void {
        const row = this.getRow(rowUid);

        if (row) {
            const placeholder = this._getPlaceholder(rowUid);
            this._table.body.replaceChild(placeholder, row);
        }
    }

    /**
     * Replaces the placeholder in table body with the row
     * @param rowUid The UID of the row
     * @remarks - Search the row in the internal array,
     * - If found, get the placeholder from the internal array and replace the placeholder in the table body with the row.
     */
    private _addRowContent(rowUid: string): void {
        const row = this.getRow(rowUid);

        if (row) {
            const placeholder = this._getPlaceholder(rowUid);

            if (placeholder) {
                try {
                    this._table.body.replaceChild(row, placeholder);
                } catch (error) {
                    this._logger?.warn(
                        'Placeholder row not active in the table. Error:',
                        error,
                    );
                }
            }
        }
    }

    /**
     * Generates a placeholder row
     * @param rowUid The UID of the row
     * @returns The generated placeholder row
     * @remarks - The placeholder row is empty and has the id `defaultIds.placeholder` (default: `placeholder-row`).
     * - The placeholder row is added to the internal array.
     */
    private _generatePlaceholder(rowUid: string): HTMLTableRowElement {
        const placeholder = document.createElement('tr');
        placeholder.id = this._defaultIds.placeholder;
        placeholder.setAttribute('row-uid', rowUid);
        this._rowPlaceholders.push({ rowUid: rowUid, row: placeholder });

        return placeholder;
    }

    /**
     * Removes the placeholder row with the given UID from the internal array
     * @param rowUid The UID of the row
     * @returns The placeholder row with the given UID or undefined if no placeholder row with the given UID exists
     */
    private _removePlaceholder(
        rowUid: string,
    ): HTMLTableRowElement | undefined {
        const placeholder = this._rowPlaceholders.find(
            (rowPlaceholder) => rowPlaceholder.rowUid === rowUid,
        )?.row;

        if (placeholder) {
            this._rowPlaceholders = this._rowPlaceholders.filter(
                (rowPlaceholder) => rowPlaceholder.rowUid !== rowUid,
            );
        }

        return placeholder;
    }

    /**
     * Returns the placeholder row with the given UID
     * @param rowUid The UID of the row
     * @returns - The placeholder row with the given UID
     * - or a new placeholder row if no placeholder row with the given UID exists
     * @remarks - If a new placeholder row is generated, it is added to the internal array.
     */
    private _getPlaceholder(rowUid: string): HTMLTableRowElement {
        const placeholder = this._rowPlaceholders.find(
            (rowPlaceholder) => rowPlaceholder.rowUid === rowUid,
        )?.row;

        if (placeholder) return placeholder;
        else {
            return this._generatePlaceholder(rowUid);
        }
    }

    /**
     * Returns the row with the given UID
     * @param rowUid The UID of the row
     * @returns The row with the given UID or undefined if no row with the given UID exists
     */
    public getRow(rowUid: string): HTMLTableRowElement | undefined {
        return this._table.rows.find(
            (row) => row.getAttribute('row-uid') === rowUid,
        );
    }

    /**
     * Toggles the class of a row
     * @param rowUid The UID of the row
     * @param classList The class list to toggle
     * @param add Whether to add or remove the class
     * @returns Whether the class was toggled
     */
    public togleRowClass(
        rowUid: string,
        classList: string[],
        add: boolean,
    ): boolean {
        let changes = false;
        const row = this.getRow(rowUid);

        if (row) {
            changes = this.toggleClass(row, classList, add);
        }

        return changes;
    }

    /**
     * Refreshes the odd and even rows with the corosponding classes
     * @remarks - The odd and even rows are calculated based on the visible rows from the internal array.
     * - Change the classes only if necessary.
     */
    private refreshRowEvenOddClass(): void {
        const visibleRows = this._table.rows.filter(
            (row) => !row.classList.contains(this._defaultClasses.hiddenRow),
        );

        visibleRows.forEach((row, index) => {
            if (index % 2 === 0) {
                this.toggleClass(row, [this._defaultClasses.evenRow], true);
                this.toggleClass(row, [this._defaultClasses.oddRow], false);
            } else {
                this.toggleClass(row, [this._defaultClasses.evenRow], false);
                this.toggleClass(row, [this._defaultClasses.oddRow], true);
            }
        });
    }

    /**
     * Toggles the specified classes on the given element.
     * @param element - The HTML element to toggle the classes on.
     * @param classList - An array of classes to toggle.
     * @param add - A boolean value indicating whether to add or remove the classes.
     * @returns A boolean value indicating whether any changes were made to the element's class list.
     */
    private toggleClass(
        element: HTMLElement,
        classList: string[],
        add: boolean,
    ): boolean {
        let changes = false;
        const presentClasses = element.classList;

        if (add) {
            classList.forEach((classItem) => {
                if (!presentClasses.contains(classItem)) {
                    element.classList.add(classItem);
                    changes = true;
                }
            });
        } else {
            classList.forEach((classItem) => {
                if (presentClasses.contains(classItem)) {
                    element.classList.remove(classItem);
                    changes = true;
                }
            });
        }

        return changes;
    }

    /**
     * Changes the header of the table
     * @param header The header to change; the header text must match the original header text
     */
    public changeHeader(header: TableHeader): void {
        this.changeHeaderClass(header);
        this.changeColumnClass(header);

        this._headers[
            this._headers.findIndex(
                (headerItem) => headerItem.text === header.text,
            )
        ] = header;
    }

    /**
     * Changes the header class of the table header and corresponding cells.
     * @param header The table header object.
     */
    private changeHeaderClass(header: TableHeader): void {
        const headerIndex = this._headers.findIndex(
            (headerItem) => headerItem.text === header.text,
        );
        const oldHeaderClasses = this._headers[headerIndex].headerClass;
        const newHeaderClasses = header.headerClass;
        const headerCell = this._table.headerCells[headerIndex];

        if (oldHeaderClasses) {
            this.toggleClass(headerCell, oldHeaderClasses, false);
        }

        if (newHeaderClasses) {
            this.toggleClass(headerCell, newHeaderClasses, true);
        }
    }

    /**
     * Changes the column class of the table header and corresponding cells.
     * @param header - The table header object.
     */
    private changeColumnClass(header: TableHeader): void {
        const columnIndex = this._headers.findIndex(
            (headerItem) => headerItem.text === header.text,
        );
        const oldHeaderClasses = this._headers[columnIndex].headerClass;

        this._table.rows.forEach((row) => {
            const cell = row.cells[columnIndex];

            if (cell) {
                if (oldHeaderClasses) {
                    this.toggleClass(cell, oldHeaderClasses, false);
                }

                if (header.columnClass) {
                    this.toggleClass(cell, header.columnClass, true);
                }
            }
        });
    }

    /**
     * Makes the input string safe for use as an ID.
     * @param input - The input string to be made safe.
     * @returns The safe ID string.
     */
    private makeSafeForId(input: string): string {
        let result = '';

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (i === 0 && !isNaN(Number(char))) {
                // Leading number becomes an underscore
                result += '_';
            } else if (char.match(/[a-zA-Z]/)) {
                // Letters become lower case letters
                result += char.toLowerCase();
            } else if (char.match(/[0-9]/)) {
                // Figures are adopted
                result += char;
            } else {
                // Other characters become underlines
                result += '_';
            }
        }

        return result;
    }
}

/**
 * Represents the header of a table.
 */
export type TableHeader = {
    /**
     * The text displayed in the header.
     */
    text: string;
    /**
     * The CSS classes applied to the header.
     */
    headerClass: string[] | undefined;
    /**
     * The CSS classes applied to the column.
     */
    columnClass: string[] | undefined;
};

/**
 * Represents a structured table.
 */
export type StructedTable = {
    table: HTMLTableElement;
    header: HTMLTableSectionElement;
    headerRow: HTMLTableRowElement;
    headerCells: HTMLTableCellElement[];
    body: HTMLTableSectionElement;
    rows: HTMLTableRowElement[];
};

/**
 * Represents a placeholder for a table row.
 */
type RowPlaceholder = {
    rowUid: string;
    row: HTMLTableRowElement;
};

/**
 * Represents a row in a table.
 */
export type Row = {
    /**
     * The unique identifier of the row.
     */
    rowUid: string;
    /**
     * The data contained in the row, represented as an array of DocumentFragments.
     */
    rowData: DocumentFragment[];
    /**
     * The list of CSS class names applied to the row.
     */
    rowClassList: string[] | undefined;
    /**
     * Indicates whether the row is hidden or not.
     */
    hidden: boolean;
};

/**
 * Represents the state of a row in a table.
 */
export type RowsState = {
    rowUid: string;
    hidden: boolean;
};
