import type tsModule from "typescript/lib/tsserverlibrary"

export type Logger = {
	log: (message: string) => void
	error: (error: unknown) => void
}

export const createLogger = (
	info: tsModule.server.PluginCreateInfo,
	label: string = ""
): Logger => {
	const log = (message: string) => {
		info.project.projectService.logger.info(
			`[css-modules-ts-plugin${label}] ${message}`
		)
	}

	const error = (error: unknown) => {
		log(`Failed with error: ${error as string}`)
	}

	return {log, error}
}
