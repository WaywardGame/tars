import type Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireWaterContainer from "../../acquire/item/specific/AcquireWaterContainer";
import MoveToTarget from "../../core/MoveToTarget";

import UseItem from "../item/UseItem";
import PickUpAllTileItems from "../tile/PickUpAllTileItems";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";
import EmptyWaterContainer from "../EmptyWaterContainer";
import { inventoryItemInfo } from "../../../core/ITars";

/**
 * It will ensure the solar still has a container
 */
export default class StartSolarStill extends Objective {

    constructor(private readonly solarStill: Doodad) {
        super();
    }

    public getIdentifier(): string {
        return `StartSolarStill:${this.solarStill}`;
    }

    public getStatus(): string | undefined {
        return `Starting solar still process for ${this.solarStill.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectives: IObjective[] = [];

        if (!this.solarStill.stillContainer) {
            this.log.info("No still container");

            const availableWaterContainers = AnalyzeInventory.getItems(context, inventoryItemInfo["waterContainer"]);

            const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(waterContainer));

            if (availableWaterContainer === undefined) {
                objectives.push(new AcquireWaterContainer().keepInInventory());
            }

            if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
                // theres water in the container - it's like seawater
                // pour it out so we can attach it to the container
                objectives.push(new EmptyWaterContainer(availableWaterContainer));
            }

            objectives.push(new MoveToTarget(this.solarStill, true));

            objectives.push(new PickUpAllTileItems(this.solarStill));

            this.log.info("Moving to attach container");

            // attach the container to the water still
            objectives.push(new UseItem(ActionType.AttachContainer, availableWaterContainer));
        }

        return objectives;
    }

}