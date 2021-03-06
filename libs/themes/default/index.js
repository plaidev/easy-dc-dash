
export default {
  extends: null,

  colors: function(_super, chartType, name, options={}) {
    let ordinal, linear;

    linear = ['red', '#f7fcfd', '#00441b']

    if (chartType == 'heatMap') {
      linear = ['red', "#e5e5e5", "#66B8A1"]
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
      ordinal = ['#2aab9f', '#2ebbae', '#32cabc', '#50d4c8', '#5fd8cd', '#6fdcd2', '#7fe0d7', '#8fe3db', '#9ee7e0', '#aeebe5', '#beefea'] 
    }

    if (name == 'tint_complement') {
      ordinal = ['#bd0022', '#d10026', '#e40029', '#f8002d', '#ff2048', '#ff3458', '#ff4768', '#ff5b78', '#ff6f89', '#ff8299', '#ff96a9'] 
    }

    if (name == 'karte_color_palette') {
      ordinal = ['#66B8A1', '#D0E8D1', '#91B7B8', '#97E9DF', '#91B7B0', '#BDE3D1']
    }

    return {
      linear,
      ordinal
    }
  },

  card: function(_super, chartType, name, options={}) {
    return {
      defaultCaption: '',
      captionHeight: 42,
      selfMargined: false
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
          top: 20,
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
      }
    }

    else if (name === 'square') {
      const length = Math.min(width, height * heightCoef)

      return {
        name: name,
        width: length,
        height: length,
        margins: {
          top: 20,
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
        }
      }
    }

    else if (name === 'overlay-legend') {
      return {
        name: name,
        width: width,
        height: height * heightCoef,
        margins: {
          top: 20,
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
        }
      }
    }

    else if (name === 'wide') {
      const legendWidth = Math.min(height * heightCoef, 200)

      const margins = {
        top: 20,
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
        }
      }

    }

    console.log('?? layout', name)

    return {}
  }
}

