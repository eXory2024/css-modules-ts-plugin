import type {ProjectContext} from "./ProjectContext.js"

//
// this is not needed in the current implementation
// but it is here in case it is needed for some reason in the future
// NB: don't know if that's a good or correct way of doing things.
//
function refreshProjectHard(project: ProjectContext) {
	const {info} = project.internal

	const program = info.languageService.getProgram()

	if (!program) return

	for (const sourceFile of program.getSourceFiles()) {
		if (sourceFile.isDeclarationFile) continue

		const scriptInfo = info.project.getScriptInfo(sourceFile.fileName)

		if (!scriptInfo) continue

		scriptInfo.markContainingProjectsAsDirty()

		project.logger.log(`marked ${sourceFile.fileName} as dirty`)
	}

	info.project.updateGraph()
	info.project.refreshDiagnostics()
}
