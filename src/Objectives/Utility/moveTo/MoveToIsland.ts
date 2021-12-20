import { ActionType } from "game/entity/action/IAction";
import { IslandId, IslandPosition } from "game/island/IIsland";
import { ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
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
        if (context.player.islandId === this.islandId) {
            return ObjectiveResult.Complete;
        }

        const islandPosition = IslandPosition.fromId(this.islandId);
        if (islandPosition === undefined) {
            return ObjectiveResult.Impossible;
        }

        // let direction: Direction.Cardinal;

        // if (islandPosition.x < context.player.island.position.x) {
        //     direction = Direction.West;

        // } else if (islandPosition.x > context.player.island.position.x) {
        //     direction = Direction.East;

        // } else if (islandPosition.y < context.player.island.position.y) {
        //     direction = Direction.South;

        // } else {
        //     direction = Direction.North;
        // }

        // const movement = Vector2.DIRECTIONS[direction];

        // const edgePosition: IVector3 = {
        //     x: Math.min(Math.max(context.player.x + (movement.x * game.mapSize), 0), game.mapSize - 1),
        //     y: Math.min(Math.max(context.player.y + (movement.y * game.mapSize), 0), game.mapSize - 1),
        //     z: context.player.z,
        // };

        return [        
            ...(context.inventory.sailBoat ? [new MoveItemIntoInventory(context.inventory.sailBoat)] : [new AcquireItem(ItemType.Sailboat), new AnalyzeInventory()]),
            new MoveToWater(true),
            // new Lambda(async () => canSailAwayFromPosition(context.player.island, context.player) ? ObjectiveResult.Complete : ObjectiveResult.Impossible),
            new ExecuteAction(ActionType.SailToIsland, (context, action) => {
                action.execute(context.player, islandPosition.x, islandPosition.y);
                return ObjectiveResult.Complete;
            }).setStatus(this),

            
            // ...(context.inventory.sailBoat ? [new MoveItemIntoInventory(context.inventory.sailBoat)] : [new AcquireItem(ItemType.Sailboat), new AnalyzeInventory()]),
            // new MoveToWater(true),
            // new MoveToTarget(edgePosition, true, { allowBoat: true, disableStaminaCheck: true }),
            // new ExecuteAction(ActionType.Move, (context, action) => {
            //     action.execute(context.player, direction);
            //     return ObjectiveResult.Complete;
            // }).setStatus(this),
        ];
    }

}
