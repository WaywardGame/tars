import type Doodad from "@wayward/game/game/doodad/Doodad";
import { doodadDescriptions } from "@wayward/game/game/doodad/Doodads";
import type { DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import Enums from "@wayward/game/utilities/enum/Enums";
import DoodadManager from "@wayward/game/game/doodad/DoodadManager";

export class DoodadUtilities {

	public getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, includeLitAndRevert?: boolean): Set<DoodadType> {
		const doodadTypes = new Set<DoodadType>();
		if (DoodadManager.isGroup(doodadTypeOrGroup)) {
			for (const dt of Enums.values(DoodadType)) {
				const doodadDescription = doodadDescriptions[dt];
				if (!doodadDescription) {
					continue;
				}

				if (DoodadManager.isInGroup(dt, doodadTypeOrGroup)) {
					doodadTypes.add(dt);
				}

				const lit = doodadDescription.lit;
				if (lit !== undefined) {
					const litDoodadDescription = doodadDescriptions[lit];
					if (litDoodadDescription && DoodadManager.isInGroup(lit, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}

				const revert = doodadDescription.revert;
				if (revert !== undefined) {
					const revertDoodadDescription = doodadDescriptions[revert];
					if (revertDoodadDescription && DoodadManager.isInGroup(revert, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}
			}

		} else {
			doodadTypes.add(doodadTypeOrGroup);

			if (includeLitAndRevert) {
				const doodadDescription = doodadDescriptions[doodadTypeOrGroup];
				if (doodadDescription) {
					const lit = doodadDescription.lit;
					if (lit !== undefined) {
						const litDoodadDescription = doodadDescriptions[lit];
						if (litDoodadDescription) {
							doodadTypes.add(lit);
						}
					}

					const revert = doodadDescription.revert;
					if (revert !== undefined) {
						const revertDoodadDescription = doodadDescriptions[revert];
						if (revertDoodadDescription) {
							doodadTypes.add(revert);
						}
					}
				}
			}
		}

		return doodadTypes;
	}

	/**
	 * Checks if a drip stone is dripping / a water still is stilling
	 */
	public isWaterSourceDoodadBusy(waterSource: Doodad): boolean {
		if (waterSource.hasWater?.top) {
			// dripstone is dripping
			// note: dripstone may have purified water at the bottom at the same time.
			// so it could be busy but gatherable!
			return true;
		}

		if (waterSource.decay !== undefined &&
			waterSource.decay > 0 &&
			waterSource.gatherReady !== undefined &&
			waterSource.gatherReady > 0 &&
			waterSource.description?.providesFire) {
			return true;
		}

		return false;
	}

	/**
	 * gatherReady <= 0 for water stills.
	 * hasWater.bottom for dripstones.
	 */
	public isWaterSourceDoodadGatherable(waterSource: Doodad): boolean {
		return (waterSource.gatherReady !== undefined && waterSource.gatherReady <= 0) ||
			waterSource.hasWater?.bottom === true;
	}

	public getTurnsUntilWaterSourceIsGatherable(waterSource: Doodad): number {
		if (this.isWaterSourceDoodadGatherable(waterSource)) {
			return 0;
		}

		let turns = waterSource.gatherReady !== undefined ? waterSource.gatherReady : 0;

		if (waterSource.type === DoodadType.SolarStill) {
			// we also have to wait until it's daytime for it to start ticking
			const ticksUntilStartPurifiying = waterSource.island.game.time.getTicksUntilTimeIsBefore(0.5);
			if (ticksUntilStartPurifiying !== undefined) {
				turns += ticksUntilStartPurifiying;
				// console.log("ticksUntilPurifiying", ticksUntilStartPurifiying);

				// todo: extra math to see if we have enough time left today to purify the water?
				// determine how long we have to wait until it's nightime again
				// const ticksUntilStopPurifiying = waterSource.island.game.time.getTicksUntilTimeIsAtLeast(0.5, ticksUntilStartPurifiying);
			}
		}

		return turns;
	}

	public requiresFire(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): boolean {
		const description = doodadDescriptions[doodadTypeOrGroup];
		if (description?.lit !== undefined) {
			if (DoodadManager.isGroup(doodadTypeOrGroup)) {
				const litDescription = doodadDescriptions[description.lit];
				if (litDescription && DoodadManager.isInGroup(description.lit, doodadTypeOrGroup)) {
					return true;
				}

			} else if (description.lit === doodadTypeOrGroup) {
				return true;
			}
		}

		return false;
	}
}
