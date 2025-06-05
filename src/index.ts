import type tsModule from "typescript/lib/tsserverlibrary"
import type {Options} from "./Options.js"
import type {ProjectContext} from "./ProjectContext.js"
import {createLogger} from "./createLogger.js"
import {createJobRunner} from "./createJobRunner.js"
import {sha256Sync} from "./util/sha256Sync.js"
import {resetAndSetupProject} from "./resetAndSetupProject.js"
import {resolveModuleSpecifier} from "./resolveModuleSpecifier.js"

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

			projectContextMap.set(projectName, {
				state: "initial",
				projectId,
				logger: projectLogger,
				internal: {ts, info},
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
			...rest
		) => {
			const resolvedModules = resolveModuleNameLiterals(
				moduleLiterals, containingFile, ...rest
			)

			return moduleLiterals.map((moduleLiteral, index) => {
				const result = resolvedModules[index]

				if (result.resolvedModule) {
					return result
				}

				// use our own module resolution if typescript's module resolution failed
				const moduleSpecifier = moduleLiteral.text

				let failedLookupLocations: string[] = []

				// An array of paths TypeScript searched for the module. All include .ts, .tsx, .d.ts, or .json extensions.
				// NOTE: TypeScript doesn't expose this in their interfaces, which is why the type is unknown.
				// https://github.com/microsoft/TypeScript/issues/28770
				if ("failedLookupLocations" in result) {
					failedLookupLocations = result.failedLookupLocations as any
				}

				return resolveModuleSpecifier(
					ts,
					mainLogger,
					moduleSpecifier,
					containingFile,
					failedLookupLocations
				)
			})
		}

		/*
		const originalFileExists = info.languageServiceHost.fileExists.bind(
			info.languageServiceHost
		)

		// tell language server that the virtual files exists
		info.languageServiceHost.fileExists = (path) => {
			// this doesn't work currently:
			// don't know how to make typescript re-trigger fileExists

			// // project not yet initialized, return default
			// if (projectContext.state !== "initialized") {
			// 	mainLogger.log(`fileExists ${path} project not initialized (yet)`)
			//
			// 	return originalFileExists(path)
			// }
			//
			// const result = originalFileExists(path) || projectContext.virtualFiles.has(path)
			//
			// mainLogger.log(`fileExists ${path}: ${result}`)
			//
			// return result

			return originalFileExists(path)// || path.endsWith(".d.css.ts")
		}
		*/

		return proxy
	}

	return {create}
}

export = init
