import Context from "../Context";
import { IObjective } from "../IObjective";

export interface ITarsMode {
	determineObjectives(context: Context, stop: () => void): Array<IObjective | IObjective[]>;

	getInterrupts?(context: Context): Array<IObjective | IObjective[] | undefined>;
}
