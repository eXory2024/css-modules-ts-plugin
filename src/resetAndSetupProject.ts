import type {ProjectContext} from "./ProjectContext.js"

export async function resetAndSetupProject(
	project: ProjectContext
): Promise<undefined> {
	project.logger.log(`resetAndSetupProject called`)

	if (project.chokidarInstance !== undefined) {
		project.logger.log(`chokidar instance needs to be destroyed`)
	}
}
