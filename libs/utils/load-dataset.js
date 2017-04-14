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

  let _format = d3.time.format;
  if (isUTC) _format = _format.utc;
  const format = _format(dateFormat);

  dateFields.forEach((field) => {
    d[field] = format.parse(d[field])
  });

  return d
}


export function loadCSV(csvFile, options) {
  return new Promise((resolve) => {
    d3.csv('./dataset.csv', (d) => convert(d, options), resolve)
  })
}


export function loadMode(queryName, options) {
  if (!window.datasets) return cb([]);

  const data = window.datasets.filter((d) => { if (d) { return d.queryName == queryName;}; })[0];
  const content = data && data.content;
  if (!content) return cb([]);

  content.forEach((d) => convert(d, options));

  return Promise.resolve(content)
}

