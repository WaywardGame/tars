/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Doodad from "@wayward/game/game/doodad/Doodad";
import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import MoveItemAction from "@wayward/game/game/entity/action/actions/MoveItem";
import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import { IVector3 } from "@wayward/game/utilities/math/IVector";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import PickUpItem from "@wayward/game/game/entity/action/actions/PickUpItem";

export default class MoveItems extends Objective {

	private readonly items: Item[] | undefined;

	constructor(itemOrItems: Item | Item[] | undefined, private readonly targetContainer: IContainer, private readonly source?: Doodad | IVector3) {
		super();

		this.items = itemOrItems ? (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]) : undefined;
	}

	public getIdentifier(): string {
		return `MoveItems:${this.items?.join(",")}`;
	}

	public getStatus(): string | undefined {
		const targetContainerName = Doodad.is(this.targetContainer) ? this.targetContainer.getName() : undefined;

		if (this.source) {
			const sourceName = Doodad.is(this.source) ? this.source.getName() : `(${this.source.x},${this.source.y},${this.source.z})`;

			return `Moving ${this.items?.join(",")} into ${targetContainerName} from ${sourceName}`;
		}

		return `Moving ${this.items?.join(",")} into ${targetContainerName}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const items = this.items ?? [this.getAcquiredItem(context)] as Item[];
		if (items.some(item => !item?.isValid)) {
			this.log.warn(`Invalid move item ${items}`);
			return ObjectiveResult.Restart;
		}

		// !game.getGameOptions().items.tileContainersEnabled && 
		if (items.some(item => item.containedWithin?.asTile)) {
			return new ExecuteAction(PickUpItem, () => {
				if (items.every(item => item.containedWithin === this.targetContainer)) {
					return ObjectiveResult.Complete;
				}

				return [] as ActionArgumentsOf<typeof PickUpItem>;
			}).setStatus(this);
		}

		const itemsByContainer = new Map<IContainer | undefined, Item[]>();

		for (const item of items) {
			let containerItems = itemsByContainer.get(item.containedWithin);
			if (!containerItems) {
				containerItems = []
				itemsByContainer.set(item.containedWithin, containerItems);
			}

			containerItems.push(item);
		}

		return Array.from(itemsByContainer.values()).map(containerItems => new ExecuteAction(MoveItemAction, () => {
			if (containerItems.every(item => item.containedWithin === this.targetContainer)) {
				return ObjectiveResult.Complete;
			}

			// console.warn(context.island.items.hasRoomInContainer(this.targetContainer, item));

			// const weightCapacity = context.island.items.getWeightCapacity(this.targetContainer);
			// if (weightCapacity !== undefined && context.island.items.computeContainerWeight(this.targetContainer) + item.getTotalWeight() > weightCapacity) {
			// 	// we won't be able to move the item
			// 	return ObjectiveResult.Restart;
			// }

			// if (items.length > 1) {
			// 	console.warn("moving more than 1 item", items);
			// }

			return [containerItems, this.targetContainer] as ActionArgumentsOf<typeof MoveItemAction>;
		}).setStatus(this));
	}

	protected override getBaseDifficulty(): number {
		return 1;
	}
}
