import d3 from 'd3'


function convert(d, options={}) {
  const {
    intFields = [],
    floatFields = [],
    dateFields = [],
    dateFormat = '%Y-%m-%dT%H:%M:%S.%LZ',
    isUTC = true
  } = options;

  intFields.forEach((field) => {
    let i = parseInt(d[field]);
    if (Number.isNaN(i)) i = 0;
    d[field] = i;
  });

  floatFields.forEach((field) => {
    let i  = parseFloat(d[field])
    if (Number.isNaN(i)) i = 0;
    d[field] = i;
  });

  if (dateFormat && dateFields.length) {
    let _format = d3.time.format;
    if (isUTC) _format = _format.utc;
    const format = _format(dateFormat);

    dateFields.forEach((field) => {
      d[field] = format.parse(d[field])
    });
  }

  return d
}


export function loadCSV(csvFile, options={}) {
  const {labels} = options;
  const l = labels ? labels.split(','): [];
  return new Promise((resolve) => {
    d3.csv('./dataset.csv', (d) => convert(d, options), (content) => {
      const _labels = {};
      if (labels) {
        let idx = 0;
        Object.keys(content[0]).forEach((key) => {
          _labels[key] = l[idx++];
        })
      }
      resolve({content, labels: _labels})
    })
  })
}


export function loadMode(queryName, options={}) {
  const {labels} = options;
  const _labels = {};
  if (!window.datasets) return Promise.resolve([]);

  const data = window.datasets.filter((d) => { if (d) { return d.queryName == queryName;}; })[0];
  const content = data && data.content;
  if (!content) {
    console.log('WARN: dataset not found. dataset: ', queryName, ', window.datasets:', window.datasets)
    return Promise.resolve([]);
  }

  content.forEach((d) => convert(d, options));

  if (labels) {
    const l = labels ? labels.split(','): [];
    let idx = 0
    data.columns.forEach((column) => {
      _labels[column.name] = l[idx++]
    })
  }

  return Promise.resolve({content, labels: _labels})
}

