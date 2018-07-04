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
define(["require", "exports", "doodad/Doodads", "entity/IStats", "Enums", "language/IMessages", "mod/IHookHost", "mod/Mod", "utilities/enum/Enums", "utilities/math/Vector2", "utilities/TileHelpers", "./Helpers", "./IObjective", "./ITars", "./Navigation", "./Objectives/AcquireItem", "./Objectives/AcquireItemByGroup", "./Objectives/AcquireItemForAction", "./Objectives/AcquireItemForDoodad", "./Objectives/AcquireWaterContainer", "./Objectives/BuildItem", "./Objectives/CarveCorpse", "./Objectives/DefendAgainstCreature", "./Objectives/Equip", "./Objectives/Idle", "./Objectives/LeaveDesert", "./Objectives/OptionsInterrupt", "./Objectives/OrganizeInventory", "./Objectives/PlantSeed", "./Objectives/RecoverHealth", "./Objectives/RecoverHunger", "./Objectives/RecoverStamina", "./Objectives/RecoverThirst", "./Objectives/ReduceWeight", "./Objectives/RepairItem", "./Objectives/ReturnToBase", "./Utilities/Logger", "./Utilities/Object", "./Utilities/Movement", "./Utilities/Action", "./Utilities/Item"], function (require, exports, Doodads_1, IStats_1, Enums_1, IMessages_1, IHookHost_1, Mod_1, Enums_2, Vector2_1, TileHelpers_1, Helpers, IObjective_1, ITars_1, Navigation_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, BuildItem_1, CarveCorpse_1, DefendAgainstCreature_1, Equip_1, Idle_1, LeaveDesert_1, OptionsInterrupt_1, OrganizeInventory_1, PlantSeed_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, ReduceWeight_1, RepairItem_1, ReturnToBase_1, Logger_1, Object_1, Movement_1, Action, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tickSpeed = 333;
    const baseDoodadDistance = 150;
    class Tars extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.overBurdened = false;
        }
        onInitialize(saveDataGlobal) {
            this.keyBind = this.addBindable(this.getName(), { key: "KeyT" });
            this.messageSource = this.addMessageSource(this.getName());
            this.addCommand("tars", () => {
                this.toggle();
            });
            Helpers.setPath(this.getPath());
            Logger_1.setLogger(this.getLog());
        }
        onUninitialize() {
            this.onGameEnd();
        }
        onGameStart() {
            this.reset();
            this.navigation = Navigation_1.getNavigation();
        }
        onGameEnd() {
            this.disable();
            this.reset();
        }
        onPlayerDeath(player) {
            if (player.isLocalPlayer()) {
                this.objective = undefined;
                this.interruptObjective = undefined;
                Movement_1.resetMovementOverlays();
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
        postExecuteAction(player, actionType, actionArgument, actionResult) {
            if (player !== localPlayer) {
                return;
            }
            Action.postExecuteAction(actionType);
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
                const str = `${this.tickTimeoutId !== undefined ? "Enabled" : "Disabled"}`;
                Logger_1.log(str);
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessages_1.MessageType.Good)
                    .send(`[TARS] ${str}`);
            });
        }
        disable() {
            if (this.tickTimeoutId !== undefined) {
                clearTimeout(this.tickTimeoutId);
                this.tickTimeoutId = undefined;
            }
            Movement_1.resetMovementOverlays();
            localPlayer.walkAlongPath(undefined);
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
                Object_1.resetCachedObjects();
                Movement_1.resetCachedPaths();
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
                objectives.push(new AcquireItemForAction_1.default(Enums_1.ActionType.StartFire));
            }
            if (this.inventory.fireKindling === undefined) {
                objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Kindling));
            }
            if (this.inventory.fireTinder === undefined) {
                objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Tinder));
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
            return this.handsEquipInterrupt(Enums_1.ActionType.Gather) || this.equipInterrupt(Enums_1.EquipType.Chest) || this.equipInterrupt(Enums_1.EquipType.Legs) || this.equipInterrupt(Enums_1.EquipType.Head) || this.equipInterrupt(Enums_1.EquipType.Belt) || this.equipInterrupt(Enums_1.EquipType.Feet) || this.equipInterrupt(Enums_1.EquipType.Hands) || this.equipInterrupt(Enums_1.EquipType.Neck) || this.equipInterrupt(Enums_1.EquipType.Back);
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
            Logger_1.log(`Repair ${game.getName(item)}`);
            return new RepairItem_1.default(item);
        }
        nearbyCreatureInterrupt() {
            for (const facingDirecton of Enums_2.default.values(Enums_1.Direction)) {
                const creature = this.checkNearbyCreature(facingDirecton);
                if (creature !== undefined) {
                    Logger_1.log(`Defend against ${game.getName(creature)}`);
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
            const target = Object_1.findCorpse("gatherFromCorpsesInterrupt", corpse => Vector2_1.default.squaredDistance(localPlayer, corpse) < 16 &&
                Object_1.getNearbyCreature(corpse) === undefined &&
                corpse.type !== Enums_1.CreatureType.Blood &&
                corpse.type !== Enums_1.CreatureType.WaterBlood);
            if (target) {
                return new CarveCorpse_1.default(game.getTileFromPoint(target).corpses[0]);
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
                    Logger_1.log(`Inventory bed - ${game.getName(this.inventory.bed)}`);
                }
            }
            if (this.inventory.waterContainer !== undefined && (!this.inventory.waterContainer.isValid() || !itemManager.isContainableInContainer(this.inventory.waterContainer, localPlayer.inventory))) {
                this.inventory.waterContainer = undefined;
            }
            if (this.inventory.waterContainer === undefined) {
                let waterContainers = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.GatherWater);
                if (waterContainers.length === 0) {
                    waterContainers = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.DrinkItem).filter(item => item.type !== Enums_1.ItemType.PileOfSnow);
                }
                if (waterContainers.length > 0) {
                    this.inventory.waterContainer = waterContainers[0];
                }
                if (this.inventory.waterContainer !== undefined) {
                    Logger_1.log(`Inventory water container - ${game.getName(this.inventory.waterContainer)}`);
                }
            }
            if (this.inventory.sharpened !== undefined && (!this.inventory.sharpened.isValid() || !itemManager.isContainableInContainer(this.inventory.sharpened, localPlayer.inventory))) {
                this.inventory.sharpened = undefined;
            }
            if (this.inventory.sharpened === undefined) {
                this.inventory.sharpened = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Sharpened);
                if (this.inventory.sharpened !== undefined) {
                    Logger_1.log(`Inventory sharpened - ${game.getName(this.inventory.sharpened)}`);
                }
            }
            if (this.inventory.fireStarter !== undefined && (!this.inventory.fireStarter.isValid() || !itemManager.isContainableInContainer(this.inventory.fireStarter, localPlayer.inventory))) {
                this.inventory.fireStarter = undefined;
            }
            if (this.inventory.fireStarter === undefined) {
                this.inventory.fireStarter = itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.HandDrill) || itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.BowDrill) || itemManager.getItemInContainer(localPlayer.inventory, Enums_1.ItemType.FirePlough);
                if (this.inventory.fireStarter !== undefined) {
                    Logger_1.log(`Inventory fire starter - ${game.getName(this.inventory.fireStarter)}`);
                }
            }
            if (this.inventory.fireStoker !== undefined && (!this.inventory.fireStoker.isValid() || !itemManager.isContainableInContainer(this.inventory.fireStoker, localPlayer.inventory))) {
                this.inventory.fireStoker = undefined;
            }
            if (this.inventory.fireStoker === undefined) {
                const fireStokers = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.StokeFire);
                if (fireStokers.length > 0) {
                    this.inventory.fireStoker = fireStokers[0];
                }
                if (this.inventory.fireStoker !== undefined) {
                    Logger_1.log(`Inventory fire stoker - ${game.getName(this.inventory.fireStoker)}`);
                }
            }
            if (this.inventory.fireKindling !== undefined && (!this.inventory.fireKindling.isValid() || !itemManager.isContainableInContainer(this.inventory.fireKindling, localPlayer.inventory))) {
                this.inventory.fireKindling = undefined;
            }
            if (this.inventory.fireKindling === undefined) {
                this.inventory.fireKindling = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Kindling);
                if (this.inventory.fireKindling !== undefined) {
                    Logger_1.log(`Inventory fire kindling - ${game.getName(this.inventory.fireKindling)}`);
                }
            }
            if (this.inventory.fireTinder !== undefined && (!this.inventory.fireTinder.isValid() || !itemManager.isContainableInContainer(this.inventory.fireTinder, localPlayer.inventory))) {
                this.inventory.fireTinder = undefined;
            }
            if (this.inventory.fireTinder === undefined) {
                this.inventory.fireTinder = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Tinder);
                if (this.inventory.fireTinder !== undefined) {
                    Logger_1.log(`Inventory fire tinder - ${game.getName(this.inventory.fireTinder)}`);
                }
            }
            if (this.inventory.hoe !== undefined && (!this.inventory.hoe.isValid() || !itemManager.isContainableInContainer(this.inventory.hoe, localPlayer.inventory))) {
                this.inventory.hoe = undefined;
            }
            if (this.inventory.hoe === undefined) {
                const hoes = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.Till);
                if (hoes.length > 0) {
                    this.inventory.hoe = hoes[0];
                }
                if (this.inventory.hoe !== undefined) {
                    Logger_1.log(`Inventory hoe - ${game.getName(this.inventory.hoe)}`);
                }
            }
            if (this.inventory.hammer !== undefined && (!this.inventory.hammer.isValid() || !itemManager.isContainableInContainer(this.inventory.hammer, localPlayer.inventory))) {
                this.inventory.hammer = undefined;
            }
            if (this.inventory.hammer === undefined) {
                this.inventory.hammer = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Hammer);
                if (this.inventory.hammer !== undefined) {
                    Logger_1.log(`Inventory hammer - ${game.getName(this.inventory.hammer)}`);
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
                    Logger_1.log(`Inventory axe - ${game.getName(this.inventory.axe)}`);
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
                    Logger_1.log(`Inventory pickaxe - ${game.getName(this.inventory.pickAxe)}`);
                }
            }
            if (this.inventory.shovel !== undefined && (!this.inventory.shovel.isValid() || !itemManager.isContainableInContainer(this.inventory.shovel, localPlayer.inventory))) {
                this.inventory.shovel = undefined;
            }
            if (this.inventory.shovel === undefined) {
                const shovels = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.Dig);
                if (shovels.length > 0) {
                    this.inventory.shovel = shovels[0];
                }
                if (this.inventory.shovel !== undefined) {
                    Logger_1.log(`Inventory shovel - ${game.getName(this.inventory.shovel)}`);
                }
            }
            if (this.inventory.waterStill !== undefined && (!this.inventory.waterStill.isValid() || !itemManager.isContainableInContainer(this.inventory.waterStill, localPlayer.inventory))) {
                this.inventory.waterStill = undefined;
            }
            if (this.inventory.waterStill === undefined) {
                this.inventory.waterStill = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.WaterStill);
                if (this.inventory.waterStill !== undefined) {
                    Logger_1.log(`Inventory waterstill - ${game.getName(this.inventory.waterStill)}`);
                }
            }
            if (this.inventory.campfire !== undefined && (!this.inventory.campfire.isValid() || !itemManager.isContainableInContainer(this.inventory.campfire, localPlayer.inventory))) {
                this.inventory.campfire = undefined;
            }
            if (this.inventory.campfire === undefined) {
                this.inventory.campfire = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Campfire);
                if (this.inventory.campfire !== undefined) {
                    Logger_1.log(`Inventory campfire - ${game.getName(this.inventory.campfire)}`);
                }
            }
            if (this.inventory.kiln !== undefined && (!this.inventory.kiln.isValid() || !itemManager.isContainableInContainer(this.inventory.kiln, localPlayer.inventory))) {
                this.inventory.kiln = undefined;
            }
            if (this.inventory.kiln === undefined) {
                this.inventory.kiln = itemManager.getItemInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Kiln);
                if (this.inventory.kiln !== undefined) {
                    Logger_1.log(`Inventory kiln - ${game.getName(this.inventory.kiln)}`);
                }
            }
            if (this.inventory.chests !== undefined) {
                this.inventory.chests = this.inventory.chests.filter(c => c.isValid() && itemManager.isContainableInContainer(c, localPlayer.inventory));
            }
            const chests = itemManager.getItemsInContainerByType(localPlayer.inventory, Enums_1.ItemType.WoodenChest, true, false);
            if (this.inventory.chests === undefined || this.inventory.chests.length !== chests.length) {
                this.inventory.chests = chests;
                if (this.inventory.chests.length > 0) {
                    Logger_1.log(`Inventory chests - ${this.inventory.chests.map(c => game.getName(c)).join(", ")}`);
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
                    Logger_1.log(`Inventory sword - ${game.getName(this.inventory.sword)}`);
                }
            }
        }
        analyzeBase() {
            if (this.base.campfire !== undefined && !this.base.campfire.isValid()) {
                this.base.campfire = undefined;
            }
            if (this.base.campfire === undefined) {
                const targets = Object_1.findDoodads("Campfire", doodad => {
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
                            Logger_1.log(`Base campfire - ${game.getName(this.base.campfire)} (distance: ${Vector2_1.default.squaredDistance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.waterStill !== undefined && !this.base.waterStill.isValid()) {
                this.base.waterStill = undefined;
            }
            if (this.base.waterStill === undefined) {
                const targets = Object_1.findDoodads("WaterStill", doodad => {
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
                            Logger_1.log(`Base waterstill - ${game.getName(this.base.waterStill)} (distance: ${Vector2_1.default.squaredDistance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.kiln !== undefined && !this.base.kiln.isValid()) {
                this.base.kiln = undefined;
            }
            if (this.base.kiln === undefined) {
                const targets = Object_1.findDoodads("Kiln", doodad => {
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
                            Logger_1.log(`Base kiln - ${game.getName(this.base.kiln)} (distance: ${Vector2_1.default.squaredDistance(localPlayer, target)})`);
                        }
                    }
                }
            }
            if (this.base.chests === undefined) {
                this.base.chests = [];
            }
            let i = 0;
            while (true) {
                const targetChest = Object_1.findDoodad(`Chest${i}`, doodad => {
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
                    Logger_1.log(`Base chest - ${game.getName(targetChest)} (distance: ${Vector2_1.default.squaredDistance(localPlayer, targetChest)})`);
                }
                else {
                    break;
                }
            }
        }
    }
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
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBOENBLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUV0QixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztJQUUvQixVQUEwQixTQUFRLGFBQUc7UUFBckM7O1lBUVMsaUJBQVksR0FBWSxLQUFLLENBQUM7UUF5bkN2QyxDQUFDO1FBN21DTyxZQUFZLENBQUMsY0FBbUI7WUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRTNELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWhDLGtCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVNLGNBQWM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFPTSxXQUFXO1lBQ2pCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsMEJBQWEsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFHTSxTQUFTO1lBQ2YsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUdNLGFBQWEs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