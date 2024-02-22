// Utility function to determine if a column is numerical
function isNumeric(value) {
    return !isNaN(value) && isFinite(value);
}

// Function to extract unique categories and their counts from data
function getCategoryCounts(data, columnName) {
    return data.reduce((acc, item) => {
        const key = item[columnName];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

function renderChart(chartType, data, categoricalColumnName, numericalColumnName) {
    const myChart = echarts.init(document.getElementById('chartContainer'));
    let option = {};

    switch (chartType) {
        case 'line':
            const xAxisData = data.map(item => item[categoricalColumnName]);
            const seriesData = data.map(item => ({
                value: isNumeric(item[numericalColumnName]) ? parseFloat(item[numericalColumnName]) : 0,
                name: item[categoricalColumnName]
            }));
            option = {
                xAxis: { type: 'category', data: xAxisData },
                yAxis: { type: 'value' },
                series: [{ data: seriesData, type: 'line' }],
            };
            break;
        
        case 'bar':
        case 'pie':
            const categoryCounts = getCategoryCounts(data, categoricalColumnName);
            const categories = Object.keys(categoryCounts);
            const counts = categories.map(category => categoryCounts[category]);
            option = {
                xAxis: chartType === 'bar' ? { type: 'category', data: categories } : undefined,
                yAxis: chartType === 'bar' ? { type: 'value' } : undefined,
                series: [{
                    type: chartType,
                    data: categories.map((category, index) => ({
                        value: counts[index],
                        name: category
                    }))
                }]
            };
            break;
    }

    myChart.setOption(option);
}

