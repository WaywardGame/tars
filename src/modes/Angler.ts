import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import { BaseMode } from "./BaseMode";

/**
 * Fishing
 */
export class AnglerMode extends BaseMode implements ITarsMode {

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		objectives.push(...await this.getBuildAnotherChestObjectives(context));

		const { Fish } = context.objectives;
		objectives.push(new Fish());

		return objectives;
	}
}
