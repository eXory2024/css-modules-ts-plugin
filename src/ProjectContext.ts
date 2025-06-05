import type tsModule from "typescript/lib/tsserverlibrary"
import type {Logger} from "./createLogger.js"
import type {FSWatcher} from "chokidar"
import type {JobRunner} from "./createJobRunner"
import type {VirtualFile} from "./VirtualFile.js"

export type ProjectContext = {
	state: "initial" | "resetting" | "initialized"

	projectId: string
	logger: Logger

	// here so we don't have to always pass this around ...
	internal: {
		ts: typeof tsModule
		info: tsModule.server.PluginCreateInfo
	}

	projectRoot: string
	projectPackageJSONIndicatesESM: boolean
	tsconfigPath: string
	jobRunner: JobRunner
	chokidarInstance: FSWatcher|undefined
	virtualFiles: Map<string, VirtualFile>
}
