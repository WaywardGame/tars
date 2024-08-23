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

import { ItemType } from "@wayward/game/game/item/IItem";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import Till from "@wayward/game/game/entity/action/actions/Till";
import Tile from "@wayward/game/game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import DigTile from "../tile/DigTile";
import Lambda from "../../core/Lambda";
import ClearTile from "../tile/ClearTile";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";
import UseItem from "../item/UseItem";

export const gardenMaxTilesChecked = 1536;

export default class TillForSeed extends Objective {

	constructor(private readonly itemType: ItemType, private readonly maxTilesChecked: number | undefined = gardenMaxTilesChecked) {
		super();
	}

	public getIdentifier(): string {
		return `TillForSeed:${this.itemType}`;
	}

	public getStatus(): string | undefined {
		return `Tilling to plant ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const result = this.getTillObjectives(context);
		if (result === undefined) {
			return ObjectiveResult.Impossible;
		}

		return [
			new AcquireInventoryItem("hoe"),
			...result,
		];
	}

	private getTillObjectives(context: Context): IObjective[] | undefined {
		const allowedTilesSet = context.utilities.tile.getSeedAllowedTileSet(this.itemType);
		if (allowedTilesSet.size === 0) {
			return undefined;
		}

		const emptyTilledTile = context.utilities.base.getBaseTile(context).findMatchingTile(
			(tile) => allowedTilesSet.has(tile.type) &&
				tile.isTilled &&
				tile.isEmpty &&
				tile.isOpen,
			{
				maxTilesChecked: this.maxTilesChecked
			});
		if (emptyTilledTile !== undefined) {
			return [
				new MoveToTarget(emptyTilledTile, true),
				new ClearTile(emptyTilledTile),
			];
		}

		let tile: Tile | undefined;

		const facingTile = context.human.facingTile;

		if (context.utilities.tile.canTill(context, facingTile, context.inventory.hoe, allowedTilesSet)) {
			tile = facingTile;

		} else {
			tile = context.utilities.tile.getNearbyTillableTile(context, this.itemType, allowedTilesSet);
		}

		if (!tile) {
			return undefined;
		}

		let objectives: IObjective[] = [];

		if (tile.type === TerrainType.Grass) {
			objectives.push(new DigTile(tile, { digUntilTypeIsNot: TerrainType.Grass }));
		}

		objectives.push(
			new MoveToTarget(tile, true),
			new ClearTile(tile),
			new UseItem(Till, "hoe"),
			new Lambda(async context => {
				const facingPoint = context.human.facingTile;

				if (facingPoint.isTilled) {
					return ObjectiveResult.Complete;
				}

				this.log.info("Not tilled yet");

				return ObjectiveResult.Restart;
			}).setStatus(this),
		);

		return objectives;
	}
}
