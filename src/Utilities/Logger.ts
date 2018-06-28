import Log from "utilities/Log";

let lastMessage: string;

let modLog: Log;

export function log(message: string, ...args: any[]) {
	if (lastMessage !== message) {
		lastMessage = message;
		
		args.unshift(message);

		modLog.info.apply(modLog, args);
	}
}

export function setLogger(logger: Log) {
	modLog = logger;
}
