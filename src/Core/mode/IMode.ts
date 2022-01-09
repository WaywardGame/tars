import type Context from "../context/Context";
import type { IObjective } from "../objective/IObjective";

export interface ITarsMode {
	initialize?(context: Context, finished: (success: boolean) => void): Promise<void>;

	dispose?(context: Context): void;

	determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;

	getInterrupts?(context: Context): Promise<Array<IObjective | IObjective[] | undefined>>;
}
