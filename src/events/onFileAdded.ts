import type {ProjectContext} from "../ProjectContext.js"
import type {PathInfo} from "../setupChokidarInstance.js"

export function onFileAdded(
	project: ProjectContext,
	pathInfo: PathInfo
) {
	project.logger.log(`chokidar:added ${pathInfo.cssSourcePath}`)
}
