import type Doodad from "game/doodad/Doodad";
import type { DoodadType} from "game/doodad/IDoodad";
import { DoodadTypeGroup } from "game/doodad/IDoodad";
import Vector2 from "utilities/math/Vector2";

import type Context from "../../../core/context/Context";
import type { BaseInfoKey} from "../../../core/ITars";
import { baseInfo } from "../../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import StartFire from "../../other/doodad/StartFire";

import AcquireBuildMoveToDoodad from "./AcquireBuildMoveToDoodad";

/**
 * Acquires, builds, and moves to a lit doodad
 * 
 * If no doodad that is able to provide fire exists and the build item isn't in the inventory, it will acquire a campfire and build it.
 * 
 * If the doodad exists, it will move to face the doodad and light it on fire if it's not already lit).
 */
export default class AcquireBuildMoveToFire extends Objective {

	constructor(private readonly baseInfoKey?: BaseInfoKey) {
		super();
	}

	public getIdentifier(): string {
		return "AcquireBuildMoveToFire";
	}

	public getStatus(): string | undefined {
		return `Acquiring fire`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectives: IObjective[] = [];

		let doodad: Doodad | undefined;
		let doodadTypeOrGroup: DoodadType | DoodadTypeGroup | undefined;

		if (this.baseInfoKey !== undefined) {
			doodad = context.base[this.baseInfoKey][0];
			if (!doodad) {
				doodadTypeOrGroup = baseInfo[this.baseInfoKey].doodadTypes![0];
			}

		} else {
			const position = context.getPosition();

			const doodadInfos = ([context.base.campfire, context.base.kiln, context.base.furnace]
				.map(doodads => {
					for (const doodad of doodads) {
						const description = doodad.description();
						if (!description) {
							return undefined;
						}

						return {
							doodad: doodad,
							providesFire: description.providesFire,
						};
					}
				})
				.filter(doodadInfo => doodadInfo !== undefined) as Array<{ doodad: Doodad; providesFire: boolean }>)
				// todo: make this use objective pipelines and move to easiest one?
				.sort((a, b) => Vector2.squaredDistance(position, a.doodad) - Vector2.squaredDistance(position, b.doodad));

			for (const doodadInfo of doodadInfos) {
				if (!doodad) {
					doodad = doodadInfo.doodad;
				}

				if (doodadInfo.providesFire) {
					doodad = doodadInfo.doodad;
					break;
				}
			}

			if (!doodad) {
				doodadTypeOrGroup = DoodadTypeGroup.LitCampfire;
			}
		}

		if (doodadTypeOrGroup !== undefined) {
			objectives.push(new AcquireBuildMoveToDoodad(doodadTypeOrGroup));
		}

		objectives.push(new StartFire(doodad));

		return objectives;
	}

}
