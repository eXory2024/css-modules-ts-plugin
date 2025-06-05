import {getCSSExports} from "./getCSSExports.js"
import fs from "node:fs"

export function generateCSSDeclarationCodeForFile(
	srcFilePath: string,
	useESM: boolean
): string {
	const cssExports = getCSSExports(
		fs.readFileSync(srcFilePath).toString(),
		srcFilePath
	)

	let code = ``

	code += `declare const _defaultExport: {`

	for (const cssExport of cssExports) {
		code += `    ${JSON.stringify(cssExport.className)}: string,\n`
	}

	code += `}\n`

	if (useESM) {
		code += `export default _defaultExport\n`
	} else {
		code += `export = _defaultExport\n`
	}

	return code
}
