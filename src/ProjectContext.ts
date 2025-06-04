import type tsModule from "typescript/lib/tsserverlibrary"
import type {FSWatcher} from "chokidar"
import type {JobRunner} from "./createJobRunner"

export type ProjectContext = {
	internal: {
		ts: typeof tsModule
		info: tsModule.server.PluginCreateInfo
	}

	isResetting: boolean
	projectRoot: string
	tsconfigPath: string
	jobRunner: JobRunner
	chokidarInstance: FSWatcher|undefined
	openedClientFiles: Map<string, undefined>
}
