import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Restart from "../core/Restart";
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
                new PlantSeed(seed),
                new Restart(), // there might be more seeds to plant, so restart after
            ]);
        }

        return objectivePipelines;
    }

}
