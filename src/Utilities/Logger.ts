import Log, { ILog, LogLineType, LogSource } from "utilities/Log";

export let log = createLog();

let queuedMessages: Array<{
	logOrType: ILog | LogLineType;
	args: any[];
}> | undefined;

export function preConsoleCallback() {
	processQueuedMessages();
}

export function queueMessage(logOrType: ILog | LogLineType, args: any[]) {
	if (!queuedMessages) {
		queuedMessages = [];
	}

	queuedMessages.push({ logOrType, args });
}

export function discardQueuedMessages() {
	queuedMessages = undefined;
}

export function processQueuedMessages() {
	if (!queuedMessages) {
		return;
	}

	const messages = queuedMessages.slice();
	queuedMessages = undefined;

	for (const message of messages) {
		if (typeof (message.logOrType) === "object") {
			message.logOrType.info(...message.args);

		} else {
			const method = LogLineType[message.logOrType].toLowerCase();
			const func = (console as any)[method];
			if (func) {
				func(...message.args);
			}
		}
	}
}

export function createLog(...name: string[]) {
	const log = new Log();

	const sources: Array<LogSource | string> = ["MOD", "TARS"];

	if (name.length > 0) {
		sources.push(...name);
	}

	log.info = (...args: any[]) => {
		processQueuedMessages();
		Log.info(...sources)(...args);
	};

	log.warn = (...args: any[]) => {
		processQueuedMessages();
		Log.warn(...sources)(...args);
	};

	log.error = (...args: any[]) => {
		processQueuedMessages();
		Log.error(...sources)(...args);
	};

	log.trace = (...args: any[]) => {
		processQueuedMessages();
		Log.trace(...sources)(...args);
	};

	log.debug = (...args: any[]) => {
		processQueuedMessages();
		Log.debug(...sources)(...args);
	};

	return log;
}
