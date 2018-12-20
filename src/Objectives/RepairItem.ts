import { ActionType } from "action/IAction";
import { ItemType } from "Enums";
import { IItem } from "item/IItem";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireBuildMoveToDoodad from "./AcquireBuildMoveToDoodad";
import AcquireBuildMoveToFire from "./AcquireBuildMoveToFire";
import AcquireItem from "./AcquireItem";
import ExecuteAction from "./ExecuteAction";

export default class RepairItem extends Objective {

	constructor(private readonly item: IItem) {
		super();
	}

	public getHashCode(): string {
		return `RepairItem:${this.item && this.item.getName(false).getString()}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (inventory.hammer === undefined) {
			return new AcquireItem(ItemType.StoneHammer);
		}

		const description = this.item.description();
		if (!description) {
			return ObjectiveStatus.Complete;
		}

		const requirements = itemManager.hasAdditionalRequirements(localPlayer, this.item.type);
		if (!requirements.requirementsMet) {
			const recipe = description.recipe;
			if (recipe) {
				if (recipe.requiresFire) {
					this.log.info("Recipe requires fire");
					return new AcquireBuildMoveToFire();
				}

				if (recipe.requiredDoodad !== undefined) {
					this.log.info("Recipe requires doodad");
					return new AcquireBuildMoveToDoodad(recipe.requiredDoodad);
				}

				if (calculateDifficulty) {
					return missionImpossible;
				}
			}

			this.log.info("Requirements not met?");

			return ObjectiveStatus.Complete;
		}

		return new ExecuteAction(ActionType.Repair, action => action.execute(localPlayer, inventory.hammer!, this.item));
	}

}
