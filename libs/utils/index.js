
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
// See: https://github.com/dc-js/dc.js/wiki/FAQ#combine-groups
export function combineGroups(groups) {
  return {
      all: function() {
        const alls = groups.map((g) => g.all());
        const gm = {};
        alls.forEach((a, i) => {
          a.forEach((b) => {
            if(!gm[b.key]) {
              gm[b.key] = new Array(groups.length);
              for(let j=0; j<groups.length; ++j)
                gm[b.key][j] = 0;
            }
            gm[b.key][i] = b.value;
          });
        });
      const ret = [];
      for(let k in gm)
        ret.push({key: k, value: gm[k]});
      return ret;
    }
  };
}
// See: https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
//      https://github.com/dc-js/dc.js/wiki/FAQ#-but-i-need-top
export function removeEmptyAndFilterBins(group, topN) {
  function nonZeroPred(d) {
    return d.value != 0;
  }
  function sortByValue(a, b) {
    return b.value - a.value
  }
  return {
    all: () => {
      if(!topN) {
        const topN = group.all().length
      }
      return group.all()
        .filter(nonZeroPred)
        .sort(sortByValue)
        .slice(0, topN);
    }
  };
}
export function removeEmptyAndFilterBinsForCombinedGroup(combinedGroup, topN) {
  function valueSum(d) {
    return d.value.reduce((previous, current) => previous + current)
  }
  function nonZeroPred(d) {
    return valueSum(d) != 0
  }
  function sortByValueSum(a, b) {
    return valueSum(b) - valueSum(a)
  }
  return {
    all: () => {
      if(!topN) {
        const topN = combinedGroup.all().length
      }
      return combinedGroup.all()
        .filter(nonZeroPred)
        .sort(sortByValueSum)
        .slice(0, topN);
    }
  };
}
