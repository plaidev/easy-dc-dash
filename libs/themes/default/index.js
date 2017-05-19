
export default {

  layout: function(chartType, name, options={}) {
    const {
      width = 377,
      height = 233
    } = options;

    const heightCoef = (chartType === 'pieChart') ? 0.8: 1;
    const legendYCoef = (chartType === 'pieChart') ? 0: 0.2;

    if (name === 'square-and-legend') {
      return {
        width: width,
        height: height * heightCoef,
        margins: {
          top: 40,
          bottom: 30,
          left: 40,
          right: width - height
        },
        chartCenter: {
          x: height / 2,
          y: height * heightCoef / 2
        },
        legend: {
          x: height + 20,
          y: height * legendYCoef,
          width: width - height - 20,
          horizontal: false
        },
        axis: {
          xLabel: { padding: 15 },
          yLabel: { padding: 20 }
        }
      }
    }

    if (name === 'square') {
      const length = Math.min(width, height * heightCoef)

      return {
        width: length,
        height: length,
        margins: {
          top: 40,
          bottom: 30,
          left: 40,
          right: 40
        },
        chartCenter: {
          x: length / 2,
          y: length / 2
        },
        legend: null,
        axis: {
          xLabel: { padding: 15 },
          yLabel: { padding: 20 }
        }
      }
    }

    else if (name === 'overlay-legend') {
      return {
        width: width,
        height: height * heightCoef,
        margins: {
          top: 40,
          bottom: 30,
          left: 40,
          right: 40
        },
        chartCenter: {
          x: width / 2,
          y: height * heightCoef / 2
        },
        legend: {
          x: height,
          y: height * legendYCoef,
          width: width - height,
          horizontal: false
        },
        axis: {
          xLabel: { padding: 15 },
          yLabel: { padding: 20 }
        }
      }
    }

    console.log('?? layout', name)

    return {}
  }
}

