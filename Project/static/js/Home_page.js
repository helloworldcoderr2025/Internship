document.addEventListener('DOMContentLoaded', () => {
    const queryState = {
        selectedTables: [],
        selectedColumns: {}
    };

    const tableSelector = document.getElementById('selecting_table');
    const loadColumnsBtn = document.getElementById('load_columns_btn');
    const columnsContainer = document.getElementById('columns_container');
    const section2 = document.getElementById('selecting_output_columns');
    const columnForm = document.getElementById('columnForm');

    loadColumnsBtn.addEventListener('click', async () => {
        const selectedOptions = Array.from(tableSelector.selectedOptions);
        const newSelectedTables = selectedOptions.map(option => option.value);

        // Update the selectedTables without wiping previously selected columns
        queryState.selectedTables = newSelectedTables;

        // Only remove UI, keep queryState.selectedColumns untouched
        columnsContainer.innerHTML = '';

        if (queryState.selectedTables.length === 0) {
            section2.style.display = 'none';
            return;
        }

        for (const table of queryState.selectedTables) {
            try {
                const response = await fetch(`/get_columns/?table_name=${table}`);
                const data = await response.json();
                const fieldset = document.createElement('fieldset');
                const legend = document.createElement('legend');
                legend.textContent = table;
                fieldset.appendChild(legend);

                data.columns.forEach(col => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = `${table}_columns`;
                    checkbox.value = col;

                    // Restore previous selection if available
                    if (queryState.selectedColumns[table]?.includes(col)) {
                        checkbox.checked = true;
                    }

                    // Track changes live (optional, helps restore state without re-submitting)
                    checkbox.addEventListener('change', () => {
                        if (!queryState.selectedColumns[table]) {
                            queryState.selectedColumns[table] = [];
                        }

                        if (checkbox.checked) {
                            if (!queryState.selectedColumns[table].includes(col)) {
                                queryState.selectedColumns[table].push(col);
                            }
                        } else {
                            queryState.selectedColumns[table] = queryState.selectedColumns[table].filter(c => c !== col);
                            if (queryState.selectedColumns[table].length === 0) {
                                delete queryState.selectedColumns[table];
                            }
                        }
                    });

                    const label = document.createElement('label');
                    label.appendChild(checkbox);
                    label.append(` ${col}`);

                    fieldset.appendChild(label);
                    fieldset.appendChild(document.createElement('br'));
                });

                columnsContainer.appendChild(fieldset);
                section2.style.display = 'block';

            } catch (error) {
                console.error(`Error fetching columns for ${table}:`, error);
            }
        }
    });

    columnForm.addEventListener('submit', event => {
        event.preventDefault();

        // Re-collect selections (in case they didn't toggle anything)
        queryState.selectedColumns = {};
        queryState.selectedTables.forEach(table => {
            const checkboxes = document.querySelectorAll(`input[name="${table}_columns"]:checked`);
            const selected = Array.from(checkboxes).map(cb => cb.value);
            if (selected.length > 0) {
                queryState.selectedColumns[table] = selected;
            }
        });

        console.log("✅ Query State:", queryState);

        alert("Selected columns saved. You can proceed to the next section.");
    });
});
