import type {ProjectContext} from "./ProjectContext.js"
import type {FSWatcher} from "chokidar"
import type {VirtualFile} from "./VirtualFile.js"

export type PathInfo = {
	cssSourcePath: VirtualFile["sourceFilePath"]
	normalizedTSServerPath: VirtualFile["normalizedTSServerPath"]
}

export function setupChokidarInstance(
	project: ProjectContext,
	instance: FSWatcher
) {
	project.logger.log(`setting up chokidar instance`)

	instance.on("add", x => {
		const t = transformPath(x)

		if (!t) return
	})

	instance.on("change", x => {
		const t = transformPath(x)

		if (!t) return
	})

	instance.on("unlink", x => {
		const t = transformPath(x)

		if (!t) return
	})

	function transformPath(path: string): false|PathInfo {
		if (!path.endsWith(".css")) {
			return false
		}

		if (project.state !== "initialized") {
			project.logger.log(
				`warning: chokidar event handler called on uninitialized project. ignoring.`
			)

			return false
		}

		return {
			cssSourcePath: path,
			normalizedTSServerPath: project.internal.ts.server.toNormalizedPath(
				path.slice(0, -4) + ".d.css.ts"
			)
		}
	}
}
