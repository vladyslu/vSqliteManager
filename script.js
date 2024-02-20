 function fetchTables() {
            $.get('http://localhost:5000/tables', function(tables) {
                let content = '<h2>Tables</h2><ul>';
				console.log(tables)
				let optionsContent = "";
                tables.forEach(function(table) {
                    content += `<li>${table} <button onclick="fetchTableData('${table}')">View</button></li>`;
					optionsContent += `<option value="${table}">${table}</option>`
                });
                content += '</ul>';
                $('#tableList').html(content);
				$('#tableNameForRow').html(optionsContent);
            });
        }





       function fetchTableData(tableName) {
    $.get(`http://localhost:5000/table/`+tableName, function(rows) {
        let content = `<h2>${tableName}</h2>`;
        if (rows.length > 0) {
            content += '<table><tr>';
            // Headers
            Object.keys(rows[0]).forEach(column => {
                content += `<th>${column}<button onclick="removeColumn('${tableName}', '${column}')">Remove Column</button></th>`;
            });
            content += '<th>Actions</th></tr>';
            // Rows
            rows.forEach(row => {
                content += '<tr>';
                Object.keys(row).forEach((column, index) => {
                    let value = row[column];
                    content += `<td contenteditable="true" data-row-id="${row.id}" data-column-name="${column}" onBlur="updateCell('${tableName}', this.getAttribute('data-row-id'), this.getAttribute('data-column-name'), this.innerText)">${value}</td>`;
                });
				console.log(row);
                content += `<td><button onclick="removeRow('${tableName}', ${row.id})">Remove Row</button></td></tr>`;
            });
            content += '</table>';
        } else {
            content += '<p>No data available.</p>';
        }
        document.getElementById('tableNameForColumn').value = tableName;
        document.getElementById('tableNameForRow').value = tableName;
        generateInputFieldsForNewRow(tableName);
        
        $('#tableData').html(content);
    });
}


function updateCell(tableName, rowId, columnName, newValue) {
	console.log("updating")
    $.ajax({
        url: `http://localhost:5000/table/${tableName}/update_cell`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id: rowId, column: columnName, value: newValue }),
        success: function(response) {
            console.log('Cell updated successfully');
        },
        error: function(xhr, status, error) {
            console.error('Error updating cell:', error);
        }
    });
}



        function removeRow(tableName, rowId) {
			console.log(rowId)
            $.ajax({
                url: `http://localhost:5000/table/`+tableName+`/remove_row`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ id: rowId }),
                success: function(response) {
                    fetchTableData(tableName); // Refresh data
                }
            });
        }
		
		function removeColumn(tableName, columnName) {
            $.ajax({
                url: `http://localhost:5000/table/`+tableName+`/remove_column`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ column_name: columnName }),
                success: function(response) {
                    fetchTableData(tableName); // Refresh data
                }
            });
        }

        $(document).ready(function() {
            fetchTables();
        });
		
		function addColumn() {
    const tableName = document.getElementById('tableNameForColumn').value;
    const columnName = document.getElementById('columnName').value;
    const columnType = document.getElementById('columnType').value;
    const columnSize = document.getElementById('columnSize').value; // Get the column size

    // Include columnSize in the data sent to the server
    $.ajax({
        url: 'http://localhost:5000/table/'+tableName+'/add_column',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            table_name: tableName, 
            column_name: columnName, 
            column_type: columnType + (columnSize ? `(${columnSize})` : '') // Append size if specified
        }),
        success: function(response) {
            alert('Column added successfully');
            fetchTableData(tableName); // Refresh data
        }
    });
}




function addRow() {
    const tableName = document.getElementById('tableNameForRow').value;
    const inputs = document.getElementById('newRowForm').elements;
    let rowData = {};
    for (let i = 0; i < inputs.length; i++) {
        rowData[inputs[i].id] = inputs[i].value;
    }

    $.ajax({
        url: `http://localhost:5000/table/${tableName}/add_row`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(rowData),
        success: function(response) {
            alert('Row added successfully');
			fetchTableData(tableName); // Refresh data
            // Optionally refresh the data view
        },
        error: function(response) {
            alert('Error adding row: ' + response.responseText);
        }
    });
}



function generateInputFieldsForNewRow() {
    const tableName = document.getElementById('tableNameForRow').value;
    $.get(`http://localhost:5000/table_info/${tableName}`, function(columns) {
        const form = document.getElementById('newRowForm');
        form.innerHTML = ''; // Clear existing fields
        columns.forEach(column => {
			if(column.name.toLowerCase() != "id"){
            const label = document.createElement('label');
            label.innerText = `${column.name} (${column.type}): `;
            form.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.id = column.name;
            form.appendChild(input);

            const breakLine = document.createElement('br');
            form.appendChild(breakLine);
			}
        });
    });
}


function addColumnSpec() {
    const container = document.getElementById('columnsContainer');
    const specHtml = `
        <div class="columnSpec">
            <input type="text" placeholder="Column Name">
            <select>
                <option value="INT">INT</option>
                <option value="VARCHAR">VARCHAR</option>
                <!-- Add other data types -->
            </select>
            <input type="number" placeholder="Size (optional)">
            <button onclick="removeColumnSpec(this)">Remove</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', specHtml);
}

function removeColumnSpec(button) {
    button.parentElement.remove();
}

function createTable() {
    const tableName = document.getElementById('newTableName').value;
    const columnSpecs = Array.from(document.getElementsByClassName('columnSpec')).map(spec => {
        return {
            name: spec.querySelector('input[type=text]').value,
            type: spec.querySelector('select').value,
            size: spec.querySelector('input[type=number]').value
        };
    });

	let outerJson = { table_name: tableName, columns: columnSpecs }
	console.log("creating table:")
	console.log(outerJson)
    $.ajax({
        url: 'http://localhost:5000/create_table',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ table_name: tableName, columns: columnSpecs }),
        success: function(response) {
            alert(response.message);
			fetchTables();
            // Optionally refresh UI elements, e.g., list of tables
        },
        error: function(xhr, status, error) {
            alert('Error creating table: ' + error);
        }
    });
}
