import { EquipType } from "@wayward/game/game/entity/IHuman";
import { TurnMode } from "@wayward/game/game/IGame";

import type Context from "../core/context/Context";
import type { ITarsMode } from "../core/mode/IMode";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";

/**
 * DUNDUN DUN DUNDUN
 */
export class TerminatorMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		const { EquipItem, AcquireInventoryItem, HuntCreatures, MoveToBase, OrganizeInventory, Lambda, Idle } = context.objectives;

		objectives.push(new AcquireInventoryItem("knife"));

		if (!context.options.lockEquipment) {
			objectives.push([new AcquireInventoryItem("equipSword"), new EquipItem(EquipType.MainHand)]);
			objectives.push([new AcquireInventoryItem("equipShield"), new EquipItem(EquipType.OffHand)]);
		}

		const creatures = context.utilities.object.findHuntableCreatures(context, "Terminator", { onlyHostile: true });
		if (creatures.length > 0) {
			objectives.push(new HuntCreatures(creatures));
		}

		objectives.push(new MoveToBase());

		objectives.push(new OrganizeInventory());

		if (!multiplayer.isConnected) {
			if (game.getTurnMode() !== TurnMode.RealTime) {
				objectives.push(new Lambda(async () => {
					this.finished(true);
					return ObjectiveResult.Complete;
				}));

			} else {
				objectives.push(new Idle());
			}
		}

		return objectives;
	}
}
