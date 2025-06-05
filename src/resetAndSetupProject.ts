import type {ProjectContext} from "./ProjectContext.js"

export async function resetAndSetupProject(
	project: ProjectContext
): Promise<undefined> {
	project.logger.log(`resetAndSetupProject called`)

	if (project.state === "initialized") {
		project.logger.log(`project context needs to be destroyed`)
	}
}
