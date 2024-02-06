import { readFile, writeFile } from 'node:fs/promises';

const filesToCompare = {
	file1: './files/file1.csv',
	file2: './files/file2.csv',
};

const routeToNewFile = './files/diff.csv';

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
			if (id === '4141') console.log({ objLine });
			// Custom conditionals to filter the lines
			if (objLine['razon_social'] === 'CONTADO') continue;
			// const kindIdentifier = checkisCifOrNif(objLine['cif']);
			// console.log({ kindIdentifier });
			// if (kindIdentifier === 'none') continue;
			// else if (kindIdentifier === 'cif' && !isValidCif(objLine['cif']))
			// 	continue;
			// else if (kindIdentifier === 'nif' && !isValidNif(objLine['cif']))
			// 	continue;
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
	// console.log({ completeDiffLines });

	const result = [header.join(separador), ...diffArray].join('\r\n');
	await writeFile(routeToNewFile, result);
};

const checkisCifOrNif = (chain: string): 'cif' | 'nif' | 'none' => {
	const firstChar = chain[0];
	const lastChar = chain[chain.length - 1];
	if (firstChar === 'X' || firstChar === 'Y' || firstChar === 'Z')
		return 'nif';
	else if (isNaN(Number(lastChar))) return 'nif';
	else if (isNaN(Number(firstChar))) return 'cif';
	else return 'none';
};

const isValidCif = (cif: string): boolean => {
	let sum: number, control: number;
	const cifArray = cif.toUpperCase().split('');

	if (cifArray.length !== 9) {
		return false;
	}

	sum = parseInt(cifArray[2]) + parseInt(cifArray[4]) + parseInt(cifArray[6]);
	for (let n = 0; n < 4; n++) {
		sum +=
			((2 * parseInt(cifArray[2 * n])) % 10) +
			Math.floor((2 * parseInt(cifArray[2 * n])) / 10);
	}

	control = 10 - (sum % 10);
	if (['X', 'P'].includes(cifArray[0])) {
		// Control letter type
		return cifArray[8] === String.fromCharCode(64 + control);
	} else {
		// Control number type
		if (control === 10) control = 0;
		return parseInt(cifArray[8]) === control;
	}
};

const isValidNif = (nif: string): boolean => {
	const letter = 'TRWAGMYFPDXBNJZSQVHLCKE';
	const nifSanitized = nif.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
	if (nifSanitized.length ===  9 && !isNaN(Number(nifSanitized.slice(0,  8)))) {
	  let indice = parseInt(nifSanitized.slice(0,  8),  10) %  23;
	  return nifSanitized.charAt(8) === letter.charAt(indice);
	} else if (nifSanitized.startsWith('X')) {
	  const numerosExtranjero = nifSanitized.slice(1,  8);
	  if (!isNaN(Number(numerosExtranjero))) {
		let indice = parseInt(numerosExtranjero,  10) %  23;
		return nifSanitized.charAt(8) === letter.charAt(indice);
	  }
	}
  
	return false;
};

runScript();
