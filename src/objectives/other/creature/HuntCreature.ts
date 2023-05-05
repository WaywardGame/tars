import type Creature from "game/entity/creature/Creature";
import type { IStat } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type Context from "../../../core/context/Context";

import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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

    // this does not work
    // public override canSaveChildObjectives(): boolean {
    //     return false;
    // }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (!this.creature.isValid() || this.creature.stat.get<IStat>(Stat.Health).value <= 0 || this.creature.isTamed()) {
            return ObjectiveResult.Complete;
        }

        const isPassable = this.creature.description?.passable ?? false;
        if (isPassable && context.human.x === this.creature.x && context.human.y === this.creature.y && context.human.z === this.creature.z) {
            // we're ontop of the creature
            // instead of trying to move next to it, idle and let it move
            return [
                new Idle(),
                new Restart(),
            ];
        }

        // attacking is handled by moving - "autoAttack" is on
        return new MoveToTarget(this.creature, false, this.track ? { equipWeapons: true } : { disableTracking: true });
    }
}
