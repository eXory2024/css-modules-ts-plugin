import type tsModule from "typescript/lib/tsserverlibrary"
import type {Options} from "./Options.js"
import {createLogger} from "./createLogger.js"

const init: tsModule.server.PluginModuleFactory = ({typescript: ts}) => {
	function create(
		info: tsModule.server.PluginCreateInfo,
	): tsModule.LanguageService {
		const languageServiceHost = {} as Partial<tsModule.LanguageServiceHost>

		const languageServiceHostProxy = new Proxy(info.languageServiceHost, {
			get(target, key: keyof tsModule.LanguageServiceHost) {
				return languageServiceHost[key] ? languageServiceHost[key] : target[key]
			}
		})

		const languageService = ts.createLanguageService(languageServiceHostProxy)
		const logger = createLogger(info)
		const directory = info.project.getCurrentDirectory()
		const compilerOptions = info.project.getCompilerOptions()

		// TypeScript plugins have a `cwd` of `/`, which causes issues with import resolution.
		process.chdir(directory)

		// User options for plugin.
		const pluginOptions: Options = (info.config as {options?: Options}).options ?? {}

		logger.log(`compiler options: ${JSON.stringify(compilerOptions)}`)
		logger.log(`options: ${JSON.stringify(pluginOptions)}`)

		//languageServiceHost.getScriptSnapshot = (fileName) => {
		//	return info.languageServiceHost.getScriptSnapshot(fileName);
		//}

		return languageService
	}

	return {create}
}

export = init
