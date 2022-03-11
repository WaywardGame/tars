import { DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import DrawnMap from "game/mapping/DrawnMap";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import AnalyzeInventory from "../analyze/AnalyzeInventory";
import MoveToTarget from "../core/MoveToTarget";
import ReserveItems from "../core/ReserveItems";
import Restart from "../core/Restart";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";
import UseItem from "../other/item/UseItem";
import DigTile from "../other/tile/DigTile";

export interface IGatherTreasureOptions {
    disableUnlocking: boolean;
    disableGrabbingItems: boolean;
}

export default class GatherTreasure extends Objective {

    constructor(private readonly drawnMap: DrawnMap, private readonly options?: Partial<IGatherTreasureOptions>) {
        super();
    }

    public getIdentifier(): string {
        return `GatherTreasure:${this.drawnMap}`;
    }

    public getStatus(): string | undefined {
        return `Gathering treasure`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const treasures = this.drawnMap.getTreasure();
        if (treasures.length === 0) {
            return ObjectiveResult.Complete;
        }

        const fishingRod = context.inventory.fishingRod;
        const lockPick = context.inventory.lockPick;

        const objectivePipelines: IObjective[][] = [];

        for (const treasure of treasures) {
            let objectives: IObjective[];

            const target: IVector3 = { x: treasure.x, y: treasure.y, z: context.human.z };
            const treasureTile = context.human.island.getTileFromPoint(target);

            if (this.drawnMap.isTreasureDiscovered(treasure)) {
                const doodad = treasureTile.doodad;
                if (!doodad) {
                    continue;
                }

                if (doodad.isInGroup(DoodadTypeGroup.LockedChest)) {
                    if (this.options?.disableUnlocking) {
                        continue;
                    }

                    objectives = [];

                    if (!lockPick) {
                        objectives.push(
                            new AcquireItemForAction(ActionType.Lockpick),
                            new AnalyzeInventory(),
                        );
                    }

                    objectives.push(
                        new MoveToTarget(target, true),
                        new UseItem(ActionType.Lockpick, lockPick),
                    );

                } else if (doodad.containedItems && doodad.containedItems.length > 0) {
                    if (this.options?.disableGrabbingItems) {
                        continue;
                    }

                    objectives = [];

                    for (const item of doodad.containedItems) {
                        objectives.push(
                            new ReserveItems(item),
                            new MoveItemIntoInventory(item),
                        );
                    }

                } else {
                    continue;
                }

            } else {
                // dig/cast the treasure out
                objectives = [];

                const needFishingRod = Terrains[TileHelpers.getType(treasureTile)]?.water ? true : false;
                if (needFishingRod) {
                    if (!fishingRod) {
                        objectives.push(
                            new AcquireItemForAction(ActionType.Cast),
                            new AnalyzeInventory(),
                        );
                    }
                }

                if (!lockPick) {
                    objectives.push(
                        new AcquireItemForAction(ActionType.Lockpick),
                        new AnalyzeInventory(),
                    );
                }

                if (needFishingRod) {
                    objectives.push(new MoveToTarget(target, true));
                    objectives.push(new UseItem(ActionType.Cast, fishingRod));

                } else {
                    objectives.push(new DigTile(target));
                }
            }

            // restart to cause a recalc, to double check that the treasure appeared
            objectives.push(new Restart());

            objectivePipelines.push(objectives);
        }


        return objectivePipelines;
    }

}
