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
            this.ensureOptions();
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
            Action_1.actionUtilities.postExecuteAction(api.type);
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
        ensureOptions() {
            var _a;
            if (this.saveData.ui === undefined) {
                this.saveData.ui = {};
            }
            this.saveData.options = {
                mode: ITars_1.TarsMode.Survival,
                stayHealthy: true,
                exploreIslands: true,
                useOrbsOfInfluence: true,
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
            this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
        }
        async onTick() {
            if (!this.isRunning() || !Executor_1.default.isReady(this.context, false)) {
                if (game.playing && this.context.player.isGhost() && game.getGameOptions().respawn) {
                    await new ExecuteAction_1.default(IAction_1.ActionType.Respawn, (context, action) => {
                        action.execute(context.player);
                    }).execute(this.context);
                }
                return;
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
                this.equipmentInterrupt(context),
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
            let objective = this.repairInterrupt(context, context.player.getEquippedItem(IHuman_1.EquipType.LeftHand)) ||
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
                this.repairInterrupt(context, this.inventory.hoe) ||
                this.repairInterrupt(context, this.inventory.axe) ||
                this.repairInterrupt(context, this.inventory.pickAxe) ||
                this.repairInterrupt(context, this.inventory.shovel) ||
                this.repairInterrupt(context, this.inventory.equipSword) ||
                this.repairInterrupt(context, this.inventory.equipShield) ||
                this.repairInterrupt(context, this.inventory.tongs) ||
                this.repairInterrupt(context, this.inventory.bed);
            if (objective) {
                return objective;
            }
            if (this.inventory.waterContainer) {
                for (const waterContainer of this.inventory.waterContainer) {
                    objective = this.repairInterrupt(context, waterContainer);
                    if (objective) {
                        return objective;
                    }
                }
            }
            return undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQStFQSxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFFdEIsSUFBSyxxQkFJSjtJQUpELFdBQUsscUJBQXFCO1FBQ3pCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNaLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0lBRUQsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBOERrQiwwQkFBcUIsR0FBaUMsRUFBRSxDQUFDO1lBQ2xFLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1lBU1gsc0JBQWlCLEdBQXlCLElBQUksR0FBRyxFQUFFLENBQUM7WUFVcEQsY0FBUyxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBcTFDbEUsQ0FBQztRQW4xQ08sWUFBWTtZQUNsQix1QkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRCLG9CQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLGFBQUcsQ0FBQyxlQUFlLENBQUMsYUFBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLHNCQUFhLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRU0sY0FBYztZQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIsdUJBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRU0sTUFBTTtZQUNaLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFZCxJQUFJLENBQUMsVUFBVSxHQUFHLG9CQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFbkMsYUFBRyxDQUFDLHFCQUFxQixDQUFDLHdCQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUU3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