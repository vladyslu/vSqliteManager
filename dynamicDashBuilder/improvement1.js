document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const data = parseCSV(content);
            const columnTypes = analyzeDataStructure(data);
            displayChartTypeButtons(columnTypes, data);
        };
        reader.readAsText(file);
    }
});

function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n').map(line => line.split(','));
    const headers = lines.shift();
    return lines.map(line => {
        const obj = {};
        line.forEach((value, index) => {
            obj[headers[index]] = value;
        });
        return obj;
    });
}

function analyzeDataStructure(data) {
    const columnTypes = { numerical: [], categorical: [] };
    if (data.length === 0) return columnTypes;

    const columns = Object.keys(data[0]);
    columns.forEach(column => {
        let isNumerical = data.every(row => !isNaN(parseFloat(row[column])) && row[column].trim() !== "");
        if (isNumerical) {
            columnTypes.numerical.push(column);
        } else {
            columnTypes.categorical.push(column);
        }
    });

    return columnTypes;
}

function displayChartTypeButtons(columnTypes, data) {
    const container = document.getElementById('chartTypeButtons');
    container.innerHTML = '';

    // Example: Adjust based on your needs and available chart types
    if (columnTypes.numerical.length > 0) {
        createButton('Line Chart', () => renderChart('line', data, columnTypes.numerical[0]));
    }
    if (columnTypes.categorical.length > 0) {
        createButton('Bar Chart', () => renderChart('bar', data, columnTypes.categorical[0]));
    }
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    document.getElementById('chartTypeButtons').appendChild(button);
}

function renderChart(chartType, data, columnName) {
    const myChart = echarts.init(document.getElementById('chartContainer'));
    let option;

    if (chartType === 'line') {
        // Line Chart for numerical data
        const xAxisData = data.map((item, index) => index); // Assuming sequential x-axis if specific x-axis data isn't provided
        const seriesData = data.map(item => parseFloat(item[columnName]));

        option = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: xAxisData
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: seriesData,
                type: 'line',
                smooth: true
            }]
        };
    } else if (chartType === 'bar') {
        // Bar Chart for categorical data
        const categoryCounts = data.reduce((acc, item) => {
            const category = item[columnName];
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        
        const categories = Object.keys(categoryCounts);
        const seriesData = categories.map(category => categoryCounts[category]);

        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            xAxis: {
                type: 'category',
                data: categories
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: seriesData,
                type: 'bar'
            }]
        };
    }

    myChart.setOption(option);
}


// Placeholder for actual rendering logic
// You'll need to implement this based on the specific requirements of your charts and data
