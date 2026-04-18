const fs = require('fs');
const xlsx = require('xlsx');

// Resolve paths
const path1 = '../TS-PS9-1.csv';
const path2 = '../TS-PS9-2.csv';
const outPath = './src/data/mockData.json';

// Create data directory
if (!fs.existsSync('./src/data')) {
  fs.mkdirSync('./src/data');
}

try {
  console.log('Reading file 1...', path1);
  const wb1 = xlsx.readFile(path1);
  const sheet1 = wb1.Sheets[wb1.SheetNames[0]];
  const data1 = xlsx.utils.sheet_to_json(sheet1);
  //console.log('File 1 data sample:', data1.slice(0, 2));

  console.log('Reading file 2...', path2);
  const wb2 = xlsx.readFile(path2);
  const sheet2 = wb2.Sheets[wb2.SheetNames[0]];
  const data2 = xlsx.utils.sheet_to_json(sheet2);
  //console.log('File 2 data sample:', data2.slice(0, 2));

  fs.writeFileSync(outPath, JSON.stringify({ dataset1: data1.slice(0, 1000), dataset2: data2.slice(0, 1000) }, null, 2));
  console.log('Wrote converted JSON data to', outPath);
} catch (e) {
  console.error('Error during conversion:', e);
}
