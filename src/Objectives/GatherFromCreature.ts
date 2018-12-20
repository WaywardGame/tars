import { ICorpse } from "creature/corpse/ICorpse";
import { ICreature } from "creature/ICreature";
import { ActionType } from "action/IAction";
import {  } from "Enums";
import Vector2 from "utilities/math/Vector2";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, ICreatureSearch, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import CarveCorpse from "./CarveCorpse";
import { findAndMoveToFaceCorpse, findAndMoveToCreature, MoveResult } from "../Utilities/Movement";
import { findCreature, findCarvableCorpse } from "../Utilities/Object";
import { getInventoryItemsWithUse } from "../Utilities/Item";
import AcquireItemForAction from "./AcquireItemForAction";

export default class GatherFromCreature extends Objective {

	constructor(private readonly search: ICreatureSearch[]) {
		super();
	}

	public getHashCode(): string {
		return `GatherFromCreature:${this.search.map(search => `${search.type},${itemManager.getItemTypeGroupName(search.itemType, false)}`).join("|")}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const canCarveCorpse = getInventoryItemsWithUse(ActionType.Carve).length > 0;

		const isTargetCorpse = (corpse: ICorpse) => {
			for (const search of this.search) {
				if (search.type === corpse.type) {
					return true;
				}
			}

			return false;
		};

		const isTargetCreature = (creature: ICreature) => {
			if (!creature.isTamed()) {
				for (const search of this.search) {
					if (search.type === creature.type) {
						return true;
					}
				}
			}

			return false;
		};

		if (calculateDifficulty) {
			const objectives: IObjective[] = [];

			if (!canCarveCorpse) {
				objectives.push(new AcquireItemForAction(ActionType.Carve));
			}

			let target = findCarvableCorpse(this.getHashCode(), isTargetCorpse);
			if (target === undefined) {
				target = findCreature(this.getHashCode(), isTargetCreature);
			}

			if (target === undefined) {
				return missionImpossible;
			}

			return Math.round(Vector2.squaredDistance(localPlayer, target)) + await this.calculateObjectiveDifficulties(base, inventory, ...objectives);
		}

		if (!canCarveCorpse) {
			return new AcquireItemForAction(ActionType.Carve);
		}

		let moveResult = await findAndMoveToFaceCorpse(this.getHashCode(), isTargetCorpse);
		if (moveResult === MoveResult.NoTarget || moveResult === MoveResult.NoPath) {
			this.log.info("Moving to creature");
			moveResult = await findAndMoveToCreature(this.getHashCode(), isTargetCreature);

			if (moveResult === MoveResult.NoPath) {
				this.log.info("No path to creature");
				return ObjectiveStatus.Complete;
			}

			if (moveResult === MoveResult.NoTarget) {
				this.log.info("No target creature");
				return ObjectiveStatus.Complete;
			}
		}

		if (moveResult === MoveResult.Moving) {
			return;
		}

		const corpses = localPlayer.getFacingTile().corpses;
		if (corpses && corpses.length > 0) {
			this.log.info("Carving corpse");
			return new CarveCorpse(corpses[0]);
		}

		this.log.info("No more corpses");

		return ObjectiveStatus.Complete;
	}

	protected getBaseDifficulty(base: IBase, inventory: IInventoryItems): number {
		return 50;
	}

}
