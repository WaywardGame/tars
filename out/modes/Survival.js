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
define(["require", "exports", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/IGame", "game/item/IItem", "game/entity/creature/ICreature", "game/biome/IBiome", "../core/context/IContext", "../core/objective/IObjective", "../objectives/acquire/item/AcquireFood", "../objectives/acquire/item/AcquireItem", "../objectives/acquire/item/specific/AcquireWaterContainer", "../objectives/analyze/AnalyzeInventory", "../objectives/core/Lambda", "../objectives/core/Restart", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/Idle", "../objectives/other/item/ReinforceItem", "../objectives/utility/moveTo/MoveToBase", "../objectives/other/UpgradeInventoryItem", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/utility/DrainSwamp", "../objectives/utility/moveTo/MoveToNewIsland", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory", "../objectives/acquire/item/specific/AcquireUseOrbOfInfluence", "../objectives/other/item/CheckDecayingItems", "../objectives/other/creature/HuntCreatures", "../objectives/utility/PlantSeeds", "../objectives/other/item/CheckSpecialItems", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/acquire/item/specific/AcquireWater", "../objectives/core/MoveToTarget", "../objectives/utility/moveTo/MoveToLand", "./BaseMode", "../objectives/other/tile/Fish", "../objectives/other/doodad/StartWaterSourceDoodad"], function (require, exports, IEntity_1, IHuman_1, IStats_1, IGame_1, IItem_1, ICreature_1, IBiome_1, IContext_1, IObjective_1, AcquireFood_1, AcquireItem_1, AcquireWaterContainer_1, AnalyzeInventory_1, Lambda_1, Restart_1, BuildItem_1, EquipItem_1, Idle_1, ReinforceItem_1, MoveToBase_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, DrainSwamp_1, MoveToNewIsland_1, OrganizeBase_1, OrganizeInventory_1, AcquireUseOrbOfInfluence_1, CheckDecayingItems_1, HuntCreatures_1, PlantSeeds_1, CheckSpecialItems_1, AcquireInventoryItem_1, AcquireWater_1, MoveToTarget_1, MoveToLand_1, BaseMode_1, Fish_1, StartWaterSourceDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SurvivalMode = void 0;
    class SurvivalMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const chest = context.human.getEquippedItem(IHuman_1.EquipType.Chest);
            const legs = context.human.getEquippedItem(IHuman_1.EquipType.Legs);
            const waist = context.human.getEquippedItem(IHuman_1.EquipType.Waist);
            const neck = context.human.getEquippedItem(IHuman_1.EquipType.Neck);
            const back = context.human.getEquippedItem(IHuman_1.EquipType.Back);
            const head = context.human.getEquippedItem(IHuman_1.EquipType.Head);
            const feet = context.human.getEquippedItem(IHuman_1.EquipType.Feet);
            const hands = context.human.getEquippedItem(IHuman_1.EquipType.Hands);
            const objectives = [];
            const moveToNewIslandState = context.getDataOrDefault(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
            if (moveToNewIslandState === IContext_1.MovingToNewIslandState.Ready) {
                objectives.push(new MoveToNewIsland_1.default());
                return objectives;
            }
            if (context.inventory.sailboat && context.human.island.items.isContainableInContainer(context.inventory.sailboat, context.human.inventory)) {
                const movedToNewIslandObjectives = [];
                if (context.utilities.base.hasBase(context)) {
                    movedToNewIslandObjectives.push(new MoveToBase_1.default());
                }
                else {
                    const target = await context.utilities.base.findInitialBuildTile(context);
                    if (target) {
                        movedToNewIslandObjectives.push(new MoveToTarget_1.default(target, true));
                    }
                    else {
                        movedToNewIslandObjectives.push(new MoveToLand_1.default());
                    }
                }
                movedToNewIslandObjectives.push(new AnalyzeInventory_1.default());
                objectives.push(movedToNewIslandObjectives);
            }
            objectives.push(new CheckSpecialItems_1.default());
            objectives.push(...await this.getCommonInitialObjectives(context));
            if (context.utilities.base.canBuildWaterDesalinators(context)) {
                if (context.base.dripStone.length === 0) {
                    objectives.push([new AcquireInventoryItem_1.default("dripStone"), new BuildItem_1.default()]);
                }
            }
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            objectives.push(new AcquireInventoryItem_1.default("hammer"));
            objectives.push(new AcquireInventoryItem_1.default("tongs"));
            await this.runWhileNearBase(context, objectives, IContext_1.ContextDataType.NearBase1, async (context, objectives) => {
                for (const doodad of context.utilities.base.getWaterSourceDoodads(context)) {
                    objectives.push(new StartWaterSourceDoodad_1.default(doodad));
                }
                const seeds = context.utilities.item.getSeeds(context, true);
                if (seeds.length > 0) {
                    objectives.push(new PlantSeeds_1.default(seeds));
                }
                const foodItemsNeeded = Math.max(2 - (context.inventory.food?.length ?? 0), 0);
                if (foodItemsNeeded > 0) {
                    for (let i = 0; i < foodItemsNeeded; i++) {
                        objectives.push([new AcquireFood_1.default({ onlyAllowBaseItems: true }), new AnalyzeInventory_1.default()]);
                    }
                }
            });
            objectives.push(new AcquireInventoryItem_1.default("heal"));
            if (context.options.survivalMaintainLowDifficulty && context.utilities.creature.hasDecentEquipment(context)) {
                await this.runWhile(context, objectives, "LoweringMalignity", async (context) => context.island.getReputation() < 5000, async (context, objectives) => {
                    if (context.island.getReputation() >= 15000) {
                        return;
                    }
                    objectives.push(new Fish_1.default());
                    objectives.push(new Restart_1.default());
                });
            }
            const waitingForWater = context.human.stat.get(IStats_1.Stat.Thirst).value <= context.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Thirst) &&
                ((context.base.dripStone.length > 0 && context.base.dripStone.some(dripStone => context.utilities.doodad.isWaterSourceDoodadBusy(dripStone))) ||
                    (context.base.waterStill.length > 0 && context.base.waterStill.some(waterStill => context.utilities.doodad.isWaterSourceDoodadBusy(waterStill))));
            if (!waitingForWater && context.options.allowBackpacks) {
                objectives.push(new AcquireInventoryItem_1.default("backpack"));
            }
            const shouldUpgradeToLeather = !waitingForWater && !context.options.lockEquipment;
            if (shouldUpgradeToLeather) {
                if (waist === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherBelt), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Waist)]);
                }
                if (neck === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherGorget), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Neck)]);
                }
                if (head === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherCap), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Head)]);
                }
                if (back === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherQuiver), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Back)]);
                }
                if (feet === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherBoots), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Feet)]);
                }
                if (hands === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherGloves), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Hands)]);
                }
                if (legs && legs.type === IItem_1.ItemType.BarkLeggings) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherPants), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Legs)]);
                }
                if (chest && chest.type === IItem_1.ItemType.BarkTunic) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherTunic), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Chest)]);
                }
            }
            if (context.options.survivalUseOrbsOfInfluence) {
                objectives.push(new AcquireUseOrbOfInfluence_1.default());
            }
            if (context.base.well.length === 0 && context.base.availableUnlimitedWellLocation !== undefined) {
                objectives.push([new AcquireInventoryItem_1.default("well"), new BuildItem_1.default()]);
            }
            if (context.base.kiln.length === 0) {
                objectives.push([new AcquireInventoryItem_1.default("kiln"), new BuildItem_1.default()]);
            }
            if (context.base.furnace.length === 0) {
                objectives.push([new AcquireInventoryItem_1.default("furnace"), new BuildItem_1.default()]);
            }
            if (context.base.anvil.length === 0) {
                objectives.push([new AcquireInventoryItem_1.default("anvil"), new BuildItem_1.default()]);
            }
            if (context.inventory.waterContainer === undefined) {
                objectives.push([new AcquireWaterContainer_1.default(), new AnalyzeInventory_1.default()]);
            }
            const { safeToDrinkWaterContainers, availableWaterContainers } = context.utilities.item.getWaterContainers(context);
            await this.runWhileNearBase(context, objectives, IContext_1.ContextDataType.NearBase2, async (context, objectives) => {
                if (context.utilities.base.canBuildWaterDesalinators(context) && context.base.dripStone.length < 2) {
                    objectives.push([new AcquireInventoryItem_1.default("dripStone"), new BuildItem_1.default()]);
                }
                if (context.inventory.food === undefined) {
                    objectives.push([new AcquireFood_1.default(), new AnalyzeInventory_1.default()]);
                }
                objectives.push(new AcquireInventoryItem_1.default("bandage"));
                if (moveToNewIslandState === IContext_1.MovingToNewIslandState.None) {
                    if (context.options.survivalClearSwamps && context.island.biomeType !== IBiome_1.BiomeType.Wetlands) {
                        const swampTiles = context.utilities.base.getSwampTilesNearBase(context);
                        if (swampTiles.length > 0) {
                            const boglings = context.utilities.base.getNonTamedCreaturesNearBase(context)
                                .filter(creature => creature.type === ICreature_1.CreatureType.Bogling);
                            if (boglings.length > 0) {
                                objectives.push(new HuntCreatures_1.default(boglings));
                            }
                            objectives.push(new DrainSwamp_1.default(swampTiles));
                        }
                    }
                    if (context.options.survivalOrganizeBase) {
                        await this.runWhile(context, objectives, "OrganizeBase", async (context) => context.utilities.base.getTilesWithItemsNearBase(context).totalCount > 20, async () => {
                            const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
                            objectives.push(new OrganizeBase_1.default(tiles.tiles));
                        });
                    }
                }
                if (safeToDrinkWaterContainers.length < 2 && availableWaterContainers.length > 0) {
                    objectives.push([new AcquireWater_1.default({ disallowTerrain: true, disallowWell: true, allowStartingWaterSourceDoodads: true, allowWaitingForWater: true }), new AnalyzeInventory_1.default()]);
                }
            });
            if (context.inventory.equipSword) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipSword, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipShield) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipShield, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            await this.runWhileNearBase(context, objectives, IContext_1.ContextDataType.NearBase3, async (context, objectives) => {
                const creatures = context.utilities.base.getNonTamedCreaturesNearBase(context)
                    .filter(creature => creature.hasAi(IEntity_1.AiType.Hostile) || creature.hasAi(IEntity_1.AiType.Hidden));
                if (creatures.length > 0) {
                    objectives.push(new HuntCreatures_1.default(creatures));
                }
            });
            if (context.inventory.equipWaist) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipWaist, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipNeck) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipNeck, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipFeet) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipFeet, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipHands) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipHands, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipLegs) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipLegs, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipChest) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipChest, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipBack) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipBack, { targetDurabilityMultipler: 1 }));
            }
            if (context.inventory.axe) {
                objectives.push(new ReinforceItem_1.default(context.inventory.axe, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.pickAxe) {
                objectives.push(new ReinforceItem_1.default(context.inventory.pickAxe, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.hammer) {
                objectives.push(new ReinforceItem_1.default(context.inventory.hammer, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.shovel) {
                objectives.push(new ReinforceItem_1.default(context.inventory.shovel, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.hoe) {
                objectives.push(new ReinforceItem_1.default(context.inventory.hoe, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.tongs) {
                objectives.push(new ReinforceItem_1.default(context.inventory.tongs, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.options.allowBackpacks) {
                objectives.push(new AcquireInventoryItem_1.default("backpack", { desiredCount: 2 }));
            }
            this.addUpgradeItemObjectives(context, objectives, "equipSword", new Set([IItem_1.ItemType.WoodenSword, IItem_1.ItemType.TinSword]));
            this.addUpgradeItemObjectives(context, objectives, "equipShield", new Set([IItem_1.ItemType.WoodenShield, IItem_1.ItemType.BarkShield, IItem_1.ItemType.TinShield]));
            this.addUpgradeItemObjectives(context, objectives, "equipWaist", new Set([IItem_1.ItemType.LeatherBelt]));
            this.addUpgradeItemObjectives(context, objectives, "equipNeck", new Set([IItem_1.ItemType.LeatherGorget, IItem_1.ItemType.TinBevor]));
            this.addUpgradeItemObjectives(context, objectives, "equipHead", new Set([IItem_1.ItemType.LeatherCap, IItem_1.ItemType.TinHelmet, IItem_1.ItemType.PirateHat, IItem_1.ItemType.StrawHat]));
            this.addUpgradeItemObjectives(context, objectives, "equipFeet", new Set([IItem_1.ItemType.LeatherBoots, IItem_1.ItemType.TinFootgear]));
            this.addUpgradeItemObjectives(context, objectives, "equipHands", new Set([IItem_1.ItemType.LeatherGloves, IItem_1.ItemType.TinGloves]));
            this.addUpgradeItemObjectives(context, objectives, "equipLegs", new Set([IItem_1.ItemType.LeatherPants, IItem_1.ItemType.TinChausses]));
            this.addUpgradeItemObjectives(context, objectives, "equipChest", new Set([IItem_1.ItemType.LeatherTunic, IItem_1.ItemType.TinChest]));
            this.addUpgradeItemObjectives(context, objectives, "knife", new Set([IItem_1.ItemType.GraniteKnife, IItem_1.ItemType.BasaltKnife, IItem_1.ItemType.SandstoneKnife, IItem_1.ItemType.TinKnife]));
            this.addUpgradeItemObjectives(context, objectives, "axe", new Set([IItem_1.ItemType.GraniteAxe, IItem_1.ItemType.BasaltAxe, IItem_1.ItemType.SandstoneAxe, IItem_1.ItemType.TinAxe]));
            this.addUpgradeItemObjectives(context, objectives, "pickAxe", new Set([IItem_1.ItemType.GranitePickaxe, IItem_1.ItemType.BasaltPickaxe, IItem_1.ItemType.SandstonePickaxe, IItem_1.ItemType.TinPickaxe]));
            this.addUpgradeItemObjectives(context, objectives, "shovel", new Set([IItem_1.ItemType.GraniteShovel, IItem_1.ItemType.BasaltShovel, IItem_1.ItemType.SandstoneShovel, IItem_1.ItemType.TinShovel]));
            this.addUpgradeItemObjectives(context, objectives, "hammer", new Set([IItem_1.ItemType.GraniteHammer, IItem_1.ItemType.BasaltHammer, IItem_1.ItemType.SandstoneHammer, IItem_1.ItemType.TinHammer]));
            this.addUpgradeItemObjectives(context, objectives, "hoe", new Set([IItem_1.ItemType.GraniteHoe, IItem_1.ItemType.BasaltHoe, IItem_1.ItemType.SandstoneHoe, IItem_1.ItemType.TinHoe]));
            if (moveToNewIslandState === IContext_1.MovingToNewIslandState.None) {
                await this.runWhileNearBase(context, objectives, IContext_1.ContextDataType.NearBase4, async (context, objectives) => {
                    objectives.push(new CheckDecayingItems_1.default());
                });
            }
            objectives.push([new AcquireInventoryItem_1.default("curePoison")]);
            if (context.base.solarStill.length === 0) {
                objectives.push([new AcquireInventoryItem_1.default("solarStill"), new BuildItem_1.default()]);
            }
            if (context.options.survivalExploreIslands && (!multiplayer.isConnected() || multiplayer.getOptions().allowTraveling)) {
                const { safeToDrinkWaterContainers } = context.utilities.item.getWaterContainers(context);
                const waterItemsNeeded = Math.max(4 - safeToDrinkWaterContainers.length, 0);
                const foodItemsNeeded = Math.max(4 - (context.inventory.food?.length ?? 0), 0);
                const health = context.human.stat.get(IStats_1.Stat.Health);
                const hunger = context.human.stat.get(IStats_1.Stat.Hunger);
                const needHealthRecovery = health.value / health.max < 0.9;
                const needHungerRecovery = hunger.value / hunger.max < 0.7;
                switch (moveToNewIslandState) {
                    case IContext_1.MovingToNewIslandState.None:
                        objectives.push(new Lambda_1.default(async () => {
                            context.setInitialStateData(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Preparing);
                            return IObjective_1.ObjectiveResult.Complete;
                        }));
                    case IContext_1.MovingToNewIslandState.Preparing:
                        if (context.base.sailboat.length === 0) {
                            objectives.push([new AcquireInventoryItem_1.default("sailboat"), new BuildItem_1.default()]);
                        }
                        if (needHealthRecovery) {
                            objectives.push(new RecoverHealth_1.default(false));
                        }
                        if (needHungerRecovery) {
                            objectives.push(new RecoverHunger_1.default(false, true));
                        }
                        objectives.push(new AcquireInventoryItem_1.default("bandage", { desiredCount: 2 }));
                        if (waterItemsNeeded > 0) {
                            for (let i = 0; i < waterItemsNeeded; i++) {
                                objectives.push([new AcquireWater_1.default({ disallowTerrain: true, disallowWell: true, allowStartingWaterSourceDoodads: true, allowWaitingForWater: true }), new AnalyzeInventory_1.default()]);
                            }
                        }
                        if (foodItemsNeeded > 0) {
                            for (let i = 0; i < foodItemsNeeded; i++) {
                                objectives.push([new AcquireFood_1.default({ onlyAllowBaseItems: true }), new AnalyzeInventory_1.default()]);
                            }
                        }
                        objectives.push(new Lambda_1.default(async () => {
                            context.setInitialStateData(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Ready);
                            return IObjective_1.ObjectiveResult.Complete;
                        }));
                }
                objectives.push(new Restart_1.default());
            }
            else {
                const health = context.human.stat.get(IStats_1.Stat.Health);
                if (health.value / health.max < 0.9) {
                    objectives.push(new RecoverHealth_1.default(false));
                }
                const hunger = context.human.stat.get(IStats_1.Stat.Hunger);
                if (hunger.value / hunger.max < 0.7) {
                    objectives.push(new RecoverHunger_1.default(false, true));
                }
                objectives.push(new MoveToBase_1.default());
                if (context.options.survivalOrganizeBase) {
                    objectives.push(new OrganizeBase_1.default(context.utilities.base.getTilesWithItemsNearBase(context).tiles));
                }
                objectives.push(new OrganizeInventory_1.default());
            }
            if (!multiplayer.isConnected()) {
                if (shouldUpgradeToLeather && game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished(true);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus("Finish"));
                }
                else {
                    objectives.push(new Idle_1.default());
                }
            }
            return objectives;
        }
        addUpgradeItemObjectives(context, objectives, inventoryItemKey, fromItemTypes) {
            const item = context.inventory[inventoryItemKey];
            if (!item) {
                return;
            }
            let islandSaveData = context.tars.saveData.island[context.human.island.id];
            if (!islandSaveData) {
                islandSaveData = context.tars.saveData.island[context.human.island.id] = {};
            }
            const upgradeItemKey = `UpgradeItem:${inventoryItemKey}`;
            if (islandSaveData[upgradeItemKey]) {
                return;
            }
            objectives.push([
                new UpgradeInventoryItem_1.default(inventoryItemKey, fromItemTypes),
                new Lambda_1.default(async () => {
                    islandSaveData[upgradeItemKey] = true;
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(`Marking ${inventoryItemKey} upgrade as done`),
                new AnalyzeInventory_1.default(),
                new Restart_1.default(),
            ]);
            objectives.push([
                new Lambda_1.default(async () => {
                    islandSaveData[upgradeItemKey] = true;
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(`Marking ${inventoryItemKey} upgrade as done`),
            ]);
        }
        async runWhileNearBase(context, objectives, id, determineObjectives) {
            return this.runWhile(context, objectives, id, async (context) => context.utilities.base.isNearBase(context), determineObjectives);
        }
        async runWhile(context, objectives, id, initialCondition, determineObjectives) {
            const isContinuing = context.getDataOrDefault(id, false);
            if (!isContinuing && !await initialCondition(context)) {
                return;
            }
            if (isContinuing) {
                context.log.debug(`${id} - Continuing`);
            }
            else {
                objectives.push(new Lambda_1.default(async () => {
                    context.setInitialStateData(id, true);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(`${id} - Marked`));
            }
            await determineObjectives(context, objectives);
            objectives.push(new Lambda_1.default(async () => {
                context.setInitialStateData(id, undefined);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(`${id} - Finished`));
        }
    }
    exports.SurvivalMode = SurvivalMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vydml2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvU3Vydml2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQW1ESCxNQUFhLFlBQWEsU0FBUSxtQkFBUTtRQUlsQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztZQUN2RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQ2hELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FB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T0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLGFBQWEsRUFBRSxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsRUFBRSxnQkFBUSxDQUFDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzSixJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFlBQVksRUFBRSxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLGFBQWEsRUFBRSxnQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFlBQVksRUFBRSxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFlBQVksRUFBRSxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0SCxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFlBQVksRUFBRSxnQkFBUSxDQUFDLFdBQVcsRUFBRSxnQkFBUSxDQUFDLGNBQWMsRUFBRSxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoSyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsRUFBRSxnQkFBUSxDQUFDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFlBQVksRUFBRSxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0SixJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBUSxDQUFDLGNBQWMsRUFBRSxnQkFBUSxDQUFDLGFBQWEsRUFBRSxnQkFBUSxDQUFDLGdCQUFnQixFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFLLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsZUFBZSxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JLLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsZUFBZSxFQUFFLGdCQUFRLENBQUMs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