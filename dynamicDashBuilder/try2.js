function displayChartTypeButtons(columnTypes, data) {
    const container = document.getElementById('chartTypeButtons');
    container.innerHTML = ''; // Clear existing buttons

    // Example: Adjust based on your needs
    if (columnTypes.numerical.length > 0) {
        // If there are numerical columns, offer a line chart option
        createButton('Line Chart', () => renderChart('line', data, columnTypes.categorical[0], columnTypes.numerical[0]));
    }
    if (columnTypes.categorical.length > 0) {
        // If there are categorical columns, offer bar and pie chart options
        createButton('Bar Chart', () => renderChart('bar', data, columnTypes.categorical[0]));
        createButton('Pie Chart', () => renderChart('pie', data, columnTypes.categorical[0]));
    }
    // Other conditions for more chart types
}

function createButton(buttonText, onClickFunction) {
    const button = document.createElement('button');
    button.textContent = buttonText;
    button.onclick = onClickFunction;
    document.getElementById('chartTypeButtons').appendChild(button);
}


    myChart.setOption(option);
}




function renderChart(chartType, data, categoricalColumnName, numericalColumnName = '') {
    const myChart = echarts.init(document.getElementById('chartContainer'));
    let option = {};

    switch (chartType) {
        case 'line':
            const xAxisData = data.map(item => item[categoricalColumnName]);
            const seriesData = data.map(item => ({
                value: item[numericalColumnName] ? parseFloat(item[numericalColumnName]) : null,
                name: item[categoricalColumnName]
            }));
            option = {
                xAxis: {
                    type: 'category',
                    data: xAxisData,
                    name: categoricalColumnName
                },
                yAxis: {
                    type: 'value',
                    name: numericalColumnName
                },
                series: [{
                    data: seriesData,
                    type: 'line'
                }],
            };
            break;
        case 'bar':
        case 'pie':
            const counts = data.reduce((acc, item) => {
                const key = item[categoricalColumnName];
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
            const processedData = Object.keys(counts).map(key => ({
                value: counts[key],
                name: key
            }));
            option = {
                tooltip: { trigger: 'item' },
                series: [{
                    type: chartType,
                    data: processedData
                }],
            };
            if (chartType === 'bar') {
                option.xAxis = { type: 'category', data: Object.keys(counts) };
                option.yAxis = { type: 'value' };
            }
            break;
    }

    myChart.setOption(option);
}

