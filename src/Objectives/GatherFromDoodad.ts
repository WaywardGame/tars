import { ActionType } from "action/IAction";
import { IDoodad } from "doodad/IDoodad";
import { DamageType, DoodadType, GrowingStage } from "Enums";
import Vector2 from "utilities/math/Vector2";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IDoodadSearch, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getBestActionItem } from "../Utilities/Item";
import { MoveResult, moveToFaceTarget } from "../Utilities/Movement";
import { findDoodad } from "../Utilities/Object";

export default class GatherFromDoodad extends Objective {

	private target: IDoodad | undefined;

	constructor(private readonly search: IDoodadSearch[]) {
		super();
	}

	public getHashCode(): string {
		return `GatherFromDoodad:${this.search.map(search => `${DoodadType[search.type]},${GrowingStage[search.growingStage]},${itemManager.getItemTypeGroupName(search.itemType, false).getString()}`).join("|")}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (!this.target || !this.target.isValid()) {
			this.target = findDoodad(`${this.getHashCode()}|1`, (doodad: IDoodad) => doodad.canGather() && this.search.findIndex(search => search.type === doodad.type && search.growingStage === doodad.getGrowingStage()) !== -1 && doodad.getTile().corpses === undefined);

			if (this.target === undefined) {
				this.target = findDoodad(`${this.getHashCode()}|2`, (doodad: IDoodad) => doodad.canGather() && this.search.findIndex(search => search.type === doodad.type && search.growingStage === GrowingStage.Dead) !== -1 && doodad.getTile().corpses === undefined);

				if (this.target) {
					this.log.info("Couldn't find target normally. found it for a dead thing!", this.search);
				}
			}
		}

		if (calculateDifficulty) {
			return this.target === undefined ? missionImpossible : Math.round(Vector2.distance(localPlayer, this.target));
		}

		if (this.target === undefined) {
			this.log.info("No target doodad");
			return ObjectiveStatus.Complete;
		}

		const moveResult = await moveToFaceTarget(this.target);

		if (moveResult === MoveResult.NoPath) {
			this.log.info("No path to doodad");
			return ObjectiveStatus.Complete;
		}

		if (moveResult !== MoveResult.Complete) {
			return;
		}

		const targetSearch = this.search.find(search => search.type === this.target!.type && search.growingStage === this.target!.getGrowingStage());

		return this.executeActionForItem(targetSearch ? targetSearch.action : ActionType.Gather, ((action: any) => action.execute(localPlayer, getBestActionItem(ActionType.Gather, DamageType.Slashing))) as any, this.search.map(search => search.itemType));
	}

	protected getBaseDifficulty(base: IBase, inventory: IInventoryItems): number {
		return 20;
	}

}
