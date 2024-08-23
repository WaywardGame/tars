/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import Tile from "@wayward/game/game/tile/Tile";

import Dig from "@wayward/game/game/entity/action/actions/Dig";
import { ActionArgument, IActionDescription } from "@wayward/game/game/entity/action/IAction";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import UseItem from "../../../objectives/other/item/UseItem";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import ClearTile from "./ClearTile";

export interface IDigTileOptions {
	digUntilTypeIsNot: TerrainType;
}

export default class DigTile extends Objective {

	constructor(private readonly target: Tile, private readonly options?: Partial<IDigTileOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `DigTile:${this.target.x},${this.target.y},${this.target.z}`;
	}

	public getStatus(): string | undefined {
		return `Digging ${this.target.x},${this.target.y},${this.target.z}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectives: IObjective[] = [];

		objectives.push(new AcquireInventoryItem("shovel"));

		objectives.push(new MoveToTarget(this.target, true));

		objectives.push(new ClearTile(this.target));

		objectives.push(new UseItem(Dig as IActionDescription<[[ActionArgument.Undefined, ActionArgument.ItemInventory]]>, context.inventory.shovel));

		const digUntilTypeIsNot = this.options?.digUntilTypeIsNot;
		if (digUntilTypeIsNot !== undefined) {
			objectives.push(new Lambda(async () => {
				if (digUntilTypeIsNot === this.target.type) {
					return ObjectiveResult.Restart;
				}

				return ObjectiveResult.Complete;
			}).setStatus(this));
		}

		return objectives;
	}

}
