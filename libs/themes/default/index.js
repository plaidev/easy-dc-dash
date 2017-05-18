

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
        legend: {
          x: height,
          width: width - height,
          horizontal: false
        }
      }
    }

    else if (name === 'overlay-legend') {
      return {
        width: width,
        height: height * 0.9,
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

