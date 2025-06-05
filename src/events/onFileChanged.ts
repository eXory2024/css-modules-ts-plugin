import type {ProjectContext} from "../ProjectContext.js"
import type {PathInfo} from "../setupChokidarInstance.js"

export function onFileChanged(
	project: ProjectContext,
	pathInfo: PathInfo
) {
	project.logger.log(`chokidar:changed ${pathInfo.cssSourcePath}`)
}
