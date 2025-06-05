import type tsModule from "typescript/lib/tsserverlibrary"
import type {Options} from "./Options.js"
import type {ProjectContext} from "./ProjectContext.js"
import {createLogger} from "./createLogger.js"
import {createJobRunner} from "./createJobRunner.js"
import {sha256Sync} from "./util/sha256Sync.js"
import {resetAndSetupProject} from "./resetAndSetupProject.js"
import {resolveModuleSpecifier} from "./resolveModuleSpecifier.js"
import fs from "node:fs"
import path from "node:path"

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

			mainLogger.log(
				`initializing context for project '${projectName}' (has id ${projectId})` +
				` for the very first time.`
			)

			let projectPackageJSONIndicatesESM = false

			const projectPackageJSON = JSON.parse(
				fs.readFileSync(
					path.join(compilerOptions.rootDir!, "package.json")
				).toString()
			)

			if ("type" in projectPackageJSON) {
				projectPackageJSONIndicatesESM = projectPackageJSON.type === "module"
			}

			mainLogger.log(`project's package.json indicates ESM? ${projectPackageJSONIndicatesESM}`)

			projectContextMap.set(projectName, {
				state: "initial",
				projectId,
				logger: projectLogger,
				internal: {ts, info},
				projectRoot: compilerOptions.rootDir!,
				projectPackageJSONIndicatesESM,
				// projectName should be path to tsconfig.json
				tsconfigPath: projectName,
				chokidarInstance: undefined,
				jobRunner: createJobRunner(projectLogger),
				virtualFiles: new Map()
			})
		}

		const projectContext = projectContextMap.get(projectName)!

		// overwrite internal object just to be sure they are up to date
		projectContext.internal = {ts, info}

		// reset and setup project
		// NB: this is done in a "jobRunner" because closing a chokidar instance is asynchronous
		projectContext.jobRunner.runJob(async () => {
			await resetAndSetupProject(projectContext)

			return undefined
		})

		//
		// hook into typescript's module resolution and map .css imports to .d.css.ts
		//
		const resolveModuleNameLiterals = info.languageServiceHost.resolveModuleNameLiterals!.bind(
			info.languageServiceHost
		)

		info.languageServiceHost.resolveModuleNameLiterals = (
			moduleLiterals,
			containingFile,
			redirectedReference,
			compilerOptions,
			...rest
		) => {
			const resolvedModules = resolveModuleNameLiterals(
				moduleLiterals,
				containingFile,
				redirectedReference,
				compilerOptions,
				...rest
			)

			return moduleLiterals.map((moduleLiteral, index) => {
				const result = resolvedModules[index]

				// if typescript was able to resolve the import use that
				if (result.resolvedModule) {
					return result
				}

				// use our own module resolution if typescript's module resolution failed
				const moduleSpecifier = moduleLiteral.text

				return resolveModuleSpecifier(
					ts,
					compilerOptions,
					mainLogger,
					moduleSpecifier,
					containingFile
				)
			})
		}

		return proxy
	}

	return {create}
}

export = init
