import type tsModule from "typescript/lib/tsserverlibrary"
import type {Logger} from "./createLogger.js"
import type {FSWatcher} from "chokidar"
import type {JobRunner} from "./createJobRunner"
import type {VirtualFile} from "./VirtualFile.js"

export type ProjectContext = {
	projectId: string
	logger: Logger

	internal: {
		ts: typeof tsModule
		info: tsModule.server.PluginCreateInfo
	}

	_isResetting: boolean
	projectRoot: string
	tsconfigPath: string
	jobRunner: JobRunner
	chokidarInstance: FSWatcher|undefined
	virtualFiles: Map<string, VirtualFile>
}
