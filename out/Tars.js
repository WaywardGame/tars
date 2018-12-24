var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "doodad/Doodads", "entity/IStats", "Enums", "mod/IHookHost", "mod/Mod", "mod/ModRegistry", "player/MessageManager", "utilities/enum/Enums", "utilities/math/Vector2", "utilities/TileHelpers", "./Helpers", "./IObjective", "./ITars", "./Navigation", "./Objectives/AcquireItem", "./Objectives/AcquireItemByGroup", "./Objectives/AcquireItemForAction", "./Objectives/AcquireItemForDoodad", "./Objectives/AcquireWaterContainer", "./Objectives/BuildItem", "./Objectives/CarveCorpse", "./Objectives/DefendAgainstCreature", "./Objectives/Equip", "./Objectives/Idle", "./Objectives/LeaveDesert", "./Objectives/OptionsInterrupt", "./Objectives/OrganizeInventory", "./Objectives/PlantSeed", "./Objectives/RecoverHealth", "./Objectives/RecoverHunger", "./Objectives/RecoverStamina", "./Objectives/RecoverThirst", "./Objectives/ReduceWeight", "./Objectives/RepairItem", "./Objectives/ReturnToBase", "./Utilities/Action", "./Utilities/Item", "./Utilities/Logger", "./Utilities/Movement", "./Utilities/Object", "utilities/TilePosition"], function (require, exports, IAction_1, Doodads_1, IStats_1, Enums_1, IHookHost_1, Mod_1, ModRegistry_1, MessageManager_1, Enums_2, Vector2_1, TileHelpers_1, Helpers, IObjective_1, ITars_1, Navigation_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, BuildItem_1, CarveCorpse_1, DefendAgainstCreature_1, Equip_1, Idle_1, LeaveDesert_1, OptionsInterrupt_1, OrganizeInventory_1, PlantSeed_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, ReduceWeight_1, RepairItem_1, ReturnToBase_1, Action, Item_1, Logger_1, movementUtilities, objectUtilities, TilePosition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tickSpeed = 333;
    const baseDoodadDistance = 150;
    var NavigationSystemState;
    (function (NavigationSystemState) {
        NavigationSystemState[NavigationSystemState["NotInitialized"] = 0] = "NotInitialized";
        NavigationSystemState[NavigationSystemState["Initializing"] = 1] = "Initializing";
        NavigationSystemState[NavigationSystemState["Initialized"] = 2] = "Initialized";
    })(NavigationSystemState || (NavigationSystemState = {}));
    ;
    class Tars extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.overBurdened = false;
        }
        onInitialize() {
            Helpers.setPath(this.getPath());
            Logger_1.setLogger(this.getLog());
        }
        onUninitialize() {
            this.onGameEnd();
        }
        onGameStart(isLoadingSave, playedCount) {
            this.reset();
            this.navigation = Navigation_1.getNavigation();
        }
        onGameEnd(state) {
            this.disable();
            this.reset();
        }
        onPlayerDeath(player) {
            if (player.isLocalPlayer()) {
                this.objective = undefined;
                this.interruptObjective = undefined;
                movementUtilities.resetMovementOverlays();
            }
            return undefined;
        }
        onMove(player, nextX, nextY, tile, direction) {
            if (this.isEnabled()) {
                movementUtilities.clearOverlay(tile);
                if (this.objective !== undefined) {
                    this.objective.onMove();
                }
            }
            return undefined;
        }
        onBindLoop(bindPressed, api) {
            if (api.wasPressed(this.keyBind) && !bindPressed) {
                this.toggle();
                bindPressed = this.keyBind;
            }
            return bindPressed;
        }
        onTileUpdate(tile, x, y, z) {
            if (this.navigationInitialized) {
                this.navigation.onTileUpdate(tile, TileHelpers_1.default.getType(tile), x, y, z);
            }
        }
        postExecuteAction(api, action, args) {
            if (api.executor !== localPlayer) {
                return;
            }
            Action.postExecuteAction(api.type);
        }
        onUpdateWeight(player, newWeight) {
            const weight = player.getStat(IStats_1.Stat.Weight);
            if (newWeight > weight.max) {
                if (!this.overBurdened) {
                    this.overBurdened = true;
                    if (this.isEnabled()) {
                        Logger_1.log("Over burdened");
                        this.objective = undefined;
                        this.interruptObjective = undefined;
                    }
                }
            }
            else if (this.overBurdened) {
                this.overBurdened = false;
                if (this.isEnabled()) {
                    Logger_1.log("No longer over burdened");
                }
            }
            return undefined;
        }
        shouldStopWalkToTileMovement() {
            return this.isEnabled() ? false : undefined;
        }
        command(player, args) {
            this.toggle();
        }
        reset() {
            this.base = {};
            this.inventory = {};
            this.overBurdened = false;
            this.objective = undefined;
            this.interruptObjective = undefined;
            this.navigationInitialized = NavigationSystemState.NotInitialized;
            Navigation_1.deleteNavigation();
        }
        isEnabled() {
            return this.tickTimeoutId !== undefined;
        }
        toggle() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.navigationInitialized === NavigationSystemState.Initializing) {
                    return;
                }
                const str = this.tickTimeoutId !== undefined ? "Enabled" : "Disabled";
                Logger_1.log(str);
                localPlayer.messages
                    .source(this.messageSource)
                    .type(MessageManager_1.MessageType.Good)
                    .send(this.messageToggle, this.tickTimeoutId === undefined);
                if (this.navigationInitialized === NavigationSystemState.NotInitialized) {
                    this.navigationInitialized = NavigationSystemState.Initializing;
                    localPlayer.messages
                        .source(this.messageSource)
                        .type(MessageManager_1.MessageType.Good)
                        .send(this.messageNavigationUpdating);
                    yield this.navigation.updateAll();
                    this.navigationInitialized = NavigationSystemState.Initialized;
                    localPlayer.messages
                        .source(this.messageSource)
                        .type(MessageManager_1.MessageType.Good)
                        .send(this.messageNavigationUpdated);
                }
                this.objective = undefined;
                this.interruptObjective = undefined;
                if (this.tickTimeoutId === undefined) {
                    this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
                }
                else {
                    this.disable();
                }
            });
        }
        disable() {
            if (this.tickTimeoutId !== undefined) {
                clearTimeout(this.tickTimeoutId);
                this.tickTimeoutId = undefined;
            }
            if (localPlayer) {
                movementUtilities.resetMovementOverlays();
                localPlayer.walkAlongPath(undefined);
            }
        }
        tick() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.onTick();
                if (this.tickTimeoutId === undefined) {
                    return;
                }
                this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
            });
        }
        onTick() {
            return __awaiter(this, void 0, void 0, function* () {
                if (localPlayer.isResting() || localPlayer.isMovingClientside || localPlayer.hasDelay() || localPlayer.isGhost() || game.paused) {
                    return;
                }
                objectUtilities.resetCachedObjects();
                movementUtilities.resetCachedPaths();
                this.analyzeInventory();
                this.analyzeBase();
                let result;
                const interrupts = this.getInterrupts();
                const interruptsId = interrupts.map(i => i.getHashCode()).join(",");
                if (this.interruptsId !== interruptsId) {
                    this.interruptsId = interruptsId;
                    this.interruptObjective = undefined;
                }
                if (this.interruptObjective) {
                    Logger_1.log(`Working on interrupt ${this.interruptObjective.getHashCode()}`);
                    result = yield this.executeObjectives([this.interruptObjective]);
                    if (result !== true) {
                        return;
                    }
                    this.interruptObjective = undefined;
                }
                if (interrupts.length > 0) {
                    result = yield this.executeObjectives(interrupts);
                    if (result === true) {
                        this.interruptObjective = undefined;
                    }
                    else if (result === false) {
                        return;
                    }
                    else {
                        this.interruptObjective = result.find(objective => !objective.shouldSaveChildObjectives()) || result[result.length - 1];
                        this.objective = undefined;
                        return;
                    }
                }
                if (this.objective !== undefined) {
                    Logger_1.log(`Working on ${this.objective.getHashCode()}`);
                    result = yield this.executeObjectives([this.objective]);
                    if (result !== true) {
                        return;
                    }
                }
                result = yield this.executeObjectives(this.determineObjectives());
                if (result === true || result === false) {
                    this.objective = undefined;
                }
                else {
                    this.objective = result.find(objective => !objective.shouldSaveChildObjectives()) || result[result.length - 1];
                }
            });
        }
        executeObjectives(objectives) {
            return __awaiter(this, void 0, void 0, function* () {
                for (const objective of objectives) {
                    if (this.hasDelay()) {
                        return false;
                    }
                    const result = yield this.executeObjective(objective);
                    if (typeof (result) !== "boolean") {
                        return result;
                    }
                }
                return true;
            });
        }
        executeObjective(objective) {
            return __awaiter(this, void 0, void 0, function* () {
                const chain = [];
                while (objective !== undefined) {
                    chain.push(objective);
                    const newObjective = yield objective.execute(this.base, this.inventory);
                    if (newObjective === undefined) {
                        return chain;
                    }
                    if (typeof (newObjective) === "number") {
                        switch (newObjective) {
                            case IObjective_1.ObjectiveStatus.Complete:
                                objective = undefined;
                                break;
                            default:
                                Logger_1.log(`Invalid return for objective ${objective}. ${newObjective}`);
                                objective = undefined;
                                break;
                        }
                    }
                    else {
                        objective = newObjective;
                    }
                }
                return true;
            });
        }
        hasDelay() {
            return localPlayer.hasDelay() || localPlayer.isResting() || localPlayer.isMovingClientside;
        }
        determineObjectives() {
            const chest = localPlayer.getEquippedItem(Enums_1.EquipType.Chest);
            const legs = localPlayer.getEquippedItem(Enums_1.EquipType.Legs);
            const belt = localPlayer.getEquippedItem(Enums_1.EquipType.Belt);
            const neck = localPlayer.getEquippedItem(Enums_1.EquipType.Neck);
            const back = localPlayer.getEquippedItem(Enums_1.EquipType.Back);
            const head = localPlayer.getEquippedItem(Enums_1.EquipType.Head);
            const feet = localPlayer.getEquippedItem(Enums_1.EquipType.Feet);
            const gloves = localPlayer.getEquippedItem(Enums_1.EquipType.Hands);
            const objectives = [];
            if (this.base.campfire === undefined) {
                const inventoryItem = itemManager.getItemInInventoryByGroup(localPlayer, Enums_1.ItemTypeGroup.Campfire);
                if (inventoryItem !== undefined) {
                    objectives.push(new BuildItem_1.default(inventoryItem));
                }
                else {
                    objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Campfire));
                }
            }
            if (this.inventory.fireStarter === undefined) {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire));
            }
            if (this.inventory.fireKindling === undefined) {
                objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Kindling));
            }
            if (this.inventory.fireTinder === undefined) {
                objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Tinder));
            }
            if (this.inventory.shovel === undefined) {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Dig));
            }
            if (this.inventory.sharpened === undefined) {
                objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Sharpened));
            }
            if (this.inventory.axe === undefined) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.StoneAxe));
            }
            if (chest === undefined || chest.type === Enums_1.ItemType.TatteredShirt) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.BarkTunic));
            }
            if (legs === undefined || legs.type === Enums_1.ItemType.TatteredPants) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.BarkLeggings));
            }
            if (this.base.waterStill === undefined) {
                const inventoryItem = itemManager.getItemInInventoryByGroup(localPlayer, Enums_1.ItemTypeGroup.WaterStill);
                if (inventoryItem !== undefined) {
                    objectives.push(new BuildItem_1.default(inventoryItem));
                }
                else {
                    objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.WaterStill));
                }
            }
            let buildChest = true;
            if (this.base.chests !== undefined) {
                for (const c of this.base.chests) {
                    if ((itemManager.computeContainerWeight(c) / c.weightCapacity) < 0.9) {
                        buildChest = false;
                        break;
                    }
                }
            }
            if (buildChest) {
                const inventoryItem = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.WoodenChest);
                if (inventoryItem !== undefined) {
                    objectives.push(new BuildItem_1.default(inventoryItem));
                }
                else {
                    objectives.push(new AcquireItemForDoodad_1.default(Enums_1.DoodadType.WoodenChest));
                }
            }
            if (this.inventory.pickAxe === undefined) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.StonePickaxe));
            }
            if (this.inventory.hammer === undefined) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.StoneHammer));
            }
            const seeds = Item_1.getSeeds();
            if (seeds.length > 0) {
                objectives.push(new PlantSeed_1.default(seeds[0]));
            }
            if (this.inventory.shovel === undefined) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.StoneShovel));
            }
            if (this.base.kiln === undefined) {
                if (this.inventory.kiln !== undefined) {
                    objectives.push(new BuildItem_1.default(this.inventory.kiln));
                }
                else {
                    objectives.push(new AcquireItemForDoodad_1.default(Enums_1.DoodadTypeGroup.LitKiln));
                }
            }
            if (this.inventory.sword === undefined) {
                objectives.push(new AcquireItem_1.default(Enums_1.ItemType.WoodenSword));
            }
            const waitingForWater = localPlayer.getStat(IStats_1.Stat.Thirst).value <= 10 && this.base.waterStill && this.base.waterStill.description().providesFire;
            const shouldUpgradeToLeather = !waitingForWater;
            if (shouldUpgradeToLeather) {
                if (belt === undefined) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherBelt));
                }
                if (neck === undefined) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherGorget));
                }
                if (head === undefined) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherCap));
                }
                if (back === undefined) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherQuiver));
                }
                if (feet === undefined) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherBoots));
                }
                if (gloves === undefined) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherGloves));
                }
                if (legs && legs.type === Enums_1.ItemType.BarkLeggings) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherPants));
                }
                if (chest && chest.type === Enums_1.ItemType.BarkTunic) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherTunic));
                }
                if (legs && legs.type === Enums_1.ItemType.BarkLeggings) {
                    objectives.push(new AcquireItem_1.default(Enums_1.ItemType.LeatherPants));
                }
            }
            const wellInventoryItem = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.StoneWell) ||
                itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.ClayBrickWell) ||
                itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.SandstoneWell);
            if (this.base.wells.length === 0) {
                if (wellInventoryItem !== undefined) {
                    objectives.push(new BuildItem_1.default(wellInventoryItem));
                }
                else {
                    objectives.push(new AcquireItemForDoodad_1.default(Enums_1.DoodadTypeGroup.Well));
                }
            }
            if (this.inventory.waterContainer === undefined) {
                objectives.push(new AcquireWaterContainer_1.default());
            }
            if (this.base.wells !== undefined) {
                const wellsHaveSomeWater = this.base.wells.some((well) => {
                    const wellData = game.wellData[TilePosition_1.getTileId(well.x, well.y, well.z)];
                    return wellData ? (wellData.quantity >= 1 || wellData.quantity === -1) : false;
                });
                if (!wellsHaveSomeWater) {
                    objectives.push(new AcquireItemForDoodad_1.default(Enums_1.DoodadTypeGroup.Well));
                }
            }
            if (localPlayer.getStat(IStats_1.Stat.Health).value / localPlayer.getMaxHealth() < 0.9) {
                objectives.push(new RecoverHealth_1.default());
            }
            const hunger = localPlayer.getStat(IStats_1.Stat.Hunger);
            if (hunger.value / hunger.max < 0.75) {
                objectives.push(new RecoverHunger_1.default());
            }
            objectives.push(new ReturnToBase_1.default());
            objectives.push(new OrganizeInventory_1.default(false));
            if (!game.isRealTimeMode()) {
                objectives.push(new Idle_1.default());
            }
            return objectives;
        }
        getInterrupts() {
            const interrupts = [
                this.optionsInterrupt(),
                this.equipsInterrupt(),
                this.nearbyCreatureInterrupt(),
                this.staminaInterrupt(),
                this.healthInterrupt(),
                this.weightInterrupt(),
                this.leaveDesertInterrupt(),
                this.repairInterrupt(this.inventory.waterContainer),
                this.thirstInterrupt(),
                this.gatherFromCorpsesInterrupt(),
                this.hungerInterrupt(),
                this.repairsInterrupt()
            ];
            return interrupts.filter(interrupt => interrupt !== undefined);
        }
        optionsInterrupt() {
            return new OptionsInterrupt_1.default();
        }
        equipsInterrupt() {
            return this.handsEquipInterrupt(IAction_1.ActionType.Gather) || this.equipInterrupt(Enums_1.EquipType.Chest) || this.equipInterrupt(Enums_1.EquipType.Legs) || this.equipInterrupt(Enums_1.EquipType.Head) || this.equipInterrupt(Enums_1.EquipType.Belt) || this.equipInterrupt(Enums_1.EquipType.Feet) || this.equipInterrupt(Enums_1.EquipType.Hands) || this.equipInterrupt(Enums_1.EquipType.Neck) || this.equipInterrupt(Enums_1.EquipType.Back);
        }
        equipInterrupt(equip) {
            const item = localPlayer.getEquippedItem(equip);
            const bestEquipment = Item_1.getBestEquipment(equip);
            if (bestEquipment.length > 0) {
                const itemToEquip = bestEquipment[0];
                if (itemToEquip === item) {
                    return;
                }
                if (item !== undefined) {
                    return new Equip_1.default(item);
                }
                return new Equip_1.default(itemToEquip, equip);
            }
        }
        handsEquipInterrupt(use, preferredDamageType) {
            const objective = this.handEquipInterrupt(Enums_1.EquipType.LeftHand, use, preferredDamageType) || this.handEquipInterrupt(Enums_1.EquipType.RightHand, use, preferredDamageType);
            if (objective) {
                return objective;
            }
            const leftHandItem = localPlayer.getEquippedItem(Enums_1.EquipType.LeftHand);
            const rightHandItem = localPlayer.getEquippedItem(Enums_1.EquipType.RightHand);
            const leftHandEquipped = leftHandItem !== undefined;
            const rightHandEquipped = rightHandItem !== undefined;
            if (preferredDamageType !== undefined) {
                let leftHandDamageTypeMatches = false;
                if (leftHandEquipped) {
                    const itemDescription = leftHandItem.description();
                    leftHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
                }
                let rightHandDamageTypeMatches = false;
                if (rightHandEquipped) {
                    const itemDescription = rightHandItem.description();
                    rightHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
                }
                if (leftHandDamageTypeMatches || rightHandDamageTypeMatches) {
                    if (leftHandDamageTypeMatches !== localPlayer.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                    if (rightHandDamageTypeMatches !== localPlayer.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
                else if (leftHandEquipped || rightHandEquipped) {
                    if (leftHandEquipped && !localPlayer.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                    if (rightHandEquipped && !localPlayer.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
                else {
                    if (!localPlayer.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                    if (!localPlayer.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
            }
            else {
                if (leftHandEquipped && !localPlayer.options.leftHand) {
                    ui.changeEquipmentOption("leftHand");
                }
                if (rightHandEquipped && !localPlayer.options.rightHand) {
                    ui.changeEquipmentOption("rightHand");
                }
                if (!localPlayer.options.leftHand && !localPlayer.options.rightHand) {
                    ui.changeEquipmentOption("leftHand");
                }
            }
        }
        handEquipInterrupt(equipType, use, preferredDamageType) {
            const equippedItem = localPlayer.getEquippedItem(equipType);
            if (equippedItem === undefined) {
                let possibleEquips = Item_1.getPossibleHandEquips(use, preferredDamageType, true);
                if (possibleEquips.length === 0) {
                    possibleEquips = Item_1.getPossibleHandEquips(use, undefined, true);
                }
                if (possibleEquips.length > 0) {
                    return new Equip_1.default(possibleEquips[0], equipType);
                }
            }
            else {
                const description = equippedItem.description();
                if (!description || !description.use || description.use.indexOf(use) === -1) {
                    return new Equip_1.default(equippedItem);
                }
                if ((preferredDamageType !== undefined && description.damageType !== undefined && (description.damageType & preferredDamageType) === 0)) {
                    const possibleEquips = Item_1.getPossibleHandEquips(use, preferredDamageType, true);
                    if (possibleEquips.length > 0) {
                        return new Equip_1.default(equippedItem);
                    }
                }
            }
        }
        thirstInterrupt() {
            if (localPlayer.getStat(IStats_1.Stat.Thirst).value > 10) {
                return;
            }
            return new RecoverThirst_1.default();
        }
        staminaInterrupt() {
            if (localPlayer.getStat(IStats_1.Stat.Stamina).value > 15) {
                return;
            }
            Logger_1.log("Stamina");
            return new RecoverStamina_1.default();
        }
        hungerInterrupt() {
            if (localPlayer.getStat(IStats_1.Stat.Hunger).value > 10) {
                return;
            }
            return new RecoverHunger_1.default();
        }
        repairsInterrupt() {
            if (this.inventory.hammer === undefined) {
                return;
            }
            return this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.LeftHand)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Chest)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Legs)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Head)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Belt)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Feet)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Neck)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Hands)) ||
                this.repairInterrupt(localPlayer.getEquippedItem(Enums_1.EquipType.Back)) ||
                this.repairInterrupt(this.inventory.sharpened) ||
                this.repairInterrupt(this.inventory.fireStarter) ||
                this.repairInterrupt(this.inventory.fireStoker) ||
                this.repairInterrupt(this.inventory.fireKindling) ||
                this.repairInterrupt(this.inventory.hoe) ||
                this.repairInterrupt(this.inventory.axe) ||
                this.repairInterrupt(this.inventory.pickAxe) ||
                this.repairInterrupt(this.inventory.shovel) ||
                this.repairInterrupt(this.inventory.sword);
        }
        repairInterrupt(item) {
            if (localPlayer.swimming || item === undefined || item.minDur === undefined || item.maxDur === undefined || item.minDur > 5 || item === this.inventory.hammer) {
                return;
            }
            if (item.minDur / item.maxDur >= 0.5) {
                return;
            }
            const description = item.description();
            if (!description || description.durability === undefined || description.repairable === false) {
                return;
            }
            Logger_1.log(`Repair ${item.getName().getString()}`);
            return new RepairItem_1.default(item);
        }
        nearbyCreatureInterrupt() {
            for (const facingDirecton of Enums_2.default.values(Enums_1.Direction)) {
                const creature = this.checkNearbyCreature(facingDirecton);
                if (creature !== undefined) {
                    Logger_1.log(`Defend against ${creature.getName().getString()}`);
                    return new DefendAgainstCreature_1.default(creature);
                }
            }
        }
        checkNearbyCreature(direction) {
            if (direction !== Enums_1.Direction.None) {
                const point = game.directionToMovement(direction);
                const tile = game.getTile(localPlayer.x + point.x, localPlayer.y + point.y, localPlayer.z);
                if (tile && tile.creature && !tile.creature.isTamed()) {
                    return tile.creature;
                }
            }
        }
        gatherFromCorpsesInterrupt() {
            const target = objectUtilities.findCarvableCorpse("gatherFromCorpsesInterrupt", corpse => Vector2_1.default.distance(localPlayer, corpse) < 16);
            if (target) {
                return new CarveCorpse_1.default(target);
            }
        }
        healthInterrupt() {
            if (localPlayer.getStat(IStats_1.Stat.Health).value >= 30 && !localPlayer.status.Bleeding) {
                return;
            }
            Logger_1.log("Heal");
            return new RecoverHealth_1.default();
        }
        weightInterrupt() {
            return new ReduceWeight_1.default();
        }
        leaveDesertInterrupt() {
            if (localPlayer.y < ITars_1.desertCutoff) {
                return;
            }
            return new LeaveDesert_1.default();
        }
        analyzeInventory() {
            if (this.inventory.bed !== undefined && (!this.inventory.bed.isValid() || !itemManager.isContainableInContainer(this.inventory.bed, localPlayer.inventory))) {
                this.inventory.bed = undefined;
            }
            if (this.inventory.bed === undefined) {
                this.inventory.bed = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Bedding);
                if (this.inventory.bed !== undefined) {
                    Logger_1.log(`Inventory bed - ${this.inventory.bed.getName().getString()}`);
                }
            }
            if (this.inventory.waterContainer !== undefined && (!this.inventory.waterContainer.isValid() || !itemManager.isContainableInContainer(this.inventory.waterContainer, localPlayer.inventory))) {
                this.inventory.waterContainer = undefined;
            }
            if (this.inventory.waterContainer === undefined) {
                let waterContainers = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.GatherWater);
                if (waterContainers.length === 0) {
                    waterContainers = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.DrinkItem).filter(item => item.type !== Enums_1.ItemType.PileOfSnow);
                }
                if (waterContainers.length > 0) {
                    this.inventory.waterContainer = waterContainers[0];
                }
                if (this.inventory.waterContainer !== undefined) {
                    Logger_1.log(`Inventory water container - ${this.inventory.waterContainer.getName().getString()}`);
                }
            }
            if (this.inventory.sharpened !== undefined && (!this.inventory.sharpened.isValid() || !itemManager.isContainableInContainer(this.inventory.sharpened, localPlayer.inventory))) {
                this.inventory.sharpened = undefined;
            }
            if (this.inventory.sharpened === undefined) {
                this.inventory.sharpened = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Sharpened);
                if (this.inventory.sharpened !== undefined) {
                    Logger_1.log(`Inventory sharpened - ${this.inventory.sharpened.getName().getString()}`);
                }
            }
            if (this.inventory.fireStarter !== undefined && (!this.inventory.fireStarter.isValid() || !itemManager.isContainableInContainer(this.inventory.fireStarter, localPlayer.inventory))) {
                this.inventory.fireStarter = undefined;
            }
            if (this.inventory.fireStarter === undefined) {
                this.inventory.fireStarter = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.HandDrill) || itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.BowDrill) || itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.FirePlough);
                if (this.inventory.fireStarter !== undefined) {
                    Logger_1.log(`Inventory fire starter - ${this.inventory.fireStarter.getName().getString()}`);
                }
            }
            if (this.inventory.fireStoker !== undefined && (!this.inventory.fireStoker.isValid() || !itemManager.isContainableInContainer(this.inventory.fireStoker, localPlayer.inventory))) {
                this.inventory.fireStoker = undefined;
            }
            if (this.inventory.fireStoker === undefined) {
                const fireStokers = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.StokeFire);
                if (fireStokers.length > 0) {
                    this.inventory.fireStoker = fireStokers[0];
                }
                if (this.inventory.fireStoker !== undefined) {
                    Logger_1.log(`Inventory fire stoker - ${this.inventory.fireStoker.getName().getString()}`);
                }
            }
            if (this.inventory.fireKindling !== undefined && (!this.inventory.fireKindling.isValid() || !itemManager.isContainableInContainer(this.inventory.fireKindling, localPlayer.inventory))) {
                this.inventory.fireKindling = undefined;
            }
            if (this.inventory.fireKindling === undefined) {
                this.inventory.fireKindling = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Kindling);
                if (this.inventory.fireKindling !== undefined) {
                    Logger_1.log(`Inventory fire kindling - ${this.inventory.fireKindling.getName().getString()}`);
                }
            }
            if (this.inventory.fireTinder !== undefined && (!this.inventory.fireTinder.isValid() || !itemManager.isContainableInContainer(this.inventory.fireTinder, localPlayer.inventory))) {
                this.inventory.fireTinder = undefined;
            }
            if (this.inventory.fireTinder === undefined) {
                this.inventory.fireTinder = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Tinder);
                if (this.inventory.fireTinder !== undefined) {
                    Logger_1.log(`Inventory fire tinder - ${this.inventory.fireTinder.getName().getString()}`);
                }
            }
            if (this.inventory.hoe !== undefined && (!this.inventory.hoe.isValid() || !itemManager.isContainableInContainer(this.inventory.hoe, localPlayer.inventory))) {
                this.inventory.hoe = undefined;
            }
            if (this.inventory.hoe === undefined) {
                const hoes = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.Till);
                if (hoes.length > 0) {
                    this.inventory.hoe = hoes[0];
                }
                if (this.inventory.hoe !== undefined) {
                    Logger_1.log(`Inventory hoe - ${this.inventory.hoe.getName().getString()}`);
                }
            }
            if (this.inventory.hammer !== undefined && (!this.inventory.hammer.isValid() || !itemManager.isContainableInContainer(this.inventory.hammer, localPlayer.inventory))) {
                this.inventory.hammer = undefined;
            }
            if (this.inventory.hammer === undefined) {
                this.inventory.hammer = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Hammer);
                if (this.inventory.hammer !== undefined) {
                    Logger_1.log(`Inventory hammer - ${this.inventory.hammer.getName().getString()}`);
                }
            }
            if (this.inventory.axe !== undefined && (!this.inventory.axe.isValid() || !itemManager.isContainableInContainer(this.inventory.axe, localPlayer.inventory))) {
                this.inventory.axe = undefined;
            }
            if (this.inventory.axe === undefined) {
                this.inventory.axe = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.WroughtIronDoubleAxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.WroughtIronAxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.IronDoubleAxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.IronAxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.CopperDoubleAxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.CopperAxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.StoneAxe);
                if (this.inventory.axe !== undefined) {
                    Logger_1.log(`Inventory axe - ${this.inventory.axe.getName().getString()}`);
                }
            }
            if (this.inventory.pickAxe !== undefined && (!this.inventory.pickAxe.isValid() || !itemManager.isContainableInContainer(this.inventory.pickAxe, localPlayer.inventory))) {
                this.inventory.pickAxe = undefined;
            }
            if (this.inventory.pickAxe === undefined) {
                this.inventory.pickAxe = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.WroughtIronPickaxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.IronPickaxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.CopperPickaxe) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.StonePickaxe);
                if (this.inventory.pickAxe !== undefined) {
                    Logger_1.log(`Inventory pickaxe - ${this.inventory.pickAxe.getName().getString()}`);
                }
            }
            if (this.inventory.shovel !== undefined && (!this.inventory.shovel.isValid() || !itemManager.isContainableInContainer(this.inventory.shovel, localPlayer.inventory))) {
                this.inventory.shovel = undefined;
            }
            if (this.inventory.shovel === undefined) {
                const shovels = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.Dig);
                if (shovels.length > 0) {
                    this.inventory.shovel = shovels[0];
                }
                if (this.inventory.shovel !== undefined) {
                    Logger_1.log(`Inventory shovel - ${this.inventory.shovel.getName().getString()}`);
                }
            }
            if (this.inventory.waterStill !== undefined && (!this.inventory.waterStill.isValid() || !itemManager.isContainableInContainer(this.inventory.waterStill, localPlayer.inventory))) {
                this.inventory.waterStill = undefined;
            }
            if (this.inventory.waterStill === undefined) {
                this.inventory.waterStill = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.WaterStill);
                if (this.inventory.waterStill !== undefined) {
                    Logger_1.log(`Inventory waterstill - ${this.inventory.waterStill.getName().getString()}`);
                }
            }
            if (this.inventory.wells !== undefined) {
                this.inventory.wells = this.inventory.wells.filter(c => c.isValid() && itemManager.isContainableInContainer(c, localPlayer.inventory));
            }
            const wells = [
                ...itemManager.getItemsInContainerByType(localPlayer.inventory, Enums_1.ItemType.StoneWell, true),
                ...itemManager.getItemsInContainerByType(localPlayer.inventory, Enums_1.ItemType.ClayBrickWell, true),
                ...itemManager.getItemsInContainerByType(localPlayer.inventory, Enums_1.ItemType.SandstoneWell, true)
            ];
            if (this.inventory.wells === undefined || this.inventory.wells.length !== wells.length) {
                this.inventory.wells = wells;
                if (this.inventory.wells.length > 0) {
                    Logger_1.log(`Inventory wells - ${this.inventory.wells.map(c => c.getName().getString()).join(", ")}`);
                }
            }
            if (this.inventory.campfire !== undefined && (!this.inventory.campfire.isValid() || !itemManager.isContainableInContainer(this.inventory.campfire, localPlayer.inventory))) {
                this.inventory.campfire = undefined;
            }
            if (this.inventory.campfire === undefined) {
                this.inventory.campfire = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Campfire);
                if (this.inventory.campfire !== undefined) {
                    Logger_1.log(`Inventory campfire - ${this.inventory.campfire.getName().getString()}`);
                }
            }
            if (this.inventory.kiln !== undefined && (!this.inventory.kiln.isValid() || !itemManager.isContainableInContainer(this.inventory.kiln, localPlayer.inventory))) {
                this.inventory.kiln = undefined;
            }
            if (this.inventory.kiln === undefined) {
                this.inventory.kiln = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Kiln);
                if (this.inventory.kiln !== undefined) {
                    Logger_1.log(`Inventory kiln - ${this.inventory.kiln.getName().getString()}`);
                }
            }
            if (this.inventory.chests !== undefined) {
                this.inventory.chests = this.inventory.chests.filter(c => c.isValid() && itemManager.isContainableInContainer(c, localPlayer.inventory));
            }
            const chests = itemManager.getItemsInContainerByType(localPlayer.inventory, Enums_1.ItemType.WoodenChest, true);
            if (this.inventory.chests === undefined || this.inventory.chests.length !== chests.length) {
                this.inventory.chests = chests;
                if (this.inventory.chests.length > 0) {
                    Logger_1.log(`Inventory chests - ${this.inventory.chests.map(c => c.getName().getString()).join(", ")}`);
                }
            }
            if (this.inventory.sword !== undefined && (!this.inventory.sword.isValid() || !itemManager.isContainableInContainer(this.inventory.sword, localPlayer.inventory))) {
                this.inventory.sword = undefined;
            }
            if (this.inventory.sword === undefined) {
                this.inventory.sword = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.WroughtIronSword) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.IronSword) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.GoldenSword) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.CopperSword) ||
                    itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.WoodenSword);
                if (this.inventory.sword !== undefined) {
                    Logger_1.log(`Inventory sword - ${this.inventory.sword.getName().getString()}`);
                }
            }
        }
        analyzeBase() {
            if (this.base.campfire !== undefined && !this.base.campfire.isValid()) {
                this.base.campfire = undefined;
            }
            if (this.base.campfire === undefined) {
                const targets = objectUtilities.findDoodads("Campfire", doodad => {
                    const description = doodad.description();
                    if (description) {
                        if (description.group === Enums_1.DoodadTypeGroup.LitCampfire) {
                            return true;
                        }
                        if (description.lit !== undefined) {
                            const litDescription = Doodads_1.default[description.lit];
                            if (litDescription && litDescription.group === Enums_1.DoodadTypeGroup.LitCampfire) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                if (targets.length > 0) {
                    const target = targets[0];
                    if (Vector2_1.default.distance(localPlayer, target) < baseDoodadDistance) {
                        this.base.campfire = target;
                        if (this.base.campfire !== undefined) {
                            Logger_1.log(`Base campfire - ${this.base.campfire.getName().getString()} (distance: ${Vector2_1.default.distance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.waterStill !== undefined && !this.base.waterStill.isValid()) {
                this.base.waterStill = undefined;
            }
            if (this.base.waterStill === undefined) {
                const targets = objectUtilities.findDoodads("WaterStill", doodad => {
                    const description = doodad.description();
                    if (description) {
                        if (description.group === Enums_1.DoodadTypeGroup.LitWaterStill) {
                            return true;
                        }
                        if (description.lit !== undefined) {
                            const litDescription = Doodads_1.default[description.lit];
                            if (litDescription && litDescription.group === Enums_1.DoodadTypeGroup.LitWaterStill) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                if (targets.length > 0) {
                    const target = targets[0];
                    if (Vector2_1.default.distance(localPlayer, target) < baseDoodadDistance) {
                        this.base.waterStill = target;
                        if (this.base.waterStill !== undefined) {
                            Logger_1.log(`Base waterstill - ${this.base.waterStill.getName().getString()} (distance: ${Vector2_1.default.distance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.wells === undefined) {
                this.base.wells = [];
            }
            else {
                this.base.wells = this.base.wells.filter(c => c.isValid());
            }
            const wells = objectUtilities.findDoodads("Well", doodad => {
                const description = doodad.description();
                if (description && description.group === Enums_1.DoodadTypeGroup.Well) {
                    return this.base.wells.indexOf(doodad) === -1;
                }
                return false;
            });
            if (wells.length > 0) {
                const target = wells[0];
                if (Vector2_1.default.distance(localPlayer, target) < baseDoodadDistance) {
                    this.base.wells.push(target);
                    Logger_1.log(`Base well - ${target.getName().getString()} (distance: ${Vector2_1.default.distance(localPlayer, target)})`);
                }
            }
            if (this.base.kiln !== undefined && !this.base.kiln.isValid()) {
                this.base.kiln = undefined;
            }
            if (this.base.kiln === undefined) {
                const targets = objectUtilities.findDoodads("Kiln", doodad => {
                    const description = doodad.description();
                    if (description) {
                        if (description.group === Enums_1.DoodadTypeGroup.LitKiln) {
                            return true;
                        }
                        if (description.lit !== undefined) {
                            const litDescription = Doodads_1.default[description.lit];
                            if (litDescription && litDescription.group === Enums_1.DoodadTypeGroup.LitKiln) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                if (targets.length > 0) {
                    const target = targets[0];
                    if (Vector2_1.default.distance(localPlayer, target) < baseDoodadDistance) {
                        this.base.kiln = target;
                        if (this.base.kiln !== undefined) {
                            Logger_1.log(`Base kiln - ${this.base.kiln.getName().getString()} (distance: ${Vector2_1.default.distance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.chests === undefined) {
                this.base.chests = [];
            }
            else {
                this.base.chests = this.base.chests.filter(c => c.isValid());
            }
            let i = 0;
            while (true) {
                const targetChest = objectUtilities.findDoodad(`Chest${i}`, doodad => {
                    const container = doodad;
                    if (container.weightCapacity && container.containedItems) {
                        return this.base.chests.indexOf(doodad) === -1;
                    }
                    return false;
                });
                i++;
                if (targetChest && Vector2_1.default.distance(localPlayer, targetChest) < baseDoodadDistance) {
                    if (!this.base.chests) {
                        this.base.chests = [];
                    }
                    this.base.chests.push(targetChest);
                    Logger_1.log(`Base chest - ${targetChest.getName().getString()} (distance: ${Vector2_1.default.distance(localPlayer, targetChest)})`);
                }
                else {
                    break;
                }
            }
        }
    }
    __decorate([
        ModRegistry_1.default.bindable("Toggle", { key: "KeyT" })
    ], Tars.prototype, "keyBind", void 0);
    __decorate([
        ModRegistry_1.default.messageSource("TARS")
    ], Tars.prototype, "messageSource", void 0);
    __decorate([
        ModRegistry_1.default.message("Toggle")
    ], Tars.prototype, "messageToggle", void 0);
    __decorate([
        ModRegistry_1.default.message("NavigationUpdating")
    ], Tars.prototype, "messageNavigationUpdating", void 0);
    __decorate([
        ModRegistry_1.default.message("NavigationUpdated")
    ], Tars.prototype, "messageNavigationUpdated", void 0);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onGameStart", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onGameEnd", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onPlayerDeath", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onMove", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onBindLoop", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onTileUpdate", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "postExecuteAction", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onUpdateWeight", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "shouldStopWalkToTileMovement", null);
    __decorate([
        ModRegistry_1.default.command("tars")
    ], Tars.prototype, "command", null);
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbURBLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUV0QixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztJQUUvQixJQUFLLHFCQUlKO0lBSkQsV0FBSyxxQkFBcUI7UUFDekIscUZBQWMsQ0FBQTtRQUNkLGlGQUFZLENBQUE7UUFDWiwrRUFBVyxDQUFBO0lBQ1osQ0FBQyxFQUpJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFJekI7SUFBQSxDQUFDO0lBRUYsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBb0JTLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBNnRDOUIsQ0FBQztRQWp0Q08sWUFBWTtZQUNsQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWhDLGtCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVNLGNBQWM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFPTSxXQUFXLENBQUMsYUFBc0IsRUFBRSxXQUFtQjtZQUM3RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLDBCQUFhLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBR00sU0FBUyxDQUFDLEtBQW1CO1lBQ25DLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFHTSxhQUFhLENBQUMsTUFBZTtZQUNuQyxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENB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