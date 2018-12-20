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
            this.navigationInitialized = false;
            Navigation_1.deleteNavigation();
        }
        isEnabled() {
            return this.tickTimeoutId !== undefined;
        }
        toggle() {
            return __awaiter(this, void 0, void 0, function* () {
                Logger_1.log("Toggle");
                if (!this.navigationInitialized) {
                    this.navigationInitialized = true;
                    yield this.navigation.updateAll();
                }
                this.objective = undefined;
                this.interruptObjective = undefined;
                if (this.tickTimeoutId === undefined) {
                    this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
                }
                else {
                    this.disable();
                }
                const str = this.tickTimeoutId !== undefined ? "Enabled" : "Disabled";
                Logger_1.log(str);
                localPlayer.messages
                    .source(this.messageSource)
                    .type(MessageManager_1.MessageType.Good)
                    .send(this.messageToggle, this.tickTimeoutId !== undefined);
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
            const target = objectUtilities.findCarvableCorpse("gatherFromCorpsesInterrupt", corpse => Vector2_1.default.squaredDistance(localPlayer, corpse) < 16);
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
                    if (Vector2_1.default.squaredDistance(localPlayer, target) < baseDoodadDistance) {
                        this.base.campfire = target;
                        if (this.base.campfire !== undefined) {
                            Logger_1.log(`Base campfire - ${this.base.campfire.getName().getString()} (distance: ${Vector2_1.default.squaredDistance(localPlayer, target)})`);
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
                    if (Vector2_1.default.squaredDistance(localPlayer, target) < baseDoodadDistance) {
                        this.base.waterStill = target;
                        if (this.base.waterStill !== undefined) {
                            Logger_1.log(`Base waterstill - ${this.base.waterStill.getName().getString()} (distance: ${Vector2_1.default.squaredDistance(localPlayer, target)})`);
                        }
                    }
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
                    if (Vector2_1.default.squaredDistance(localPlayer, target) < baseDoodadDistance) {
                        this.base.kiln = target;
                        if (this.base.kiln !== undefined) {
                            Logger_1.log(`Base kiln - ${this.base.kiln.getName().getString()} (distance: ${Vector2_1.default.squaredDistance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.chests === undefined) {
                this.base.chests = [];
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
                if (targetChest && Vector2_1.default.squaredDistance(localPlayer, targetChest) < baseDoodadDistance) {
                    if (!this.base.chests) {
                        this.base.chests = [];
                    }
                    this.base.chests.push(targetChest);
                    Logger_1.log(`Base chest - ${targetChest.getName().getString()} (distance: ${Vector2_1.default.squaredDistance(localPlayer, targetChest)})`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0RBLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUV0QixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztJQUUvQixNQUFxQixJQUFLLFNBQVEsYUFBRztRQUFyQzs7WUFZUyxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQXNvQzlCLENBQUM7UUExbkNPLFlBQVk7WUFDbEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUVoQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFTSxjQUFjO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBT00sV0FBVyxDQUFDLGFBQXNCLEVBQUUsV0FBbUI7WUFDN0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLFVBQVUsR0FBRywwQkFBYSxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUdNLFNBQVMsQ0FBQyxLQUFtQjtZQUNuQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBR00sYUFBYSxDQUFDLE1BQWU7WUFDbkMsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUMzQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO2dCQUVwQyxpQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2FBQzFDO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUdNLE1BQU0sQ0FBQyxNQUFlLEVBQUUsS0FBYSxFQUFFLEtBQWEsRUFBRSxJQUFXLEVBQUUsU0FB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