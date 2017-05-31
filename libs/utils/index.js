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
export function generateExtractor (rule, dateKey) {

  let parseDate = null;
  if (dateKey) {
    const dateExtractor = generateExtractor(dateKey)
    parseDate = function parseDate(d) {
      if (!dateKey) return {}
      const t = dateExtractor(d)
      console.log('parseDate:', d, t, dateKey)
      if (!t) return {}
      return {
        year: t.getFullYear(),
        month: t.getMonth() + 1,
        day: t.getDate(),
        week: Number(d3.time.format('%w')(t)),
        hour: t.getHours(),
        weekofyear: Number(d3.time.format('%W')(t))
      }
    }
  }

  if (typeof rule === 'function' || rule instanceof Function) {
    return rule
  }

  else if (typeof rule === "string" || rule instanceof String) {
    if (/^[a-zA-Z0-9\$_]+$/g.test(rule)) {
      return (d) => d[rule]
    }
    else if (/^([a-zA-Z0-9\$_]*\s?,?\s?)+$/g.test(rule)) {
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
      const code = `const v = ${rule}; return v === null? "": v;`
      if (dateKey) {
        // TODO: このへんどうにかしたい。ここで吸収できるのは悪くないと思うが
        let _f = new Function('d', 'year', 'month', 'day', 'week', 'hour', 'weekofyear', code)
        return (d) => {
          const {year, month, day, week, hour, weekofyear} = parseDate(d)
          return _f(d, year, month, day, week, hour, weekofyear)
        }
      }
      return new Function('d', code);
    }
  }

  else if (rule instanceof Array) {
    return (d) => {
      const t = parseDate(d);
      const row = []
      rule.forEach((k) => {
        row.push(t[k] ? t[k] : d[k])
      })
      return row
    }
  }

  else if (rule instanceof Object) {
    return (d) => {
      const t = parseDate(d);
      const row = {}
      Object.keys(rule).forEach((k) => {
        row[k] = t[k] ? t[k] : d[rule[k]]
      })
      return row
    }
  }

  return (d) => null
}

// https://github.com/dc-js/dc.js/wiki/FAQ#combine-groups
export function combineGroups(sourceGroups) {
  return {
    all: () => {
      const alls = sourceGroups.map((g) => g.all());
      // Object型がkeyになっている場合に ret.push({key: k, value:gm[k]}) のkeyがString型になってしまうのを防ぐ
      // ret.push({key: _keys[k], value: gm[k]});
      const _keys = {};
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
            if(!_keys[k])
              _keys[k] = b.key;
        });
      });
      const ret = [];
      for(let k in gm)
        ret.push({key: _keys[k], value: gm[k]});
      return ret;
    }
  };
}

// https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
export function removeEmptyBins(sourceGroup) {
  return {
    all: () => {
      return sourceGroup.all().filter((d) => d.value != 0)
    },
    top: (n) => {
      return sourceGroup.top(Infinity)
        .filter((d) => d.value != 0)
        .slice(0, n);
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

export function joinKey(k) {
  return k.join(',')
}
export function splitKey(k) {
  return k.split(',')
}
export function multiKey(x, y) {
  return x + ',' + y;
}
export function extractName(dimension) {
  // FIXME: Replace if there is a better way
  return dimension.replace(/(\[)|(\D*\()|(\s)|(d\.)|(\))|(\])/g, '')
}
export function roundDecimalFormat(number, n) {
  const _pow = Math.pow(10,n) ;
  return Math.round(number * _pow) / _pow;
}