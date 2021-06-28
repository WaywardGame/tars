import { ActionType } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";
import { IStat, Stat } from "game/entity/IStats";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import Context from "../../../Context";

import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import Restart from "../../core/Restart";
import Idle from "../Idle";

export default class HuntCreature extends Objective {

    constructor(private readonly creature: Creature, private readonly track: boolean) {
        super();
    }

    public getIdentifier(): string {
        return `HuntCreature:${this.creature}:${this.track}`;
    }

    public getStatus(): string | undefined {
        return `Hunting ${this.creature.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (this.creature.stat.get<IStat>(Stat.Health).value <= 0 || !this.creature.isValid() || this.creature.isTamed()) {
            return ObjectiveResult.Restart;
        }

        const isPassable = this.creature.description()?.passable ?? false;
        if (isPassable && context.player.x === this.creature.x && context.player.y === this.creature.y && context.player.z === this.creature.z) {
            // we're ontop of the creature
            // instead of trying to move next to it, idle and let it move
            return [
                new Idle(),
                new Restart(),
            ];
        }

        return [
            new MoveToTarget(this.creature, true).trackCreature(this.track ? this.creature : undefined),
            new Lambda(async context => {
                if (!this.creature.isValid()) {
                    return ObjectiveResult.Complete;
                }

                const direction = getDirectionFromMovement(this.creature.x - context.player.x, this.creature.y - context.player.y);

                // if (this.creature.description()?.passable) {
                // face the creature and attack with a weapon
                let objectives: IObjective[] = [];

                if (context.player.facingDirection !== direction) {
                    objectives.push(new ExecuteAction(ActionType.UpdateDirection, (context, action) => {
                        action.execute(context.player, direction, undefined);
                        return ObjectiveResult.Complete;
                    }));
                }

                // const leftHandItem = context.player.options.leftHand ? context.player.getEquippedItem(EquipType.LeftHand) : undefined;
                // const rightHandItem = context.player.options.rightHand ? context.player.getEquippedItem(EquipType.RightHand) : undefined;

                // const weapon = leftHandItem ?? rightHandItem;
                // if (weapon) {
                //     objectives.push(new ExecuteAction(ActionType.Melee, (context, action) => {
                //         action.execute(context.player, weapon);
                //     }));

                // } else {
                objectives.push(new ExecuteAction(ActionType.Attack, (context, action) => {
                    action.execute(context.player);
                    return ObjectiveResult.Complete;
                }));
                // }

                return objectives;

                // } else {
                //     // move into the creature
                //     return new ExecuteAction(ActionType.Move, (context, action) => {
                //         action.execute(context.player, direction);
                //     });
                // }
            }),
            new Restart(), // ensures that no other objectives are ran after this one
        ];
    }
}
