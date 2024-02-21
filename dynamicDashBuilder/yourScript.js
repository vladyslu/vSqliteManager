document.getElementById('csvFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const data = parseCSV(content);
            const columnTypes = analyzeDataStructure(data);
            visualizeData(data, columnTypes);
        };
        reader.readAsText(file);
    }
});

function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return data;
}

function analyzeDataStructure(data) {
    const columnTypes = {};
    const sampleRow = data[0];
    for (const column in sampleRow) {
        const sampleValue = sampleRow[column];
        if (!isNaN(parseFloat(sampleValue)) && isFinite(sampleValue)) {
            columnTypes[column] = 'numerical';
        } else if (Date.parse(sampleValue)) {
            columnTypes[column] = 'date';
        } else {
            columnTypes[column] = 'categorical';
        }
    }
    return columnTypes;
}

function visualizeData(data, columnTypes) {
    const myChart = echarts.init(document.getElementById('chartContainer'));
    let option;

    // Example: Visualize the first column found for each type
    const firstColumnOfType = {};
    for (const [column, type] of Object.entries(columnTypes)) {
        if (!firstColumnOfType[type]) {
            firstColumnOfType[type] = column;
        }
    }

    if (firstColumnOfType['numerical']) {
        // Numerical data visualization (e.g., line chart)
        const column = firstColumnOfType['numerical'];
        option = createLineChartOption(data, column, 'Numerical Data Visualization');
    } else if (firstColumnOfType['categorical']) {
        // Categorical data visualization (e.g., bar chart)
        const column = firstColumnOfType['categorical'];
        option = createBarChartOption(data, column, 'Categorical Data Visualization');
    } else if (firstColumnOfType['date']) {
        // Date data visualization (e.g., time series line chart)
        const column = firstColumnOfType['date'];
        option = createTimeSeriesOption(data, column, 'Date Data Visualization');
    } else {
        console.error('Unsupported data type for visualization');
        return;
    }

    myChart.setOption(option);
}

function createLineChartOption(data, column, title) {
    const xAxisData = data.map((_, index) => index + 1);
    const seriesData = data.map(item => parseFloat(item[column]));
    return {
        title: { text: title },
        tooltip: {},
        xAxis: { type: 'category', data: xAxisData },
        yAxis: { type: 'value' },
        series: [{ data: seriesData, type: 'line' }]
    };
}

function createBarChartOption(data, column, title) {
    const categoryCounts = data.reduce((acc, item) => {
        acc[item[column]] = (acc[item[column]] || 0) + 1;
        return acc;
    }, {});
    const categories = Object.keys(categoryCounts);
    const seriesData = categories.map(category => categoryCounts[category]);
    return {
        title: { text: title },
        tooltip: {},
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value' },
        series: [{ data: seriesData, type: 'bar' }]
    };
}

function createTimeSeriesOption(data, column, title) {
    const seriesData = data.map(item => [item[column], parseFloat(item[firstNumericalColumn])]).filter(item => !isNaN(item[1]));
    return {
        title: { text: title },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'time' },
        yAxis: { type: 'value' },
        series: [{ data: seriesData, type: 'line' }]
    };
}

