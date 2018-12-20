import ActionExecutor from "action/ActionExecutor";
import actionDescriptions from "action/Actions";
import { ActionType, IActionDescription } from "action/IAction";
import { ItemType } from "Enums";
import Log, { nullLog } from "utilities/Log";
import { IObjective, missionImpossible, ObjectiveStatus } from "./IObjective";
import { IBase, IInventoryItems } from "./ITars";
import { executeAction } from "./Utilities/Action";

export default abstract class Objective implements IObjective {

	private static calculatedDifficulties: { [index: string]: number };
	private calculatingDifficulty = false;

	private _log: Log | undefined;

	abstract getHashCode(): string;

	public execute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		Objective.calculatedDifficulties = {};
		return this.onExecute(base, inventory, false);
	}

	public async calculateDifficulty(base: IBase, inventory: IInventoryItems): Promise<number> {
		let difficulty: number | undefined;

		const hashCode = this.getHashCode();
		if (hashCode !== undefined) {
			const calculatedDifficulty = Objective.calculatedDifficulties[hashCode];
			if (calculatedDifficulty !== undefined) {
				difficulty = calculatedDifficulty;
			}

			Objective.calculatedDifficulties[hashCode] = missionImpossible;
		}

		if (difficulty === undefined) {
			difficulty = this.getBaseDifficulty(base, inventory);

			this.calculatingDifficulty = true;
			const result = await this.onExecute(base, inventory, true);
			this.calculatingDifficulty = false;

			if (result !== undefined) {
				if (typeof (result) === "number") {
					if (result !== ObjectiveStatus.Complete) {
						difficulty += result;
					}

				} else if (result instanceof Objective) {
					const calculatedDifficulty = await result.calculateDifficulty(base, inventory);
					if (isNaN(calculatedDifficulty)) {
						this.log.info(`Invalid difficulty - ${result.getHashCode()}`);
					}

					difficulty += calculatedDifficulty;

				} else {
					this.log.info("Unknown difficulty");
				}
			}
		}

		if (hashCode !== undefined) {
			Objective.calculatedDifficulties[hashCode] = difficulty;
		}

		return difficulty;
	}

	public getName(): string {
		return this.constructor.name;
	}

	public shouldSaveChildObjectives(): boolean {
		return true;
	}
	
	public onMove(): void {
	}

	protected abstract onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined>;

	protected getBaseDifficulty(base: IBase, inventory: IInventoryItems): number {
		return 1;
	}

	protected get log(): Log {
		if (!this.calculatingDifficulty) {
			if (this._log === undefined) {
				this._log = new Log("MOD", "TARS", this.getName());
			}

			return this._log;
		}

		return nullLog;
	}

	protected async pickEasiestObjective(base: IBase, inventory: IInventoryItems, objectiveSets: IObjective[][]): Promise<IObjective | undefined> {
		let easiestObjective: IObjective | undefined;
		let easiestDifficulty: number | undefined;

		for (const objectives of objectiveSets) {
			const objectiveDifficulty = await this.calculateObjectiveDifficulties(base, inventory, ...objectives);

			this.log.info(`Objective ${objectives.map(o => o.getHashCode()).join(",")}. Difficulty: ${objectiveDifficulty}`);

			if (objectiveDifficulty < missionImpossible && (easiestDifficulty === undefined || easiestDifficulty > objectiveDifficulty)) {
				easiestDifficulty = objectiveDifficulty;
				easiestObjective = objectives[0];
			}
		}

		if (easiestObjective) {
			this.log.info(`Easiest objective is ${easiestObjective.getHashCode()} (difficulty: ${easiestDifficulty})`);

		} else {
			this.log.info(`All ${objectiveSets.length} objectives are impossible`);
		}

		return easiestObjective;
	}

	protected async calculateObjectiveDifficulties(base: IBase, inventory: IInventoryItems, ...objectives: IObjective[]): Promise<number> {
		let totalDifficulty = 0;

		for (const objective of objectives) {
			const difficulty = await objective.calculateDifficulty(base, inventory);

			// this.log.info(`\tObjective ${objective.getHashCode()}. Difficulty: ${difficulty}`);

			if (difficulty >= missionImpossible) {
				return missionImpossible;
			}

			totalDifficulty += difficulty;
		}

		return totalDifficulty;
	}

	protected async executeActionForItem<T extends ActionType>(actionType: T, executor: (action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R> ? ActionExecutor<A, E, R> : never) => void, itemTypes: ItemType[]): Promise<ObjectiveStatus | undefined> {
		let matchingNewItem = await this.executeActionCompareInventoryItems(actionType, executor, itemTypes);
		if (matchingNewItem !== undefined) {
			this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]}`);
			return ObjectiveStatus.Complete;
		}

		const tile = localPlayer.getTile();
		if (tile && tile.containedItems !== undefined && tile.containedItems.find((item) => itemTypes.indexOf(item.type) !== -1)) {
			console.log("found item!");
			matchingNewItem = await this.executeActionCompareInventoryItems(ActionType.Idle, undefined, itemTypes);

			if (matchingNewItem !== undefined) {
				console.log("picked up item!");

				this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (via idle)`);
				return ObjectiveStatus.Complete;

			} else {
				console.log("didn't pick up item?");
			}
		}
	}

	private async executeActionCompareInventoryItems(actionType: ActionType, executor: any, itemTypes: ItemType[]) {
		const itemsBefore = localPlayer.inventory.containedItems.slice(0);

		await executeAction(actionType, executor);

		const newItems = localPlayer.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);

		return newItems.find(item => itemTypes.indexOf(item.type) !== -1);
	}
}
