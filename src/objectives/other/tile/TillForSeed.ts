import doodadDescriptions from "game/doodad/Doodads";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { ITile, TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import { itemDescriptions } from "game/item/ItemDescriptions";
import Till from "game/entity/action/actions/Till";
import { IVector3 } from "utilities/math/IVector";

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

    private readonly allowedTilesSet: Set<TerrainType>;

    constructor(private readonly itemType: ItemType, private readonly maxTilesChecked: number | undefined = gardenMaxTilesChecked) {
        super();


        this.allowedTilesSet = new Set(doodadDescriptions[itemDescriptions[this.itemType]?.onUse?.[ActionType.Plant]!]?.allowedTiles ?? []);
    }

    public getIdentifier(): string {
        return `TillForSeed:${Array.from(this.allowedTilesSet).join(",")}`;
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
        if (this.allowedTilesSet.size === 0) {
            return undefined;
        }

        const emptyTilledTile = TileHelpers.findMatchingTile(
            context.island,
            context.utilities.base.getBasePosition(context),
            (island, point, tile) => this.allowedTilesSet.has(TileHelpers.getType(tile)) &&
                island.isTilled(point.x, point.y, point.z) &&
                island.isTileEmpty(tile) &&
                TileHelpers.isOpenTile(island, point, tile),
            {
                maxTilesChecked: this.maxTilesChecked
            });
        if (emptyTilledTile !== undefined) {
            return [
                new MoveToTarget(emptyTilledTile, true),
                new ClearTile(emptyTilledTile),
            ];
        }

        let tile: ITile | undefined;
        let point: IVector3 | undefined;

        const facingTile = context.human.getFacingTile();
        const facingPoint = context.human.getFacingPoint();
        if (context.utilities.tile.canTill(context, facingPoint, facingTile, context.inventory.hoe, this.allowedTilesSet)) {
            tile = facingTile;
            point = facingPoint;

        } else {
            const nearbyTillableTile = TileHelpers.findMatchingTile(
                context.island,
                context.utilities.base.getBasePosition(context),
                (_, point, tile) => context.utilities.tile.canTill(context, point, tile, context.inventory.hoe, this.allowedTilesSet),
                {
                    maxTilesChecked: gardenMaxTilesChecked,
                }
            );

            if (!nearbyTillableTile) {
                return undefined;
            }

            const target = nearbyTillableTile;
            point = target;
            tile = context.island.getTileFromPoint(target);
        }

        let objectives: IObjective[] = [];

        if (TileHelpers.getType(tile) === TerrainType.Grass) {
            objectives.push(new DigTile(point, { digUntilTypeIsNot: TerrainType.Grass }));
        }

        objectives.push(
            new MoveToTarget(point, true),
            new UseItem(Till, "hoe"),
            new Lambda(async context => {
                const facingPoint = context.human.getFacingPoint();

                if (context.human.island.isTilled(facingPoint.x, facingPoint.y, facingPoint.z)) {
                    return ObjectiveResult.Complete;
                }

                this.log.info("Not tilled yet");

                return ObjectiveResult.Restart;
            }).setStatus(this),
        );

        return objectives;
    }
}
