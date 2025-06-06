import type Doodad from "@wayward/game/game/doodad/Doodad";

import type Context from "../../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import AcquireWaterContainer from "../../../acquire/item/specific/AcquireWaterContainer";
import MoveToTarget from "../../../core/MoveToTarget";

import UseItem from "../../item/UseItem";
import AnalyzeInventory from "../../../analyze/AnalyzeInventory";
import { inventoryItemInfo } from "../../../../core/ITars";
import Pour from "@wayward/game/game/entity/action/actions/Pour";
import AcquireWater from "../../../acquire/item/specific/AcquireWater";
import RepairItem from "../../../interrupt/RepairItem";

/**
 * It will ensure the dripstone has water in the top
 * It returns 0 objectives otherwise, which results in an Impossible status
 */
export default class StartDripStone extends Objective {

	constructor(private readonly dripStone: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StartDripStone:${this.dripStone}`;
	}

	public getStatus(): string | undefined {
		return `Starting drip stone process for ${this.dripStone.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.dripStone.hasWater?.top) {
			// if (
			// 	(this.dripStone.gatherReady !== undefined && this.dripStone.gatherReady <= 0) ||
			// 	this.dripStone.hasWater?.top ||
			// 	this.dripStone.hasWater?.bottom
			// ) {
			return ObjectiveResult.Ignore;
		}

		const objectives: IObjective[] = [];

		this.log.info("No water at the top");

		let isWaterInContainer = false;

		const availableWaterContainers = AnalyzeInventory.getItems(context, inventoryItemInfo["waterContainer"]);

		const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(context, waterContainer));

		// check if we need a water container
		if (availableWaterContainer) {
			isWaterInContainer = context.utilities.item.isDrinkableItem(availableWaterContainer);

			if (availableWaterContainer.durability !== undefined &&
				availableWaterContainer.durabilityMax !== undefined &&
				(availableWaterContainer.durability / availableWaterContainer.durabilityMaxWithMagical) < 0.6) {
				// repair our container
				objectives.push(new RepairItem(availableWaterContainer));
			}

		} else {
			objectives.push(new AcquireWaterContainer().keepInInventory());
		}

		if (!isWaterInContainer) {
			// gather water for our container
			// objectives.push(new GatherWater(availableWaterContainer, { disallowWaterStill: true }));
			objectives.push(new AcquireWater({ onlyForDesalination: true }).keepInInventory());
		}

		objectives.push(new MoveToTarget(this.dripStone, true));

		objectives.push(new UseItem(Pour, availableWaterContainer));

		return objectives;
	}

}
