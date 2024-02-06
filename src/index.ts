import { readFile, writeFile } from 'node:fs/promises';

const filesToCompare = {
	file1: './files/file1.csv',
	file2: './files/file2.csv',
};

const runScript = async () => {
	const separador = '\t';
	const [file1Readed, file2Readed] = await Promise.all([
		readFile(filesToCompare.file1, { encoding: 'utf8' }),
		readFile(filesToCompare.file2, { encoding: 'utf8' }),
	]);
	const file1Lines = file1Readed
		.replaceAll('\r', '')
		.split('\n')
		.filter((linea) => linea !== '');
	const file2Lines = file2Readed
		.replaceAll('\r', '')
		.split('\n')
		.filter((linea) => linea !== '');
	// Get the header of the files
	const header = file1Lines[0].split(separador);
	const objFiles: Record<string, { value: string; counter: number }> = {};
	const diffLines: Record<string, string> = {};
	const completeDiffLines: Record<string, object> = {};
	for (let file of [file1Lines, file2Lines]) {
		for (let line of file) {
			const arrayLine = line.split(separador);
			const objLine: Record<string, string> = {};
			for (let i = 0; i < arrayLine.length; i++) {
				objLine[header[i]] = arrayLine[i];
			}
			const id = objLine['id'];
			// if the id is not present or is the header, continue
			if (!id || id === 'id') continue;

			// Custom conditionals to filter the lines
			if (objLine['razon_social'] === 'CONTADO') continue;
			// if (!isValidCif(objLine['cif'])) continue;

			// add or remove the line from the object
			const element = objFiles[id];
			if (element) {
				delete diffLines[id];
				delete completeDiffLines[id];
				element.counter++;
			} else {
				objFiles[id] = { value: line, counter: 1 };
				diffLines[id] = line;
				completeDiffLines[id] = objLine;
			}
		}
	}
	const diffArray: string[] = Object.values(diffLines);
	console.log({
		diffLines,
		lenght: Object.keys(diffLines).length,
		diffArray,
	});
	console.log({ completeDiffLines });

	const result = [header.join(separador), ...diffArray].join('\r\n');
	await writeFile('./files/diff.csv', result);
};

const isValidCif = (cif: string): boolean => {
	cif = cif.toUpperCase();
 if (cif.length !== 9) {
    return false;
 }
 let suma = parseInt(cif[2]) + parseInt(cif[4]) + parseInt(cif[6]);
 let multiplicadores = [2, 1, 2, 1, 2, 1, 2];
 for (let i = 0; i < 7; i++) {
    suma += parseInt(cif[2 * i + 1]) * multiplicadores[i];
 }
 let digitoControl = 10 - (suma % 10);
 if (digitoControl === 10) {
    digitoControl = 0;
 }
 console.log({cif, digitoControl});
 return cif[8] === (cif[0] === 'X' ? '0' : String(digitoControl));
};

runScript();
