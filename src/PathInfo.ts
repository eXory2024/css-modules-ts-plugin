import type tsModule from "typescript/lib/tsserverlibrary"

export type PathInfo = {
	source: string
	vSource: tsModule.server.NormalizedPath
}
