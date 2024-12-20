import type Context from "../../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import SetContextData from "../../../contextData/SetContextData";
import ReserveItems from "../../../core/ReserveItems";
import PlantSeed from "../../../other/item/PlantSeed";
import AcquireItem from "../AcquireItem";

export default class AcquireAndPlantSeed extends Objective {

	constructor(private readonly onlyEdiblePlants: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireAndPlantSeed:${this.onlyEdiblePlants}`;
	}

	public getStatus(): string | undefined {
		return "Acquiring and planting a seed";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const itemContextDataKey = this.getUniqueContextDataKey("Seed");

		return Array.from(this.onlyEdiblePlants ? context.utilities.item.edibleSeedItemTypes : context.utilities.item.allSeedItemTypes)
			.map(itemType => {
				const objectives: IObjective[] = [];

				// todo: require minDur > 0
				const item = context.utilities.item.getItemInInventory(context, itemType);
				if (item) {
					objectives.push(new ReserveItems(item).keepInInventory());
					objectives.push(new SetContextData(itemContextDataKey, item));

				} else {
					objectives.push(new AcquireItem(itemType, { requiredMinDur: 1, willDestroyItem: true }).setContextDataKey(itemContextDataKey));
				}

				objectives.push(new PlantSeed(itemType).setContextDataKey(itemContextDataKey));

				return objectives;
			});
	}

}
