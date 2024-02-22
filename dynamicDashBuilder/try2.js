function displayChartTypeButtons(columnTypes, data) {
    const container = document.getElementById('chartTypeButtons');
    container.innerHTML = ''; // Clear existing buttons

    // Assuming columnTypes structure is { numerical: ['age'], categorical: ['name'] }
    if (columnTypes.numerical.length > 0) {
        // Line Chart button for numerical data
        createButton('Line Chart', () => renderChart('line', data, columnTypes.numerical));
        // Scatter Plot button if there are at least two numerical columns
        if (columnTypes.numerical.length > 1) {
            createButton('Scatter Plot', () => renderChart('scatter', data, columnTypes.numerical));
        }
    }
    if (columnTypes.categorical.length > 0) {
        // Bar Chart button for categorical data
        createButton('Bar Chart', () => renderChart('bar', data, columnTypes.categorical[0]));
        // Pie Chart button for categorical data
        createButton('Pie Chart', () => renderChart('pie', data, columnTypes.categorical[0]));
    }
    // Additional buttons for other chart types based on data analysis...
}

function createButton(buttonText, onClickFunction) {
    const button = document.createElement('button');
    button.textContent = buttonText;
    button.onclick = onClickFunction;
    document.getElementById('chartTypeButtons').appendChild(button);
}




function renderChart(chartType, data, columnNames) {
    const myChart = echarts.init(document.getElementById('chartContainer'));
    let option;

    switch (chartType) {
        case 'line':
            option = getLineChartOption(data, columnNames);
            break;
        case 'bar':
            option = getBarChartOption(data, columnNames);
            break;
    }

    myChart.setOption(option);
}

function getLineChartOption(data, columnName) {
    // Assuming columnName[0] is categorical (e.g., 'name') and columnName[1] is numerical (e.g., 'age')
    const xAxisData = data.map(item => item[columnName[0]]);
    const seriesData = data.map(item => parseFloat(item[columnName[1]]));

    return {
        title: { text: 'Line Chart' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: xAxisData, name: columnName[0] },
        yAxis: { type: 'value', name: columnName[1] },
        series: [{ data: seriesData, type: 'line' }]
    };
}


function getBarChartOption(data, columnNames) {
    const columnName = columnNames[0]; // Assuming the first column for simplicity
    let categories, seriesData;

    if (isNaN(data[0][columnName])) {
        // Categorical data handling
        const categoryCounts = data.reduce((acc, item) => {
            acc[item[columnName]] = (acc[item[columnName]] || 0) + 1;
            return acc;
        }, {});
        categories = Object.keys(categoryCounts);
        seriesData = Object.values(categoryCounts);
    } else {
        // Numerical data handling
        categories = data.map((_, index) => `Index ${index}`);
        seriesData = data.map(item => parseFloat(item[columnName])).filter(item => !isNaN(item));
    }

    return {
        title: { text: `Bar Chart of ${columnName}` },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: categories, name: 'Category' },
        yAxis: { type: 'value', name: 'Count/Value' },
        series: [{ data: seriesData, type: 'bar' }]
    };
}
