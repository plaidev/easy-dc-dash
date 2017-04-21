
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
    return new Function('d', 'return ' + rule)
  }

  else if (rule instanceof Array) {
    return (d) => {
      row = {}
      rule.forEach((k) => {
        row[k] = d[rule[k]]
      })
      return row
    }
  }

  else if (rule instanceof Object) {
    return (d) => {
      row = {}
      Object.keys(rule).forEach((k) => {
        row[k] = d[rule[k]]
      })
      return row
    }
  }

  return // else
}
