import { DoodadTypeGroup } from "game/doodad/IDoodad";
import DrawnMap from "game/mapping/DrawnMap";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import Lockpick from "game/entity/action/actions/Lockpick";
import Cast from "game/entity/action/actions/Cast";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";
import ReserveItems from "../core/ReserveItems";
import Restart from "../core/Restart";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";
import UseItem from "../other/item/UseItem";
import DigTile from "../other/tile/DigTile";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";

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

        const objectivePipelines: IObjective[][] = [];

        for (const treasure of treasures) {
            let objectives: IObjective[];

            const target: IVector3 = { x: treasure.x, y: treasure.y, z: this.drawnMap.position.z };
            const treasureTile = context.human.island.getTileFromPoint(target);

            if (this.drawnMap.isTreasureDiscovered(treasure)) {
                const doodad = treasureTile.doodad;
                if (!doodad || doodad.crafterIdentifier) {
                    continue;
                }

                if (doodad.isInGroup(DoodadTypeGroup.LockedChest)) {
                    if (this.options?.disableUnlocking) {
                        continue;
                    }

                    objectives = [
                        new AcquireInventoryItem("lockPick"),
                        new MoveToTarget(target, true),
                        new UseItem(Lockpick, context.inventory.lockPick),
                    ];

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
                    objectives.push(new AcquireInventoryItem("fishing"));
                }

                objectives.push(new AcquireInventoryItem("lockPick"));

                if (needFishingRod) {
                    // if (context.inventory.fishing) {
                    //     const ranged = context.inventory.fishing.description()?.ranged ?? { range: 1 };
                    //     const itemRange = ranged.range + (context.inventory.fishing?.magic.get(MagicalPropertyType.Range) ?? 0);
                    //     const minRange = context.island.rangeFinder(itemRange, context.human.skill.get(SkillType.Fishing), "min");
                    //     const maxRange = context.island.rangeFinder(itemRange, context.human.skill.get(SkillType.Fishing), "max");

                    //     objectives.push(new MoveToTargetRange(target, minRange, maxRange));
                    //     objectives.push(new UseItem(Cast, context.inventory.fishing));

                    // } else {
                    //     objectives.push(new Restart());
                    // }
                    objectives.push(new MoveToTarget(target, true));
                    objectives.push(new UseItem(Cast, context.inventory.fishing));

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
