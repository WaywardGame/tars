var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventEmitter", "event/EventManager", "game/entity/action/IAction", "game/entity/IHuman", "game/entity/IStats", "game/entity/player/IPlayer", "game/IGame", "game/item/IItem", "game/meta/prompt/IPrompt", "language/dictionary/InterruptChoice", "utilities/Decorators", "utilities/game/TileHelpers", "utilities/math/Direction", "utilities/math/Vector2", "utilities/promise/Async", "utilities/promise/ResolvablePromise", "../ITarsMod", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/core/ExecuteAction", "../objectives/interrupt/ButcherCorpse", "../objectives/interrupt/DefendAgainstCreature", "../objectives/interrupt/OptionsInterrupt", "../objectives/interrupt/ReduceWeight", "../objectives/interrupt/RepairItem", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/item/UnequipItem", "../objectives/other/ReturnToBase", "../objectives/other/RunAwayFromTarget", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/recover/RecoverStamina", "../objectives/recover/RecoverThirst", "../objectives/utility/OrganizeInventory", "../utilities/Action", "../utilities/Base", "../utilities/Creature", "../utilities/Item", "../utilities/Logger", "../utilities/Movement", "../utilities/Object", "../utilities/Player", "../utilities/Tile", "./context/Context", "./context/IContext", "./Executor", "./ITars", "./ITars", "./mode/Modes", "./navigation/Navigation", "./navigation/Navigation", "./objective/IObjective", "./planning/Planner", "./planning/Plan", "../utilities/Doodad", "../objectives/core/MoveToTarget"], function (require, exports, EventBuses_1, EventEmitter_1, EventManager_1, IAction_1, IHuman_1, IStats_1, IPlayer_1, IGame_1, IItem_1, IPrompt_1, InterruptChoice_1, Decorators_1, TileHelpers_1, Direction_1, Vector2_1, Async_1, ResolvablePromise_1, ITarsMod_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, ButcherCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, EquipItem_1, UnequipItem_1, ReturnToBase_1, RunAwayFromTarget_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, OrganizeInventory_1, Action_1, Base_1, Creature_1, Item_1, Logger_1, Movement_1, Object_1, Player_1, Tile_1, Context_1, IContext_1, Executor_1, ITars_1, ITars_2, Modes_1, Navigation_1, Navigation_2, IObjective_1, Planner_1, Plan_1, Doodad_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tars extends EventEmitter_1.default.Host {
        constructor(human, saveData, overlay) {
            super();
            this.human = human;
            this.saveData = saveData;
            this.overlay = overlay;
            this.statThresholdExceeded = {};
            this.quantumBurstCooldown = 0;
            this.interruptContexts = new Map();
            this.navigationSystemState = ITars_2.NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates = [];
            this.modeCache = new Map();
            this.loaded = false;
            this.utilities = {
                action: new Action_1.ActionUtilities(),
                base: new Base_1.BaseUtilities(),
                doodad: new Doodad_1.DoodadUtilities(),
                item: new Item_1.ItemUtilities(),
                movement: new Movement_1.MovementUtilities(),
                navigation: new Navigation_2.default(human, overlay),
                object: new Object_1.ObjectUtilities(),
                overlay: this.overlay,
                player: new Player_1.PlayerUtilities(),
                tile: new Tile_1.TileUtilities(),
                ensureSailingMode: (sailingMode) => this.ensureSailingMode(sailingMode),
            };
            Logger_1.log.info("Created TARS instance");
        }
        delete() {
            this.reset({
                delete: true,
            });
            this.navigationSystemState = ITars_2.NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates.length = 0;
            this.utilities.navigation.unload();
            Logger_1.log.info("Deleted TARS instance");
            this.event.emit("delete");
        }
        load() {
            if (this.loaded) {
                return;
            }
            this.loaded = true;
            this.reset({
                resetInventory: true,
                resetBase: true,
            });
            this.utilities.navigation.load();
            EventManager_1.default.registerEventBusSubscriber(this);
        }
        unload() {
            if (!this.loaded) {
                return;
            }
            this.loaded = false;
            this.delete();
            EventManager_1.default.deregisterEventBusSubscriber(this);
        }
        disable(gameIsTravelingOrEnding = false) {
            if (!gameIsTravelingOrEnding && this.saveData.enabled) {
                this.saveData.enabled = false;
                this.event.emit("enableChange", false);
            }
            this.overlay.hide();
            if (this.tickTimeoutId !== undefined) {
                clearTimeout(this.tickTimeoutId);
                this.tickTimeoutId = undefined;
            }
            this.utilities.movement.resetMovementOverlays();
            this.human.walkAlongPath(undefined);
            const player = this.human.asPlayer;
            if (player) {
                OptionsInterrupt_1.default.restore(player);
            }
            if (!gameIsTravelingOrEnding && this.saveData.options.mode === ITars_2.TarsMode.Manual) {
                this.updateOptions({ mode: ITars_2.TarsMode.Survival });
            }
            this.updateStatus();
        }
        onPlayerSpawn(player) {
            if (!this.saveData.configuredThresholds) {
                this.saveData.configuredThresholds = true;
                this.saveData.options.recoverThresholdHealth = Math.round(player.stat.get(IStats_1.Stat.Health).max * 0.6);
                this.saveData.options.recoverThresholdStamina = Math.round(player.stat.get(IStats_1.Stat.Stamina).max * 0.25);
                this.saveData.options.recoverThresholdHunger = Math.round(player.stat.get(IStats_1.Stat.Hunger).max * 0.40);
                this.saveData.options.recoverThresholdThirst = 10;
                this.saveData.options.recoverThresholdThirstFromMax = -10;
                Logger_1.log.info(`Configured recover thresholds. health: ${this.saveData.options.recoverThresholdHealth}. stamina: ${this.saveData.options.recoverThresholdStamina}. hunger: ${this.saveData.options.recoverThresholdHunger}`);
            }
        }
        onWriteNote(player, note) {
            if (this.human !== player || !this.isRunning()) {
                return;
            }
            return false;
        }
        onPlayerDeath() {
            if (this.human !== localPlayer) {
                return;
            }
            this.fullInterrupt("Human died");
            this.utilities.movement.resetMovementOverlays();
        }
        onPlayerRespawn() {
            if (this.human !== localPlayer) {
                return;
            }
            this.fullInterrupt("Human respawned");
            this.utilities.movement.resetMovementOverlays();
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(this.human);
            }
        }
        async processMovement(player) {
            if (this.human !== player || !this.isRunning()) {
                return;
            }
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(player);
            }
            this.processQuantumBurst();
            const objective = this.getCurrentObjective();
            if (objective !== undefined) {
                const result = await objective.onMove(this.context);
                if (result === true) {
                    this.fullInterrupt("Target moved");
                }
                else if (result) {
                    this.interrupt("Target moved", result);
                }
            }
        }
        onItemRemove(_, item) {
            if (!this.isRunning()) {
                return;
            }
            const objective = this.getCurrentObjective();
            if (objective !== undefined && objective instanceof MoveToTarget_1.default) {
                const result = objective.onItemRemoved(this.context, item);
                if (result === true) {
                    this.fullInterrupt(`${item} was removed`);
                }
            }
        }
        onCorpseRemove(_, corpse) {
            if (!this.isRunning()) {
                return;
            }
            const objective = this.getCurrentObjective();
            if (objective !== undefined && objective instanceof MoveToTarget_1.default) {
                const result = objective.onCorpseRemoved(this.context, corpse);
                if (result === true) {
                    this.fullInterrupt(`${corpse} was removed`);
                }
            }
        }
        onRestEnd(player) {
            if (this.human !== player) {
                return;
            }
            this.processQueuedNavigationUpdates();
        }
        async onPostMove(npc, fromX, fromY, fromZ, fromTile, toX, toY, toZ, toTile) {
            if (this.human !== npc) {
                return;
            }
            this.utilities.movement.clearOverlay(toTile);
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(npc);
            }
            this.processQuantumBurst();
            const objective = this.getCurrentObjective();
            if (objective !== undefined) {
                const result = await objective.onMove(this.context);
                if (result === true) {
                    this.fullInterrupt("Target moved");
                }
                else if (result) {
                    this.interrupt("Target moved", result);
                }
            }
        }
        onMoveComplete(player) {
            if (this.human !== player) {
                return;
            }
            this.utilities.movement.clearOverlay(player.getTile());
        }
        onPrompt(host, prompt) {
            if (this.isRunning() && (prompt.type === IPrompt_1.Prompt.GameDangerousStep || prompt.type === IPrompt_1.Prompt.GameIslandTravelConfirmation)) {
                Logger_1.log.info(`Resolving true for prompt ${IPrompt_1.Prompt[prompt.type]}`);
                prompt.resolve(InterruptChoice_1.default.Yes);
            }
        }
        onTileUpdate(island, tile, tileX, tileY, tileZ, tileUpdateType) {
            if (island !== this.human.island) {
                return;
            }
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initializing || this.human.isResting()) {
                this.navigationQueuedUpdates.push(() => {
                    this.onTileUpdate(island, tile, tileX, tileY, tileZ, tileUpdateType);
                });
            }
            else if (this.navigationSystemState === ITars_2.NavigationSystemState.Initialized) {
                const updateNeighbors = tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn;
                if (updateNeighbors) {
                    for (let x = -Navigation_1.tileUpdateRadius; x <= Navigation_1.tileUpdateRadius; x++) {
                        for (let y = -Navigation_1.tileUpdateRadius; y <= Navigation_1.tileUpdateRadius; y++) {
                            const point = island.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                            if (point) {
                                const otherTile = island.getTileFromPoint(point);
                                this.utilities.navigation.onTileUpdate(otherTile, TileHelpers_1.default.getType(otherTile), tileX + x, tileY + y, tileZ, this.utilities.base.isBaseTile(this.getContext(), otherTile), undefined, tileUpdateType);
                            }
                        }
                    }
                }
                else {
                    this.utilities.navigation.onTileUpdate(tile, TileHelpers_1.default.getType(tile), tileX, tileY, tileZ, this.utilities.base.isBaseTile(this.getContext(), tile), undefined, tileUpdateType);
                }
            }
        }
        postExecuteAction(_, actionType, api, args) {
            if (this.human !== api.executor) {
                return;
            }
            this.processQuantumBurst();
            this.utilities.action.postExecuteAction(api.type);
        }
        processInput(player) {
            if (this.human !== player || !this.isRunning()) {
                return;
            }
            this.processQuantumBurst();
            return undefined;
        }
        onWalkPathChange(human, walkPath) {
            if (this.human !== human || !this.isRunning() || !walkPath || walkPath.length === 0) {
                return;
            }
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext);
            if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
                this.interrupt("Organize inventory", ...organizeInventoryInterrupts);
            }
        }
        onChangeZ(human, z, lastZ) {
            if (this.human !== human || !this.isRunning() || !human.hasWalkPath()) {
                return;
            }
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(this.human);
            }
            this.interrupt(`Interrupting due to z movement from ${lastZ} to ${z}`);
        }
        onPreMove(human, prevX, prevY, prevZ, prevTile, nextX, nextY, nextZ, nextTile) {
            if (this.human !== human || !this.isRunning() || !human.hasWalkPath()) {
                return;
            }
            if ((nextTile.npc && nextTile.npc !== this.human) || (nextTile.doodad && nextTile.doodad.blocksMove()) || human.island.isPlayerAtTile(nextTile, false, true)) {
                this.interrupt("Interrupting due to blocked movement");
            }
        }
        onStatChange(human, stat) {
            if (this.human !== human || !this.isRunning()) {
                return;
            }
            if (stat.type === IStats_1.Stat.Health || stat.type === IStats_1.Stat.Stamina || stat.type === IStats_1.Stat.Hunger || stat.type === IStats_1.Stat.Thirst) {
                const recoverThreshold = this.utilities.player.getRecoverThreshold(this.context, stat.type);
                if (stat.value <= recoverThreshold) {
                    if (!this.statThresholdExceeded[stat.type]) {
                        this.statThresholdExceeded[stat.type] = true;
                        if (this.isRunning()) {
                            this.interrupt(`Stat threshold exceeded for ${IStats_1.Stat[stat.type]}. ${stat.value} < ${recoverThreshold}`);
                        }
                    }
                }
                else if (this.statThresholdExceeded[stat.type]) {
                    this.statThresholdExceeded[stat.type] = false;
                }
            }
            switch (stat.type) {
                case IStats_1.Stat.Weight:
                    Executor_1.default.markWeightChanged();
                    const weightStatus = human.getWeightStatus();
                    if (this.weightStatus !== weightStatus) {
                        this.previousWeightStatus = this.weightStatus;
                        this.weightStatus = weightStatus;
                        if (weightStatus === IPlayer_1.WeightStatus.None) {
                            return;
                        }
                        if (this.isRunning()) {
                            this.interrupt(`Weight status changed from ${this.previousWeightStatus !== undefined ? IPlayer_1.WeightStatus[this.previousWeightStatus] : "N/A"} to ${IPlayer_1.WeightStatus[this.weightStatus]}`);
                        }
                    }
                    break;
            }
        }
        async onMoveToIsland() {
            if (this.isEnabled()) {
                this.disable(true);
            }
            this.delete();
            this.utilities.navigation.load();
            if (!this.isEnabled()) {
                return;
            }
            this.toggle(true);
        }
        getContext() {
            return this.context ?? new Context_1.default(this.human, this.base, this.inventory, this.utilities, this.saveData.options);
        }
        isEnabled() {
            return this.saveData.enabled;
        }
        isRunning() {
            return this.tickTimeoutId !== undefined;
        }
        isQuantumBurstEnabled() {
            return this.isEnabled() && this.saveData.options.quantumBurst && !multiplayer.isConnected();
        }
        async toggle(enabled = !this.saveData.enabled) {
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initializing) {
                return;
            }
            this.saveData.enabled = enabled;
            this.event.emit("enableChange", enabled);
            Logger_1.log.info(this.saveData.enabled ? "Enabled" : "Disabled");
            this.context = new Context_1.default(this.human, this.base, this.inventory, this.utilities, this.saveData.options);
            this.utilities.item.initialize(this.context);
            await this.ensureNavigation(!!this.context.human.vehicleItemReference);
            this.reset();
            if (this.saveData.enabled) {
                this.overlay.show();
                if (this.utilities.navigation) {
                    this.utilities.navigation.queueUpdateOrigin(this.human);
                }
                this.tickTimeoutId = window.setTimeout(this.tick.bind(this), ITars_1.tickSpeed);
            }
            else {
                this.disable();
            }
        }
        updateOptions(options) {
            const changedOptions = [];
            for (const key of Object.keys(options)) {
                const newValue = options[key];
                if (newValue !== undefined && this.saveData.options[key] !== newValue) {
                    this.saveData.options[key] = newValue;
                    changedOptions.push(key);
                }
            }
            if (changedOptions.length > 0) {
                Logger_1.log.info(`Updating options: ${changedOptions.join(", ")}`);
                this.event.emit("optionsChange", this.saveData.options);
                let shouldInterrupt = this.isRunning();
                for (const changedOption of changedOptions) {
                    switch (changedOption) {
                        case "mode":
                            shouldInterrupt = true;
                            break;
                        case "survivalExploreIslands":
                            this.context?.setData(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
                            break;
                        case "goodCitizen":
                            this.reset({
                                resetBase: true,
                                resetContext: true,
                            });
                            break;
                        case "quantumBurst":
                            shouldInterrupt = false;
                            if (this.saveData.options.quantumBurst) {
                                this.event.emit("quantumBurstChange", ITars_2.QuantumBurstStatus.Start);
                            }
                            else {
                                this.quantumBurstCooldown = 2;
                            }
                            break;
                        case "debugLogging":
                            shouldInterrupt = false;
                            Planner_1.default.debug = this.saveData.options.debugLogging;
                            break;
                    }
                }
                if (shouldInterrupt) {
                    this.fullInterrupt("Option changed");
                }
            }
        }
        async activateManualMode(modeInstance) {
            this.updateOptions({ mode: ITars_2.TarsMode.Manual });
            if (!this.isRunning()) {
                this.toggle();
            }
            await this.initializeMode(this.context, ITars_2.TarsMode.Manual, modeInstance);
        }
        getStatus() {
            if (this.navigationSystemState === ITars_2.NavigationSystemState.Initializing) {
                return ITarsMod_1.TarsTranslation.DialogStatusNavigatingInitializing;
            }
            if (!this.isRunning()) {
                return "Not running";
            }
            let statusMessage = "Idle";
            let planStatusMessage;
            const plan = Executor_1.default.getPlan();
            if (plan !== undefined) {
                planStatusMessage = plan.tree.objective.getStatusMessage(this.context);
            }
            const objectivePipeline = this.objectivePipeline ?? this.interruptObjectivePipeline;
            if (objectivePipeline) {
                statusMessage = objectivePipeline.flat()[0].getStatusMessage(this.context);
                if (!statusMessage) {
                    statusMessage = planStatusMessage;
                }
                else if (planStatusMessage && planStatusMessage !== statusMessage &&
                    statusMessage !== "Miscellaneous processing" && statusMessage !== "Calculating objective...") {
                    statusMessage = `${planStatusMessage} - ${statusMessage}`;
                }
            }
            else if (planStatusMessage) {
                statusMessage = planStatusMessage;
            }
            if (statusMessage === undefined) {
                statusMessage = "Miscellaneous processing";
                if (plan) {
                    Logger_1.log.warn("Missing status message for objective", plan.tree.objective.getIdentifier());
                }
            }
            if (this.lastStatusMessage !== statusMessage) {
                this.lastStatusMessage = statusMessage;
                Logger_1.log.info(`Status: ${statusMessage}`);
            }
            return statusMessage;
        }
        updateStatus() {
            this.event.emit("statusChange", this.getStatus());
        }
        async ensureSailingMode(sailingMode) {
            if (!this.utilities.navigation) {
                return;
            }
            if (this.navigationUpdatePromise) {
                return this.navigationUpdatePromise;
            }
            if (this.utilities.navigation.shouldUpdateSailingMode(sailingMode)) {
                Logger_1.log.info("Updating sailing mode", sailingMode);
                this.navigationUpdatePromise = new ResolvablePromise_1.default();
                this.navigationSystemState = ITars_2.NavigationSystemState.NotInitialized;
                await this.ensureNavigation(sailingMode);
                this.navigationUpdatePromise.resolve();
                this.navigationUpdatePromise = undefined;
            }
        }
        async ensureNavigation(sailingMode) {
            if (this.navigationSystemState === ITars_2.NavigationSystemState.NotInitialized && this.utilities.navigation) {
                this.navigationSystemState = ITars_2.NavigationSystemState.Initializing;
                this.updateStatus();
                this.event.emit("navigationChange", this.navigationSystemState);
                await (0, Async_1.sleep)(100);
                await this.utilities.navigation.updateAll(sailingMode);
                this.utilities.navigation.queueUpdateOrigin(this.human);
                this.navigationSystemState = ITars_2.NavigationSystemState.Initialized;
                this.processQueuedNavigationUpdates();
                this.event.emit("navigationChange", this.navigationSystemState);
            }
        }
        async getOrCreateModeInstance(context) {
            const mode = this.saveData.options.mode;
            let modeInstance = this.modeCache.get(mode);
            if (!modeInstance) {
                const modeConstructor = Modes_1.modes.get(mode);
                if (!modeConstructor) {
                    this.disable();
                    throw new Error(`Missing mode initializer for ${ITars_2.TarsMode[mode]}`);
                }
                modeInstance = new modeConstructor();
                await this.initializeMode(context, mode, modeInstance);
            }
            return modeInstance;
        }
        async initializeMode(context, mode, modeInstance) {
            Logger_1.log.info(`Initializing ${ITars_2.TarsMode[mode]}`);
            this.disposeMode(context, mode);
            this.modeCache.set(mode, modeInstance);
            EventManager_1.default.registerEventBusSubscriber(modeInstance);
            await modeInstance.initialize?.(context, (success) => {
                this.event.emit("modeFinished", mode, success);
                this.disable();
            });
        }
        disposeMode(context, mode) {
            const modeInstance = this.modeCache.get(mode);
            if (modeInstance) {
                modeInstance.dispose?.(this.context);
                EventManager_1.default.deregisterEventBusSubscriber(modeInstance);
                this.modeCache.delete(mode);
                Logger_1.log.info(`Disposed of "${ITars_2.TarsMode[mode]}" mode`);
            }
        }
        reset(options) {
            Executor_1.default.reset();
            for (const mode of Array.from(this.modeCache.keys())) {
                if (options?.delete || mode !== ITars_2.TarsMode.Manual) {
                    this.disposeMode(this.context, mode);
                }
            }
            this.lastStatusMessage = undefined;
            this.objectivePipeline = undefined;
            this.interruptObjectivePipeline = undefined;
            this.interruptIds = undefined;
            this.interruptContext = undefined;
            this.interruptContexts.clear();
            this.clearCaches();
            if (options?.delete || options?.resetInventory) {
                this.inventory = {};
            }
            if (options?.delete || options?.resetBase) {
                if (this.base && typeof (localIsland) !== "undefined") {
                    const baseDoodads = this.utilities.base.getBaseDoodads(this.getContext());
                    for (const doodad of baseDoodads) {
                        this.utilities.navigation.refreshOverlay(doodad.getTile(), doodad.x, doodad.y, doodad.z, false);
                    }
                }
                this.base = {
                    anvil: [],
                    campfire: [],
                    chest: [],
                    furnace: [],
                    intermediateChest: [],
                    kiln: [],
                    solarStill: [],
                    waterStill: [],
                    well: [],
                    buildAnotherChest: false,
                    availableUnlimitedWellLocation: undefined,
                };
                this.utilities.base.clearCache();
            }
            if (options?.delete) {
                this.context = undefined;
                this.modeCache.clear();
            }
            else if (options?.resetContext) {
                this.context = new Context_1.default(this.human, this.base, this.inventory, this.utilities, this.saveData.options);
            }
        }
        clearCaches() {
            this.utilities.object.clearCache();
            this.utilities.tile.clearCache();
            this.utilities.item.clearCache();
            this.utilities.movement.clearCache();
        }
        getCurrentObjective() {
            const objective = this.interruptObjectivePipeline || this.objectivePipeline;
            if (objective !== undefined && !Array.isArray(objective[0])) {
                return objective[0];
            }
            return undefined;
        }
        interrupt(reason, ...interruptObjectives) {
            Logger_1.log.info(`Interrupt: ${reason}`, Plan_1.default.getPipelineString(this.context, interruptObjectives));
            Executor_1.default.interrupt();
            this.objectivePipeline = undefined;
            if (interruptObjectives && interruptObjectives.length > 0) {
                this.interruptObjectivePipeline = interruptObjectives;
            }
            this.utilities.movement.resetMovementOverlays();
            this.human.walkAlongPath(undefined);
        }
        fullInterrupt(reason) {
            this.interrupt(reason);
            this.interruptObjectivePipeline = undefined;
            this.interruptIds = undefined;
        }
        async tick() {
            try {
                if (this.context.human.hasDelay()) {
                    this.processQuantumBurst();
                }
                await this.onTick();
                this.updateStatus();
            }
            catch (ex) {
                Logger_1.log.error("onTick error", ex);
            }
            if (this.tickTimeoutId === undefined) {
                this.disable();
                return;
            }
            if (this.context.human.hasDelay()) {
                this.processQuantumBurst();
            }
            this.tickTimeoutId = window.setTimeout(this.tick.bind(this), this.isQuantumBurstEnabled() ? game.interval : ITars_1.tickSpeed);
        }
        async onTick() {
            if (!this.isRunning() || !Executor_1.default.isReady(this.context, false)) {
                if (this.quantumBurstCooldown === 2) {
                    this.quantumBurstCooldown--;
                    this.event.emit("quantumBurstChange", ITars_2.QuantumBurstStatus.CooldownStart);
                }
                if (game.playing && this.context.human.isGhost() && game.getGameOptions().respawn && this.context.human.asPlayer) {
                    await new ExecuteAction_1.default(IAction_1.ActionType.Respawn, (context, action) => {
                        action.execute(context.actionExecutor);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).execute(this.context);
                }
                return;
            }
            if (this.quantumBurstCooldown === 1) {
                this.quantumBurstCooldown--;
                this.event.emit("quantumBurstChange", ITars_2.QuantumBurstStatus.CooldownEnd);
            }
            this.clearCaches();
            await Executor_1.default.executeObjectives(this.context, [new AnalyzeInventory_1.default(), new AnalyzeBase_1.default()], false, false);
            const modeInstance = await this.getOrCreateModeInstance(this.context);
            const interrupts = modeInstance.getInterrupts ?
                await modeInstance.getInterrupts(this.context) :
                this.getInterrupts(this.context);
            const interruptIds = new Set(interrupts
                .filter(objective => Array.isArray(objective) ? objective.length > 0 : objective !== undefined)
                .map(objective => Array.isArray(objective) ? objective.map(o => o.getIdentifier()).join(" -> ") : objective.getIdentifier()));
            let interruptsChanged = this.interruptIds === undefined && interruptIds.size > 0;
            if (!interruptsChanged && this.interruptIds !== undefined) {
                for (const interruptId of interruptIds) {
                    if (!this.interruptIds.has(interruptId)) {
                        interruptsChanged = true;
                        break;
                    }
                }
            }
            if (interruptsChanged) {
                Logger_1.log.info(`Interrupts changed from ${this.interruptIds ? Array.from(this.interruptIds).join(", ") : undefined} to ${Array.from(interruptIds).join(", ")}`);
                this.interruptIds = interruptIds;
                this.interruptObjectivePipeline = undefined;
            }
            if (this.interruptObjectivePipeline || interrupts.length > 0) {
                if (!this.interruptContext) {
                    this.interruptContext = this.context.clone();
                    this.interruptContext.setInitialState();
                    this.interruptContexts.clear();
                    Logger_1.log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
                }
                if (this.interruptObjectivePipeline) {
                    const interruptHashCode = Plan_1.default.getPipelineString(this.context, this.interruptObjectivePipeline);
                    Logger_1.log.info("Continuing interrupt execution", interruptHashCode);
                    const result = await Executor_1.default.executeObjectives(this.interruptContext, this.interruptObjectivePipeline, false);
                    switch (result.type) {
                        case Executor_1.ExecuteObjectivesResultType.Completed:
                            this.interruptObjectivePipeline = undefined;
                            Logger_1.log.info("Completed interrupt objectives");
                            break;
                        case Executor_1.ExecuteObjectivesResultType.Restart:
                            this.interruptObjectivePipeline = undefined;
                            return;
                        case Executor_1.ExecuteObjectivesResultType.Pending:
                            const afterInterruptHashCode = Plan_1.default.getPipelineString(this.context, this.interruptObjectivePipeline);
                            if (interruptHashCode === afterInterruptHashCode) {
                                this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                                Logger_1.log.info(`Updated continuing interrupt objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Plan_1.default.getPipelineString(this.context, this.interruptObjectivePipeline));
                            }
                            else {
                                Logger_1.log.info(`Ignoring continuing interrupt objectives due to changed interrupts - ${Executor_1.ExecuteObjectivesResultType[result.type]}. Before: ${interruptHashCode}. After: ${afterInterruptHashCode}`);
                            }
                            return;
                        case Executor_1.ExecuteObjectivesResultType.ContinuingNextTick:
                            this.interruptObjectivePipeline = undefined;
                            Logger_1.log.info("Clearing interrupt objective pipeline");
                            return;
                    }
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
                            Logger_1.log.debug(`Restored saved context from ${i}. ${this.interruptContext.getHashCode()}`);
                        }
                        const result = await Executor_1.default.executeObjectives(this.interruptContext, [interruptObjectives], true);
                        if (!this.interruptContext) {
                            return;
                        }
                        switch (result.type) {
                            case Executor_1.ExecuteObjectivesResultType.Completed:
                                this.interruptObjectivePipeline = undefined;
                                if (this.interruptContexts.has(i)) {
                                    this.interruptContexts.delete(i);
                                    Logger_1.log.debug(`Deleting saved context from ${i}`);
                                }
                                break;
                            default:
                                this.interruptContexts.set(i, this.interruptContext.clone());
                                Logger_1.log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext.getHashCode()}`);
                                this.interruptContext.setInitialState();
                                if (result.type === Executor_1.ExecuteObjectivesResultType.Pending || result.type === Executor_1.ExecuteObjectivesResultType.ContinuingNextTick) {
                                    this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                                    this.objectivePipeline = undefined;
                                }
                                return;
                        }
                    }
                }
                if (Executor_1.default.tryClearInterrupt()) {
                    this.interruptContext.setInitialState();
                    Logger_1.log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);
                    return;
                }
            }
            if (Executor_1.default.tryClearInterrupt()) {
                return;
            }
            this.interruptContext = undefined;
            if (this.objectivePipeline !== undefined) {
                const hashCode = Plan_1.default.getPipelineString(this.context, this.objectivePipeline);
                Logger_1.log.info("Continuing execution of objectives", hashCode);
                const result = await Executor_1.default.executeObjectives(this.context, this.objectivePipeline, false, true);
                switch (result.type) {
                    case Executor_1.ExecuteObjectivesResultType.Completed:
                        this.objectivePipeline = undefined;
                        break;
                    case Executor_1.ExecuteObjectivesResultType.Restart:
                        this.objectivePipeline = undefined;
                        return;
                    case Executor_1.ExecuteObjectivesResultType.Pending:
                    case Executor_1.ExecuteObjectivesResultType.ContinuingNextTick:
                        const afterHashCode = Plan_1.default.getPipelineString(this.context, this.objectivePipeline);
                        if (hashCode === afterHashCode) {
                            this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                            Logger_1.log.info(`Updated continuing objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Plan_1.default.getPipelineString(this.context, this.objectivePipeline));
                        }
                        else {
                            Logger_1.log.info(`Ignoring continuing objectives due to changed objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}. Resetting. Before: ${hashCode}. After: ${afterHashCode}`);
                            this.objectivePipeline = undefined;
                        }
                        return;
                }
                if (!this.isEnabled()) {
                    return;
                }
            }
            this.context.reset();
            Logger_1.log.debug(`Reset context state. Context hash code: ${this.context.getHashCode()}.`);
            const objectives = await modeInstance.determineObjectives(this.context);
            const result = await Executor_1.default.executeObjectives(this.context, objectives, true, true);
            switch (result.type) {
                case Executor_1.ExecuteObjectivesResultType.Pending:
                case Executor_1.ExecuteObjectivesResultType.ContinuingNextTick:
                    this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                    Logger_1.log.info(`Saved objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Plan_1.default.getPipelineString(this.context, this.objectivePipeline));
                    this.updateStatus();
                    return;
                default:
                    this.objectivePipeline = undefined;
                    return;
            }
        }
        getInterrupts(context) {
            const stayHealthy = this.saveData.options.stayHealthy;
            let interrupts = [
                this.optionsInterrupt(),
                ...this.equipmentInterrupt(context),
                this.nearbyCreatureInterrupt(context),
            ];
            if (stayHealthy) {
                interrupts.push(...this.getRecoverInterrupts(context, true));
            }
            interrupts = interrupts.concat([
                this.buildItemObjectives(),
                this.reduceWeightInterrupt(context),
            ]);
            if (stayHealthy) {
                interrupts.push(...this.getRecoverInterrupts(context, false));
            }
            interrupts = interrupts.concat([
                this.gatherFromCorpsesInterrupt(context),
                this.repairsInterrupt(context),
                this.returnToBaseInterrupt(context),
            ]);
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(context);
            if (organizeInventoryInterrupts) {
                interrupts = interrupts.concat(organizeInventoryInterrupts);
            }
            return interrupts;
        }
        getRecoverInterrupts(context, onlyUseAvailableItems) {
            const poisonHealthPercentThreshold = 0.85;
            const health = context.human.stat.get(IStats_1.Stat.Health);
            const needsHealthRecovery = health.value <= this.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Health) ||
                context.human.status.Bleeding ||
                (context.human.status.Poisoned && (health.value / health.max) <= poisonHealthPercentThreshold);
            const exceededThirstThreshold = context.human.stat.get(IStats_1.Stat.Thirst).value <= this.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Thirst);
            const exceededHungerThreshold = context.human.stat.get(IStats_1.Stat.Hunger).value <= this.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Hunger);
            const exceededStaminaThreshold = context.human.stat.get(IStats_1.Stat.Stamina).value <= this.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Stamina);
            const objectives = [];
            if (needsHealthRecovery) {
                objectives.push(new RecoverHealth_1.default(onlyUseAvailableItems));
            }
            objectives.push(new RecoverThirst_1.default({
                onlyUseAvailableItems: onlyUseAvailableItems,
                exceededThreshold: exceededThirstThreshold,
                onlyEmergencies: false,
            }));
            objectives.push(new RecoverHunger_1.default(onlyUseAvailableItems, exceededHungerThreshold));
            if (exceededStaminaThreshold) {
                objectives.push(new RecoverStamina_1.default());
            }
            objectives.push(new RecoverThirst_1.default({
                onlyUseAvailableItems: onlyUseAvailableItems,
                exceededThreshold: exceededThirstThreshold,
                onlyEmergencies: true,
            }));
            return objectives;
        }
        optionsInterrupt() {
            return new OptionsInterrupt_1.default();
        }
        equipmentInterrupt(context) {
            return [
                this.handsEquipInterrupt(context),
                this.equipInterrupt(context, IHuman_1.EquipType.Chest),
                this.equipInterrupt(context, IHuman_1.EquipType.Legs),
                this.equipInterrupt(context, IHuman_1.EquipType.Head),
                this.equipInterrupt(context, IHuman_1.EquipType.Belt),
                this.equipInterrupt(context, IHuman_1.EquipType.Feet),
                this.equipInterrupt(context, IHuman_1.EquipType.Hands),
                this.equipInterrupt(context, IHuman_1.EquipType.Neck),
                this.equipInterrupt(context, IHuman_1.EquipType.Back),
            ];
        }
        equipInterrupt(context, equip) {
            const item = context.human.getEquippedItem(equip);
            if (item && (item.type === IItem_1.ItemType.SlitherSucker || item.type === IItem_1.ItemType.AberrantSlitherSucker)) {
                return new UnequipItem_1.default(item);
            }
            const bestEquipment = this.utilities.item.getBestEquipment(context, equip);
            if (bestEquipment.length > 0) {
                const itemToEquip = bestEquipment[0];
                if (itemToEquip === item) {
                    return undefined;
                }
                if (item !== undefined) {
                    return new UnequipItem_1.default(item);
                }
                return new EquipItem_1.default(equip, itemToEquip);
            }
        }
        handsEquipInterrupt(context, preferredDamageType) {
            const leftHandEquipInterrupt = this.handEquipInterrupt(context, IHuman_1.EquipType.LeftHand, IAction_1.ActionType.Attack);
            if (leftHandEquipInterrupt) {
                return leftHandEquipInterrupt;
            }
            if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
                return new EquipItem_1.default(IHuman_1.EquipType.RightHand, context.inventory.equipShield);
            }
            const leftHandItem = context.human.getEquippedItem(IHuman_1.EquipType.LeftHand);
            const rightHandItem = context.human.getEquippedItem(IHuman_1.EquipType.RightHand);
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
                    if (leftHandDamageTypeMatches !== context.human.options.leftHand) {
                        this.changeEquipmentOption("leftHand");
                    }
                    if (rightHandDamageTypeMatches !== context.human.options.rightHand) {
                        this.changeEquipmentOption("rightHand");
                    }
                }
                else if (leftHandEquipped || rightHandEquipped) {
                    if (leftHandEquipped && !context.human.options.leftHand) {
                        this.changeEquipmentOption("leftHand");
                    }
                    if (rightHandEquipped && !context.human.options.rightHand) {
                        this.changeEquipmentOption("rightHand");
                    }
                }
                else {
                    if (!context.human.options.leftHand) {
                        this.changeEquipmentOption("leftHand");
                    }
                    if (!context.human.options.rightHand) {
                        this.changeEquipmentOption("rightHand");
                    }
                }
            }
            else {
                if (!leftHandEquipped && !rightHandEquipped) {
                    if (!context.human.options.leftHand) {
                        this.changeEquipmentOption("leftHand");
                    }
                }
                else if (leftHandEquipped !== context.human.options.leftHand) {
                    this.changeEquipmentOption("leftHand");
                }
                if (leftHandEquipped) {
                    if (context.human.options.rightHand) {
                        this.changeEquipmentOption("rightHand");
                    }
                }
                else if (rightHandEquipped !== context.human.options.rightHand) {
                    this.changeEquipmentOption("rightHand");
                }
            }
        }
        changeEquipmentOption(id) {
            if (this.human.isLocalPlayer()) {
                oldui.changeEquipmentOption(id);
            }
            else if (!this.human.asPlayer) {
                const isLeftHand = id === "leftHand";
                const newValue = isLeftHand ? !this.human.options.leftHand : !this.human.options.rightHand;
                this.human.options[id] = newValue;
            }
        }
        handEquipInterrupt(context, equipType, use, itemTypes, preferredDamageType) {
            const equippedItem = context.human.getEquippedItem(equipType);
            let possibleEquips;
            if (use) {
                possibleEquips = this.utilities.item.getPossibleHandEquips(context, use, preferredDamageType, false);
                if (use === IAction_1.ActionType.Attack) {
                    let closestCreature;
                    let closestCreatureDistance;
                    for (let x = -2; x <= 2; x++) {
                        for (let y = -2; y <= 2; y++) {
                            const point = context.human.island.ensureValidPoint({ x: context.human.x + x, y: context.human.y + y, z: context.human.z });
                            if (point) {
                                const tile = context.island.getTileFromPoint(point);
                                if (tile.creature && !tile.creature.isTamed()) {
                                    const distance = Vector2_1.default.squaredDistance(context.human, tile.creature.getPoint());
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
                            .sort((a, b) => this.utilities.item.estimateDamageModifier(b, closestCreature) - this.utilities.item.estimateDamageModifier(a, closestCreature));
                    }
                    else if (context.human.getEquippedItem(equipType) !== undefined) {
                        return undefined;
                    }
                }
                if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                    possibleEquips = this.utilities.item.getPossibleHandEquips(context, use, undefined, false);
                }
            }
            else if (itemTypes) {
                possibleEquips = [];
                for (const itemType of itemTypes) {
                    if (context.island.items.isGroup(itemType)) {
                        possibleEquips.push(...context.utilities.item.getItemsInContainerByGroup(context, context.human.inventory, itemType));
                    }
                    else {
                        possibleEquips.push(...context.utilities.item.getItemsInContainerByType(context, context.human.inventory, itemType));
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
                        return new EquipItem_1.default(equipType, possibleEquips[i]);
                    }
                }
            }
        }
        repairsInterrupt(context) {
            if (this.inventory.hammer === undefined) {
                return undefined;
            }
            const objectives = [
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.LeftHand)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.RightHand)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Chest)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Legs)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Head)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Belt)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Feet)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Neck)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Hands)),
                this.repairInterrupt(context, context.human.getEquippedItem(IHuman_1.EquipType.Back)),
                this.repairInterrupt(context, this.inventory.knife),
                this.repairInterrupt(context, this.inventory.fireStarter),
                this.repairInterrupt(context, this.inventory.hoe),
                this.repairInterrupt(context, this.inventory.axe),
                this.repairInterrupt(context, this.inventory.pickAxe),
                this.repairInterrupt(context, this.inventory.shovel),
                this.repairInterrupt(context, this.inventory.equipSword),
                this.repairInterrupt(context, this.inventory.equipShield),
                this.repairInterrupt(context, this.inventory.tongs),
                this.repairInterrupt(context, this.inventory.bed),
            ];
            if (this.inventory.waterContainer) {
                for (const waterContainer of this.inventory.waterContainer) {
                    objectives.push(this.repairInterrupt(context, waterContainer));
                }
            }
            return objectives.filter(objective => objective !== undefined);
        }
        repairInterrupt(context, item) {
            if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
                return undefined;
            }
            const threshold = this.utilities.base.isNearBase(context) ? 0.2 : 0.1;
            if (item.minDur / item.maxDur >= threshold) {
                return undefined;
            }
            if (this.inventory.waterContainer?.includes(item) && context.human.stat.get(IStats_1.Stat.Thirst).value < 2) {
                return undefined;
            }
            return new RepairItem_1.default(item);
        }
        nearbyCreatureInterrupt(context) {
            const shouldRunAwayFromAllCreatures = Creature_1.creatureUtilities.shouldRunAwayFromAllCreatures(context);
            for (const facingDirecton of Direction_1.Direction.CARDINALS_AND_NONE) {
                const creature = this.checkNearbyCreature(context, facingDirecton);
                if (creature !== undefined) {
                    const tamingCreature = context.getData(IContext_1.ContextDataType.TamingCreature);
                    if (tamingCreature && tamingCreature === creature) {
                        Logger_1.log.info(`Not defending against ${creature.getName().getString()} because we're trying to tame it`);
                        continue;
                    }
                    Logger_1.log.info(`Defend against ${creature.getName().getString()}`);
                    return new DefendAgainstCreature_1.default(creature, shouldRunAwayFromAllCreatures || Creature_1.creatureUtilities.isScaredOfCreature(context, creature));
                }
            }
            const nearbyCreatures = Creature_1.creatureUtilities.getNearbyCreatures(context);
            for (const creature of nearbyCreatures) {
                if (shouldRunAwayFromAllCreatures || Creature_1.creatureUtilities.isScaredOfCreature(context, creature)) {
                    const path = creature.findPath(context.human, 16, context.human);
                    if (path) {
                        Logger_1.log.info(`Run away from ${creature.getName().getString()}`);
                        return new RunAwayFromTarget_1.default(creature);
                    }
                }
            }
        }
        checkNearbyCreature(context, direction) {
            if (direction !== Direction_1.Direction.None) {
                const point = Vector2_1.default.DIRECTIONS[direction];
                const validPoint = context.island.ensureValidPoint({ x: context.human.x + point.x, y: context.human.y + point.y, z: context.human.z });
                if (validPoint) {
                    const tile = context.island.getTileFromPoint(validPoint);
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
            if (this.inventory.solarStill !== undefined) {
                objectives.push(new BuildItem_1.default(this.inventory.solarStill));
            }
            return objectives;
        }
        gatherFromCorpsesInterrupt(context) {
            if (this.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Butcher).length === 0) {
                return undefined;
            }
            const targets = this.utilities.object.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2_1.default.distance(context.human, corpse) < 16);
            if (targets) {
                const objectives = [];
                for (const target of targets) {
                    const tile = context.island.getTileFromPoint(target);
                    const corpses = tile.corpses;
                    if (corpses && corpses.length > 0) {
                        for (const corpse of corpses) {
                            const resources = corpse.getResources(true);
                            if (!resources || resources.length === 0) {
                                continue;
                            }
                            const step = corpse.step || 0;
                            const count = resources.length - step;
                            for (let i = 0; i < count; i++) {
                                objectives.push(new ButcherCorpse_1.default(corpse));
                            }
                        }
                    }
                }
                return objectives;
            }
        }
        reduceWeightInterrupt(context) {
            return new ReduceWeight_1.default({
                allowReservedItems: !this.utilities.base.isNearBase(context) && this.weightStatus === IPlayer_1.WeightStatus.Overburdened,
                disableDrop: this.weightStatus !== IPlayer_1.WeightStatus.Overburdened && !this.utilities.base.isNearBase(context),
            });
        }
        returnToBaseInterrupt(context) {
            if (!this.utilities.base.isNearBase(context) &&
                this.weightStatus !== IPlayer_1.WeightStatus.None &&
                this.previousWeightStatus === IPlayer_1.WeightStatus.Overburdened &&
                context.getData(IContext_1.ContextDataType.MovingToNewIsland) !== IContext_1.MovingToNewIslandState.Ready) {
                return new ReturnToBase_1.default();
            }
        }
        organizeInventoryInterrupts(context, interruptContext) {
            if (context.getDataOrDefault(IContext_1.ContextDataType.DisableMoveAwayFromBaseItemOrganization, false) ||
                context.getData(IContext_1.ContextDataType.MovingToNewIsland) === IContext_1.MovingToNewIslandState.Ready) {
                return undefined;
            }
            const walkPath = context.human.walkPath;
            if (walkPath === undefined || walkPath.path.length === 0) {
                return undefined;
            }
            if (!this.utilities.base.isNearBase(context)) {
                return undefined;
            }
            const target = walkPath.path[walkPath.path.length - 1];
            if (this.utilities.base.isNearBase(context, { x: target.x, y: target.y, z: context.human.z })) {
                return undefined;
            }
            let objectives = [];
            const reservedItems = this.utilities.item.getReservedItems(context, false);
            const interruptReservedItems = interruptContext ? this.utilities.item.getReservedItems(interruptContext, false) : undefined;
            if (reservedItems.length > 0) {
                const organizeInventoryObjectives = OrganizeInventory_1.default.moveIntoChestsObjectives(context, reservedItems);
                if (organizeInventoryObjectives) {
                    objectives = objectives.concat(organizeInventoryObjectives);
                }
            }
            let unusedItems = this.utilities.item.getUnusedItems(context);
            const interruptUnusedItems = interruptContext ? this.utilities.item.getUnusedItems(interruptContext) : undefined;
            if (interruptUnusedItems) {
                unusedItems = unusedItems.filter(item => !interruptReservedItems?.includes(item) && !interruptUnusedItems.includes(item));
            }
            if (unusedItems.length > 0) {
                const organizeInventoryObjectives = OrganizeInventory_1.default.moveIntoChestsObjectives(context, unusedItems);
                if (organizeInventoryObjectives) {
                    objectives = objectives.concat(organizeInventoryObjectives);
                }
            }
            Logger_1.log.info(objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space", `Reserved items: ${reservedItems.join(",")}`, `Unused items: ${unusedItems.join(",")}`, `Context soft reserved items: ${Array.from(context.state.softReservedItems).map(item => item.id).join(",")}`, `Context hard reserved items: ${Array.from(context.state.hardReservedItems).map(item => item.id).join(",")}`, `Interrupt context soft reserved items: ${Array.from(interruptContext?.state.softReservedItems ?? []).map(item => item.id).join(",")}`, `Interrupt context hard reserved items: ${Array.from(interruptContext?.state.hardReservedItems ?? []).map(item => item.id).join(",")}`, `Objectives: ${Plan_1.default.getPipelineString(this.context, objectives)}`);
            return objectives;
        }
        processQueuedNavigationUpdates() {
            for (const queuedUpdate of this.navigationQueuedUpdates) {
                queuedUpdate();
            }
            this.navigationQueuedUpdates.length = 0;
        }
        processQuantumBurst() {
            if (!this.isRunning() || !this.isQuantumBurstEnabled()) {
                return;
            }
            const player = this.context.human.asPlayer;
            if (!player) {
                return;
            }
            player.nextMoveTime = 0;
            player.movementFinishTime = 0;
            player.attackAnimationEndTime = 0;
            while (this.context.human.hasDelay()) {
                game.absoluteTime += 100;
            }
        }
    }
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "spawn")
    ], Tars.prototype, "onPlayerSpawn", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Players, "writeNote")
    ], Tars.prototype, "onWriteNote", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "die")
    ], Tars.prototype, "onPlayerDeath", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "respawn")
    ], Tars.prototype, "onPlayerRespawn", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "processMovement")
    ], Tars.prototype, "processMovement", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.ItemManager, "remove")
    ], Tars.prototype, "onItemRemove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.CorpseManager, "remove")
    ], Tars.prototype, "onCorpseRemove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Players, "restEnd")
    ], Tars.prototype, "onRestEnd", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.NPCs, "postMove")
    ], Tars.prototype, "onPostMove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Players, "moveComplete")
    ], Tars.prototype, "onMoveComplete", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Prompt, "queue", EventEmitter_1.Priority.High)
    ], Tars.prototype, "onPrompt", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Island, "tileUpdate")
    ], Tars.prototype, "onTileUpdate", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Actions, "postExecuteAction")
    ], Tars.prototype, "postExecuteAction", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Players, "processInput")
    ], Tars.prototype, "processInput", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "walkPathChange")
    ], Tars.prototype, "onWalkPathChange", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "changeZ")
    ], Tars.prototype, "onChangeZ", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "preMove")
    ], Tars.prototype, "onPreMove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "statChanged")
    ], Tars.prototype, "onStatChange", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.LocalPlayer, "moveToIsland")
    ], Tars.prototype, "onMoveToIsland", null);
    __decorate([
        Decorators_1.Bound
    ], Tars.prototype, "getStatus", null);
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL1RhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBa0ZBLE1BQXFCLElBQUssU0FBUSxzQkFBWSxDQUFDLElBQWlCO1FBNkI1RCxZQUE2QixLQUFZLEVBQW1CLFFBQW1CLEVBQW1CLE9BQW9CO1lBQ2xILEtBQUssRUFBRSxDQUFDO1lBRGlCLFVBQUssR0FBTCxLQUFLLENBQU87WUFBbUIsYUFBUSxHQUFSLFFBQVEsQ0FBVztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBdkJyRywwQkFBcUIsR0FBNEIsRUFBRSxDQUFDO1lBQzdELHlCQUFvQixHQUFHLENBQUMsQ0FBQztZQVNoQixzQkFBaUIsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUs3RCwwQkFBcUIsR0FBMEIsNkJBQXFCLENBQUMsY0FBYyxDQUFDO1lBRTNFLDRCQUF1QixHQUFzQixFQUFFLENBQUM7WUFFaEQsY0FBUyxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRXpELFdBQU0sR0FBRyxLQUFLLENBQUM7WUFLbkIsSUFBSSxDQUFDLFNBQVMsR0FBRztnQkFDYixNQUFNLEVBQUUsSUFBSSx3QkFBZSxFQUFFO2dCQUM3QixJQUFJLEVBQUUsSUFBSSxvQkFBYSxFQUFFO2dCQUN6QixNQUFNLEVBQUUsSUFBSSx3QkFBZSxFQUFFO2dCQUM3QixJQUFJLEVBQUUsSUFBSSxvQkFBYSxFQUFFO2dCQUN6QixRQUFRLEVBQUUsSUFBSSw0QkFBaUIsRUFBRTtnQkFDakMsVUFBVSxFQUFFLElBQUksb0JBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO2dCQUMxQyxNQUFNLEVBQUUsSUFBSSx3QkFBZSxFQUFFO2dCQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLE1BQU0sRUFBRSxJQUFJLHdCQUFlLEVBQUU7Z0JBQzdCLElBQUksRUFBRSxJQUFJLG9CQUFhLEVBQUU7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