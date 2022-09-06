define(["require", "exports", "game/doodad/IDoodad", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/IGame", "game/item/IItem", "game/entity/creature/ICreature", "game/entity/action/actions/Drop", "../core/context/IContext", "../core/objective/IObjective", "../objectives/acquire/item/AcquireFood", "../objectives/acquire/item/AcquireItem", "../objectives/acquire/item/AcquireItemForDoodad", "../objectives/acquire/item/specific/AcquireWaterContainer", "../objectives/analyze/AnalyzeInventory", "../objectives/core/ExecuteAction", "../objectives/core/Lambda", "../objectives/core/Restart", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/Idle", "../objectives/other/item/ReinforceItem", "../objectives/utility/moveTo/MoveToBase", "../objectives/other/doodad/StartWaterStillDesalination", "../objectives/other/UpgradeInventoryItem", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/utility/DrainSwamp", "../objectives/utility/moveTo/MoveToNewIsland", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory", "../objectives/acquire/item/specific/AcquireUseOrbOfInfluence", "../objectives/other/item/CheckDecayingItems", "../objectives/other/creature/HuntCreatures", "../objectives/utility/PlantSeeds", "../objectives/other/item/CheckSpecialItems", "./CommonInitialObjectives", "../objectives/other/doodad/StartSolarStill", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/acquire/item/specific/AcquireWater", "../objectives/core/MoveToTarget", "../objectives/utility/moveTo/MoveToLand"], function (require, exports, IDoodad_1, IEntity_1, IHuman_1, IStats_1, IGame_1, IItem_1, ICreature_1, Drop_1, IContext_1, IObjective_1, AcquireFood_1, AcquireItem_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, AnalyzeInventory_1, ExecuteAction_1, Lambda_1, Restart_1, BuildItem_1, EquipItem_1, Idle_1, ReinforceItem_1, MoveToBase_1, StartWaterStillDesalination_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, DrainSwamp_1, MoveToNewIsland_1, OrganizeBase_1, OrganizeInventory_1, AcquireUseOrbOfInfluence_1, CheckDecayingItems_1, HuntCreatures_1, PlantSeeds_1, CheckSpecialItems_1, CommonInitialObjectives_1, StartSolarStill_1, AcquireInventoryItem_1, AcquireWater_1, MoveToTarget_1, MoveToLand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SurvivalMode = void 0;
    class SurvivalMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const chest = context.human.getEquippedItem(IHuman_1.EquipType.Chest);
            const legs = context.human.getEquippedItem(IHuman_1.EquipType.Legs);
            const belt = context.human.getEquippedItem(IHuman_1.EquipType.Belt);
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
            if (context.inventory.sailBoat && context.human.island.items.isContainableInContainer(context.inventory.sailBoat, context.human.inventory)) {
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
                movedToNewIslandObjectives.push(new ExecuteAction_1.default(Drop_1.default, [context.inventory.sailBoat]).setStatus("Dropping sailboat"), new AnalyzeInventory_1.default());
                objectives.push(movedToNewIslandObjectives);
            }
            objectives.push(new CheckSpecialItems_1.default());
            objectives.push(...await (0, CommonInitialObjectives_1.getCommonInitialObjectives)(context));
            if (context.utilities.base.shouldBuildWaterStills(context) && context.base.waterStill.length === 0) {
                objectives.push([new AcquireInventoryItem_1.default("waterStill"), new BuildItem_1.default()]);
            }
            if (!context.base.buildAnotherChest) {
                context.base.buildAnotherChest = true;
                if (context.base.chest.length > 0) {
                    for (const c of context.base.chest) {
                        if ((context.human.island.items.computeContainerWeight(c) / context.human.island.items.getWeightCapacity(c)) < 0.9) {
                            context.base.buildAnotherChest = false;
                            break;
                        }
                    }
                }
            }
            if (context.base.buildAnotherChest && context.inventory.chest === undefined) {
                context.base.buildAnotherChest = true;
                objectives.push([new AcquireInventoryItem_1.default("chest"), new BuildItem_1.default()]);
            }
            objectives.push(new AcquireInventoryItem_1.default("hammer"));
            objectives.push(new AcquireInventoryItem_1.default("tongs"));
            await this.runWhileNearBase(context, objectives, async (context, objectives) => {
                for (const solarStill of context.base.solarStill) {
                    if (!solarStill.stillContainer) {
                        objectives.push(new StartSolarStill_1.default(solarStill));
                    }
                }
                for (const waterStill of context.base.waterStill) {
                    objectives.push(new StartWaterStillDesalination_1.default(waterStill));
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
            if (context.base.kiln.length === 0) {
                objectives.push([new AcquireInventoryItem_1.default("kiln"), new BuildItem_1.default()]);
            }
            objectives.push(new AcquireInventoryItem_1.default("heal"));
            const waitingForWater = context.human.stat.get(IStats_1.Stat.Thirst).value <= context.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Thirst) &&
                context.base.waterStill.length > 0 && context.base.waterStill[0].description().providesFire;
            if (!waitingForWater && context.options.allowBackpacks) {
                objectives.push(new AcquireInventoryItem_1.default("backpack"));
            }
            const shouldUpgradeToLeather = !waitingForWater && !context.options.lockEquipment;
            if (shouldUpgradeToLeather) {
                if (belt === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherBelt), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Belt)]);
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
            await this.runWhileNearBase(context, objectives, async (context, objectives) => {
                if (context.utilities.base.shouldBuildWaterStills(context) && context.base.waterStill.length < 2) {
                    objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitWaterStill), new BuildItem_1.default()]);
                }
                if (context.inventory.food === undefined) {
                    objectives.push([new AcquireFood_1.default(), new AnalyzeInventory_1.default()]);
                }
                objectives.push(new AcquireInventoryItem_1.default("bandage"));
                if (moveToNewIslandState === IContext_1.MovingToNewIslandState.None) {
                    if (context.options.survivalClearSwamps) {
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
                    objectives.push([new AcquireWater_1.default({ disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }), new AnalyzeInventory_1.default()]);
                }
            });
            if (context.inventory.equipSword) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipSword, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipShield) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipShield, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            await this.runWhileNearBase(context, objectives, async (context, objectives) => {
                const creatures = context.utilities.base.getNonTamedCreaturesNearBase(context)
                    .filter(creature => creature.hasAi(IEntity_1.AiType.Hostile) || creature.hasAi(IEntity_1.AiType.Hidden));
                if (creatures.length > 0) {
                    objectives.push(new HuntCreatures_1.default(creatures));
                }
            });
            if (context.inventory.equipBelt) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipBelt, { minWorth: 200, targetDurabilityMultipler: 2 }));
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
            this.addUpgradeItemObjectives(context, objectives, "equipBelt", new Set([IItem_1.ItemType.LeatherBelt]));
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
                await this.runWhileNearBase(context, objectives, async (context, objectives) => {
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
                const isPreparing = waterItemsNeeded !== 0 || foodItemsNeeded !== 0 || needHealthRecovery || needHungerRecovery;
                switch (moveToNewIslandState) {
                    case IContext_1.MovingToNewIslandState.None:
                        objectives.push(new Lambda_1.default(async () => {
                            context.setInitialStateData(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Preparing);
                            return IObjective_1.ObjectiveResult.Complete;
                        }));
                    case IContext_1.MovingToNewIslandState.Preparing:
                        if (!context.inventory.sailBoat) {
                            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default()]);
                            if (isPreparing) {
                                objectives.push(new Restart_1.default());
                            }
                        }
                        if (needHealthRecovery) {
                            objectives.push(new RecoverHealth_1.default(false));
                        }
                        if (needHungerRecovery) {
                            objectives.push(new RecoverHunger_1.default(false, true));
                        }
                        if (waterItemsNeeded > 0) {
                            for (let i = 0; i < waterItemsNeeded; i++) {
                                objectives.push([new AcquireWater_1.default({ disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }), new AnalyzeInventory_1.default()]);
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
        async runWhileNearBase(context, objectives, determineObjectives) {
            return this.runWhile(context, objectives, "NearBase", async (context) => context.utilities.base.isNearBase(context), determineObjectives);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vydml2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvU3Vydml2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXFEQSxNQUFhLFlBQVk7UUFJakIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDdkUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUNoRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFN0QsTUFBTSxVQUFVLEdBQXFDLEVBQUUs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QUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxhQUFhLEVBQUUsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEgsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLEVBQUUsZ0JBQVEsQ0FBQyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0osSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLEVBQUUsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEgsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxhQUFhLEVBQUUsZ0JBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEgsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLEVBQUUsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEgsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLEVBQUUsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFD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