import type {ProjectContext} from "../ProjectContext.js"
import path from "node:path"

export function getDirectoriesToWatch(project: ProjectContext): string[] {
	const {ts} = project.internal

	const config = ts.readConfigFile(
		project.tsconfigPath,
		ts.sys.readFile
	)

	if (config.error) {
		project.logger.error(new Error(`Unable to read tsconfig.json file`))

		return []
	}

	const parsedConfig = ts.parseJsonConfigFileContent(
		config.config,
		ts.sys,
		path.dirname(project.tsconfigPath)
	)

	// todo: investigate if compilerOptions.rootDir is
	// part of wildcardDirectories or not

	return Object.keys(parsedConfig.wildcardDirectories ?? {})
}
