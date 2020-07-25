var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "entity/IEntity", "entity/IHuman", "entity/IStats", "entity/player/IMessageManager", "entity/player/IPlayer", "event/EventBuses", "event/EventManager", "game/IGame", "item/IItem", "mod/IHookHost", "mod/Mod", "mod/ModRegistry", "newui/input/Bind", "newui/input/IInput", "utilities/Async", "utilities/math/Direction", "utilities/math/Vector2", "utilities/TileHelpers", "./Context", "./Core/Planner", "./IObjective", "./ITars", "./Navigation/Navigation", "./Objectives/Acquire/Item/AcquireItem", "./Objectives/Acquire/Item/AcquireItemByGroup", "./Objectives/Acquire/Item/AcquireItemForAction", "./Objectives/Acquire/Item/AcquireItemForDoodad", "./Objectives/Acquire/Item/Specific/AcquireWaterContainer", "./Objectives/Analyze/AnalyzeBase", "./Objectives/Analyze/AnalyzeInventory", "./Objectives/Core/Lambda", "./Objectives/Interrupt/CarveCorpse", "./Objectives/Interrupt/DefendAgainstCreature", "./Objectives/Interrupt/OptionsInterrupt", "./Objectives/Interrupt/ReduceWeight", "./Objectives/Interrupt/RepairItem", "./Objectives/Other/BuildItem", "./Objectives/Other/Equip", "./Objectives/Other/Idle", "./Objectives/Other/PlantSeed", "./Objectives/Other/ReturnToBase", "./Objectives/Other/StartWaterStillDesalination", "./Objectives/Other/Unequip", "./Objectives/Other/UpgradeInventoryItem", "./Objectives/Recover/RecoverHealth", "./Objectives/Recover/RecoverHunger", "./Objectives/Recover/RecoverStamina", "./Objectives/Recover/RecoverThirst", "./Objectives/Utility/LeaveDesert", "./Objectives/Utility/OrganizeInventory", "./Utilities/Action", "./Utilities/Base", "./Utilities/Item", "./Utilities/Logger", "./Utilities/Movement", "./Utilities/Object", "./Utilities/Tile"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IMessageManager_1, IPlayer_1, EventBuses_1, EventManager_1, IGame_1, IItem_1, IHookHost_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, Async_1, Direction_1, Vector2_1, TileHelpers_1, Context_1, Planner_1, IObjective_1, ITars_1, Navigation_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, AnalyzeBase_1, AnalyzeInventory_1, Lambda_1, CarveCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, Equip_1, Idle_1, PlantSeed_1, ReturnToBase_1, StartWaterStillDesalination_1, Unequip_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, LeaveDesert_1, OrganizeInventory_1, Action, Base_1, Item_1, Logger_1, movementUtilities, objectUtilities, tileUtilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tickSpeed = 333;
    const recoverThresholds = {
        [IStats_1.Stat.Health]: 30,
        [IStats_1.Stat.Stamina]: 20,
        [IStats_1.Stat.Hunger]: 10,
        [IStats_1.Stat.Thirst]: 10,
    };
    const poisonHealthPercentThreshold = 0.85;
    var NavigationSystemState;
    (function (NavigationSystemState) {
        NavigationSystemState[NavigationSystemState["NotInitialized"] = 0] = "NotInitialized";
        NavigationSystemState[NavigationSystemState["Initializing"] = 1] = "Initializing";
        NavigationSystemState[NavigationSystemState["Initialized"] = 2] = "Initialized";
    })(NavigationSystemState || (NavigationSystemState = {}));
    class Tars extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.statThresholdExceeded = {};
            this.interruptContexts = new Map();
            this.interrupted = false;
        }
        onInitialize() {
            Navigation_1.default.setModPath(this.getPath());
        }
        onUninitialize() {
            this.onGameEnd();
        }
        onGameStart(isLoadingSave, playedCount) {
            this.delete();
            this.navigation = Navigation_1.default.get();
        }
        onGameEnd(state) {
            this.disable(true);
            this.delete();
        }
        onWriteNote(player, note) {
            if (this.isEnabled()) {
                return false;
            }
            return undefined;
        }
        onPlayerDeath() {
            this.interrupt();
            movementUtilities.resetMovementOverlays();
        }
        async processMovement(player) {
            if (this.isEnabled() && player.isLocalPlayer()) {
                if (this.navigationInitialized === NavigationSystemState.Initialized && this.navigation) {
                    this.navigation.queueUpdateOrigin(player);
                }
                const objective = this.interruptObjective || this.objective;
                if (objective !== undefined) {
                    const result = await objective.onMove(this.context);
                    if (result === true) {
                        this.interrupt();
                    }
                    else if (result) {
                        this.interrupt(result);
                    }
                }
            }
        }
        restEnd() {
            if (this.isEnabled()) {
                this.processQueuedNavigationUpdates();
            }
        }
        onMoveComplete(player) {
            if (this.isEnabled()) {
                movementUtilities.clearOverlay(player.getTile());
            }
        }
        onToggleBind() {
            this.toggle();
            return true;
        }
        onTileUpdate(game, tile, tileX, tileY, tileZ, tileUpdateType) {
            if (this.navigationInitialized === NavigationSystemState.Initializing || localPlayer.isResting()) {
                this.navigationQueuedUpdates.push(() => {
                    this.onTileUpdate(game, tile, tileX, tileY, tileZ, tileUpdateType);
                });
            }
            else if (this.navigationInitialized === NavigationSystemState.Initialized && this.navigation) {
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (x === 0 && y === 0) {
                            this.navigation.onTileUpdate(tile, TileHelpers_1.default.getType(tile), tileX, tileY, tileZ);
                        }
                        else {
                            const point = game.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                            if (point) {
                                const otherTile = game.getTileFromPoint(point);
                                this.navigation.onTileUpdate(otherTile, TileHelpers_1.default.getType(otherTile), tileX + x, tileY + y, tileZ);
                            }
                        }
                    }
                }
            }
        }
        postExecuteAction(api, action, args) {
            if (api.executor !== localPlayer) {
                return;
            }
            Action.postExecuteAction(api.type);
        }
        onStatChange(player, stat) {
            const recoverThreshold = recoverThresholds[stat.type];
            if (recoverThreshold !== undefined) {
                if (stat.value <= recoverThreshold) {
                    if (!this.statThresholdExceeded[stat.type]) {
                        this.statThresholdExceeded[stat.type] = true;
                        if (this.isEnabled()) {
                            Logger_1.log.info(`Stat threshold exceeded for ${IStats_1.Stat[stat.type]}. ${stat.value} < ${recoverThreshold}`);
                            this.interrupt();
                        }
                    }
                }
                else if (this.statThresholdExceeded[stat.type]) {
                    this.statThresholdExceeded[stat.type] = false;
                }
            }
            switch (stat.type) {
                case IStats_1.Stat.Weight:
                    this.weightChanged = true;
                    const weightStatus = player.getWeightStatus();
                    if (this.weightStatus !== weightStatus) {
                        const previousWeightStatus = this.weightStatus;
                        this.weightStatus = weightStatus;
                        if (weightStatus === IPlayer_1.WeightStatus.None) {
                            return;
                        }
                        if (this.isEnabled()) {
                            Logger_1.log.info(`Weight status changed from ${previousWeightStatus !== undefined ? IPlayer_1.WeightStatus[previousWeightStatus] : "N/A"} to ${IPlayer_1.WeightStatus[this.weightStatus]}`);
                            this.interrupt();
                        }
                    }
                    break;
            }
        }
        command(_player, _args) {
            this.toggle();
        }
        reset() {
            this.objective = undefined;
            this.interruptObjective = undefined;
            this.interruptsId = undefined;
            this.interrupted = false;
            this.interruptContext = undefined;
            this.interruptContexts.clear();
        }
        delete() {
            this.base = {
                anvil: [],
                campfire: [],
                chest: [],
                furnace: [],
                intermediateChest: [],
                kiln: [],
                waterStill: [],
                well: [],
                buildAnotherChest: false,
                availableUnlimitedWellLocation: undefined,
            };
            this.inventory = {};
            this.reset();
            this.navigationInitialized = NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates = [];
            Navigation_1.default.delete();
        }
        isEnabled() {
            return this.tickTimeoutId !== undefined;
        }
        isReady(checkForInterrupts) {
            return this.isEnabled() &&
                !this.context.player.isResting() &&
                !this.context.player.isMovingClientside &&
                !this.context.player.hasDelay() &&
                !this.context.player.isGhost() &&
                !game.paused &&
                (!checkForInterrupts || !this.interrupted);
        }
        async toggle() {
            if (this.navigationInitialized === NavigationSystemState.Initializing) {
                return;
            }
            const str = !this.isEnabled() ? "Enabled" : "Disabled";
            Logger_1.log.info(str);
            localPlayer.messages
                .source(this.messageSource)
                .type(IMessageManager_1.MessageType.Good)
                .send(this.messageToggle, !this.isEnabled());
            if (this.navigationInitialized === NavigationSystemState.NotInitialized && this.navigation) {
                this.navigationInitialized = NavigationSystemState.Initializing;
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageNavigationUpdating);
                await Async_1.sleep(100);
                await this.navigation.updateAll();
                this.navigation.queueUpdateOrigin(localPlayer);
                this.navigationInitialized = NavigationSystemState.Initialized;
                this.processQueuedNavigationUpdates();
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageNavigationUpdated);
            }
            this.context = new Context_1.default(localPlayer, this.base, this.inventory);
            this.reset();
            if (this.isEnabled()) {
                this.disable();
            }
            else {
                if (this.navigation) {
                    this.navigation.showOverlay();
                    if (this.navigationInitialized === NavigationSystemState.Initialized) {
                        this.navigation.queueUpdateOrigin(localPlayer);
                    }
                }
                this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
            }
        }
        disable(gameIsEnding = false) {
            if (this.navigation) {
                this.navigation.hideOverlay();
            }
            if (this.tickTimeoutId !== undefined) {
                clearTimeout(this.tickTimeoutId);
                this.tickTimeoutId = undefined;
            }
            if (localPlayer && !gameIsEnding) {
                movementUtilities.resetMovementOverlays();
                localPlayer.walkAlongPath(undefined);
            }
        }
        interrupt(interruptObjective) {
            Logger_1.log.info("Interrupt", interruptObjective);
            this.interrupted = true;
            this.objective = undefined;
            if (interruptObjective) {
                this.interruptObjective = interruptObjective;
            }
            movementUtilities.resetMovementOverlays();
            localPlayer.walkAlongPath(undefined);
        }
        async tick() {
            try {
                await this.onTick();
            }
            catch (ex) {
                Logger_1.log.error("onTick error", ex);
            }
            if (this.tickTimeoutId === undefined) {
                this.disable();
                return;
            }
            this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
        }
        async onTick() {
            if (!this.isReady(false)) {
                return;
            }
            objectUtilities.resetCachedObjects();
            movementUtilities.resetCachedPaths();
            tileUtilities.resetNearestTileLocationCache();
            await this.executeObjectives(this.context, [new AnalyzeInventory_1.default(), new AnalyzeBase_1.default()], false, false);
            const interrupts = this.getInterrupts(this.context);
            const interruptsId = interrupts
                .map(objective => objective && (Array.isArray(objective) ? objective.map(o => o.getIdentifier()).join(" -> ") : objective.getIdentifier()))
                .join(", ");
            if (this.interruptsId !== interruptsId) {
                Logger_1.log.info(`Interrupts changed from ${this.interruptsId} to ${interruptsId}`);
                this.interruptsId = interruptsId;
                this.interruptObjective = undefined;
            }
            if (this.interruptObjective || interrupts.length > 0) {
                if (!this.interruptContext) {
                    this.interruptContext = this.context.clone();
                    this.interruptContext.setInitialState();
                    this.interruptContexts.clear();
                    Logger_1.log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
                }
                if (this.interruptObjective) {
                    this.interruptObjective.log.info("Continuing interrupt execution...");
                    const result = await this.executeObjectives(this.interruptContext, [this.interruptObjective], false);
                    if (result !== true) {
                        return;
                    }
                    this.interruptObjective = undefined;
                }
                if (interrupts.length > 0) {
                    for (let i = 0; i < interrupts.length; i++) {
                        const interruptObjectives = interrupts[i];
                        if (interruptObjectives === undefined || (Array.isArray(interruptObjectives) && interruptObjectives.length === 0)) {
                            continue;
                        }
                        const savedContext = this.interruptContexts.get(i);
                        if (savedContext) {
                            this.interruptContext = savedContext;
                            Logger_1.log.debug(`Restored saved context from ${i}. ${this.interruptContext}`);
                        }
                        const result = await this.executeObjectives(this.interruptContext, [interruptObjectives], true);
                        Logger_1.log.debug("Interrupt result", result);
                        if (!this.interruptContext) {
                            return;
                        }
                        if (result === true) {
                            this.interruptObjective = undefined;
                            if (this.interruptContexts.has(i)) {
                                this.interruptContexts.delete(i);
                                Logger_1.log.debug(`Deleting saved context from ${i}`);
                            }
                        }
                        else {
                            this.interruptContexts.set(i, this.interruptContext.clone());
                            Logger_1.log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext}`);
                            this.interruptContext.setInitialState();
                            if (result !== false) {
                                this.interruptObjective = result.find(objective => !objective.canSaveChildObjectives()) || result[result.length - 1];
                                this.objective = undefined;
                            }
                            return;
                        }
                    }
                }
                if (this.interrupted) {
                    this.interrupted = false;
                    this.interruptContext.setInitialState();
                    Logger_1.log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);
                    return;
                }
            }
            if (this.interrupted) {
                this.interrupted = false;
                return;
            }
            this.interruptContext = undefined;
            if (this.objective !== undefined) {
                this.objective.log.info("Continuing execution...");
                const result = await this.executeObjectives(this.context, [this.objective], false, true);
                if (result !== true) {
                    return;
                }
            }
            const result = await this.executeObjectives(this.context, this.determineObjectives(this.context), true, true);
            if (result === true || result === false) {
                this.objective = undefined;
            }
            else {
                this.objective = result.find(objective => !objective.canSaveChildObjectives()) || result[result.length - 1];
            }
        }
        async executeObjectives(context, objectives, resetContextState, checkForInterrupts = false) {
            for (const objective of objectives) {
                if (!this.isReady(checkForInterrupts)) {
                    return false;
                }
                if (resetContextState) {
                    context.reset();
                    Logger_1.log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`);
                }
                let objs;
                if (Array.isArray(objective)) {
                    objs = objective;
                }
                else {
                    objs = [objective];
                }
                Planner_1.default.reset();
                for (const o of objs) {
                    const plan = await Planner_1.default.createPlan(context, o);
                    if (!plan) {
                        Logger_1.log.warn(`No valid plan for ${o.getHashCode()}`);
                        break;
                    }
                    const result = await plan.execute(() => {
                        this.weightChanged = false;
                        return true;
                    }, () => {
                        if (this.weightChanged && context.player.getWeightStatus() !== IPlayer_1.WeightStatus.None) {
                            Logger_1.log.info("Weight changed. Stopping execution");
                            return false;
                        }
                        return this.isReady(checkForInterrupts);
                    });
                    if (result === IObjective_1.ObjectiveResult.Restart) {
                        return false;
                    }
                    if (result === false) {
                        return false;
                    }
                    if (typeof (result) !== "boolean") {
                        return result;
                    }
                }
            }
            return true;
        }
        determineObjectives(context) {
            const chest = context.player.getEquippedItem(IHuman_1.EquipType.Chest);
            const legs = context.player.getEquippedItem(IHuman_1.EquipType.Legs);
            const belt = context.player.getEquippedItem(IHuman_1.EquipType.Belt);
            const neck = context.player.getEquippedItem(IHuman_1.EquipType.Neck);
            const back = context.player.getEquippedItem(IHuman_1.EquipType.Back);
            const head = context.player.getEquippedItem(IHuman_1.EquipType.Head);
            const feet = context.player.getEquippedItem(IHuman_1.EquipType.Feet);
            const hands = context.player.getEquippedItem(IHuman_1.EquipType.Hands);
            const objectives = [];
            const gatherItem = Item_1.getBestActionItem(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Slashing);
            if (gatherItem === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Gather)]);
            }
            if (this.base.campfire.length === 0 && this.inventory.campfire === undefined) {
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Campfire), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.inventory.fireStarter === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.fireKindling === undefined) {
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Kindling), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.fireTinder === undefined) {
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Tinder), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.shovel === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Dig), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.knife === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneKnife), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.equipSword === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.WoodenSword), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.LeftHand)]);
            }
            if (this.inventory.axe === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneAxe), new AnalyzeInventory_1.default()]);
            }
            if (chest === undefined || chest.type === IItem_1.ItemType.TatteredShirt) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.BarkTunic), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Chest)]);
            }
            if (legs === undefined || legs.type === IItem_1.ItemType.TatteredPants) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.BarkLeggings), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Legs)]);
            }
            if (this.inventory.equipShield === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.WoodenShield), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.RightHand)]);
            }
            if (this.base.waterStill.length === 0 && this.inventory.waterStill === undefined) {
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            let acquireChest = true;
            if (!this.base.buildAnotherChest && this.base.chest.length > 0) {
                for (const c of this.base.chest) {
                    if ((itemManager.computeContainerWeight(c) / c.weightCapacity) < 0.9) {
                        acquireChest = false;
                        break;
                    }
                }
            }
            if (acquireChest && this.inventory.chest === undefined) {
                this.base.buildAnotherChest = true;
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadType.WoodenChest), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.inventory.pickAxe === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StonePickaxe), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.hammer === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneHammer), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.tongs === undefined) {
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Tongs), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.shovel === undefined) {
                objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneShovel), new AnalyzeInventory_1.default()]);
            }
            if (context.base.waterStill.length > 0) {
                objectives.push(new StartWaterStillDesalination_1.default(context.base.waterStill[0]));
            }
            if (Base_1.isNearBase(context)) {
                const seeds = Item_1.getSeeds(context);
                if (seeds.length > 0) {
                    objectives.push(new PlantSeed_1.default(seeds[0]));
                }
            }
            if (this.base.kiln.length === 0 && this.inventory.kiln === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitKiln), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            const waitingForWater = context.player.stat.get(IStats_1.Stat.Thirst).value <= recoverThresholds[IStats_1.Stat.Thirst] &&
                this.base.waterStill.length > 0 && this.base.waterStill[0].description().providesFire;
            const shouldUpgradeToLeather = !waitingForWater;
            if (shouldUpgradeToLeather) {
                if (belt === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherBelt), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Belt)]);
                }
                if (neck === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherGorget), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Neck)]);
                }
                if (head === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherCap), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Head)]);
                }
                if (back === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherQuiver), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Back)]);
                }
                if (feet === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherBoots), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Feet)]);
                }
                if (hands === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherGloves), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Hands)]);
                }
                if (legs && legs.type === IItem_1.ItemType.BarkLeggings) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherPants), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Legs)]);
                }
                if (chest && chest.type === IItem_1.ItemType.BarkTunic) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.LeatherTunic), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Chest)]);
                }
            }
            if (this.base.well.length === 0 && this.inventory.well === undefined && this.base.availableUnlimitedWellLocation !== undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.Well), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.base.furnace.length === 0 && this.inventory.furnace === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitFurnace), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.base.anvil.length === 0 && this.inventory.anvil === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.Anvil), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.inventory.waterContainer === undefined) {
                objectives.push([new AcquireWaterContainer_1.default(), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.equipSword && this.inventory.equipSword.type === IItem_1.ItemType.WoodenSword) {
                objectives.push([new UpgradeInventoryItem_1.default("equipSword"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.LeftHand)]);
            }
            if (this.inventory.equipShield && this.inventory.equipShield.type === IItem_1.ItemType.WoodenShield) {
                objectives.push([new UpgradeInventoryItem_1.default("equipShield"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.RightHand)]);
            }
            if (this.inventory.equipBelt && this.inventory.equipBelt.type === IItem_1.ItemType.LeatherBelt) {
                objectives.push([new UpgradeInventoryItem_1.default("equipBelt"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Belt)]);
            }
            if (this.inventory.equipNeck && this.inventory.equipNeck.type === IItem_1.ItemType.LeatherGorget) {
                objectives.push([new UpgradeInventoryItem_1.default("equipNeck"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Neck)]);
            }
            if (this.inventory.equipHead && this.inventory.equipHead.type === IItem_1.ItemType.LeatherCap) {
                objectives.push([new UpgradeInventoryItem_1.default("equipHead"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Head)]);
            }
            if (this.inventory.equipFeet && this.inventory.equipFeet.type === IItem_1.ItemType.LeatherBoots) {
                objectives.push([new UpgradeInventoryItem_1.default("equipFeet"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Feet)]);
            }
            if (this.inventory.equipHands && this.inventory.equipHands.type === IItem_1.ItemType.LeatherGloves) {
                objectives.push([new UpgradeInventoryItem_1.default("equipHands"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Hands)]);
            }
            if (this.inventory.equipLegs && this.inventory.equipLegs.type === IItem_1.ItemType.LeatherPants) {
                objectives.push([new UpgradeInventoryItem_1.default("equipLegs"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Legs)]);
            }
            if (this.inventory.equipChest && this.inventory.equipChest.type === IItem_1.ItemType.LeatherTunic) {
                objectives.push([new UpgradeInventoryItem_1.default("equipChest"), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.Chest)]);
            }
            const health = context.player.stat.get(IStats_1.Stat.Health);
            if (health.value / health.max < 0.9) {
                objectives.push(new RecoverHealth_1.default());
            }
            const hunger = context.player.stat.get(IStats_1.Stat.Hunger);
            if (hunger.value / hunger.max < 0.7) {
                objectives.push(new RecoverHunger_1.default(true));
            }
            objectives.push(new ReturnToBase_1.default());
            objectives.push(new OrganizeInventory_1.default());
            if (!multiplayer.isConnected()) {
                if (shouldUpgradeToLeather && game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        Logger_1.log.info("Done with all objectives! Disabling...");
                        this.disable();
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
                else {
                    objectives.push(new Idle_1.default());
                }
            }
            return objectives;
        }
        getInterrupts(context) {
            return [
                this.optionsInterrupt(),
                this.equipmentInterrupt(context),
                this.nearbyCreatureInterrupt(context),
                this.staminaInterrupt(context),
                this.buildItemObjectives(),
                this.healthInterrupt(context),
                this.weightInterrupt(),
                this.leaveDesertInterrupt(context),
                this.thirstInterrupt(context),
                this.gatherFromCorpsesInterrupt(context),
                this.hungerInterrupt(context),
                this.repairsInterrupt(context),
            ];
        }
        optionsInterrupt() {
            return new OptionsInterrupt_1.default();
        }
        equipmentInterrupt(context) {
            return this.handsEquipInterrupt(context) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Chest) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Legs) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Head) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Belt) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Feet) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Hands) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Neck) ||
                this.equipInterrupt(context, IHuman_1.EquipType.Back);
        }
        equipInterrupt(context, equip) {
            const item = context.player.getEquippedItem(equip);
            if (item && item.type === IItem_1.ItemType.SlitherSucker) {
                return new Unequip_1.default(item);
            }
            const bestEquipment = Item_1.getBestEquipment(context, equip);
            if (bestEquipment.length > 0) {
                const itemToEquip = bestEquipment[0];
                if (itemToEquip === item) {
                    return undefined;
                }
                if (item !== undefined) {
                    return new Unequip_1.default(item);
                }
                return new Equip_1.default(equip, itemToEquip);
            }
        }
        handsEquipInterrupt(context, preferredDamageType) {
            const leftHandEquipInterrupt = this.handEquipInterrupt(context, IHuman_1.EquipType.LeftHand, IAction_1.ActionType.Attack);
            if (leftHandEquipInterrupt) {
                return leftHandEquipInterrupt;
            }
            if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
                return new Equip_1.default(IHuman_1.EquipType.RightHand, context.inventory.equipShield);
            }
            const leftHandItem = context.player.getEquippedItem(IHuman_1.EquipType.LeftHand);
            const rightHandItem = context.player.getEquippedItem(IHuman_1.EquipType.RightHand);
            const leftHandDescription = leftHandItem ? leftHandItem.description() : undefined;
            const leftHandEquipped = leftHandDescription ? leftHandDescription.attack !== undefined : false;
            const rightHandDescription = rightHandItem ? rightHandItem.description() : undefined;
            const rightHandEquipped = rightHandDescription ? rightHandDescription.attack !== undefined : false;
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
                    if (leftHandDamageTypeMatches !== context.player.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                    if (rightHandDamageTypeMatches !== context.player.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
                else if (leftHandEquipped || rightHandEquipped) {
                    if (leftHandEquipped && !context.player.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                    if (rightHandEquipped && !context.player.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
                else {
                    if (!context.player.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                    if (!context.player.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
            }
            else {
                if (leftHandEquipped !== context.player.options.leftHand) {
                    ui.changeEquipmentOption("leftHand");
                }
                if (rightHandEquipped !== context.player.options.rightHand) {
                    ui.changeEquipmentOption("rightHand");
                }
                if (!context.player.options.leftHand && !context.player.options.rightHand) {
                    ui.changeEquipmentOption("leftHand");
                }
            }
        }
        handEquipInterrupt(context, equipType, use, itemTypes, preferredDamageType) {
            const equippedItem = context.player.getEquippedItem(equipType);
            let possibleEquips;
            if (use) {
                possibleEquips = Item_1.getPossibleHandEquips(context, use, preferredDamageType, false);
                if (use === IAction_1.ActionType.Attack) {
                    let closestCreature;
                    let closestCreatureDistance;
                    for (let x = -2; x <= 2; x++) {
                        for (let y = -2; y <= 2; y++) {
                            const point = game.ensureValidPoint({ x: context.player.x + x, y: context.player.y + y, z: context.player.z });
                            if (point) {
                                const tile = game.getTileFromPoint(point);
                                if (tile.creature && !tile.creature.isTamed()) {
                                    const distance = Vector2_1.default.distance(context.player, tile.creature.getPoint());
                                    if (closestCreatureDistance === undefined || closestCreatureDistance > distance) {
                                        closestCreatureDistance = distance;
                                        closestCreature = tile.creature;
                                    }
                                }
                            }
                        }
                    }
                    if (closestCreature) {
                        possibleEquips
                            .sort((a, b) => Item_1.estimateDamageModifier(a, closestCreature) < Item_1.estimateDamageModifier(b, closestCreature) ? 1 : -1);
                    }
                    else if (context.player.getEquippedItem(equipType) !== undefined) {
                        return undefined;
                    }
                }
                if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                    possibleEquips = Item_1.getPossibleHandEquips(context, use, undefined, false);
                }
            }
            else if (itemTypes) {
                possibleEquips = [];
                for (const itemType of itemTypes) {
                    if (itemManager.isGroup(itemType)) {
                        possibleEquips.push(...itemManager.getItemsInContainerByGroup(context.player.inventory, itemType));
                    }
                    else {
                        possibleEquips.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType));
                    }
                }
            }
            else {
                return undefined;
            }
            if (possibleEquips.length > 0) {
                for (let i = 0; i < 2; i++) {
                    const possibleEquipItem = possibleEquips[i];
                    if (!possibleEquipItem || possibleEquipItem === equippedItem) {
                        return undefined;
                    }
                    if (!possibleEquipItem.isEquipped()) {
                        return new Equip_1.default(equipType, possibleEquips[i]);
                    }
                }
            }
        }
        healthInterrupt(context) {
            const health = context.player.stat.get(IStats_1.Stat.Health);
            if (health.value > recoverThresholds[IStats_1.Stat.Health] && !context.player.status.Bleeding &&
                (!context.player.status.Poisoned || (context.player.status.Poisoned && (health.value / health.max) >= poisonHealthPercentThreshold))) {
                return undefined;
            }
            Logger_1.log.info("Heal");
            return new RecoverHealth_1.default();
        }
        staminaInterrupt(context) {
            if (context.player.stat.get(IStats_1.Stat.Stamina).value > recoverThresholds[IStats_1.Stat.Stamina]) {
                return undefined;
            }
            Logger_1.log.info("Stamina");
            return new RecoverStamina_1.default();
        }
        hungerInterrupt(context) {
            return new RecoverHunger_1.default(context.player.stat.get(IStats_1.Stat.Hunger).value <= recoverThresholds[IStats_1.Stat.Hunger]);
        }
        thirstInterrupt(context) {
            return new RecoverThirst_1.default(context.player.stat.get(IStats_1.Stat.Thirst).value <= recoverThresholds[IStats_1.Stat.Thirst]);
        }
        repairsInterrupt(context) {
            if (this.inventory.hammer === undefined) {
                return undefined;
            }
            return this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.LeftHand)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.RightHand)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Chest)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Legs)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Head)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Belt)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Feet)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Neck)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Hands)) ||
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Back)) ||
                this.repairInterrupt(context, this.inventory.knife) ||
                this.repairInterrupt(context, this.inventory.fireStarter) ||
                this.repairInterrupt(context, this.inventory.fireKindling) ||
                this.repairInterrupt(context, this.inventory.hoe) ||
                this.repairInterrupt(context, this.inventory.axe) ||
                this.repairInterrupt(context, this.inventory.pickAxe) ||
                this.repairInterrupt(context, this.inventory.shovel) ||
                this.repairInterrupt(context, this.inventory.equipSword) ||
                this.repairInterrupt(context, this.inventory.equipShield) ||
                this.repairInterrupt(context, this.inventory.bed) ||
                this.repairInterrupt(context, this.inventory.waterContainer);
        }
        repairInterrupt(context, item) {
            if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
                return undefined;
            }
            if (item.minDur / item.maxDur >= 0.6) {
                return undefined;
            }
            if (item === this.inventory.waterContainer && context.player.stat.get(IStats_1.Stat.Thirst).value < 2) {
                return undefined;
            }
            return new RepairItem_1.default(item);
        }
        nearbyCreatureInterrupt(context) {
            for (const facingDirecton of Direction_1.Direction.DIRECTIONS) {
                const creature = this.checkNearbyCreature(context, facingDirecton);
                if (creature !== undefined) {
                    Logger_1.log.info(`Defend against ${creature.getName().getString()}`);
                    return new DefendAgainstCreature_1.default(creature);
                }
            }
        }
        checkNearbyCreature(context, direction) {
            if (direction !== Direction_1.Direction.None) {
                const point = game.directionToMovement(direction);
                const validPoint = game.ensureValidPoint({ x: context.player.x + point.x, y: context.player.y + point.y, z: context.player.z });
                if (validPoint) {
                    const tile = game.getTileFromPoint(validPoint);
                    if (tile && tile.creature && !tile.creature.isTamed()) {
                        return tile.creature;
                    }
                }
            }
        }
        buildItemObjectives() {
            const objectives = [];
            if (this.inventory.campfire !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.campfire));
            }
            if (this.inventory.waterStill !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.waterStill));
            }
            if (this.inventory.chest !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.chest));
            }
            if (this.inventory.kiln !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.kiln));
            }
            if (this.inventory.well !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.well));
            }
            if (this.inventory.furnace !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.furnace));
            }
            if (this.inventory.anvil !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.anvil));
            }
            return objectives;
        }
        gatherFromCorpsesInterrupt(context) {
            if (Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Carve).length === 0) {
                return undefined;
            }
            const targets = objectUtilities.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2_1.default.distance(context.player, corpse) < 16);
            if (targets) {
                const objectives = [];
                for (const target of targets) {
                    const tile = game.getTileFromPoint(target);
                    const corpses = tile.corpses;
                    if (corpses && corpses.length > 0) {
                        for (const corpse of corpses) {
                            const resources = corpseManager.getResources(corpse, true);
                            if (!resources || resources.length === 0) {
                                continue;
                            }
                            const step = corpse.step || 0;
                            const carveCount = resources.length - step;
                            for (let i = 0; i < carveCount; i++) {
                                objectives.push(new CarveCorpse_1.default(corpse));
                            }
                        }
                    }
                }
                return objectives;
            }
        }
        weightInterrupt() {
            return new ReduceWeight_1.default();
        }
        leaveDesertInterrupt(context) {
            if (context.player.y < ITars_1.desertCutoff) {
                return undefined;
            }
            return new LeaveDesert_1.default();
        }
        processQueuedNavigationUpdates() {
            for (const queuedUpdate of this.navigationQueuedUpdates) {
                queuedUpdate();
            }
            this.navigationQueuedUpdates = [];
        }
    }
    __decorate([
        ModRegistry_1.default.bindable("Toggle", IInput_1.IInput.key("KeyT"))
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
        EventManager_1.EventHandler(EventBuses_1.EventBus.Game, "end")
    ], Tars.prototype, "onGameEnd", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "onWriteNote", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "die")
    ], Tars.prototype, "onPlayerDeath", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "processMovement")
    ], Tars.prototype, "processMovement", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "restEnd")
    ], Tars.prototype, "restEnd", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "moveComplete")
    ], Tars.prototype, "onMoveComplete", null);
    __decorate([
        Bind_1.default.onDown(ModRegistry_1.Registry().get("keyBind"))
    ], Tars.prototype, "onToggleBind", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.Game, "tileUpdate")
    ], Tars.prototype, "onTileUpdate", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "postExecuteAction", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "statChanged")
    ], Tars.prototype, "onStatChange", null);
    __decorate([
        ModRegistry_1.default.command("TARS")
    ], Tars.prototype, "command", null);
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW9FQSxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFFdEIsTUFBTSxpQkFBaUIsR0FBZ0M7UUFDdEQsQ0FBQyxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtRQUNqQixDQUFDLGFBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO1FBQ2xCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDakIsQ0FBQyxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtLQUNqQixDQUFDO0lBR0YsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUM7SUFFMUMsSUFBSyxxQkFJSjtJQUpELFdBQUsscUJBQXFCO1FBQ3pCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNaLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0lBRUQsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBb0JrQiwwQkFBcUIsR0FBaUMsRUFBRSxDQUFDO1lBUXpELHNCQUFpQixHQUF5QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTdELGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBNHJDN0IsQ0FBQztRQXByQ08sWUFBWTtZQUNsQixvQkFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU0sY0FBYztZQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQU9NLFdBQVcsQ0FBQyxhQUFzQixFQUFFLFdBQW1CO1lBQzdELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBR00sU0FB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QU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsa0JBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMs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