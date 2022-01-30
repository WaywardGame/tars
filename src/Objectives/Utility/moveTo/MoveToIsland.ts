import { ActionType } from "game/entity/action/IAction";
import type { IslandId } from "game/island/IIsland";
import { IslandPosition } from "game/island/IIsland";
import { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItem from "../../acquire/item/AcquireItem";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";
import ExecuteAction from "../../core/ExecuteAction";
import MoveItemIntoInventory from "../../other/item/MoveItemIntoInventory";
import MoveToWater from "./MoveToWater";

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

        const player = context.human.asPlayer;
        if (!player) {
            return ObjectiveResult.Impossible;
        }

        const islandPosition = IslandPosition.fromId(this.islandId);
        if (islandPosition === undefined) {
            return ObjectiveResult.Impossible;
        }

        return [
            ...(context.inventory.sailBoat ? [new MoveItemIntoInventory(context.inventory.sailBoat)] : [new AcquireItem(ItemType.Sailboat), new AnalyzeInventory()]),
            new MoveToWater(true),
            // new Lambda(async () => canSailAwayFromPosition(context.player.island, context.player) ? ObjectiveResult.Complete : ObjectiveResult.Impossible),
            new ExecuteAction(ActionType.SailToIsland, (context, action) => {
                action.execute(player, islandPosition.x, islandPosition.y);
                return ObjectiveResult.Complete;
            }).setStatus(this),


            // ...(context.inventory.sailBoat ? [new MoveItemIntoInventory(context.inventory.sailBoat)] : [new AcquireItem(ItemType.Sailboat), new AnalyzeInventory()]),
            // new MoveToWater(true),
            // new MoveToTarget(edgePosition, true, { allowBoat: true, disableStaminaCheck: true }),
            // new ExecuteAction(ActionType.Move, (context, action) => {
            //     action.execute(context.actionExecutor, direction);
            //     return ObjectiveResult.Complete;
            // }).setStatus(this),
        ];
    }

}
