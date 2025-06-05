import type {ProjectContext} from "../ProjectContext.js"
import type {PathInfo} from "../setupChokidarInstance.js"

export function onFileRemoved(
	project: ProjectContext,
	pathInfo: PathInfo
) {
	project.logger.log(`chokidar:removed ${pathInfo.cssSourcePath}`)
}
