import type {ProjectContext} from "./ProjectContext.js"

export async function resetAndSetupProject(
	project: ProjectContext
): Promise<undefined> {
	project.logger.log(`resetAndSetupProject called`)

	if (project.state === "initialized") {
		project.logger.log(`project context needs to be destroyed`)

		if (project.chokidarInstance === undefined) {
			throw new Error(`project.chokidarInstance must not be undefined here.`)
		}

		project.logger.log(`closing chokidar instance`)
		await project.chokidarInstance.close()

		project.chokidarInstance = undefined
		project.state = "initial"
	}
}
