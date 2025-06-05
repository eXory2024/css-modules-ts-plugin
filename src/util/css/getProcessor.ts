//
// source: https://github.com/mrmckeb/typescript-plugin-css-modules/blob/045fc08805a6e56663fc8a42225af46ff48f6e1e/src/helpers/getProcessor.ts
//
import postcss, {type AcceptedPlugin} from "postcss"
import Processor from "postcss/lib/processor"
import postcssLocalByDefault from "postcss-modules-local-by-default"
import postcssModulesScope from "postcss-modules-scope"
import postcssModulesExtractImports from "postcss-modules-extract-imports"

export const getProcessor = (
	additionalPlugins: AcceptedPlugin[] = []
): Processor => {
	return postcss([
		...additionalPlugins,
		postcssLocalByDefault(),
		postcssModulesExtractImports(),
		postcssModulesScope({
			generateScopedName: (name) => name
		})
	])
}
