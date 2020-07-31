var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "entity/IEntity", "entity/IHuman", "entity/IStats", "entity/player/IMessageManager", "entity/player/IPlayer", "event/EventBuses", "event/EventManager", "game/IGame", "item/IItem", "mod/IHookHost", "mod/Mod", "mod/ModRegistry", "newui/input/Bind", "newui/input/IInput", "utilities/Async", "utilities/math/Direction", "utilities/math/Vector2", "utilities/TileHelpers", "./Context", "./Core/Planner", "./IObjective", "./Navigation/Navigation", "./Objectives/Acquire/Item/AcquireItem", "./Objectives/Acquire/Item/AcquireItemByGroup", "./Objectives/Acquire/Item/AcquireItemForAction", "./Objectives/Acquire/Item/AcquireItemForDoodad", "./Objectives/Acquire/Item/Specific/AcquireWaterContainer", "./Objectives/Analyze/AnalyzeBase", "./Objectives/Analyze/AnalyzeInventory", "./Objectives/Core/ExecuteAction", "./Objectives/Core/Lambda", "./Objectives/Interrupt/CarveCorpse", "./Objectives/Interrupt/DefendAgainstCreature", "./Objectives/Interrupt/OptionsInterrupt", "./Objectives/Interrupt/ReduceWeight", "./Objectives/Interrupt/RepairItem", "./Objectives/Other/BuildItem", "./Objectives/Other/Equip", "./Objectives/Other/Idle", "./Objectives/Other/PlantSeed", "./Objectives/Other/ReturnToBase", "./Objectives/Other/StartWaterStillDesalination", "./Objectives/Other/Unequip", "./Objectives/Other/UpgradeInventoryItem", "./Objectives/Recover/RecoverHealth", "./Objectives/Recover/RecoverHunger", "./Objectives/Recover/RecoverStamina", "./Objectives/Recover/RecoverThirst", "./Objectives/Utility/OrganizeInventory", "./Utilities/Action", "./Utilities/Base", "./Utilities/Item", "./Utilities/Logger", "./Utilities/Movement", "./Utilities/Object", "./Utilities/Tile"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IMessageManager_1, IPlayer_1, EventBuses_1, EventManager_1, IGame_1, IItem_1, IHookHost_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, Async_1, Direction_1, Vector2_1, TileHelpers_1, Context_1, Planner_1, IObjective_1, Navigation_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, Lambda_1, CarveCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, Equip_1, Idle_1, PlantSeed_1, ReturnToBase_1, StartWaterStillDesalination_1, Unequip_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, OrganizeInventory_1, Action, Base_1, Item_1, Logger_1, movementUtilities, objectUtilities, tileUtilities) {
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
        onLoad() {
            this.delete();
            this.navigation = Navigation_1.default.get();
        }
        onUnload() {
            this.disable(true);
            this.delete();
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
                if (game.playing && this.context.player.isGhost() && game.getGameOptions().respawn) {
                    await new ExecuteAction_1.default(IAction_1.ActionType.Respawn, (context, action) => {
                        action.execute(context.player);
                    }).execute(this.context);
                }
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
                if (!leftHandEquipped && !rightHandEquipped) {
                    if (!context.player.options.leftHand) {
                        ui.changeEquipmentOption("leftHand");
                    }
                }
                else if (leftHandEquipped !== context.player.options.leftHand) {
                    ui.changeEquipmentOption("leftHand");
                }
                if (rightHandEquipped !== context.player.options.rightHand) {
                    ui.changeEquipmentOption("rightHand");
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
                                    const distance = Vector2_1.default.squaredDistance(context.player, tile.creature.getPoint());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW9FQSxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFFdEIsTUFBTSxpQkFBaUIsR0FBZ0M7UUFDdEQsQ0FBQyxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtRQUNqQixDQUFDLGFBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO1FBQ2xCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDakIsQ0FBQyxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtLQUNqQixDQUFDO0lBR0YsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUM7SUFFMUMsSUFBSyxxQkFJSjtJQUpELFdBQUsscUJBQXFCO1FBQ3pCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNaLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0lBRUQsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBb0JrQiwwQkFBcUIsR0FBaUMsRUFBRSxDQUFDO1lBUXpELHNCQUFpQixHQUF5QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTdELGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBa3NDN0IsQ0FBQztRQTFyQ08sWUFBWTtZQUNsQixvQkFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU0sY0FBYztZQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVNLE1BQU07WUFDWixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsVUFBVSxHQUFHLG9CQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVNLFFBQVE7WUFDZCxJQUFJLENBQUMsT0FBTyxD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