import type {FSWatcher} from "chokidar"
import type {JobRunner} from "./createJobRunner"

export type ProjectContext = {
	jobRunner: JobRunner
	chokidarInstance: FSWatcher
}
