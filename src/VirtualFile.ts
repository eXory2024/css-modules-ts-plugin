import type tsModule from "typescript/lib/tsserverlibrary"

export type VirtualFile = {
	tsScriptInfo: tsModule.server.ScriptInfo

	//
	// path of the virtual .d.css.ts file
	//
	normalizedTSServerPath: tsModule.server.NormalizedPath

	//
	// path to the .css source file represented by this virtual file
	//
	sourceFilePath: string
}
