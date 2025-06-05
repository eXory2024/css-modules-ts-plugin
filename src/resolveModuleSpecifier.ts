import type tsModule from "typescript/lib/tsserverlibrary"
import type {Logger} from "./createLogger.js"
import path from "node:path"

export function resolveModuleSpecifier(
	ts: typeof tsModule,
	compilerOptions: tsModule.CompilerOptions,
	logger: Logger,
	moduleSpecifier: string,
	containingFile: string,
	failedLookupLocations: string[]
): tsModule.ResolvedModuleWithFailedLookupLocations {
	// only consider module specifiers that end in .css
	if (!moduleSpecifier.endsWith(".css")) {
		return {
			resolvedModule: undefined
		}
	}

	// we know moduleSpecifier ends with ".css" here
	const extensionlessModuleSpecifier = moduleSpecifier.slice(0, -4)

	logger.log(
		`resolveModuleSpecifier: trying to resolve '${moduleSpecifier}' within file '${containingFile}'`
	)

	// relative imports can be easily mapped
	if (moduleSpecifier.startsWith("./")) {
		const parentDir = path.dirname(containingFile)

		const resolvedFileName = path.join(
			parentDir, `${extensionlessModuleSpecifier}.d.css.ts`
		)

		logger.log(`'${moduleSpecifier}' resolved to '${resolvedFileName}'`)

		return {
			resolvedModule: {
				resolvedFileName,
				extension: ts.Extension.Dts,
				isExternalLibraryImport: false
			}
		}
	}

	return {
		resolvedModule: undefined
	}
}
