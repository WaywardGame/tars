define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/IGame", "game/item/IItem", "game/entity/creature/ICreature", "../core/context/ContextState", "../core/context/IContext", "../core/objective/IObjective", "../objectives/acquire/item/AcquireFood", "../objectives/acquire/item/AcquireItem", "../objectives/acquire/item/AcquireItemByGroup", "../objectives/acquire/item/AcquireItemByTypes", "../objectives/acquire/item/AcquireItemForAction", "../objectives/acquire/item/AcquireItemForDoodad", "../objectives/acquire/item/specific/AcquireWaterContainer", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/core/ExecuteAction", "../objectives/core/Lambda", "../objectives/core/Restart", "../objectives/gather/GatherWater", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/Idle", "../objectives/other/item/ReinforceItem", "../objectives/other/ReturnToBase", "../objectives/other/doodad/StartWaterStillDesalination", "../objectives/other/UpgradeInventoryItem", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/utility/DrainSwamp", "../objectives/utility/moveTo/MoveToLand", "../objectives/utility/moveTo/MoveToNewIsland", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory", "../objectives/acquire/item/specific/AcquireUseOrbOfInfluence", "../objectives/other/item/CheckDecayingItems", "../objectives/other/creature/HuntCreatures", "../objectives/utility/PlantSeeds", "../objectives/gather/GatherWaters", "../objectives/other/item/CheckSpecialItems", "../core/ITars", "../ITarsMod", "./CommonInitialObjectives", "../objectives/other/doodad/StartSolarStill"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IGame_1, IItem_1, ICreature_1, ContextState_1, IContext_1, IObjective_1, AcquireFood_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemByTypes_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, Lambda_1, Restart_1, GatherWater_1, BuildItem_1, EquipItem_1, Idle_1, ReinforceItem_1, ReturnToBase_1, StartWaterStillDesalination_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, DrainSwamp_1, MoveToLand_1, MoveToNewIsland_1, OrganizeBase_1, OrganizeInventory_1, AcquireUseOrbOfInfluence_1, CheckDecayingItems_1, HuntCreatures_1, PlantSeeds_1, GatherWaters_1, CheckSpecialItems_1, ITars_1, ITarsMod_1, CommonInitialObjectives_1, StartSolarStill_1) {
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
                objectives.push([
                    new MoveToLand_1.default(),
                    new ExecuteAction_1.default(IAction_1.ActionType.Drop, (context, action) => {
                        action.execute(context.actionExecutor, context.inventory.sailBoat);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus("Dropping sailboat"),
                    new AnalyzeInventory_1.default(),
                ]);
            }
            objectives.push(new CheckSpecialItems_1.default());
            objectives.push(...await (0, CommonInitialObjectives_1.getCommonInitialObjectives)(context));
            if (context.utilities.base.shouldBuildWaterStills(context) && context.base.waterStill.length === 0 && context.inventory.waterStill === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitWaterStill), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
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
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadType.WoodenChest), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (context.inventory.hammer === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneHammer), new AnalyzeInventory_1.default()]);
            }
            if (context.inventory.tongs === undefined) {
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Tongs), new AnalyzeInventory_1.default()]);
            }
            if (context.utilities.base.isNearBase(context)) {
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
                objectives.push(new CheckDecayingItems_1.default());
            }
            if (context.base.kiln.length === 0 && context.inventory.kiln === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitKiln), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (context.inventory.heal === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Heal), new AnalyzeInventory_1.default()]);
            }
            const waitingForWater = context.human.stat.get(IStats_1.Stat.Thirst).value <= context.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Thirst) &&
                context.base.waterStill.length > 0 && context.base.waterStill[0].description().providesFire;
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
            if (context.base.well.length === 0 && context.inventory.well === undefined && context.base.availableUnlimitedWellLocation !== undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.Well), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (context.base.furnace.length === 0 && context.inventory.furnace === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitFurnace), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (context.base.anvil.length === 0 && context.inventory.anvil === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.Anvil), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (context.inventory.waterContainer === undefined) {
                objectives.push([new AcquireWaterContainer_1.default(), new AnalyzeInventory_1.default()]);
            }
            if (context.utilities.base.isNearBase(context)) {
                if (context.utilities.base.shouldBuildWaterStills(context) && context.base.waterStill.length < 2) {
                    objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitWaterStill), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
                }
                if (context.inventory.food === undefined) {
                    objectives.push([new AcquireFood_1.default(), new AnalyzeInventory_1.default()]);
                }
                if (context.inventory.bandage === undefined) {
                    objectives.push([new AcquireItemByTypes_1.default(ITars_1.inventoryItemInfo.bandage.itemTypes), new AnalyzeInventory_1.default()]);
                }
                const drinkableWaterContainers = [];
                const availableWaterContainers = [];
                if (context.inventory.waterContainer !== undefined) {
                    for (const waterContainer of context.inventory.waterContainer) {
                        if (context.utilities.item.isSafeToDrinkItem(waterContainer)) {
                            drinkableWaterContainers.push(waterContainer);
                        }
                        else {
                            availableWaterContainers.push(waterContainer);
                        }
                    }
                    if (availableWaterContainers.length > 0) {
                        objectives.push(new GatherWaters_1.default(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true }));
                    }
                }
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
                        const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
                        if (tiles.totalCount > 20) {
                            objectives.push(new OrganizeBase_1.default(tiles.tiles));
                        }
                    }
                }
                if (drinkableWaterContainers.length < 2 && availableWaterContainers.length > 0) {
                    objectives.push(new GatherWaters_1.default(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }));
                }
            }
            if (context.inventory.equipSword) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipSword, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.inventory.equipShield) {
                objectives.push(new ReinforceItem_1.default(context.inventory.equipShield, { minWorth: 200, targetDurabilityMultipler: 2 }));
            }
            if (context.utilities.base.isNearBase(context)) {
                const creatures = context.utilities.base.getNonTamedCreaturesNearBase(context)
                    .filter(creature => creature.hasAi(IEntity_1.AiType.Hostile) || creature.hasAi(IEntity_1.AiType.Hidden));
                if (creatures.length > 0) {
                    objectives.push(new HuntCreatures_1.default(creatures));
                }
            }
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
            this.addUpgradeItemObjectives(context, objectives, "equipSword", new Set([IItem_1.ItemType.WoodenSword, IItem_1.ItemType.TinSword]));
            this.addUpgradeItemObjectives(context, objectives, "equipShield", new Set([IItem_1.ItemType.WoodenShield, IItem_1.ItemType.TinShield]));
            this.addUpgradeItemObjectives(context, objectives, "equipBelt", new Set([IItem_1.ItemType.LeatherBelt]));
            this.addUpgradeItemObjectives(context, objectives, "equipNeck", new Set([IItem_1.ItemType.LeatherGorget, IItem_1.ItemType.TinBevor]));
            this.addUpgradeItemObjectives(context, objectives, "equipHead", new Set([IItem_1.ItemType.LeatherCap, IItem_1.ItemType.TinHelmet, IItem_1.ItemType.PirateHat]));
            this.addUpgradeItemObjectives(context, objectives, "equipFeet", new Set([IItem_1.ItemType.LeatherBoots, IItem_1.ItemType.TinFootgear]));
            this.addUpgradeItemObjectives(context, objectives, "equipHands", new Set([IItem_1.ItemType.LeatherGloves, IItem_1.ItemType.TinGloves]));
            this.addUpgradeItemObjectives(context, objectives, "equipLegs", new Set([IItem_1.ItemType.LeatherPants, IItem_1.ItemType.TinChausses]));
            this.addUpgradeItemObjectives(context, objectives, "equipChest", new Set([IItem_1.ItemType.LeatherTunic, IItem_1.ItemType.TinChest]));
            this.addUpgradeItemObjectives(context, objectives, "axe", new Set([IItem_1.ItemType.StoneAxe, IItem_1.ItemType.TinAxe]));
            this.addUpgradeItemObjectives(context, objectives, "pickAxe", new Set([IItem_1.ItemType.StonePickaxe, IItem_1.ItemType.TinPickaxe]));
            this.addUpgradeItemObjectives(context, objectives, "shovel", new Set([IItem_1.ItemType.StoneShovel, IItem_1.ItemType.TinShovel]));
            this.addUpgradeItemObjectives(context, objectives, "hammer", new Set([IItem_1.ItemType.StoneHammer, IItem_1.ItemType.TinHammer]));
            this.addUpgradeItemObjectives(context, objectives, "hoe", new Set([IItem_1.ItemType.StoneHoe, IItem_1.ItemType.TinHoe]));
            if (context.options.survivalExploreIslands && !multiplayer.isConnected()) {
                const needWaterItems = context.inventory.waterContainer === undefined || context.inventory.waterContainer.filter(item => context.utilities.item.isSafeToDrinkItem(item)).length < 2;
                const needFoodItems = context.inventory.food === undefined || context.inventory.food.length < 2;
                const health = context.human.stat.get(IStats_1.Stat.Health);
                const hunger = context.human.stat.get(IStats_1.Stat.Hunger);
                const needHealthRecovery = health.value / health.max < 0.9;
                const needHungerRecovery = hunger.value / hunger.max < 0.7;
                const isPreparing = needWaterItems || needFoodItems || needHealthRecovery || needHungerRecovery;
                switch (moveToNewIslandState) {
                    case IContext_1.MovingToNewIslandState.None:
                        objectives.push(new Lambda_1.default(async () => {
                            const initialState = new ContextState_1.default();
                            initialState.set(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Preparing);
                            context.setInitialState(initialState);
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
                        if (needWaterItems) {
                            const availableWaterContainers = context.inventory.waterContainer?.filter(item => !context.utilities.item.isSafeToDrinkItem(item));
                            if (availableWaterContainers && availableWaterContainers.length > 0) {
                                objectives.push(new GatherWaters_1.default(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }));
                            }
                            else {
                                objectives.push(new AcquireWaterContainer_1.default());
                                objectives.push(new GatherWater_1.default(undefined, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }));
                            }
                        }
                        if (needFoodItems) {
                            objectives.push([new AcquireFood_1.default(), new AnalyzeInventory_1.default()]);
                        }
                        objectives.push(new Lambda_1.default(async () => {
                            const initialState = new ContextState_1.default();
                            initialState.set(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Ready);
                            context.setInitialState(initialState);
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
                objectives.push(new ReturnToBase_1.default());
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
            const upgradeItemKey = `UpgradeItem:${inventoryItemKey}`;
            if (!fromItemTypes.has(item.type)) {
                return;
            }
            const islandSaveData = (0, ITarsMod_1.getTarsSaveData)("island")[context.human.island.id];
            objectives.push([
                new UpgradeInventoryItem_1.default(inventoryItemKey, fromItemTypes),
                new Lambda_1.default(async () => {
                    islandSaveData[upgradeItemKey] = true;
                    return IObjective_1.ObjectiveResult.Complete;
                }),
                new AnalyzeInventory_1.default(),
                new Restart_1.default(),
            ]);
        }
    }
    exports.SurvivalMode = SurvivalMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vydml2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvU3Vydml2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQTREQSxNQUFhLFlBQVk7UUFJakIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDdkUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUNoRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFN0QsTUFBTSxVQUFVLEdBQXFDLEVBQUUs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d0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsVUFBVSxFQUFFLGdCQUFRLENBQUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMs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