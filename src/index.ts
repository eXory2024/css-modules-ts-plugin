import type tsModule from "typescript/lib/tsserverlibrary"
import type {Options} from "./Options.js"
import type {ProjectContext} from "./ProjectContext.js"
import {createLogger} from "./createLogger.js"
import {createJobRunner} from "./createJobRunner.js"

const projectContextMap: Map<string, ProjectContext> = new Map()

const init: tsModule.server.PluginModuleFactory = ({typescript: ts}) => {
	function create(info: tsModule.server.PluginCreateInfo) {
		// Set up decorator object
		const proxy: tsModule.LanguageService = Object.create(null)

		for (let k of Object.keys(info.languageService) as Array<keyof tsModule.LanguageService>) {
			const x = info.languageService[k]!
			// @ts-expect-error - JS runtime trickery which is tricky to type tersely
			proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
		}

		const compilerOptions = info.project.getCompilerOptions()
		const logger = createLogger(info)

		// User options for plugin.
		const pluginOptions: Options = (info.config as {options?: Options}).options ?? {}

		logger.log(`compiler options: ${JSON.stringify(compilerOptions)}`)
		logger.log(`options: ${JSON.stringify(pluginOptions)}`)

		const projectName = info.project.getProjectName()

		//
		// this portion of the code will only run once per project
		//
		const createProjectContext = !projectContextMap.has(projectName)

		if (createProjectContext) {
			logger.log(`initializing context for project '${projectName}'`)

			projectContextMap.set(projectName, {
				isResetting: false,
				projectRoot: compilerOptions.rootDir!,
				// projectName should be path to tsconfig.json
				tsconfigPath: projectName,
				chokidarInstance: undefined,
				jobRunner: createJobRunner(logger),
				openedClientFiles: new Map()
			})
		}

		const projectContext = projectContextMap.get(projectName)!

		return proxy
	}

	return {create}
}

export = init
