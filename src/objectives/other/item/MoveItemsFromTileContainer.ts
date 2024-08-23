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

import Doodad from "@wayward/game/game/doodad/Doodad";
import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import { IVector3 } from "@wayward/game/utilities/math/IVector";
import PickUpItem from "@wayward/game/game/entity/action/actions/PickUpItem";
import Tile from "@wayward/game/game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";

/**
 * Moves items from a tile container.
 */
export default class MoveItemsFromTileContainer extends Objective {

	private readonly items: Item[] | undefined;

	constructor(itemOrItems: Item | Item[] | undefined, private readonly targetContainer: IContainer, private readonly source?: Doodad | Tile | IVector3) {
		super();

		this.items = itemOrItems ? (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]) : undefined;
	}

	public getIdentifier(): string {
		return `MoveItemsFromTileContainer:${this.items?.join(",")}`;
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

		return new ExecuteAction(PickUpItem, () => {
			if (items.every(item => item.containedWithin === this.targetContainer)) {
				return ObjectiveResult.Complete;
			}

			return [context.human.tile === this.source] as ActionArgumentsOf<typeof PickUpItem>;
		}).setStatus(this);
	}

	protected override getBaseDifficulty(): number {
		return 1;
	}
}
