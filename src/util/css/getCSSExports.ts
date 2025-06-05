import {getProcessor} from "./getProcessor.js"
import {extractICSS} from "icss-utils"

type CSSExport = {
	className: string
}

const processor = getProcessor()

export function getCSSExports(
	code: string,
	fileName: string
): CSSExport[] {
	const processedCss = processor.process(code, {
		from: fileName,
		map: {
			inline: false
		}
	})

	const classNames = extractICSS(processedCss.root).icssExports
	const cssExports: CSSExport[] = []

	for (const className in classNames) {
		cssExports.push({
			className
		})
	}

	return cssExports
}
