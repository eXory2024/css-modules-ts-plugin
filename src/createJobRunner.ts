import type {Logger} from "./createLogger.js"

type JobFunction = () => Promise<undefined>

type JobRunnerInternal = {
	jobCurrentlyRunning: boolean
	nextJob: JobFunction|undefined
}

export type JobRunner = {
	runJob: (jobFn: JobFunction) => void
}

export function createJobRunner(
	logger: Logger
): JobRunner {
	const internal: JobRunnerInternal = {
		jobCurrentlyRunning: false,
		nextJob: undefined
	}

	const instance: JobRunner = {
		runJob(jobFn) {
			if (internal.jobCurrentlyRunning) {
				logger.log(`job is currently running, setting nextJob`)

				internal.nextJob = jobFn

				return
			}

			logger.log(`running a job`)

			internal.jobCurrentlyRunning = true

			Promise.resolve().then(() => {
				return jobFn()
			}).then(() => {
				const nextJob = internal.nextJob

				logger.log(`job is done, has next job? ${(!!nextJob ? "yes" : "no")}`)

				internal.jobCurrentlyRunning = false
				internal.nextJob = undefined

				if (nextJob) {
					setTimeout(() => {
						instance.runJob(nextJob)
					}, 0)
				}
			})
		}
	}

	return instance
}
