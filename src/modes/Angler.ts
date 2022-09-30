
import type Context from "../core/context/Context";
import { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import { BaseMode } from "./BaseMode";
import Fish from "../objectives/other/tile/Fish";

/**
 * Fishing
 */
export class AnglerMode extends BaseMode implements ITarsMode {

	public async initialize(_: Context, finished: (success: boolean) => void) {
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		objectives.push(...await this.getBuildAnotherChestObjectives(context));

		objectives.push(new Fish());

		return objectives;
	}
}
