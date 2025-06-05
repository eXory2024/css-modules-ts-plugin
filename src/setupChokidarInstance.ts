import type {ProjectContext} from "./ProjectContext.js"
import type {FSWatcher} from "chokidar"

export function setupChokidarInstance(
	project: ProjectContext,
	instance: FSWatcher
) {
	project.logger.log(`setting up chokidar instance`)
}
