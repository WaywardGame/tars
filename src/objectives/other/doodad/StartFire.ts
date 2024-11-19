import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import StartFireAction from "@wayward/game/game/entity/action/actions/StartFire";
import type Item from "@wayward/game/game/item/Item";
import { TileEventType } from "@wayward/game/game/tile/ITileEvent";

import { ReserveType } from "../../../core/ITars";
import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";

export default class StartFire extends Objective {

	constructor(private readonly doodad?: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StartFire:${this.doodad}`;
	}

	public getStatus(): string | undefined {
		return `Starting a fire for ${this.doodad?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodad = this.doodad ?? context.getData(ContextDataType.LastBuiltDoodad);
		if (!doodad) {
			this.log.error("Invalid doodad");
			return ObjectiveResult.Restart;
		}

		const objectives: IObjective[] = [];

		const description = doodad.description;
		if (description?.lit === undefined || description.providesFire) {
			// it's already lit
			objectives.push(new MoveToTarget(doodad, true));

		} else {
			if (context.island.tileEvents.getFromTile(doodad.tile, TileEventType.Fire)) {
				this.log.warn("Doodad already on fire?");
				return ObjectiveResult.Impossible;
			}

			const kindlingDataKey = this.getUniqueContextDataKey("Kindling");
			const tinderDataKey = this.getUniqueContextDataKey("Tinder");

			objectives.push(new AcquireInventoryItem("fireKindling", { skipHardReservedItems: true, reserveType: ReserveType.Hard }).setContextDataKey(kindlingDataKey));
			objectives.push(new AcquireInventoryItem("fireTinder", { skipHardReservedItems: true, reserveType: ReserveType.Hard }).setContextDataKey(tinderDataKey));
			objectives.push(new AcquireInventoryItem("fireStarter"));

			objectives.push(new MoveToTarget(doodad, true));

			objectives.push(new ExecuteAction(StartFireAction, context => {
				if (!context.inventory.fireStarter?.isValid) {
					this.log.warn("Invalid fireStarter");
					return ObjectiveResult.Restart;
				}

				const kindling = context.getData<Item>(kindlingDataKey);
				if (!kindling?.isValid) {
					this.log.warn("Invalid StartFireKindling");
					return ObjectiveResult.Restart;
				}

				const tinder = context.getData<Item>(tinderDataKey);
				if (!tinder?.isValid) {
					this.log.warn("Invalid StartFireTinder");
					return ObjectiveResult.Restart;
				}

				return [context.inventory.fireStarter, undefined, kindling, tinder, undefined] as ActionArgumentsOf<typeof StartFireAction>;
			}).setStatus(this));

			objectives.push(new Lambda(async context => {
				const description = doodad.description;
				if (description?.lit === undefined || description.providesFire) {
					return ObjectiveResult.Complete;
				}

				// failed to start fire. try again
				return ObjectiveResult.Restart;
			}).setStatus(this));
		}

		return objectives;
	}

}
