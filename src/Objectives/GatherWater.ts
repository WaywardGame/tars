import { ActionType } from "Enums";
import { IItem } from "item/IItem";
import { ITile } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { defaultMaxTilesChecked } from "../ITars";
import { anyWaterTileLocation } from "../Navigation";
import Objective from "../Objective";
import UseItem from "./UseItem";

export default class GatherWater extends Objective {

	constructor(private item: IItem) {
		super();
	}

	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const facingTile = localPlayer.getFacingTile();
		let tileType = TileHelpers.getType(facingTile);
		let terrainDescription = Terrains[tileType];

		let target: IVector3 | undefined;
		if (!terrainDescription || !(terrainDescription.water || terrainDescription.shallowWater)) {
			target = TileHelpers.findMatchingTile(localPlayer, (point: IVector3, tile: ITile) => {
				tileType = TileHelpers.getType(tile);
				terrainDescription = Terrains[tileType];
				return terrainDescription && (terrainDescription.water || terrainDescription.shallowWater) ? true : false;
			}, defaultMaxTilesChecked);

			if (!target) {
				const targets = await Helpers.getNearestTileLocation(anyWaterTileLocation, localPlayer);
				if (targets.length === 0) {
					this.log.info("No nearby water, go near some");
					return;
				}

				target = targets[0].point;
			}
		}

		this.log.info("Gather water");
		return new UseItem(this.item, ActionType.GatherWater, target);
	}

}
