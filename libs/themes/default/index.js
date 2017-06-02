
export default {

  colors: function(name) {
    let ordinal, weekOrdinal, valueGradation;

    if (name == 'heatMap') {
      valueGradation = ["#e5e5e5", "green"]
    }

    return {
      valueGradation,
      ordinal,
      weekOrdinal,
    }
  },

  layout: function(chartType, name, options={}) {
    const {
      width = 377,
      height = 233,
      legendable = true
    } = options;

    const heightCoef = (chartType === 'pieChart') ? 0.8: 1;
    const legendYCoef = (chartType === 'pieChart') ? 0: 0.2;

    if (name === 'auto') {
      if (legendable && width / height > 2) {
        name = 'wide'
      }
      else if (Math.abs(width - height) < 10) {
        name = 'square'
      }
      else if (legendable && Math.abs(1.618 - width / height) < 0.2) {
        name = 'square-and-legend'
      }
      else {
        name = 'overlay-legend'
      }

      if (width < 233 && name !== 'square') {
        name = 'overlay-legend'
      }
    }

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

    else if (name === 'square') {
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
          x: width - height,
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

    else if (name === 'wide') {
      const legendWidth = Math.min(height * heightCoef, 200)

      const margins = {
        top: 40,
        bottom: 30,
        left: 60,
        right: legendWidth
      }

      // FIXME: このあたり、どのくらい計算的に出すか難しい...
      if (margins.top + margins.bottom > height / 2){
        margins.top = height / 6;
        margins.bottom = height / 3;
      }

      return {
        width: width,
        height: height * heightCoef,
        margins: margins,
        chartCenter: {
          x: height / 2,
          y: height * heightCoef / 2
        },
        legend: {
          x: width - legendWidth + 40,
          y: height * legendYCoef,
          width: legendWidth - 40,
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

