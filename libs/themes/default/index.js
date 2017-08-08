
export default {
  extends: null,

  colors: function(_super, chartType, name, options={}) {
    let ordinal, linear;

    linear = ['red', '#f7fcfd', '#00441b']

    if (chartType == 'heatMap') {
      linear = ['red', "#e5e5e5", "green"]
    }

    if (name == 'week') {
      ordinal = ['#bd3122', "#2AAB9F", "#54BCB2", "#70C7BF", "#9BD7D2", "#C5E8E5", '#d66b6e']
    }

    if (name == 'analogous') {
      ordinal = ['#2AAB9F', '#2EB9DC', '#2E85DC', '#2E50DC', '#3F2EDC', '#732EDC', '#AC21E8', '#DC2EDC', '#DC2EA7', '#DC2E73', '#DC2E3F', '#DC502E', '#DC852E', '#E8C021', '#D4E821', '#98E821', '#62DC2E', '#34D534', '#23CD56', '#29C782']
    }

    if (name == 'approximate') {
      ordinal = ['#2AAB9F', '#009688', '#66BB6A', '#4CAF50', '#9CCC65', '#8BC34A', '#D4E157', '#CDDC39', '#26C6DA', '#00BCD4']
    }

    if (name == 'tint') {
      ordinal = ['#2AAB9F', '#3ACFC0', '#63D9CD', '#8CE3DA', '#B5EDE7'] 
    }

    if (name == 'tint_complement') {
      ordinal = ['#BD0022', '#F0002C', '#FF244C', '#FF5776', '#FF8A9F'] 
    }

    return {
      linear,
      ordinal
    }
  },

  layout: function(_super, chartType, name, options={}) {
    let {
      width = 377,
      height = 233,
      legendable = true,
      fullscreen = false
    } = options;

    const heightCoef = (chartType === 'pieChart') ? 0.8: 1;
    const legendYCoef = (chartType === 'pieChart') ? 0: 0.2;
    const xAxisLabelLimit = fullscreen ? 30 : 10;
    const captionHeight = 0;

    height -= captionHeight

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
        name: name,
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
          xLabel: { padding: 15, limit: xAxisLabelLimit },
          yLabel: { padding: 20 }
        },
        caption: {
          height: captionHeight
        }
      }
    }

    else if (name === 'square') {
      const length = Math.min(width, height * heightCoef)

      return {
        name: name,
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
          xLabel: { padding: 15, limit: xAxisLabelLimit },
          yLabel: { padding: 20 }
        },
        caption: {
          height: captionHeight
        }
      }
    }

    else if (name === 'overlay-legend') {
      return {
        name: name,
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
        legend: (!legendable) ? null : {
          x: width - height,
          y: height * legendYCoef,
          width: width - height,
          horizontal: false
        },
        axis: {
          xLabel: { padding: 15, limit: xAxisLabelLimit },
          yLabel: { padding: 20 }
        },
        caption: {
          height: captionHeight
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
        name: name,
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
          xLabel: { padding: 15, limit: xAxisLabelLimit},
          yLabel: { padding: 20 }
        },
        caption: {
          height: captionHeight
        }
      }

    }

    console.log('?? layout', name)

    return {}
  }
}

