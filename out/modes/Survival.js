define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/IGame", "game/item/IItem", "game/entity/creature/ICreature", "../core/context/ContextState", "../core/context/IContext", "../core/objective/IObjective", "../objectives/acquire/item/AcquireFood", "../objectives/acquire/item/AcquireItem", "../objectives/acquire/item/AcquireItemByGroup", "../objectives/acquire/item/AcquireItemByTypes", "../objectives/acquire/item/AcquireItemForAction", "../objectives/acquire/item/AcquireItemForDoodad", "../objectives/acquire/item/specific/AcquireWaterContainer", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/core/ExecuteAction", "../objectives/core/Lambda", "../objectives/core/Restart", "../objectives/gather/GatherWater", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/Idle", "../objectives/other/item/ReinforceItem", "../objectives/other/ReturnToBase", "../objectives/other/doodad/StartWaterStillDesalination", "../objectives/other/UpgradeInventoryItem", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/utility/DrainSwamp", "../objectives/utility/moveTo/MoveToLand", "../objectives/utility/moveTo/MoveToNewIsland", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory", "../objectives/acquire/item/specific/AcquireUseOrbOfInfluence", "../objectives/other/item/CheckDecayingItems", "../objectives/other/creature/HuntCreatures", "../objectives/utility/PlantSeeds", "../objectives/gather/GatherWaters", "../objectives/other/item/CheckSpecialItems", "../core/ITars", "../ITarsMod", "./CommonInitialObjectives"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IGame_1, IItem_1, ICreature_1, ContextState_1, IContext_1, IObjective_1, AcquireFood_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemByTypes_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, Lambda_1, Restart_1, GatherWater_1, BuildItem_1, EquipItem_1, Idle_1, ReinforceItem_1, ReturnToBase_1, StartWaterStillDesalination_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, DrainSwamp_1, MoveToLand_1, MoveToNewIsland_1, OrganizeBase_1, OrganizeInventory_1, AcquireUseOrbOfInfluence_1, CheckDecayingItems_1, HuntCreatures_1, PlantSeeds_1, GatherWaters_1, CheckSpecialItems_1, ITars_1, ITarsMod_1, CommonInitialObjectives_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SurvivalMode = void 0;
    class SurvivalMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            var _a;
            const chest = context.player.getEquippedItem(IHuman_1.EquipType.Chest);
            const legs = context.player.getEquippedItem(IHuman_1.EquipType.Legs);
            const belt = context.player.getEquippedItem(IHuman_1.EquipType.Belt);
            const neck = context.player.getEquippedItem(IHuman_1.EquipType.Neck);
            const back = context.player.getEquippedItem(IHuman_1.EquipType.Back);
            const head = context.player.getEquippedItem(IHuman_1.EquipType.Head);
            const feet = context.player.getEquippedItem(IHuman_1.EquipType.Feet);
            const hands = context.player.getEquippedItem(IHuman_1.EquipType.Hands);
            const objectives = [];
            const moveToNewIslandState = context.getDataOrDefault(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
            if (moveToNewIslandState === IContext_1.MovingToNewIslandState.Ready) {
                objectives.push(new MoveToNewIsland_1.default());
                return objectives;
            }
            if (context.inventory.sailBoat && context.player.island.items.isContainableInContainer(context.inventory.sailBoat, context.player.inventory)) {
                objectives.push([
                    new MoveToLand_1.default(),
                    new ExecuteAction_1.default(IAction_1.ActionType.Drop, (context, action) => {
                        action.execute(context.player, context.inventory.sailBoat);
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
            let acquireChest = true;
            if (context.base.buildAnotherChest) {
                acquireChest = context.utilities.base.isNearBase(context);
            }
            else if (context.base.chest.length > 0) {
                for (const c of context.base.chest) {
                    if ((context.player.island.items.computeContainerWeight(c) / context.player.island.items.getWeightCapacity(c)) < 0.9) {
                        acquireChest = false;
                        break;
                    }
                }
            }
            if (acquireChest && context.inventory.chest === undefined) {
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
                for (const waterStill of context.base.waterStill) {
                    objectives.push(new StartWaterStillDesalination_1.default(waterStill));
                }
                objectives.push(new PlantSeeds_1.default());
                objectives.push(new CheckDecayingItems_1.default());
            }
            if (context.base.kiln.length === 0 && context.inventory.kiln === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitKiln), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (context.inventory.heal === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Heal), new AnalyzeInventory_1.default()]);
            }
            const waitingForWater = context.player.stat.get(IStats_1.Stat.Thirst).value <= context.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Thirst) &&
                context.base.waterStill.length > 0 && context.base.waterStill[0].description().providesFire;
            const shouldUpgradeToLeather = !waitingForWater;
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
            if (context.options.useOrbsOfInfluence) {
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
                    const swampTiles = context.utilities.base.getSwampTilesNearBase(context);
                    if (swampTiles.length > 0) {
                        const boglings = context.utilities.base.getNonTamedCreaturesNearBase(context)
                            .filter(creature => creature.type === ICreature_1.CreatureType.Bogling);
                        if (boglings.length > 0) {
                            objectives.push(new HuntCreatures_1.default(boglings));
                        }
                        objectives.push(new DrainSwamp_1.default(swampTiles));
                    }
                    const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
                    if (tiles.totalCount > 20) {
                        objectives.push(new OrganizeBase_1.default(tiles.tiles));
                    }
                }
                if (drinkableWaterContainers.length < 2 && availableWaterContainers.length > 0) {
                    objectives.push(new GatherWaters_1.default(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
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
            if (context.options.exploreIslands && !multiplayer.isConnected()) {
                const needWaterItems = context.inventory.waterContainer === undefined || context.inventory.waterContainer.filter(item => context.utilities.item.isSafeToDrinkItem(item)).length < 2;
                const needFoodItems = context.inventory.food === undefined || context.inventory.food.length < 2;
                const health = context.player.stat.get(IStats_1.Stat.Health);
                const hunger = context.player.stat.get(IStats_1.Stat.Hunger);
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
                            const availableWaterContainers = (_a = context.inventory.waterContainer) === null || _a === void 0 ? void 0 : _a.filter(item => !context.utilities.item.isSafeToDrinkItem(item));
                            if (availableWaterContainers && availableWaterContainers.length > 0) {
                                objectives.push(new GatherWaters_1.default(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
                            }
                            else {
                                objectives.push(new AcquireWaterContainer_1.default());
                                objectives.push(new GatherWater_1.default(undefined, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
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
                const health = context.player.stat.get(IStats_1.Stat.Health);
                if (health.value / health.max < 0.9) {
                    objectives.push(new RecoverHealth_1.default(false));
                }
                const hunger = context.player.stat.get(IStats_1.Stat.Hunger);
                if (hunger.value / hunger.max < 0.7) {
                    objectives.push(new RecoverHunger_1.default(false, true));
                }
                objectives.push(new ReturnToBase_1.default());
                objectives.push(new OrganizeBase_1.default(context.utilities.base.getTilesWithItemsNearBase(context).tiles));
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
            const islandSaveData = (0, ITarsMod_1.getTarsSaveData)("island")[context.player.island.id];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vydml2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvU3Vydml2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQTJEQSxNQUFhLFlBQVk7UUFJakIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDdkUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjs7WUFDaEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlELE1BQU0sVUFBVSxHQUFxQyxFQUFF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R0FBRyxFQUFFLHlCQUF5QixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM3RztZQU1ELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsV0FBVyxFQUFFLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsVUFBVSxFQUFFLGdCQUFRLENBQUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsUUFBUSxFQUFFLGdCQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsWUFBWSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsV0FBVyxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xILElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFRLENBQUMsV0FBVyxFQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FB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