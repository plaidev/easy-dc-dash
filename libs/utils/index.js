import dc from 'dc'

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  })
}


export function generateDomId() {
  return 'id-' + generateUUID();
}


// Array, Object:
//   String(js): <data-table columns="{key: d.key}"></data-table>
//   Function: <data-table :columns="customParser"></data-table>
// Object:
//   Object: <data-table :columns="{key: "key"}"></data-table>
// Array:
//   Array: <xxx :columns="["key"]"></xxx>
//   CSV: <xxx dimension="d1,d2"></xxx>
export function generateExtractor (rule) {
  if (typeof rule === 'function' || rule instanceof Function) {
    return rule
  }

  else if (typeof rule === "string" || rule instanceof String) {
    if (/^([a-zA-Z0-9\$_]*\s?,?\s?)+$/g.test(rule)) {
      const keys = rule.split(',')
      return (d) => {
        const row = []
        keys.forEach((k) => {
          row.push(d[k])
        })
        return row
      }
    }
    else {
      return new Function('d', `const v = ${rule}; return v === null? "": v;`)
    }
  }

  else if (rule instanceof Array) {
    return (d) => {
      const row = []
      rule.forEach((k) => {
        row.push(d[k])
      })
      return row
    }
  }

  else if (rule instanceof Object) {
    return (d) => {
      const row = {}
      Object.keys(rule).forEach((k) => {
        row[k] = d[rule[k]]
      })
      return row
    }
  }

  return // else
}

// https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
export function removeEmptyBins(sourceGroup) {
  return {
    all:function () {
      return sourceGroup.all().filter(function(d) {
        return d.value != 0;
      });
    }
  };
}

// reverse dc.legend() order
// See: http://stackoverflow.com/questions/39811210/dc-charts-change-legend-order
export function reverseLegendOrder(chart) {
  dc.override(chart, 'legendables', function() {
      var items = chart._legendables();
      return items.reverse();
  });
}