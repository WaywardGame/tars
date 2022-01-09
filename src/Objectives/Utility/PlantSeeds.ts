
import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import SetContextData from "../contextData/SetContextData";
import ReserveItems from "../core/ReserveItems";
import Restart from "../core/Restart";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";
import PlantSeed from "../other/item/PlantSeed";

export default class PlantSeeds extends Objective {

    public getIdentifier(): string {
        return "PlantSeeds";
    }

    public getStatus(): string | undefined {
        return "Planting seeds";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const seeds = context.utilities.item.getSeeds(context);
        if (seeds.length === 0) {
            return ObjectiveResult.Ignore;
        }

        const objectivePipelines: IObjective[][] = [];

        for (const seed of seeds) {
            objectivePipelines.push([
                // we might be planting a seed far away from the base - prevent placing the seed into an intermediate chest
                new SetContextData(ContextDataType.DisableMoveAwayFromBaseItemOrganization, true),
                new ReserveItems(seed),
                new MoveItemIntoInventory(seed),
                new PlantSeed(seed),
                new Restart(), // there might be more seeds to plant, so restart after
            ]);
        }

        return objectivePipelines;
    }

}
