import type tsModule from "typescript/lib/tsserverlibrary"
import type {Options} from "./Options.js"
import type {ProjectContext} from "./ProjectContext.js"
import {createLogger} from "./createLogger.js"
import {createJobRunner} from "./createJobRunner.js"
import {sha256Sync} from "./util/sha256Sync.js"

function calcProjectId(projectName: string): string {
	const hash = sha256Sync(projectName)

	return hash.slice(0, 4) + hash.slice(-4)
}

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
		const mainLogger = createLogger(info)

		// User options for plugin.
		const pluginOptions: Options = (info.config as {options?: Options}).options ?? {}

		mainLogger.log(`compiler options: ${JSON.stringify(compilerOptions)}`)
		mainLogger.log(`options: ${JSON.stringify(pluginOptions)}`)

		const projectName = info.project.getProjectName()

		//
		// this portion of the code will only run once per project
		//
		const createProjectContext = !projectContextMap.has(projectName)

		if (createProjectContext) {
			const projectId = calcProjectId(projectName)
			const projectLogger = createLogger(info, ` project: ${projectId}`)

			mainLogger.log(`initializing context for project '${projectName}' (has id ${projectId})`)

			projectContextMap.set(projectName, {
				projectId,
				internal: {ts, info, logger: projectLogger},
				_isResetting: false,
				projectRoot: compilerOptions.rootDir!,
				// projectName should be path to tsconfig.json
				tsconfigPath: projectName,
				chokidarInstance: undefined,
				jobRunner: createJobRunner(projectLogger),
				virtualFiles: new Map()
			})
		}

		const projectContext = projectContextMap.get(projectName)!

		// overwrite internal object just to be sure they are up to date
		projectContext.internal.ts = ts
		projectContext.internal.info = info

		return proxy
	}

	return {create}
}

export = init
