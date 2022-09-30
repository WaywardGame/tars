import type { ILog, LogSource } from "utilities/Log";
import Log, { LogLineType } from "utilities/Log";
import { Bound } from "utilities/Decorators";

export const logSourceName = "TARS";

export class LoggerUtilities {
	private queuedMessages: Array<{
		logOrType: ILog | LogLineType;
		args: any[];
	}> | undefined;

	public logSources: string[];
	public readonly log: Log;

	constructor(private readonly tarsInstanceName: () => string) {
		this.reloadLogSources();
		this.log = this.createLog();
	}

	public reloadLogSources() {
		this.logSources = ["MOD", logSourceName, this.tarsInstanceName()];
	}

	@Bound
	public preConsoleCallback() {
		this.processQueuedMessages();
	}

	public queueMessage(logOrType: ILog | LogLineType, args: any[]) {
		if (!this.queuedMessages) {
			this.queuedMessages = [];
		}

		this.queuedMessages.push({ logOrType, args });
	}

	public discardQueuedMessages() {
		this.queuedMessages = undefined;
	}

	public processQueuedMessages() {
		if (!this.queuedMessages) {
			return;
		}

		const messages = this.queuedMessages.slice();
		this.queuedMessages = undefined;

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

	public createLog(...name: string[]): Log {
		const log = new Log();

		const sources: Array<LogSource | string> = [...this.logSources, ...name];

		log.info = (...args: any[]) => {
			this.processQueuedMessages();
			Log.info(...sources)(...args);
		};

		log.warn = (...args: any[]) => {
			this.processQueuedMessages();
			Log.warn(...sources)(...args);
		};

		log.error = (...args: any[]) => {
			this.processQueuedMessages();
			Log.error(...sources)(...args);
		};

		log.trace = (...args: any[]) => {
			this.processQueuedMessages();
			Log.trace(...sources)(...args);
		};

		log.debug = (...args: any[]) => {
			this.processQueuedMessages();
			Log.debug(...sources)(...args);
		};

		return log;
	}

}
