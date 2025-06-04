import type {FSWatcher} from "chokidar"
import type {JobRunner} from "./createJobRunner"

export type ProjectContext = {
	isResetting: boolean
	projectRoot: string
	tsconfigPath: string
	jobRunner: JobRunner
	chokidarInstance: FSWatcher|undefined
}
