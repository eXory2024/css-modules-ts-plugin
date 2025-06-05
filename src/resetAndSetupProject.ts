import type {ProjectContext} from "./ProjectContext.js"
import {getDirectoriesToWatch} from "./util/getDirectoriesToWatch.js"
import chokidar from "chokidar"
import {setupChokidarInstance} from "./setupChokidarInstance.js"

export async function resetAndSetupProject(
	project: ProjectContext
): Promise<undefined> {
	project.logger.log(`resetAndSetupProject called`)

	if (project.state === "initialized") {
		project.state = "resetting"

		project.logger.log(`project context needs to be destroyed`)

		if (project.chokidarInstance === undefined) {
			throw new Error(`project.chokidarInstance must not be undefined here.`)
		}

		project.logger.log(`closing chokidar instance`)
		await project.chokidarInstance.close()

		project.logger.log(`closing virtual files`)
		for (const [_, vFile] of project.virtualFiles.entries()) {
			project.logger.log(`closing '${vFile.normalizedTSServerPath}'`)

			//project.internal.info.project.projectService.closeClientFile(
			//	vFile.tsScriptInfo.fileName
			//)

			// not sure what the correct order is here ...
			// or if .closeClientFile() would be enough
			vFile.tsScriptInfo.detachAllProjects()
			vFile.tsScriptInfo.close()
		}

		project.virtualFiles = new Map()
		project.chokidarInstance = undefined
		project.state = "initial"
	}

	if (project.state === "initial") {
		project.logger.log(`initializing project`)

		// todo: assert chokidarInstance=undefined, virtualFiles size = 0

		const dirsToWatch = getDirectoriesToWatch(project)

		for (const dir of dirsToWatch) {
			project.logger.log(`will be watching directory '${dir}'`)
		}

		const chokidarInstance = chokidar.watch(dirsToWatch)

		setupChokidarInstance(project, chokidarInstance)

		project.chokidarInstance = chokidarInstance
		project.state = "initialized"
	}
}
