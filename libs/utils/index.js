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


// String(js): <data-table columns="{key: d.key}"></data-table>
// Object: <data-table :columns="{key: "key"}"></data-table>
// Array: <data-table :columns="["key"]"></data-table>
// Function: <data-table :columns="customParser"></data-table>
export function generateExtractor (rule) {
  if (typeof rule === 'function' || rule instanceof Function) {
    return rule
  }

  else if (typeof rule === "string" || rule instanceof String) {
    return new Function('d', `const v = ${rule}; return v === null? "": v;`)
  }

  else if (rule instanceof Array) {
    return (d) => {
      row = {}
      rule.forEach((k) => {
        row[k] = d[rule[k]]
      })
      return row === null? '': row;
    }
  }

  else if (rule instanceof Object) {
    return (d) => {
      row = {}
      Object.keys(rule).forEach((k) => {
        row[k] = d[rule[k]]
      })
      return row === null? '': row;
    }
  }

  return // else
}

// https://github.com/dc-js/dc.js/wiki/FAQ#combine-groups
export function combineGroups(sourceGroups) {
  return {
    all: () => {
      const alls = sourceGroups.map((g) => g.all());
      // Object型がkeyになっている場合に ret.push({key: k, value:gm[k]}) のkeyがString型になってしまうのを防ぐ
      // ret.push({key: objKeys[k], value: gm[k]});
      const objKeys = {};
      const gm = {};
      alls.forEach((a, i) => {
        a.forEach((b) => {
          if(!gm[b.key]) {
            gm[b.key] = new Array(sourceGroups.length);
            for(let j=0; j<sourceGroups.length; ++j)
              gm[b.key][j] = 0;
          }
          gm[b.key][i] = b.value;
          for(let k in gm)
            if(!objKeys[k])
              objKeys[k] = b.key;
        });
      });
      const ret = [];
      for(let k in gm)
        ret.push({key: objKeys[k], value: gm[k]});
      return ret;
    }
  };
}

// https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
export function removeEmptyBins(sourceGroup) {
  return {
    all: () => {
      return sourceGroup.all().filter((d) => d.value != 0)
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