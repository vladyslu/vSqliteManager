.item {
  position: relative;
  /* Other styles */
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: red;
  cursor: se-resize;
}






document.querySelectorAll('.resize-handle').forEach(handle => {
  let startX, startY, startWidth, startHeight;

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(handle.parentNode).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(handle.parentNode).height, 10);

    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
  });

  function doDrag(e) {
    handle.parentNode.style.width = startWidth + e.clientX - startX + 'px';
    handle.parentNode.style.height = startHeight + e.clientY - startY + 'px';
    // Refresh Muuri layout after resizing
    grid.refreshItems().layout();
  }

  function stopDrag() {
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);
  }
});



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





function displayChartTypeButtons(columnTypes, data) {
    const container = document.getElementById('chartTypeButtons');
    container.innerHTML = '';

    // Line Chart for numerical data
    if (columnTypes.numerical.length > 0) {
        createButton('Line Chart', () => renderChart('line', data, columnTypes.numerical[0]));
    }
    // Bar Chart for categorical data
    if (columnTypes.categorical.length > 0) {
        createButton('Bar Chart', () => renderChart('bar', data, columnTypes.categorical[0]));
    }
    // Scatter Plot for datasets with at least two numerical columns
    if (columnTypes.numerical.length > 1) {
        createButton('Scatter Plot', () => renderChart('scatter', data, columnTypes.numerical));
    }
    // Pie Chart for categorical data
    if (columnTypes.categorical.length > 0) {
        createButton('Pie Chart', () => renderChart('pie', data, columnTypes.categorical[0]));
    }
}



function renderChart(chartType, data, columnName) {
    const myChart = echarts.init(document.getElementById('chartContainer'));
    let option = {};

    switch (chartType) {
        case 'line':
            // Line chart configuration (as previously defined)
            break;
        case 'bar':
            // Bar chart configuration (as previously defined)
            break;
        case 'scatter':
            // Scatter plot configuration
            const xAxisData = data.map(item => parseFloat(item[columnName[0]]));
            const yAxisData = data.map(item => parseFloat(item[columnName[1]]));
            option = {
                tooltip: { trigger: 'item' },
                xAxis: { type: 'value' },
                yAxis: { type: 'value' },
                series: [{ data: xAxisData.map((x, i) => [x, yAxisData[i]]), type: 'scatter' }]
            };
            break;
        case 'pie':
            // Pie chart configuration
            const categoryCounts = data.reduce((acc, item) => {
                const category = item[columnName];
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});
            const seriesData = Object.keys(categoryCounts).map(key => ({ value: categoryCounts[key], name: key }));
            option = {
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '50%',
                    data: seriesData,
                    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
                }]
            };
            break;
    }

    myChart.setOption(option);
}











// Placeholder for actual rendering logic
// You'll need to implement this based on the specific requirements of your charts and data
