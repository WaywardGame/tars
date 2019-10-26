import Log, { ILog, LogSource } from "utilities/Log";

export let log = createLog();

let nextMessage: { log: ILog; args: any[] } | undefined;

export function queueNextMessage(log: ILog, ...args: any[]) {
	nextMessage = { log, args };
}

export function discardNextMessage() {
	nextMessage = undefined;
}

export function processNextMessage() {
	if (nextMessage) {
		const message = nextMessage;
		nextMessage = undefined;

		message.log.info(...message.args);
	}
}

export function createLog(...name: string[]) {
	const log = new Log();

	const sources: Array<LogSource | string> = ["MOD", "TARS"];

	if (name.length > 0) {
		sources.push(...name);
	}

	log.info = (...args: any[]) => {
		processNextMessage();
		Log.info(...sources)(...args);
	};

	log.warn = (...args: any[]) => {
		processNextMessage();
		Log.warn(...sources)(...args);
	};

	log.error = (...args: any[]) => {
		processNextMessage();
		Log.error(...sources)(...args);
	};

	log.trace = (...args: any[]) => {
		processNextMessage();
		Log.trace(...sources)(...args);
	};

	log.debug = (...args: any[]) => {
		processNextMessage();
		Log.debug(...sources)(...args);
	};

	return log;
}
