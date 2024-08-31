import Human from "@wayward/game/game/entity/Human";
import type { IOptions } from "@wayward/game/save/data/ISaveDataGlobal";
import { DropLocation } from "@wayward/game/save/data/ISaveDataGlobal";
import Objects from "@wayward/utilities/object/Objects";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class OptionsInterrupt extends Objective {

	public static previousOptions: Map<number, IOptions | undefined> = new Map();

	private static readonly desiredOptions: Partial<IOptions> = {
		autoAttack: true, // todo: I think this should be false
		autoPickup: false,
		dropIntoContainers: false,
		dropLocation: DropLocation.Feet,
		dropOnDisassemble: true,
		dropOnDismantle: true,
		dropOnGatherHarvest: true,
		useAdjacentContainers: false,
		warnOnDangerousActions: false,
		warnWhenBreakingItems: false,
		warnWhenBreakingItemsOnCraft: false,
	}

	/**
	 * Restores options to the original state before starting TARS
	 */
	public static restore(human: Human): void {
		const referenceId = human.referenceId;
		if (referenceId === undefined) {
			return;
		}

		const previousOptions = OptionsInterrupt.previousOptions.get(referenceId);
		if (!previousOptions) {
			return;
		}

		for (const key of Objects.keys(previousOptions)) {
			const optionValue = previousOptions[key];
			if ((typeof (optionValue) === "boolean" || typeof (optionValue) === "number") && optionValue !== human.options[key]) {
				game.updateOption(human, key, optionValue);
			}
		}

		OptionsInterrupt.previousOptions.delete(referenceId);
	}

	public getIdentifier(): string {
		return "OptionsInterrupt";
	}

	public getStatus(): string | undefined {
		return "Updating options";
	}

	/**
	 * Updates options that helps TARS
	 */
	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.human.referenceId !== undefined && !OptionsInterrupt.previousOptions.has(context.human.referenceId)) {
			OptionsInterrupt.previousOptions.set(context.human.referenceId, Objects.deepClone(context.human.options as IOptions));
		}

		const updated: string[] = [];

		for (const optionKey of Object.keys(OptionsInterrupt.desiredOptions) as Array<keyof IOptions>) {
			if (context.human.options[optionKey] !== OptionsInterrupt.desiredOptions[optionKey]) {
				updated.push(`Updating ${optionKey}`);
				game.updateOption(context.human, optionKey, OptionsInterrupt.desiredOptions[optionKey] as any);
			}
		}

		if (updated.length > 0) {
			this.log.info(`Updating options. ${updated.join(", ")}`);
			return ObjectiveResult.Pending;
		}

		return ObjectiveResult.Ignore;
	}

}
