var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/entity/action/IAction", "game/entity/IHuman", "game/entity/IStats", "game/entity/player/IMessageManager", "game/entity/player/IPlayer", "game/IGame", "game/item/IItem", "game/WorldZ", "language/dictionary/Interrupt", "language/dictionary/InterruptChoice", "language/Translation", "mod/IHookHost", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/MenuBarButtonDescriptions", "ui/screen/screens/GameScreen", "utilities/game/TileHelpers", "utilities/Log", "utilities/math/Direction", "utilities/math/Vector2", "utilities/promise/Async", "utilities/promise/ResolvablePromise", "./Context", "./core/Executor", "./core/Planner", "./IContext", "./ITars", "./mode/Modes", "./navigation/Navigation", "./Objective", "./objectives/analyze/AnalyzeBase", "./objectives/analyze/AnalyzeInventory", "./objectives/core/ExecuteAction", "./objectives/interrupt/CarveCorpse", "./objectives/interrupt/DefendAgainstCreature", "./objectives/interrupt/OptionsInterrupt", "./objectives/interrupt/ReduceWeight", "./objectives/interrupt/RepairItem", "./objectives/other/item/BuildItem", "./objectives/other/item/EquipItem", "./objectives/other/ReturnToBase", "./objectives/other/item/UnequipItem", "./objectives/utility/MoveToZ", "./objectives/utility/OrganizeInventory", "./ui/TarsDialog", "./utilities/Action", "./utilities/Logger", "./utilities/Movement", "./utilities/Object", "./utilities/Tile", "./utilities/Base", "./utilities/Player", "./utilities/Item", "./utilities/Creature", "./objectives/other/RunAwayFromTarget", "./objectives/recover/Recover"], function (require, exports, EventBuses_1, EventManager_1, IAction_1, IHuman_1, IStats_1, IMessageManager_1, IPlayer_1, IGame_1, IItem_1, WorldZ_1, Interrupt_1, InterruptChoice_1, Translation_1, IHookHost_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, MenuBarButtonDescriptions_1, GameScreen_1, TileHelpers_1, Log_1, Direction_1, Vector2_1, Async_1, ResolvablePromise_1, Context_1, Executor_1, Planner_1, IContext_1, ITars_1, Modes_1, Navigation_1, Objective_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, CarveCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, EquipItem_1, ReturnToBase_1, UnequipItem_1, MoveToZ_1, OrganizeInventory_1, TarsDialog_1, Action_1, Logger_1, Movement_1, Object_1, Tile_1, Base_1, Player_1, Item_1, Creature_1, RunAwayFromTarget_1, Recover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tickSpeed = 333;
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
            this.gamePlaying = false;
            this.quantumBurstCooldown = 0;
            this.interruptContexts = new Map();
            this.modeCache = new Map();
        }
        onInitialize() {
            ITars_1.setTarsInstance(this);
            Navigation_1.default.setModPath(this.getPath());
            Log_1.default.setSourceFilter(Log_1.default.LogType.File, false, Logger_1.logSourceName);
        }
        onUninitialize() {
            this.onGameEnd();
            ITars_1.setTarsInstance(undefined);
        }
        onLoad() {
            this.ensureSaveData();
            this.delete();
            this.navigation = Navigation_1.default.get();
            Log_1.default.addPreConsoleCallback(Logger_1.loggerUtilities.preConsoleCallback);
            window.TARS = this;
            if (this.saveData.ui[ITars_1.TarsUiSaveDataKey.DialogOpened]) {
                this.saveData.ui[ITars_1.TarsUiSaveDataKey.DialogOpened] = undefined;
                GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.openDialog(Tars.INSTANCE.dialogMain);
            }
        }
        onUnload() {
            this.delete();
            Log_1.default.removePreConsoleCallback(Logger_1.loggerUtilities.preConsoleCallback);
            window.TARS = undefined;
            if (this.gamePlaying && (GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.isDialogVisible(Tars.INSTANCE.dialogMain))) {
                this.saveData.ui[ITars_1.TarsUiSaveDataKey.DialogOpened] = true;
                GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.closeDialog(Tars.INSTANCE.dialogMain);
            }
        }
        onGameStart() {
            this.gamePlaying = true;
            if (!this.saveData.island[island.id]) {
                this.saveData.island[island.id] = {};
            }
            if (!this.isRunning() && (this.isEnabled() || new URLSearchParams(window.location.search).has("autotars"))) {
                this.toggle(true);
            }
        }
        onGameEnd(state) {
            this.gamePlaying = false;
            this.disable(true);
            this.delete();
        }
        onWriteNote(player, note) {
            if (this.isRunning()) {
                return false;
            }
            return undefined;
        }
        onPlayerDeath() {
            this.interrupt();
            Movement_1.movementUtilities.resetMovementOverlays();
        }
        onPlayerRespawn() {
            this.interrupt();
            Movement_1.movementUtilities.resetMovementOverlays();
            if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
                this.navigation.queueUpdateOrigin(localPlayer);
            }
        }
        async processMovement(player) {
            if (this.isRunning() && player.isLocalPlayer()) {
                if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
                    this.navigation.queueUpdateOrigin(player);
                }
                this.processQuantumBurst();
                const objective = this.interruptObjectivePipeline || this.objectivePipeline;
                if (objective !== undefined && !Array.isArray(objective[0])) {
                    const result = await objective[0].onMove(this.context);
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
            if (this.isRunning()) {
                this.processQueuedNavigationUpdates();
            }
        }
        onMoveComplete(player) {
            Movement_1.movementUtilities.clearOverlay(player.getTile());
        }
        onInterrupt(host, options, interrupt) {
            if (this.isRunning() && (interrupt === Interrupt_1.default.GameDangerousStep || interrupt === Interrupt_1.default.GameTravelConfirmation)) {
                Logger_1.log.info(`Returning true for interrupt ${Interrupt_1.default[interrupt]}`);
                return InterruptChoice_1.default.Yes;
            }
        }
        command(_player, _args) {
            this.toggle();
        }
        onToggleTars() {
            this.toggle();
            return true;
        }
        onTileUpdate(_, tile, tileX, tileY, tileZ, tileUpdateType) {
            if (this.navigationSystemState === NavigationSystemState.Initializing || localPlayer.isResting()) {
                this.navigationQueuedUpdates.push(() => {
                    this.onTileUpdate(undefined, tile, tileX, tileY, tileZ, tileUpdateType);
                });
            }
            else if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
                this.navigation.onTileUpdate(tile, TileHelpers_1.default.getType(tile), tileX, tileY, tileZ, undefined, tileUpdateType);
                const updateNeighbors = tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn;
                if (updateNeighbors) {
                    for (let x = -Navigation_1.tileUpdateRadius; x <= Navigation_1.tileUpdateRadius; x++) {
                        for (let y = -Navigation_1.tileUpdateRadius; y <= Navigation_1.tileUpdateRadius; y++) {
                            if (x !== 0 || y !== 0) {
                                const point = game.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                                if (point) {
                                    const otherTile = game.getTileFromPoint(point);
                                    this.navigation.onTileUpdate(otherTile, TileHelpers_1.default.getType(otherTile), tileX + x, tileY + y, tileZ, undefined, tileUpdateType);
                                }
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
            this.processQuantumBurst();
            Action_1.actionUtilities.postExecuteAction(api.type);
        }
        processInput(player) {
            this.processQuantumBurst();
            return undefined;
        }
        onWalkPathChange(player, walkPath) {
            if (!walkPath || walkPath.length === 0 || !this.isRunning()) {
                return;
            }
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext);
            if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
                this.interrupt(...organizeInventoryInterrupts);
            }
        }
        preMove(player, prevX, prevY, prevZ, prevTile, nextX, nextY, nextZ, nextTile) {
            if (!this.isRunning() || !player.hasWalkPath()) {
                return;
            }
            if (nextTile.npc || (nextTile.doodad && nextTile.doodad.blocksMove()) || game.isPlayerAtTile(nextTile, false, true)) {
                Logger_1.log.info("Interrupting due to blocked movement");
                this.interrupt();
            }
        }
        onStatChange(player, stat) {
            if (!this.isRunning()) {
                return;
            }
            const recoverThreshold = Player_1.playerUtilities.getRecoverThreshold(this.context, stat.type);
            if (recoverThreshold !== undefined) {
                if (stat.value <= recoverThreshold) {
                    if (!this.statThresholdExceeded[stat.type]) {
                        this.statThresholdExceeded[stat.type] = true;
                        if (this.isRunning()) {
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
                    Executor_1.default.markWeightChanged();
                    const weightStatus = player.getWeightStatus();
                    if (this.weightStatus !== weightStatus) {
                        this.previousWeightStatus = this.weightStatus;
                        this.weightStatus = weightStatus;
                        if (weightStatus === IPlayer_1.WeightStatus.None) {
                            return;
                        }
                        if (this.isRunning()) {
                            Logger_1.log.info(`Weight status changed from ${this.previousWeightStatus !== undefined ? IPlayer_1.WeightStatus[this.previousWeightStatus] : "N/A"} to ${IPlayer_1.WeightStatus[this.weightStatus]}`);
                            this.interrupt();
                        }
                    }
                    break;
            }
        }
        getTranslation(translation) {
            return translation instanceof Translation_1.default ? translation : new Translation_1.default(this.dictionary, translation);
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
            if (this.navigationSystemState === NavigationSystemState.Initializing) {
                return;
            }
            this.saveData.enabled = enabled;
            this.event.emit("enableChange", true);
            Logger_1.log.info(this.saveData.enabled ? "Enabled" : "Disabled");
            localPlayer.messages
                .source(this.messageSource)
                .type(IMessageManager_1.MessageType.Good)
                .send(this.messageToggle, this.saveData.enabled);
            this.context = new Context_1.default(localPlayer, this.base, this.inventory, this.saveData.options);
            await this.ensureNavigation(this.context.player.vehicleItemId !== undefined);
            await this.reset();
            if (this.saveData.enabled) {
                if (this.navigation) {
                    this.navigation.showOverlay();
                    this.navigation.queueUpdateOrigin(localPlayer);
                }
                this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
            }
            else {
                this.disable();
            }
        }
        updateOptions(options) {
            var _a;
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
                        case "exploreIslands":
                            (_a = this.context) === null || _a === void 0 ? void 0 : _a.setData(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
                            break;
                        case "quantumBurst":
                            shouldInterrupt = false;
                            if (this.saveData.options.quantumBurst) {
                                localPlayer.messages
                                    .source(this.messageSource)
                                    .type(IMessageManager_1.MessageType.Good)
                                    .send(this.messageQuantumBurstStart);
                            }
                            else {
                                this.quantumBurstCooldown = 2;
                            }
                            break;
                        case "developerMode":
                            shouldInterrupt = false;
                            Planner_1.default.debug = this.saveData.options.developerMode;
                            break;
                    }
                }
                if (shouldInterrupt) {
                    this.interrupt();
                }
            }
        }
        async activateManualMode(modeInstance) {
            this.updateOptions({ mode: ITars_1.TarsMode.Manual });
            if (!this.isRunning()) {
                this.toggle();
            }
            await this.initializeMode(this.context, ITars_1.TarsMode.Manual, modeInstance);
        }
        getStatus() {
            var _a;
            if (this.navigationSystemState === NavigationSystemState.Initializing) {
                return this.getTranslation(ITars_1.TarsTranslation.DialogStatusNavigatingInitializing);
            }
            if (!this.isRunning()) {
                return "Not running";
            }
            let statusMessage = "Idle";
            let planStatusMessage;
            const plan = Executor_1.default.getPlan();
            if (plan !== undefined) {
                planStatusMessage = plan.tree.objective.getStatusMessage();
            }
            const objectivePipeline = (_a = this.objectivePipeline) !== null && _a !== void 0 ? _a : this.interruptObjectivePipeline;
            if (objectivePipeline) {
                statusMessage = objectivePipeline.flat()[0].getStatusMessage();
                if (planStatusMessage && planStatusMessage !== statusMessage && statusMessage !== "Miscellaneous processing" && statusMessage !== "Calculating objective...") {
                    statusMessage = `${planStatusMessage} - ${statusMessage}`;
                }
            }
            else if (planStatusMessage) {
                statusMessage = planStatusMessage;
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
            if (!this.navigation) {
                return;
            }
            if (this.navigationUpdatePromise) {
                return this.navigationUpdatePromise;
            }
            if (this.navigation.shouldUpdateSailingMode(sailingMode)) {
                Logger_1.log.info("Updating sailing mode", sailingMode);
                this.navigationUpdatePromise = new ResolvablePromise_1.default();
                this.navigationSystemState = NavigationSystemState.NotInitialized;
                await this.ensureNavigation(sailingMode);
                this.navigationUpdatePromise.resolve();
                this.navigationUpdatePromise = undefined;
            }
        }
        ensureSaveData() {
            var _a;
            if (this.saveData.island === undefined) {
                this.saveData.island = {};
            }
            if (this.saveData.ui === undefined) {
                this.saveData.ui = {};
            }
            this.saveData.options = {
                mode: ITars_1.TarsMode.Survival,
                stayHealthy: true,
                exploreIslands: true,
                useOrbsOfInfluence: true,
                quantumBurst: false,
                developerMode: false,
                ...((_a = this.saveData.options) !== null && _a !== void 0 ? _a : {}),
            };
            if (this.saveData.options.mode === ITars_1.TarsMode.Manual) {
                this.saveData.options.mode = ITars_1.TarsMode.Survival;
            }
            Planner_1.default.debug = this.saveData.options.developerMode;
        }
        async ensureNavigation(sailingMode) {
            if (this.navigationSystemState === NavigationSystemState.NotInitialized && this.navigation) {
                this.navigationSystemState = NavigationSystemState.Initializing;
                this.updateStatus();
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageNavigationUpdating);
                await Async_1.sleep(100);
                await this.navigation.updateAll(sailingMode);
                this.navigation.queueUpdateOrigin(localPlayer);
                this.navigationSystemState = NavigationSystemState.Initialized;
                this.processQueuedNavigationUpdates();
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageNavigationUpdated);
            }
        }
        async getOrCreateModeInstance(context) {
            const mode = this.saveData.options.mode;
            let modeInstance = this.modeCache.get(mode);
            if (!modeInstance) {
                modeInstance = Modes_1.modes.get(mode);
                if (!modeInstance) {
                    this.disable();
                    throw new Error(`Missing mode initializer for ${ITars_1.TarsMode[mode]}`);
                }
                await this.initializeMode(context, mode, modeInstance);
            }
            return modeInstance;
        }
        async initializeMode(context, mode, modeInstance) {
            var _a;
            await this.disposeMode(context, mode);
            EventManager_1.default.registerEventBusSubscriber(modeInstance);
            await ((_a = modeInstance.initialize) === null || _a === void 0 ? void 0 : _a.call(modeInstance, context, () => { this.stop(true); }));
            this.modeCache.set(mode, modeInstance);
        }
        async disposeMode(context, mode) {
            var _a;
            const modeInstance = this.modeCache.get(ITars_1.TarsMode.Manual);
            if (modeInstance) {
                await ((_a = modeInstance.dispose) === null || _a === void 0 ? void 0 : _a.call(modeInstance, this.context));
                EventManager_1.default.deregisterEventBusSubscriber(modeInstance);
                this.modeCache.delete(mode);
            }
        }
        async reset(deleting = false) {
            Executor_1.default.reset();
            for (const mode of Array.from(this.modeCache.keys())) {
                if (deleting || mode !== ITars_1.TarsMode.Manual) {
                    await this.disposeMode(this.context, mode);
                }
            }
            this.lastStatusMessage = undefined;
            this.objectivePipeline = undefined;
            this.interruptObjectivePipeline = undefined;
            this.interruptIds = undefined;
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
            Base_1.baseUtilities.clearCache();
            this.reset(true);
            this.navigationSystemState = NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates = [];
            Navigation_1.default.delete();
        }
        disable(gameIsEnding = false) {
            var _a;
            if (!gameIsEnding) {
                this.saveData.enabled = false;
                this.event.emit("enableChange", false);
            }
            (_a = this.navigation) === null || _a === void 0 ? void 0 : _a.hideOverlay();
            if (this.tickTimeoutId !== undefined) {
                clearTimeout(this.tickTimeoutId);
                this.tickTimeoutId = undefined;
            }
            Movement_1.movementUtilities.resetMovementOverlays();
            if (localPlayer) {
                localPlayer.walkAlongPath(undefined);
                OptionsInterrupt_1.default.restore(localPlayer);
            }
            if (!gameIsEnding && this.saveData.options.mode === ITars_1.TarsMode.Manual) {
                this.updateOptions({ mode: ITars_1.TarsMode.Survival });
            }
            this.updateStatus();
        }
        interrupt(...interruptObjectives) {
            Logger_1.log.info("Interrupt", Objective_1.default.getPipelineString(interruptObjectives));
            Executor_1.default.interrupt();
            this.objectivePipeline = undefined;
            if (interruptObjectives && interruptObjectives.length > 0) {
                this.interruptObjectivePipeline = interruptObjectives;
            }
            Movement_1.movementUtilities.resetMovementOverlays();
            localPlayer.walkAlongPath(undefined);
        }
        async tick() {
            try {
                if (this.context.player.hasDelay()) {
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
            if (this.context.player.hasDelay()) {
                this.processQuantumBurst();
            }
            this.tickTimeoutId = setTimeout(this.tick.bind(this), this.isQuantumBurstEnabled() ? game.interval : tickSpeed);
        }
        async onTick() {
            if (!this.isRunning() || !Executor_1.default.isReady(this.context, false)) {
                if (this.quantumBurstCooldown === 2) {
                    this.quantumBurstCooldown--;
                    localPlayer.messages
                        .source(this.messageSource)
                        .type(IMessageManager_1.MessageType.Good)
                        .send(this.messageQuantumBurstCooldownStart, false);
                }
                if (game.playing && this.context.player.isGhost() && game.getGameOptions().respawn) {
                    await new ExecuteAction_1.default(IAction_1.ActionType.Respawn, (context, action) => {
                        action.execute(context.player);
                    }).execute(this.context);
                }
                return;
            }
            if (this.quantumBurstCooldown === 1) {
                this.quantumBurstCooldown--;
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageQuantumBurstCooldownEnd, false);
            }
            Object_1.objectUtilities.clearCache();
            Tile_1.tileUtilities.clearCache();
            Item_1.itemUtilities.clearCache();
            Movement_1.movementUtilities.clearCache();
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
                    const interruptHashCode = Objective_1.default.getPipelineString(this.interruptObjectivePipeline);
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
                            const afterInterruptHashCode = Objective_1.default.getPipelineString(this.interruptObjectivePipeline);
                            if (interruptHashCode === afterInterruptHashCode) {
                                this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                                Logger_1.log.info(`Updated continuing interrupt objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Objective_1.default.getPipelineString(this.interruptObjectivePipeline));
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
                            Logger_1.log.debug(`Restored saved context from ${i}. ${this.interruptContext}`);
                        }
                        const result = await Executor_1.default.executeObjectives(this.interruptContext, [interruptObjectives], true);
                        Logger_1.log.debug("Interrupt result", result);
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
                                Logger_1.log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext}`);
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
                const hashCode = Objective_1.default.getPipelineString(this.objectivePipeline);
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
                        const afterHashCode = Objective_1.default.getPipelineString(this.objectivePipeline);
                        if (hashCode === afterHashCode) {
                            this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                            Logger_1.log.info(`Updated continuing objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Objective_1.default.getPipelineString(this.objectivePipeline));
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
                    Logger_1.log.info(`Saved objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Objective_1.default.getPipelineString(this.objectivePipeline));
                    this.updateStatus();
                    return;
                default:
                    this.objectivePipeline = undefined;
                    return;
            }
        }
        stop(finished) {
            localPlayer.messages
                .source(this.messageSource)
                .type(IMessageManager_1.MessageType.Good)
                .send(finished ? this.messageFinished : this.messageToggle, false);
            this.disable();
        }
        getInterrupts(context) {
            const stayHealthy = this.saveData.options.stayHealthy;
            let interrupts = [
                this.optionsInterrupt(),
                ...this.equipmentInterrupt(context),
                this.nearbyCreatureInterrupt(context),
                stayHealthy ? new Recover_1.default(true) : undefined,
                this.buildItemObjectives(),
                this.reduceWeightInterrupt(context),
                stayHealthy ? new Recover_1.default(false) : undefined,
                this.gatherFromCorpsesInterrupt(context),
                this.repairsInterrupt(context),
                this.escapeCavesInterrupt(context),
                this.returnToBaseInterrupt(context),
            ];
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(context);
            if (organizeInventoryInterrupts) {
                interrupts = interrupts.concat(organizeInventoryInterrupts);
            }
            return interrupts;
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
            const item = context.player.getEquippedItem(equip);
            if (item && item.type === IItem_1.ItemType.SlitherSucker) {
                return new UnequipItem_1.default(item);
            }
            const bestEquipment = Item_1.itemUtilities.getBestEquipment(context, equip);
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
                        oldui.changeEquipmentOption("leftHand");
                    }
                    if (rightHandDamageTypeMatches !== context.player.options.rightHand) {
                        oldui.changeEquipmentOption("rightHand");
                    }
                }
                else if (leftHandEquipped || rightHandEquipped) {
                    if (leftHandEquipped && !context.player.options.leftHand) {
                        oldui.changeEquipmentOption("leftHand");
                    }
                    if (rightHandEquipped && !context.player.options.rightHand) {
                        oldui.changeEquipmentOption("rightHand");
                    }
                }
                else {
                    if (!context.player.options.leftHand) {
                        oldui.changeEquipmentOption("leftHand");
                    }
                    if (!context.player.options.rightHand) {
                        oldui.changeEquipmentOption("rightHand");
                    }
                }
            }
            else {
                if (!leftHandEquipped && !rightHandEquipped) {
                    if (!context.player.options.leftHand) {
                        oldui.changeEquipmentOption("leftHand");
                    }
                }
                else if (leftHandEquipped !== context.player.options.leftHand) {
                    oldui.changeEquipmentOption("leftHand");
                }
                if (leftHandEquipped) {
                    if (context.player.options.rightHand) {
                        oldui.changeEquipmentOption("rightHand");
                    }
                }
                else if (rightHandEquipped !== context.player.options.rightHand) {
                    oldui.changeEquipmentOption("rightHand");
                }
            }
        }
        handEquipInterrupt(context, equipType, use, itemTypes, preferredDamageType) {
            const equippedItem = context.player.getEquippedItem(equipType);
            let possibleEquips;
            if (use) {
                possibleEquips = Item_1.itemUtilities.getPossibleHandEquips(context, use, preferredDamageType, false);
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
                            .sort((a, b) => Item_1.itemUtilities.estimateDamageModifier(b, closestCreature) - Item_1.itemUtilities.estimateDamageModifier(a, closestCreature));
                    }
                    else if (context.player.getEquippedItem(equipType) !== undefined) {
                        return undefined;
                    }
                }
                if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                    possibleEquips = Item_1.itemUtilities.getPossibleHandEquips(context, use, undefined, false);
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
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.LeftHand)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.RightHand)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Chest)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Legs)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Head)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Belt)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Feet)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Neck)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Hands)),
                this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.Back)),
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
            var _a;
            if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
                return undefined;
            }
            const threshold = Base_1.baseUtilities.isNearBase(context) ? 0.2 : 0.1;
            if (item.minDur / item.maxDur >= threshold) {
                return undefined;
            }
            if (((_a = this.inventory.waterContainer) === null || _a === void 0 ? void 0 : _a.includes(item)) && context.player.stat.get(IStats_1.Stat.Thirst).value < 2) {
                return undefined;
            }
            return new RepairItem_1.default(item);
        }
        nearbyCreatureInterrupt(context) {
            const shouldRunAwayFromAllCreatures = Creature_1.creatureUtilities.shouldRunAwayFromAllCreatures(context);
            for (const facingDirecton of Direction_1.Direction.CARDINALS_AND_NONE) {
                const creature = this.checkNearbyCreature(context, facingDirecton);
                if (creature !== undefined) {
                    Logger_1.log.info(`Defend against ${creature.getName().getString()}`);
                    return new DefendAgainstCreature_1.default(creature, shouldRunAwayFromAllCreatures || Creature_1.creatureUtilities.isScaredOfCreature(context, creature));
                }
            }
            const nearbyCreatures = Creature_1.creatureUtilities.getNearbyCreatures(context.player);
            for (const creature of nearbyCreatures) {
                if (shouldRunAwayFromAllCreatures || Creature_1.creatureUtilities.isScaredOfCreature(context, creature)) {
                    const path = creature.findPath(context.player, 16, context.player);
                    if (path) {
                        Logger_1.log.info(`Run away from ${creature.getName().getString()}`);
                        return new RunAwayFromTarget_1.default(creature);
                    }
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
            if (Item_1.itemUtilities.getInventoryItemsWithUse(context, IAction_1.ActionType.Carve).length === 0) {
                return undefined;
            }
            const targets = Object_1.objectUtilities.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2_1.default.distance(context.player, corpse) < 16);
            if (targets) {
                const objectives = [];
                for (const target of targets) {
                    const tile = game.getTileFromPoint(target);
                    const corpses = tile.corpses;
                    if (corpses && corpses.length > 0) {
                        for (const corpse of corpses) {
                            const resources = corpse.getResources(true);
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
        reduceWeightInterrupt(context) {
            return new ReduceWeight_1.default({
                allowReservedItems: !Base_1.baseUtilities.isNearBase(context) && this.weightStatus === IPlayer_1.WeightStatus.Overburdened,
                disableDrop: this.weightStatus !== IPlayer_1.WeightStatus.Overburdened && !Base_1.baseUtilities.isNearBase(context),
            });
        }
        returnToBaseInterrupt(context) {
            if (!Base_1.baseUtilities.isNearBase(context) &&
                this.weightStatus !== IPlayer_1.WeightStatus.None &&
                this.previousWeightStatus === IPlayer_1.WeightStatus.Overburdened &&
                context.getData(IContext_1.ContextDataType.MovingToNewIsland) !== IContext_1.MovingToNewIslandState.Ready) {
                return new ReturnToBase_1.default();
            }
        }
        escapeCavesInterrupt(context) {
            if (context.player.z === WorldZ_1.WorldZ.Cave) {
                return new MoveToZ_1.default(WorldZ_1.WorldZ.Overworld);
            }
        }
        organizeInventoryInterrupts(context, interruptContext) {
            var _a;
            if (context.getDataOrDefault(IContext_1.ContextDataType.DisableMoveAwayFromBaseItemOrganization, false) ||
                context.getData(IContext_1.ContextDataType.MovingToNewIsland) === IContext_1.MovingToNewIslandState.Ready) {
                return undefined;
            }
            const walkPath = context.player.walkPath;
            if (walkPath === undefined || walkPath.path.length === 0) {
                return undefined;
            }
            if (!Base_1.baseUtilities.isNearBase(context)) {
                return undefined;
            }
            const target = walkPath.path[walkPath.path.length - 1];
            if (Base_1.baseUtilities.isNearBase(context, { x: target.x, y: target.y, z: context.player.z })) {
                return undefined;
            }
            let objectives = [];
            const reservedItems = Item_1.itemUtilities.getReservedItems(context);
            const interruptReservedItems = interruptContext ? Item_1.itemUtilities.getReservedItems(interruptContext) : undefined;
            if (reservedItems.length > 0) {
                const organizeInventoryObjectives = OrganizeInventory_1.default.moveIntoChestsObjectives(context, reservedItems);
                if (organizeInventoryObjectives) {
                    objectives = objectives.concat(organizeInventoryObjectives);
                }
            }
            let unusedItems = Item_1.itemUtilities.getUnusedItems(context);
            const interruptUnusedItems = interruptContext ? Item_1.itemUtilities.getUnusedItems(interruptContext) : undefined;
            if (interruptUnusedItems) {
                unusedItems = unusedItems.filter(item => !(interruptReservedItems === null || interruptReservedItems === void 0 ? void 0 : interruptReservedItems.includes(item)) && !interruptUnusedItems.includes(item));
            }
            if (unusedItems.length > 0) {
                const organizeInventoryObjectives = OrganizeInventory_1.default.moveIntoChestsObjectives(context, unusedItems);
                if (organizeInventoryObjectives) {
                    objectives = objectives.concat(organizeInventoryObjectives);
                }
            }
            Logger_1.log.info(objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space", `Reserved items: ${reservedItems.join(",")}`, `Unused items: ${unusedItems.join(",")}`, `Context reserved items: ${Array.from(context.state.reservedItems).join(",")}`, `Interrupt context reserved items: ${Array.from((_a = interruptContext === null || interruptContext === void 0 ? void 0 : interruptContext.state.reservedItems) !== null && _a !== void 0 ? _a : []).join(",")}`, `Objectives: ${Objective_1.default.getPipelineString(objectives)}`);
            return objectives;
        }
        processQueuedNavigationUpdates() {
            for (const queuedUpdate of this.navigationQueuedUpdates) {
                queuedUpdate();
            }
            this.navigationQueuedUpdates = [];
        }
        processQuantumBurst() {
            if (!this.isQuantumBurstEnabled()) {
                return;
            }
            this.context.player.nextMoveTime = 0;
            this.context.player.movementFinishTime = 0;
            this.context.player.attackAnimationEndTime = 0;
            while (this.context.player.hasDelay()) {
                game.absoluteTime += 100;
            }
        }
    }
    __decorate([
        Mod_1.default.saveData()
    ], Tars.prototype, "saveData", void 0);
    __decorate([
        ModRegistry_1.default.bindable("ToggleDialog", IInput_1.IInput.key("KeyT"))
    ], Tars.prototype, "bindableToggleDialog", void 0);
    __decorate([
        ModRegistry_1.default.bindable("ToggleTars", IInput_1.IInput.key("KeyT", "Shift"))
    ], Tars.prototype, "bindableToggleTars", void 0);
    __decorate([
        ModRegistry_1.default.messageSource("TARS")
    ], Tars.prototype, "messageSource", void 0);
    __decorate([
        ModRegistry_1.default.message("Toggle")
    ], Tars.prototype, "messageToggle", void 0);
    __decorate([
        ModRegistry_1.default.message("Finished")
    ], Tars.prototype, "messageFinished", void 0);
    __decorate([
        ModRegistry_1.default.message("NavigationUpdating")
    ], Tars.prototype, "messageNavigationUpdating", void 0);
    __decorate([
        ModRegistry_1.default.message("NavigationUpdated")
    ], Tars.prototype, "messageNavigationUpdated", void 0);
    __decorate([
        ModRegistry_1.default.message("QuantumBurstStart")
    ], Tars.prototype, "messageQuantumBurstStart", void 0);
    __decorate([
        ModRegistry_1.default.message("QuantumBurstCooldownStart")
    ], Tars.prototype, "messageQuantumBurstCooldownStart", void 0);
    __decorate([
        ModRegistry_1.default.message("QuantumBurstCooldownEnd")
    ], Tars.prototype, "messageQuantumBurstCooldownEnd", void 0);
    __decorate([
        ModRegistry_1.default.dictionary("Tars", ITars_1.TarsTranslation)
    ], Tars.prototype, "dictionary", void 0);
    __decorate([
        ModRegistry_1.default.dialog("Main", TarsDialog_1.default.description, TarsDialog_1.default)
    ], Tars.prototype, "dialogMain", void 0);
    __decorate([
        ModRegistry_1.default.menuBarButton("Dialog", {
            onActivate: () => GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.toggleDialog(Tars.INSTANCE.dialogMain),
            group: MenuBarButtonDescriptions_1.MenuBarButtonGroup.Meta,
            bindable: ModRegistry_1.Registry().get("bindableToggleDialog"),
            tooltip: tooltip => tooltip.addText(text => text.setText(new Translation_1.default(Tars.INSTANCE.dictionary, ITars_1.TarsTranslation.DialogTitleMain))),
        })
    ], Tars.prototype, "menuBarButton", void 0);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.Game, "play")
    ], Tars.prototype, "onGameStart", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.Game, "end")
    ], Tars.prototype, "onGameEnd", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "writeNote")
    ], Tars.prototype, "onWriteNote", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "die")
    ], Tars.prototype, "onPlayerDeath", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "respawn")
    ], Tars.prototype, "onPlayerRespawn", null);
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
        EventManager_1.EventHandler(EventBuses_1.EventBus.Ui, "interrupt")
    ], Tars.prototype, "onInterrupt", null);
    __decorate([
        ModRegistry_1.default.command("TARS")
    ], Tars.prototype, "command", null);
    __decorate([
        Bind_1.default.onDown(ModRegistry_1.Registry().get("bindableToggleTars"))
    ], Tars.prototype, "onToggleTars", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.Game, "tileUpdate")
    ], Tars.prototype, "onTileUpdate", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "postExecuteAction", null);
    __decorate([
        IHookHost_1.HookMethod
    ], Tars.prototype, "processInput", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "walkPathChange")
    ], Tars.prototype, "onWalkPathChange", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "preMove")
    ], Tars.prototype, "preMove", null);
    __decorate([
        EventManager_1.EventHandler(EventBuses_1.EventBus.LocalPlayer, "statChanged")
    ], Tars.prototype, "onStatChange", null);
    __decorate([
        Bound
    ], Tars.prototype, "getStatus", null);
    __decorate([
        Bound
    ], Tars.prototype, "stop", null);
    __decorate([
        Mod_1.default.instance(ITars_1.TARS_ID)
    ], Tars, "INSTANCE", void 0);
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQStFQSxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFFdEIsSUFBSyxxQkFJSjtJQUpELFdBQUsscUJBQXFCO1FBQ3pCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNaLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0lBRUQsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBdUVrQiwwQkFBcUIsR0FBaUMsRUFBRSxDQUFDO1lBQ2xFLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLHlCQUFvQixHQUFHLENBQUMsQ0FBQztZQVNoQixzQkFBaUIsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQVVwRCxjQUFTLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUErNUNsRSxDQUFDO1FBNzVDTyxZQUFZO1lBQ2xCLHVCQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEIsb0JBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFdEMsYUFBRyxDQUFDLGVBQWUsQ0FBQyxhQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsc0JBQWEsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFTSxjQUFjO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVqQix1QkFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSxNQUFNO1lBQ1osSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXRCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVuQyxhQUFHLENBQUMscUJBQXFCLENBQUMsd0JB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