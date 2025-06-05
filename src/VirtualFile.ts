import type tsModule from "typescript/lib/tsserverlibrary"

export type VirtualFile = {
	normalizedTSServerPath: tsModule.server.NormalizedPath
	sourceFilePath: string
}
