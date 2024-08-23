/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Doodad from "@wayward/game/game/doodad/Doodad";
import AttachContainer from "@wayward/game/game/entity/action/actions/AttachContainer";

import type Context from "../../../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import AcquireWaterContainer from "../../../acquire/item/specific/AcquireWaterContainer";
import MoveToTarget from "../../../core/MoveToTarget";

import UseItem from "../../item/UseItem";
import PickUpAllTileItems from "../../tile/PickUpAllTileItems";
import AnalyzeInventory from "../../../analyze/AnalyzeInventory";
import EmptyWaterContainer from "../../EmptyWaterContainer";
import { inventoryItemInfo } from "../../../../core/ITars";

/**
 * It will ensure the solar still has a container
 * It returns 0 objectives otherwise, which results in an Impossible status
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
        if (this.solarStill.stillContainer) {
            return ObjectiveResult.Ignore;
        }

        const objectives: IObjective[] = [];

        this.log.info("No still container");

        const availableWaterContainers = AnalyzeInventory.getItems(context, inventoryItemInfo["waterContainer"]);

        const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(context, waterContainer));

        if (availableWaterContainer === undefined) {
            objectives.push(new AcquireWaterContainer().keepInInventory());
        }

        if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
            // theres water in the container - it's like seawater
            // pour it out so we can attach it to the container
            objectives.push(new EmptyWaterContainer(availableWaterContainer));
        }

        objectives.push(new MoveToTarget(this.solarStill, true));

        objectives.push(new PickUpAllTileItems(this.solarStill.tile));

        this.log.info("Moving to attach container");

        // attach the container to the water still
        objectives.push(new UseItem(AttachContainer, availableWaterContainer));

        return objectives;
    }

}
