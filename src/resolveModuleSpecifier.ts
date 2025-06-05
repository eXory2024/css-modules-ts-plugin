import type tsModule from "typescript/lib/tsserverlibrary"
import type {Logger} from "./createLogger.js"
import path from "node:path"

export function resolveModuleSpecifier(
	ts: typeof tsModule,
	compilerOptions: tsModule.CompilerOptions,
	logger: Logger,
	moduleSpecifier: string,
	containingFile: string
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

	if (compilerOptions.paths) {
		// instead of trying to resolve paths on our own,
		// we use a synthetic file name instead and tell typescript that this fake file exists
		// we then use the "fake" resolved path and remove the synthetic file extension
		// adding .d.css.ts in its place
		const syntheticFileExtension = `__virtual_${Math.random().toString(32).slice(2)}.ts`

		const result = ts.resolveModuleName(
			`${extensionlessModuleSpecifier}${syntheticFileExtension}`,
			containingFile,
			compilerOptions,
			{
				...ts.sys,
				fileExists(fileName) {
					return fileName.endsWith(syntheticFileExtension)
				}
			}
		)

		if (result.resolvedModule) {
			const {resolvedFileName} = result.resolvedModule

			if (resolvedFileName.endsWith(syntheticFileExtension)) {
				const tmp = resolvedFileName.slice(0, -(syntheticFileExtension.length))

				logger.log(`resolved '${moduleSpecifier}' to '${tmp}.d.css.ts'`)

				return {
					resolvedModule: {
						resolvedFileName: `${tmp}.d.css.ts`,
						extension: ts.Extension.Dts,
						isExternalLibraryImport: false
					}
				}
			}
		}
	}

	return {
		resolvedModule: undefined
	}
}
