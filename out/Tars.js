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
define(["require", "exports", "action/IAction", "doodad/Doodads", "entity/IStats", "Enums", "mod/IHookHost", "mod/Mod", "mod/ModRegistry", "player/MessageManager", "utilities/enum/Enums", "utilities/math/Vector2", "utilities/TileHelpers", "./Helpers", "./IObjective", "./ITars", "./Navigation", "./Objectives/AcquireItem", "./Objectives/AcquireItemByGroup", "./Objectives/AcquireItemForAction", "./Objectives/AcquireItemForDoodad", "./Objectives/AcquireWaterContainer", "./Objectives/BuildItem", "./Objectives/CarveCorpse", "./Objectives/DefendAgainstCreature", "./Objectives/Equip", "./Objectives/Idle", "./Objectives/LeaveDesert", "./Objectives/OptionsInterrupt", "./Objectives/OrganizeInventory", "./Objectives/PlantSeed", "./Objectives/RecoverHealth", "./Objectives/RecoverHunger", "./Objectives/RecoverStamina", "./Objectives/RecoverThirst", "./Objectives/ReduceWeight", "./Objectives/RepairItem", "./Objectives/ReturnToBase", "./Utilities/Action", "./Utilities/Item", "./Utilities/Logger", "./Utilities/Movement", "./Utilities/Object"], function (require, exports, IAction_1, Doodads_1, IStats_1, Enums_1, IHookHost_1, Mod_1, ModRegistry_1, MessageManager_1, Enums_2, Vector2_1, TileHelpers_1, Helpers, IObjective_1, ITars_1, Navigation_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, BuildItem_1, CarveCorpse_1, DefendAgainstCreature_1, Equip_1, Idle_1, LeaveDesert_1, OptionsInterrupt_1, OrganizeInventory_1, PlantSeed_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, ReduceWeight_1, RepairItem_1, ReturnToBase_1, Action, Item_1, Logger_1, movementUtilities, objectUtilities) {
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
            const wellInventoryItem = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.StoneWell) ||
                itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.ClayBrickWell) ||
                itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.SandstoneWell);
            if (wellInventoryItem !== undefined) {
                objectives.push(new BuildItem_1.default(wellInventoryItem));
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
            if (this.base.wells.length === 0 && wellInventoryItem === undefined) {
                objectives.push(new AcquireItemForDoodad_1.default(Enums_1.DoodadTypeGroup.Well));
            }
            if (this.inventory.waterContainer === undefined) {
                objectives.push(new AcquireWaterContainer_1.default());
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
            if (game.getTurnMode() !== Enums_1.TurnMode.RealTime) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0RBLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUV0QixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztJQUUvQixJQUFLLHFCQUlKO0lBSkQsV0FBSyxxQkFBcUI7UUFDekIscUZBQWMsQ0FBQTtRQUNkLGlGQUFZLENBQUE7UUFDWiwrRUFBVyxDQUFBO0lBQ1osQ0FBQyxFQUpJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFJekI7SUFBQSxDQUFDO0lBRUYsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBb0JTLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBNHRDOUIsQ0FBQztRQWh0Q08sWUFBWTtZQUNsQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWhDLGtCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVNLGNBQWM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFPTSxXQUFXLENBQUMsYUFBc0IsRUFBRSxXQUFtQjtZQUM3RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLDBCQUFhLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBR00sU0FBUyxDQUFDLEtBQW1CO1lBQ25DLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFHTSxhQUFhLENBQUMsTUFBZTtZQUNuQyxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENB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QU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLGlCQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzNFLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxpQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsaUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLGlCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxpQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsaUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLGlCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxpQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsaUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztnQkFDakQsSUFBSSxDQUFDLGVB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