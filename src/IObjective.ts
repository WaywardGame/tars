import { ActionType, DamageType } from "Enums";
import { IBase, IInventoryItems } from "./ITars";

export const missionImpossible = 1000000;

export enum ObjectiveStatus {
	Complete = -1
}

export enum ObjectiveType {
	AcquireItem,
	Build,
	DefendAgainstCreature,
	GatherDoodad,
	GatherFromCreature,
	GatherFromTerrain,
	GatherWater,
	Idle,
	None,
	PlantSeed,
	RecoverHunger,
	RecoverStamina,
	RecoverThirst,
	ReduceWeight,
	Rest,
	UseItem
}

export interface IObjective {
	execute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined>;
	calculateDifficulty(base: IBase, inventory: IInventoryItems): Promise<number>;
	getName(): string;
	getHashCode(): string;
	shouldSaveChildObjectives(): boolean;
}

export interface IHandsEquipment {
	use: ActionType;
	preferredDamageType?: DamageType;
}
