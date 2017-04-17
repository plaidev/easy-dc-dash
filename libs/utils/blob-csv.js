
function findDataFromDatasets(name) {
  if (!window.datasets || window.datasets instanceof Array) return []
  const data = window.datasets.find((dataset) => (dataset.queryName === name));
  return data.content || [];
}

function convertArrayOfObjectsToCSV(args) {
  let result, ctr, keys, columnDelimiter, lineDelimiter;
  const {
    data,
    labels = {}
  } = args || {};

  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ',';
  lineDelimiter = args.lineDelimiter || '\n';
  keys = Object.keys(data[0]);
  result = '';
  result += keys.map((k) => labels[k] || k).join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    ctr = 0;
    keys.forEach(function(key) {
      if (ctr > 0) result += columnDelimiter;
      let v = item[key];
      if (item[key] instanceof Date) {
        v = item[key].toISOString();
      }
      result += `"${String(v).replace('"', '\\"')}"`;
      ctr++;
    });
    result += lineDelimiter;
  });
  return result;
}

export function downloadCSV(name_or_data, filename, labels) {

  let dat
  if (name_or_data instanceof Array) data = name_or_data;
  else data = findDataFromDatasets(name_or_data)

  const csvContent = convertArrayOfObjectsToCSV({data, labels})

  if (!csvContent) {
    console.log('dataset not found', name);
    return;
  }

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);

  const pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
}
