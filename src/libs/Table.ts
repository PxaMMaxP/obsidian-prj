export default class Table {
    public get data(): StructedTable {
        return this._table;
    }
    private _table: StructedTable;
    private _headers: TableHeader[];
    private _tableId: string;
    private _tableClassList: string[] | undefined;
    //   Default classes  //
    private defaultClasses = {
        table: ['prj-table'],
        header: ['prj-table-header'],
        headerRow: ['prj-table-header-row'],
        headerCell: ['prj-table-header-cell'],
        body: ['prj-table-body'],
        row: ['prj-table-row', 'prj-table-row-hover'],
        cell: ['prj-table-cell'],

        hiddenRow: 'hidden-row',
        evenRow: 'even-row',
        oddRow: 'odd-row'
    };
    // // //// // //// // //

    /**
     * Creates a new table
     * @param tableHeaders A list of table headers
     * @param id The ID of the table
     * @param classList The class list of the table
     */
    constructor(tableHeaders: TableHeader[], id: string, classList: string[] | undefined) {
        this._headers = tableHeaders;
        this._tableId = id;
        this._tableClassList = classList;
        this._table = this.createTable();
    }

    /**
     * Delte the complete table
     */
    public deconstructor(): void {
        this._table.table.remove();
    }

    private createTable(): StructedTable {
        const table = document.createElement('table');
        table.id = this._tableId;
        table.classList.add(...this.defaultClasses.table);
        if (this._tableClassList) {
            this._tableClassList.forEach(classItem => {
                table.classList.add(classItem);
            });
        }

        const tableHeader = table.createTHead();
        tableHeader.classList.add(...this.defaultClasses.header);
        const tableHeaderRow = tableHeader.insertRow();
        tableHeaderRow.classList.add(...this.defaultClasses.headerRow);

        const tableHeaderCells: HTMLTableCellElement[] = [];
        this._headers.forEach(header => {
            const tableHeaderCell = document.createElement('th');
            tableHeaderCell.classList.add(...this.defaultClasses.headerCell);
            tableHeaderCell.id = this.makeSafeForId(header.text);
            tableHeaderCell.textContent = header.text;
            if (header.headerClass) {
                header.headerClass.forEach(classItem => {
                    tableHeaderCell.classList.add(classItem);
                });
            }
            tableHeaderCells.push(tableHeaderCell);
            tableHeaderRow.appendChild(tableHeaderCell);
        });
        const tableBody = table.createTBody();
        tableBody.classList.add(...this.defaultClasses.body);

        const structedTable = {
            table: table,
            header: tableHeader,
            headerRow: tableHeaderRow,
            headerCells: tableHeaderCells,
            body: tableBody,
            rows: []
        };

        return structedTable;
    }

    /**
     * Adds a row to the table
     * @param rowUid The UID of the new row
     * @param rowData The data of the new row
     * @param rowClassList The class list of the new row
     * @param hidden Whether the new row should be hidden
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
     */
    public addRows(rows: Row[]): void {
        let oneRowVisible = false;
        rows.forEach(row => {
            this._addRow(row.rowUid, row.rowData, row.rowClassList, row.hidden);
            oneRowVisible = oneRowVisible || !row.hidden;
        });
    }

    private _addRow(rowUid: string, rowData: DocumentFragment[], rowClassList: string[] | undefined, hidden: boolean): void {
        const tableRow = this._table.body.insertRow();
        this.setRowOddOrEven(tableRow);
        tableRow.classList.add(...this.defaultClasses.row);
        tableRow.setAttribute('row-uid', rowUid);
        if (rowClassList) {
            rowClassList.forEach(classItem => {
                tableRow.classList.add(classItem);
            });
        }
        if (hidden) {
            tableRow.classList.add(this.defaultClasses.hiddenRow);
        }
        rowData.forEach((data, index) => {
            const tableCell = tableRow.insertCell();
            tableCell.classList.add(...this.defaultClasses.cell);
            if (this._headers[index] !== undefined && this._headers[index].columnClass) {
                this._headers[index].columnClass?.forEach(classItem => {
                    tableCell.classList.add(classItem);
                });
            }
            tableCell.appendChild(data);
        });
        this._table.rows.push(tableRow);
    }

    private setRowOddOrEven(tableRow: HTMLTableRowElement) {
        let lastVisibleRow;
        for (let i = this._table.rows.length - 1; i >= 0; i--) {
            if (!this._table.rows[i].classList.contains(this.defaultClasses.hiddenRow)) {
                lastVisibleRow = this._table.rows[i];
                break;
            }
        }
        if (lastVisibleRow) {
            tableRow.classList.add(lastVisibleRow.classList.contains(this.defaultClasses.evenRow) ? this.defaultClasses.oddRow : this.defaultClasses.evenRow);
        } else {
            tableRow.classList.add(this.defaultClasses.evenRow);
        }
    }

    /**
     * Deletes the row with the given UID
     * @param rowUid The UID of the row
     */
    public deleteRow(rowUid: string): void {
        const rowToDelete = this._table.rows.find(row => row.getAttribute('row-uid') === rowUid);
        const rowVisible = rowToDelete && !rowToDelete.classList.contains(this.defaultClasses.hiddenRow);
        if (rowToDelete) {
            this._table.body.removeChild(rowToDelete);
        }
        if (rowVisible) {
            this.refreshRowEvenOddClass();
        }
    }

    /**
     * Set a row to hidden
     * @param rowUid The UID of the row
     */
    public hideRow(rowUid: string): void {
        const rowToHide = this._table.rows.find(row => row.getAttribute('row-uid') === rowUid);
        if (rowToHide) {
            rowToHide.classList.add(this.defaultClasses.hiddenRow);
            this.refreshRowEvenOddClass();
        }
    }

    /**
     * Set a row to visible
     * @param rowUid The UID of the row
     */
    public showRow(rowUid: string): void {
        const rowToShow = this._table.rows.find(row => row.getAttribute('row-uid') === rowUid);
        if (rowToShow) {
            rowToShow.classList.remove(this.defaultClasses.hiddenRow);
            this.refreshRowEvenOddClass();
        }
    }

    /**
     * Returns the row with the given UID
     * @param rowUid The UID of the row
     * @returns The row with the given UID or undefined if no row with the given UID exists
     */
    public getRow(rowUid: string): HTMLTableRowElement | undefined {
        return this._table.rows.find(row => row.getAttribute('row-uid') === rowUid);
    }

    /**
     * Toggles the class of a row
     * @param rowUid The UID of the row
     * @param classList The class list to toggle
     * @param add Whether to add or remove the class
     */
    public togleRowClass(rowUid: string, classList: string[], add: boolean): void {
        const row = this.getRow(rowUid);
        if (row) {
            this.toggleClass(row, classList, add);
        }
    }

    private refreshRowEvenOddClass(): void {
        const visibleRows = this._table.rows.filter(row => !row.classList.contains(this.defaultClasses.hiddenRow));
        visibleRows.forEach((row, index) => {
            if (index % 2 === 0) {
                this.toggleClass(row, [this.defaultClasses.evenRow], true);
                this.toggleClass(row, [this.defaultClasses.oddRow], false);
            } else {
                this.toggleClass(row, [this.defaultClasses.evenRow], false);
                this.toggleClass(row, [this.defaultClasses.oddRow], true);
            }
        });
    }

    private toggleClass(element: HTMLElement, classList: string[], add: boolean): void {
        const presentClasses = element.classList;
        if (add) {
            classList.forEach(classItem => {
                if (!presentClasses.contains(classItem)) {
                    element.classList.add(classItem);
                }
            });
        } else {
            classList.forEach(classItem => {
                if (presentClasses.contains(classItem)) {
                    element.classList.remove(classItem);
                }
            });
        }
    }

    /**
     * Changes the header of the table
     * @param header The header to change; the header text must match the original header text
     */
    public changeHeader(header: TableHeader): void {
        this.changeHeaderClass(header);
        this.changeColumnClass(header);
        this._headers[this._headers.findIndex(headerItem => headerItem.text === header.text)] = header;
    }

    private changeHeaderClass(header: TableHeader): void {
        const headerIndex = this._headers.findIndex(headerItem => headerItem.text === header.text);
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

    private changeColumnClass(header: TableHeader): void {
        const columnIndex = this._headers.findIndex(headerItem => headerItem.text === header.text);
        const oldHeaderClasses = this._headers[columnIndex].headerClass;
        this._table.rows.forEach(row => {
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

export type TableHeader = {
    text: string;
    headerClass: string[] | undefined;
    columnClass: string[] | undefined;
}

export type StructedTable = {
    table: HTMLTableElement;
    header: HTMLTableSectionElement;
    headerRow: HTMLTableRowElement;
    headerCells: HTMLTableCellElement[];
    body: HTMLTableSectionElement;
    rows: HTMLTableRowElement[];
}

export type Row = {
    rowUid: string;
    rowData: DocumentFragment[];
    rowClassList: string[] | undefined;
    hidden: boolean;
}