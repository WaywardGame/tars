import { ActionType } from "action/IAction";
import { IStat, Stat } from "entity/IStats";
import { ItemTypeGroup, TerrainType } from "Enums";
import { ITile } from "tile/ITerrain";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { MoveResult, moveToFaceTarget, moveToFaceTargetWithRetries } from "../Utilities/Movement";
import { getNearestTileLocation } from "../Utilities/Tile";
import AcquireWaterContainer from "./AcquireWaterContainer";
import ExecuteAction from "./ExecuteAction";
import GatherWater from "./GatherWater";
import StartFire from "./StartFire";
import UseItem from "./UseItem";

export default class RecoverThirst extends Objective {

	public getHashCode(): string {
		return "RecoverThirst";
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const waterStill = base.waterStill;

		const isEmergency = localPlayer.getStat<IStat>(Stat.Thirst).value <= 3 && (!waterStill || !waterStill.gatherReady);

		let isWaterInContainer: boolean | undefined;
		if (inventory.waterContainer !== undefined) {
			const waterContainerDescription = inventory.waterContainer.description()!;
			isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(ActionType.DrinkItem) !== -1;
			if (isWaterInContainer) {
				if (itemManager.isInGroup(inventory.waterContainer.type, ItemTypeGroup.ContainerOfMedicinalWater) ||
					itemManager.isInGroup(inventory.waterContainer.type, ItemTypeGroup.ContainerOfDesalinatedWater) ||
					itemManager.isInGroup(inventory.waterContainer.type, ItemTypeGroup.ContainerOfPurifiedFreshWater)) {
					this.log.info("Drink water from container");
					return new UseItem(inventory.waterContainer, ActionType.DrinkItem);
				}

				if (isEmergency && itemManager.isInGroup(inventory.waterContainer.type, ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
					// emergency!
					this.log.info("Drink water from container");
					return new UseItem(inventory.waterContainer, ActionType.DrinkItem);
				}
			}
		}

		if (isEmergency) {
			// look for nearby freshwater
			const nearestShallowFreshWater = await getNearestTileLocation(TerrainType.ShallowFreshWater, localPlayer);
			if (nearestShallowFreshWater.length > 0) {
				const moveResult = await moveToFaceTargetWithRetries((ignoredTiles: ITile[]) => {
					for (let i = 0; i < 2; i++) {
						const target = nearestShallowFreshWater[i];
						if (target) {
							const targetTile = game.getTileFromPoint(target.point);
							if (ignoredTiles.indexOf(targetTile) === -1) {
								return target.point;
							}
						}
					}

					return undefined;
				});

				if (moveResult === MoveResult.NoTarget) {
					this.log.info("Can't find freshwater");
					return ObjectiveStatus.Complete;

				} else if (moveResult === MoveResult.NoPath) {
					this.log.info("Can't path to freshwater");
					return ObjectiveStatus.Complete;

				} else if (moveResult !== MoveResult.Complete) {
					return;
				}

				this.log.info("Drink in front");

				return new ExecuteAction(ActionType.DrinkInFront, action => action.execute(localPlayer));
			}
		}

		if (inventory.waterContainer === undefined) {
			return new AcquireWaterContainer();
		}

		// desalinate water
		if (waterStill === undefined) {
			return ObjectiveStatus.Complete;
		}

		if (waterStill.gatherReady) {
			if (isWaterInContainer) {
				// pour out the water we have
				this.log.info("Emptying water from container");
				return new UseItem(inventory.waterContainer, ActionType.PourOnYourself);
			}

			// gather water
			this.log.info("Gather water from the water still");
			return new UseItem(inventory.waterContainer, ActionType.GatherWater, waterStill);

		} else if (waterStill.decay === -1) {

			if (isWaterInContainer) {
				// pour water into it
				this.log.info("Pour water into water still");
				return new UseItem(inventory.waterContainer, ActionType.Pour, waterStill);
			}

			this.log.info("Gather water");
			return new GatherWater(inventory.waterContainer);
		}

		const waterStillDescription = waterStill.description();
		if (waterStillDescription && waterStillDescription.providesFire) {
			// wait for water to be ready
			this.log.info(`Waiting for water to be purified. Decay: ${waterStill.decay}`);

			if (isEmergency) {
				// run back to the waterstill and wait
				const moveResult = await moveToFaceTarget(waterStill);
				if (moveResult === MoveResult.NoPath) {
					this.log.info("No path to water still");
					return;
				}

				if (moveResult === MoveResult.Moving) {
					return;
				}
			}

			return ObjectiveStatus.Complete;
		}
		
		return new StartFire(waterStill);
	}

}
