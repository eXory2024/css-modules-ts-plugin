import type tsModule from "typescript/lib/tsserverlibrary"

export type VirtualFile = {
	source: string
	vSource: tsModule.server.NormalizedPath
}
