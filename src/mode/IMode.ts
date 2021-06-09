import Context from "../Context";
import { IObjective } from "../IObjective";

export interface ITarsMode {
	initialize?(context: Context, finished: () => void): Promise<void>;

	dispose?(context: Context): Promise<void>;

	determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;

	getInterrupts?(context: Context): Promise<Array<IObjective | IObjective[] | undefined>>;
}
