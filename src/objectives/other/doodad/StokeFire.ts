/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Doodad from "@wayward/game/game/doodad/Doodad";
import StokeFireAction from "@wayward/game/game/entity/action/actions/StokeFire";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import Item from "@wayward/game/game/item/Item";
import { ReserveType } from "../../../core/ITars";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";
import ExecuteAction from "../../core/ExecuteAction";
import StartFire from "./StartFire";

export default class StokeFire extends Objective {

	constructor(private readonly doodad?: Doodad, private readonly numberOfStokes: number = 0) {
		super();
	}

	public getIdentifier(): string {
		return `StokeFire:${this.doodad}:${this.numberOfStokes}`;
	}

	public getStatus(): string | undefined {
		return `Stoking ${this.doodad?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodad = this.doodad ?? context.getData(ContextDataType.LastBuiltDoodad);
		if (!doodad) {
			this.log.error("Invalid doodad");
			return ObjectiveResult.Restart;
		}

		const itemContextDataKey = this.getUniqueContextDataKey("Kindling");

		const objectives: IObjective[] = [];

		const description = doodad.description;
		if (description && !description.providesFire) {
			objectives.push(new StartFire(doodad));
		}

		objectives.push(new AcquireInventoryItem("fireKindling", { skipHardReservedItems: true, reserveType: ReserveType.Hard, desiredCount: this.numberOfStokes }).setContextDataKey(itemContextDataKey));

		objectives.push(new MoveToTarget(doodad, true));

		objectives.push(new ExecuteAction(StokeFireAction, (context) => {
			const kindling = context.getData<Item>(itemContextDataKey);
			if (!kindling?.isValid) {
				this.log.warn("Invalid StokeFire kindling");
				return ObjectiveResult.Restart;
			}

			return [kindling] as ActionArgumentsOf<typeof StokeFireAction>;
		}).setStatus(this));

		return objectives;
	}

}
