import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad";
import { ActionType } from "entity/action/IAction";
import { ItemType } from "item/IItem";
import { itemDescriptions as Items } from "item/Items";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";
import Enums from "utilities/enum/Enums";

import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { getDoodadTypes } from "../../../Utilities/Doodad";

import AcquireItem from "./AcquireItem";

export default class AcquireItemForDoodad extends Objective {

	private static readonly cache: Map<DoodadType | DoodadTypeGroup, ItemType[]> = new Map();

	constructor(private readonly doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemForDoodad:${doodadManager.isGroup(this.doodadTypeOrGroup) ? DoodadTypeGroup[this.doodadTypeOrGroup] : DoodadType[this.doodadTypeOrGroup]}`;
	}

	public getStatus(): string {
		return `Acquiring ${doodadManager.isGroup(this.doodadTypeOrGroup) ? Translation.nameOf(Dictionary.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation.nameOf(Dictionary.Doodad, this.doodadTypeOrGroup).getString()}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return this.getItems().some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		return this.getItems()
			.map(item => [new AcquireItem(item).passContextDataKey(this)]);
	}

	private getItems(): ItemType[] {
		let result = AcquireItemForDoodad.cache.get(this.doodadTypeOrGroup);
		if (result === undefined) {
			result = [];

			const doodadTypes = getDoodadTypes(this.doodadTypeOrGroup);
			for (const doodadType of doodadTypes) {
				for (const itemType of Enums.values(ItemType)) {
					const itemDescription = Items[itemType];
					if (itemDescription && itemDescription.onUse &&
						(itemDescription.onUse[ActionType.Build] === doodadType || itemDescription.onUse[ActionType.PlaceDown] === doodadType)) {
						result.push(itemType);
					}
				}
			}

			AcquireItemForDoodad.cache.set(this.doodadTypeOrGroup, result);
		}

		return result;
	}
}
