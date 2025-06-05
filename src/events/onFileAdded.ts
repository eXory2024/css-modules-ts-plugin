import type {ProjectContext} from "../ProjectContext.js"
import type {PathInfo} from "../setupChokidarInstance.js"
import {generateCSSDeclarationCodeForFile} from "../util/css/generateCSSDeclarationCodeForFile.js"

export function onFileAdded(
	project: ProjectContext,
	pathInfo: PathInfo
) {
	const {ts, info} = project.internal

	project.logger.log(`chokidar:added ${pathInfo.cssSourcePath}`)

	//
	// create and open the virtual d.css.ts file
	//
	const tsScriptInfo = info.project.projectService.getOrCreateScriptInfoForNormalizedPath(
		pathInfo.normalizedTSServerPath,
		true,
		// NB: needs to be a module
		// todo: init with class names from css file
		generateCSSDeclarationCodeForFile(pathInfo.cssSourcePath),
		ts.ScriptKind.TS,
		false
	)

	if (!tsScriptInfo) {
		project.logger.log(`warning tsScriptInfo is undefined!`)

		return
	}

	project.logger.log(`adding to virtual files`)

	project.virtualFiles.set(pathInfo.normalizedTSServerPath, {
		sourceFilePath: pathInfo.cssSourcePath,
		normalizedTSServerPath: pathInfo.normalizedTSServerPath,
		tsScriptInfo
	})

	tsScriptInfo.attachToProject(info.project)
	tsScriptInfo.markContainingProjectsAsDirty()

//	info.project.updateGraph()
	info.project.refreshDiagnostics()
}
