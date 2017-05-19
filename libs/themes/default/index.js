

export default {
  layout: function(name, options={}) {
    const {
      width = 377,
      height = 233
    } = options;

    if (name === 'square-and-legend') {
      return {
        width: width,
        height: height * 0.9,
        chartCenter: {
          x: height / 2,
          y: height * 0.9 / 2
        },
        legend: {
          x: height,
          width: width - height,
          horizontal: false
        }
      }
    }

    if (name === 'square') {
      const length = Math.min(width, height * 0.9)

      return {
        width: length,
        height: length,
        chartCenter: {
          x: length / 2,
          y: length / 2
        },
        legend: null
      }
    }

    else if (name === 'overlay-legend') {
      return {
        width: width,
        height: height * 0.9,
        chartCenter: {
          x: width / 2,
          y: height * 0.9 / 2
        },
        legend: {
          x: height,
          width: width - height,
          horizontal: false
        }
      }
    }

    console.log('?? layout', name)

    return {}
  }
}

