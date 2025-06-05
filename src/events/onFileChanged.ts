import type {ProjectContext} from "../ProjectContext.js"
import type {PathInfo} from "../setupChokidarInstance.js"
import {generateCSSDeclarationCodeForFile} from "../util/css/generateCSSDeclarationCodeForFile.js"

export function onFileChanged(
	project: ProjectContext,
	pathInfo: PathInfo
) {
	project.logger.log(`chokidar:changed ${pathInfo.cssSourcePath}`)

	if (project.virtualFiles.has(pathInfo.normalizedTSServerPath)) {
		project.logger.log(`updating virtual file`)

		const vFile = project.virtualFiles.get(pathInfo.normalizedTSServerPath)!

		vFile.tsScriptInfo.editContent(
			0,
			vFile.tsScriptInfo.getSnapshot().getLength(),
			generateCSSDeclarationCodeForFile(
				pathInfo.cssSourcePath,
				project.projectPackageJSONIndicatesESM
			)
		)

		vFile.tsScriptInfo.markContainingProjectsAsDirty()
		project.internal.info.project.refreshDiagnostics()
	}
}
