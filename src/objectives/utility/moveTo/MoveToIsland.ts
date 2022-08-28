import { DoodadType } from "game/doodad/IDoodad";
import type { IslandId } from "game/island/IIsland";
import { IslandPosition } from "game/island/IIsland";
import SailToIsland from "game/entity/action/actions/SailToIsland";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import MoveToTarget from "../../core/MoveToTarget";
import MoveItemIntoInventory from "../../other/item/MoveItemIntoInventory";
import MoveToWater from "./MoveToWater";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";

export default class MoveToIsland extends Objective {

    constructor(private readonly islandId: IslandId) {
        super();
    }

    public getIdentifier(): string {
        return "MoveToIsland";
    }

    public getStatus(): string | undefined {
        return `Moving to a island ${this.islandId}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (context.human.islandId === this.islandId) {
            return ObjectiveResult.Complete;
        }

        const islandPosition = IslandPosition.fromId(this.islandId);
        if (islandPosition === undefined) {
            return ObjectiveResult.Impossible;
        }

        const objectivePipelines: IObjective[][] = [];

        if (context.inventory.sailBoat) {
            objectivePipelines.push([
                new MoveItemIntoInventory(context.inventory.sailBoat),
                new MoveToWater(true),
                new ExecuteAction(SailToIsland, [islandPosition.x, islandPosition.y]).setStatus(this),
            ]);

        } else {
            const sailBoats = context.utilities.object.findDoodads(context, "SailBoat", (doodad) => doodad.type === DoodadType.Sailboat);
            for (const sailBoat of sailBoats) {
                const result = context.human.canSailAwayFromPosition(context.human.island, sailBoat);
                if (result.canSailAway) {
                    objectivePipelines.push([
                        new MoveToTarget(sailBoat, false),
                        new ExecuteAction(SailToIsland, [islandPosition.x, islandPosition.y]).setStatus(this),
                    ]);
                }
            }

            if (objectivePipelines.length === 0) {
                // no sail boats or sailboats are not in good spots
                objectivePipelines.push([
                    new AcquireInventoryItem("sailBoat"),
                    new MoveToWater(true),
                    new ExecuteAction(SailToIsland, [islandPosition.x, islandPosition.y]).setStatus(this),
                ]);
            }
        }

        return objectivePipelines;
    }

}