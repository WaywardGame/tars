import { IStat, IStatMax, Stat } from "game/entity/IStats";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { playerUtilities } from "../../utilities/Player";
import RecoverHealth from "./RecoverHealth";
import RecoverHunger from "./RecoverHunger";
import RecoverStamina from "./RecoverStamina";
import RecoverThirst from "./RecoverThirst";

// focus on healing if our health is below 85% while poisoned
const poisonHealthPercentThreshold = 0.85;

export default class Recover extends Objective {

    constructor(private readonly onlyUseAvailableItems: boolean) {
        super();
    }

    public getIdentifier(): string {
        return `Recover:${this.onlyUseAvailableItems}`;
    }

    public getStatus(): string {
        return "Recovering stats";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const health = context.player.stat.get<IStatMax>(Stat.Health);
        const needsHealthRecovery = health.value <= playerUtilities.getRecoverThreshold(context, Stat.Health) ||
            context.player.status.Bleeding ||
            (context.player.status.Poisoned && (health.value / health.max) <= poisonHealthPercentThreshold);

        const exceededThirstThreshold = context.player.stat.get<IStat>(Stat.Thirst).value <= playerUtilities.getRecoverThreshold(context, Stat.Thirst);
        const exceededHungerThreshold = context.player.stat.get<IStat>(Stat.Hunger).value <= playerUtilities.getRecoverThreshold(context, Stat.Hunger);
        const exceededStaminaThreshold = context.player.stat.get<IStat>(Stat.Stamina).value <= playerUtilities.getRecoverThreshold(context, Stat.Stamina);

        const objectives: IObjective[] = [];

        if (needsHealthRecovery) {
            objectives.push(new RecoverHealth(this.onlyUseAvailableItems));
        }

        objectives.push(new RecoverThirst(this.onlyUseAvailableItems, exceededThirstThreshold, false));

        objectives.push(new RecoverHunger(this.onlyUseAvailableItems, exceededHungerThreshold));

        if (exceededStaminaThreshold) {
            objectives.push(new RecoverStamina());
        }

        objectives.push(new RecoverThirst(this.onlyUseAvailableItems, exceededThirstThreshold, true));

        return objectives;
    }

}
