import Doodad from "@wayward/game/game/doodad/Doodad";
import type { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import MoveItemAction from "@wayward/game/game/entity/action/actions/MoveItem";
import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";

/**
 * Moves items from a container.
 * NOT a tile container!
 */
export default class MoveItemsFromContainer extends Objective {

	private readonly items: Item[] | undefined;

	constructor(itemOrItems: Item | Item[] | undefined, private readonly targetContainer: IContainer, private readonly source?: Doodad | IVector3) {
		super();

		this.items = itemOrItems ? (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]) : undefined;
	}

	public getIdentifier(): string {
		return `MoveItemsFromContainer:${this.items?.join(",")}`;
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

		const itemsByContainer = new Map<IContainer | undefined, Item[]>();

		for (const item of items) {
			let containerItems = itemsByContainer.get(item.containedWithin);
			if (!containerItems) {
				containerItems = [];
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
