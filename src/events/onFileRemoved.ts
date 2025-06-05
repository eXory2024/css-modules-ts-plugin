import type {ProjectContext} from "../ProjectContext.js"
import type {PathInfo} from "../setupChokidarInstance.js"

export function onFileRemoved(
	project: ProjectContext,
	pathInfo: PathInfo
) {
	project.logger.log(`chokidar:removed ${pathInfo.cssSourcePath}`)

	if (project.virtualFiles.has(pathInfo.normalizedTSServerPath)) {
		project.logger.log(`removing single virtual file`)

		const vFile = project.virtualFiles.get(
			pathInfo.normalizedTSServerPath
		)!

		// not sure what the correct order is here ...
		// or if .closeClientFile() would be enough
		vFile.tsScriptInfo.close()
		vFile.tsScriptInfo.detachAllProjects()

		project.virtualFiles.delete(pathInfo.normalizedTSServerPath)
	}
}
