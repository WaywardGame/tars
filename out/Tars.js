var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "entity/IEntity", "entity/IHuman", "entity/IStats", "entity/player/IMessageManager", "entity/player/IPlayer", "event/EventBuses", "event/EventManager", "game/IGame", "game/WorldZ", "item/IItem", "language/dictionary/Interrupt", "language/dictionary/InterruptChoice", "language/Translation", "mod/IHookHost", "mod/Mod", "mod/ModRegistry", "newui/input/Bind", "newui/input/IInput", "newui/screen/screens/game/static/menubar/MenuBarButtonDescriptions", "newui/screen/screens/GameScreen", "utilities/Async", "utilities/Log", "utilities/math/Direction", "utilities/math/Vector2", "utilities/TileHelpers", "./Context", "./ContextState", "./Core/Executor", "./Core/Planner", "./IContext", "./IObjective", "./ITars", "./Navigation/Navigation", "./Objective", "./Objectives/Acquire/Item/AcquireFood", "./Objectives/Acquire/Item/AcquireItem", "./Objectives/Acquire/Item/AcquireItemByGroup", "./Objectives/Acquire/Item/AcquireItemByTypes", "./Objectives/Acquire/Item/AcquireItemForAction", "./Objectives/Acquire/Item/AcquireItemForDoodad", "./Objectives/Acquire/Item/Specific/AcquireWaterContainer", "./Objectives/Analyze/AnalyzeBase", "./Objectives/Analyze/AnalyzeInventory", "./Objectives/Core/ExecuteAction", "./Objectives/Core/Lambda", "./Objectives/Core/Restart", "./Objectives/Gather/GatherWater", "./Objectives/Interrupt/CarveCorpse", "./Objectives/Interrupt/DefendAgainstCreature", "./Objectives/Interrupt/OptionsInterrupt", "./Objectives/Interrupt/ReduceWeight", "./Objectives/Interrupt/RepairItem", "./Objectives/Other/BuildItem", "./Objectives/Other/EmptyWaterContainer", "./Objectives/Other/Equip", "./Objectives/Other/Idle", "./Objectives/Other/PlantSeed", "./Objectives/Other/ReinforceItem", "./Objectives/Other/ReturnToBase", "./Objectives/Other/StartWaterStillDesalination", "./Objectives/Other/Unequip", "./Objectives/Other/UpgradeInventoryItem", "./Objectives/Recover/RecoverHealth", "./Objectives/Recover/RecoverHunger", "./Objectives/Recover/RecoverStamina", "./Objectives/Recover/RecoverThirst", "./Objectives/Utility/MoveToLand", "./Objectives/Utility/MoveToNewIsland", "./Objectives/Utility/MoveToZ", "./Objectives/Utility/OrganizeBase", "./Objectives/Utility/OrganizeInventory", "./Ui/TarsDialog", "./Utilities/Action", "./Utilities/Base", "./Utilities/Item", "./Utilities/Logger", "./Utilities/Movement", "./Utilities/Object", "./Utilities/Tile"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IMessageManager_1, IPlayer_1, EventBuses_1, EventManager_1, IGame_1, WorldZ_1, IItem_1, Interrupt_1, InterruptChoice_1, Translation_1, IHookHost_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, MenuBarButtonDescriptions_1, GameScreen_1, Async_1, Log_1, Direction_1, Vector2_1, TileHelpers_1, Context_1, ContextState_1, Executor_1, Planner_1, IContext_1, IObjective_1, ITars_1, Navigation_1, Objective_1, AcquireFood_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemByTypes_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AcquireWaterContainer_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, Lambda_1, Restart_1, GatherWater_1, CarveCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, EmptyWaterContainer_1, Equip_1, Idle_1, PlantSeed_1, ReinforceItem_1, ReturnToBase_1, StartWaterStillDesalination_1, Unequip_1, UpgradeInventoryItem_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, MoveToLand_1, MoveToNewIsland_1, MoveToZ_1, OrganizeBase_1, OrganizeInventory_1, TarsDialog_1, Action, Base_1, Item_1, Logger_1, movementUtilities, objectUtilities, tileUtilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tickSpeed = 333;
    const recoverThresholds = {
        [IStats_1.Stat.Health]: 30,
        [IStats_1.Stat.Stamina]: 20,
        [IStats_1.Stat.Hunger]: 8,
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
        }
        onInitialize() {
            Navigation_1.default.setModPath(this.getPath());
            Log_1.default.setSourceFilter(Log_1.default.LogType.File, false, Logger_1.logSourceName);
        }
        onUninitialize() {
            this.onGameEnd();
        }
        onLoad() {
            this.delete();
            this.navigation = Navigation_1.default.get();
            Log_1.default.addPreConsoleCallback(Logger_1.preConsoleCallback);
            window.TARS = this;
            window.TARS_Planner = Planner_1.default;
            window.TARS_TileUtilities = tileUtilities;
            if (this.saveData.shouldOpenDialog) {
                this.saveData.shouldOpenDialog = undefined;
                GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.openDialog(Tars.INSTANCE.dialogMain);
            }
        }
        onUnload() {
            this.disable(true);
            this.delete();
            Log_1.default.removePreConsoleCallback(Logger_1.preConsoleCallback);
            window.TARS = undefined;
            window.TARS_Planner = undefined;
            window.TARS_TileUtilities = undefined;
            if (GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.isDialogVisible(Tars.INSTANCE.dialogMain)) {
                this.saveData.shouldOpenDialog = true;
                GameScreen_1.gameScreen === null || GameScreen_1.gameScreen === void 0 ? void 0 : GameScreen_1.gameScreen.closeDialog(Tars.INSTANCE.dialogMain);
            }
        }
        onGameStart() {
            if (this.saveData.enabled && !this.isEnabled()) {
                this.toggle();
            }
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
        onPlayerRespawn() {
            this.interrupt();
            movementUtilities.resetMovementOverlays();
            if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
                this.navigation.queueUpdateOrigin(localPlayer);
            }
        }
        async processMovement(player) {
            if (this.isEnabled() && player.isLocalPlayer()) {
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
            if (this.isEnabled()) {
                this.processQueuedNavigationUpdates();
            }
        }
        onMoveComplete(player) {
            movementUtilities.clearOverlay(player.getTile());
        }
        onInterrupt(host, options, interrupt) {
            if (this.isEnabled() && (interrupt === Interrupt_1.default.GameDangerousStep || interrupt === Interrupt_1.default.GameTravelConfirmation)) {
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
        onTileUpdate(game, tile, tileX, tileY, tileZ, tileUpdateType) {
            if (this.navigationSystemState === NavigationSystemState.Initializing || localPlayer.isResting()) {
                this.navigationQueuedUpdates.push(() => {
                    this.onTileUpdate(game, tile, tileX, tileY, tileZ, tileUpdateType);
                });
            }
            else if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
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
        onWalkPathChange(player, walkPath) {
            if (!walkPath || walkPath.length === 0 || !this.isEnabled()) {
                return;
            }
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext);
            if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
                this.interrupt(...organizeInventoryInterrupts);
            }
        }
        preMove(player, prevX, prevY, prevZ, prevTile, nextX, nextY, nextZ, nextTile) {
            if (!this.isEnabled() || !player.hasWalkPath()) {
                return;
            }
            if (nextTile.npc || (nextTile.doodad && nextTile.doodad.blocksMove()) || game.isPlayerAtTile(nextTile, false, true)) {
                Logger_1.log.info("Interrupting due to blocked movement");
                this.interrupt();
            }
        }
        onStatChange(player, stat) {
            if (!this.isEnabled()) {
                return;
            }
            const recoverThreshold = this.getRecoverThreshold(this.context, stat.type);
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
                    Executor_1.default.markWeightChanged();
                    const weightStatus = player.getWeightStatus();
                    if (this.weightStatus !== weightStatus) {
                        this.previousWeightStatus = this.weightStatus;
                        this.weightStatus = weightStatus;
                        if (weightStatus === IPlayer_1.WeightStatus.None) {
                            return;
                        }
                        if (this.isEnabled()) {
                            Logger_1.log.info(`Weight status changed from ${this.previousWeightStatus !== undefined ? IPlayer_1.WeightStatus[this.previousWeightStatus] : "N/A"} to ${IPlayer_1.WeightStatus[this.weightStatus]}`);
                            this.interrupt();
                        }
                    }
                    break;
            }
        }
        async moveToFaceTarget(target) {
            return movementUtilities.moveToFaceTarget(new Context_1.default(localPlayer, this.base, this.inventory), target);
        }
        getTranslation(translation) {
            return new Translation_1.default(this.dictionary, translation);
        }
        isEnabled() {
            return this.tickTimeoutId !== undefined;
        }
        async toggle() {
            if (this.navigationSystemState === NavigationSystemState.Initializing) {
                return;
            }
            const str = !this.isEnabled() ? "Enabled" : "Disabled";
            Logger_1.log.info(str);
            localPlayer.messages
                .source(this.messageSource)
                .type(IMessageManager_1.MessageType.Good)
                .send(this.messageToggle, !this.isEnabled());
            if (this.navigationSystemState === NavigationSystemState.NotInitialized && this.navigation) {
                this.navigationSystemState = NavigationSystemState.Initializing;
                this.updateStatus();
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageNavigationUpdating);
                await Async_1.sleep(100);
                await this.navigation.updateAll();
                this.navigation.queueUpdateOrigin(localPlayer);
                this.navigationSystemState = NavigationSystemState.Initialized;
                this.processQueuedNavigationUpdates();
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageNavigationUpdated);
            }
            this.context = new Context_1.default(localPlayer, this.base, this.inventory);
            this.reset();
            this.saveData.enabled = !this.isEnabled();
            if (this.saveData.enabled) {
                if (this.navigation) {
                    this.navigation.showOverlay();
                    if (this.navigationSystemState === NavigationSystemState.Initialized) {
                        this.navigation.queueUpdateOrigin(localPlayer);
                    }
                }
                this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
            }
            else {
                this.disable();
            }
            this.event.emit("enableChange", this.isEnabled());
        }
        getStatus() {
            if (this.navigationSystemState === NavigationSystemState.Initializing) {
                return this.getTranslation(ITars_1.TarsTranslation.DialogStatusNavigatingInitializing);
            }
            if (!this.isEnabled()) {
                return "Waiting to be enabled";
            }
            const plan = Executor_1.default.getPlan();
            if (plan !== undefined) {
                const statusMessage = plan.tree.objective.getStatusMessage();
                if (this.lastStatusMessage !== statusMessage) {
                    this.lastStatusMessage = statusMessage;
                    Logger_1.log.info(`Status: ${statusMessage}`, plan.tree.objective);
                }
                return statusMessage;
            }
            return "Idle";
        }
        updateStatus() {
            this.event.emit("statusChange", this.getStatus());
        }
        reset() {
            Executor_1.default.reset();
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
            this.reset();
            this.navigationSystemState = NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates = [];
            Navigation_1.default.delete();
        }
        disable(gameIsEnding = false) {
            if (this.navigation) {
                this.navigation.hideOverlay();
            }
            if (this.tickTimeoutId !== undefined) {
                clearTimeout(this.tickTimeoutId);
                this.tickTimeoutId = undefined;
            }
            movementUtilities.resetMovementOverlays();
            if (localPlayer) {
                localPlayer.walkAlongPath(undefined);
                OptionsInterrupt_1.default.restore();
            }
        }
        interrupt(...interruptObjectives) {
            Logger_1.log.info("Interrupt", interruptObjectives.map(objective => objective.getHashCode()).join(" -> "));
            Executor_1.default.interrupt();
            this.objectivePipeline = undefined;
            if (interruptObjectives && interruptObjectives.length > 0) {
                this.interruptObjectivePipeline = interruptObjectives;
            }
            movementUtilities.resetMovementOverlays();
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
            if (!this.isEnabled() || !Executor_1.default.isReady(this.context, false)) {
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
            await Executor_1.default.executeObjectives(this.context, [new AnalyzeInventory_1.default(), new AnalyzeBase_1.default()], false, false);
            const interrupts = this.getInterrupts(this.context);
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
            }
            const result = await Executor_1.default.executeObjectives(this.context, this.determineObjectives(this.context), true, true);
            switch (result.type) {
                case Executor_1.ExecuteObjectivesResultType.Pending:
                case Executor_1.ExecuteObjectivesResultType.ContinuingNextTick:
                    this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                    Logger_1.log.info(`Saved objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Objective_1.default.getPipelineString(this.objectivePipeline));
                    return;
                default:
                    this.objectivePipeline = undefined;
                    return;
            }
        }
        determineObjectives(context) {
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
            const moveToNewIslandState = (_a = context.getData(IContext_1.ContextDataType.MovingToNewIsland)) !== null && _a !== void 0 ? _a : IContext_1.MovingToNewIslandState.None;
            if (moveToNewIslandState === IContext_1.MovingToNewIslandState.Ready) {
                if (this.inventory.sailBoat && !itemManager.isContainableInContainer(this.inventory.sailBoat, context.player.inventory)) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.Sailboat));
                }
                objectives.push(new MoveToNewIsland_1.default());
                return objectives;
            }
            if (this.inventory.sailBoat && itemManager.isContainableInContainer(this.inventory.sailBoat, context.player.inventory)) {
                objectives.push([
                    new MoveToLand_1.default(),
                    new ExecuteAction_1.default(IAction_1.ActionType.Drop, (context, action) => {
                        action.execute(context.player, this.inventory.sailBoat);
                    }).setStatus("Dropping sailboat"),
                ]);
            }
            const gatherItem = Item_1.getBestActionItem(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Slashing);
            if (gatherItem === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Gather)]);
            }
            if (this.base.campfire.length === 0 && this.inventory.campfire === undefined) {
                Logger_1.log.info("Need campfire");
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Campfire), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.inventory.fireStarter === undefined) {
                Logger_1.log.info("Need fire starter");
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.fireKindling === undefined || this.inventory.fireKindling.length === 0) {
                Logger_1.log.info("Need fire kindling");
                objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Kindling), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.fireTinder === undefined) {
                Logger_1.log.info("Need fire tinder");
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
            if (this.base.buildAnotherChest) {
                acquireChest = Base_1.isNearBase(context);
            }
            else if (this.base.chest.length > 0) {
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
            if (Base_1.isNearBase(context)) {
                for (const waterStill of context.base.waterStill) {
                    objectives.push(new StartWaterStillDesalination_1.default(waterStill));
                }
                const seeds = Item_1.getSeeds(context);
                if (seeds.length > 0) {
                    objectives.push(new PlantSeed_1.default(seeds[0]));
                }
            }
            if (this.base.kiln.length === 0 && this.inventory.kiln === undefined) {
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitKiln), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            if (this.inventory.heal === undefined) {
                objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Heal), new AnalyzeInventory_1.default()]);
            }
            const waitingForWater = context.player.stat.get(IStats_1.Stat.Thirst).value <= this.getRecoverThreshold(context, IStats_1.Stat.Thirst) &&
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
            if (Base_1.isNearBase(context)) {
                if (context.base.waterStill.length < 2) {
                    objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.WaterStill), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
                }
                if (this.inventory.food === undefined) {
                    objectives.push([new AcquireFood_1.default(), new AnalyzeInventory_1.default()]);
                }
                if (this.inventory.bandage === undefined) {
                    objectives.push([new AcquireItemByTypes_1.default(ITars_1.inventoryItemInfo.bandage.itemTypes), new AnalyzeInventory_1.default()]);
                }
                let availableWaterContainer;
                if (context.inventory.waterContainer !== undefined) {
                    const hasDrinkableWater = context.inventory.waterContainer.some(Item_1.isSafeToDrinkItem);
                    if (!hasDrinkableWater) {
                        availableWaterContainer = context.inventory.waterContainer.find(Item_1.canGatherWater);
                        if (!availableWaterContainer) {
                            availableWaterContainer = context.inventory.waterContainer[0];
                            objectives.push(new EmptyWaterContainer_1.default(availableWaterContainer));
                        }
                        objectives.push(new GatherWater_1.default(availableWaterContainer, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true }));
                    }
                }
                if (moveToNewIslandState === IContext_1.MovingToNewIslandState.None) {
                    const tiles = Base_1.getTilesWithItemsNearBase(context);
                    if (tiles.totalCount > (availableWaterContainer ? 0 : 20)) {
                        objectives.push(new OrganizeBase_1.default(tiles.tiles));
                    }
                }
                if (availableWaterContainer) {
                    objectives.push(new GatherWater_1.default(availableWaterContainer, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
                }
            }
            if (this.inventory.equipSword && this.inventory.equipSword.type !== IItem_1.ItemType.WoodenSword) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipSword, 0.5));
            }
            if (this.inventory.equipShield && this.inventory.equipShield.type !== IItem_1.ItemType.WoodenShield) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipShield, 0.5));
            }
            if (this.inventory.equipBelt) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipBelt, 0.5));
            }
            if (this.inventory.equipNeck) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipNeck, 0.5));
            }
            if (this.inventory.equipFeet) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipFeet, 0.5));
            }
            if (this.inventory.equipHands) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipHands, 0.5));
            }
            if (this.inventory.equipLegs && this.inventory.equipLegs.type !== IItem_1.ItemType.BarkLeggings) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipLegs, 0.5));
            }
            if (this.inventory.equipChest && this.inventory.equipChest.type !== IItem_1.ItemType.BarkTunic) {
                objectives.push(new ReinforceItem_1.default(this.inventory.equipChest, 0.5));
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
            if (this.inventory.axe && this.inventory.axe.type === IItem_1.ItemType.StoneAxe) {
                objectives.push([new UpgradeInventoryItem_1.default("axe"), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.pickAxe && this.inventory.pickAxe.type === IItem_1.ItemType.StonePickaxe) {
                objectives.push([new UpgradeInventoryItem_1.default("pickAxe"), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.shovel && this.inventory.shovel.type === IItem_1.ItemType.StoneShovel) {
                objectives.push([new UpgradeInventoryItem_1.default("shovel"), new AnalyzeInventory_1.default()]);
            }
            if (this.inventory.hoe && this.inventory.hoe.type === IItem_1.ItemType.StoneHoe) {
                objectives.push([new UpgradeInventoryItem_1.default("hoe"), new AnalyzeInventory_1.default()]);
            }
            if (!multiplayer.isConnected()) {
                const needsFood = this.inventory.food === undefined || this.inventory.food.length < 2;
                switch (moveToNewIslandState) {
                    case IContext_1.MovingToNewIslandState.None:
                        objectives.push(new Lambda_1.default(async () => {
                            const initialState = new ContextState_1.default();
                            initialState.set(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Preparing);
                            this.context.setInitialState(initialState);
                            return IObjective_1.ObjectiveResult.Complete;
                        }));
                    case IContext_1.MovingToNewIslandState.Preparing:
                        if (!this.inventory.sailBoat) {
                            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default()]);
                            if (needsFood) {
                                objectives.push(new Restart_1.default());
                            }
                        }
                        if (needsFood) {
                            objectives.push([new AcquireFood_1.default(), new AnalyzeInventory_1.default()]);
                        }
                        objectives.push(new Lambda_1.default(async () => {
                            const initialState = new ContextState_1.default();
                            initialState.set(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.Ready);
                            this.context.setInitialState(initialState);
                            return IObjective_1.ObjectiveResult.Complete;
                        }));
                    case IContext_1.MovingToNewIslandState.Ready:
                        if (this.inventory.sailBoat && !itemManager.isContainableInContainer(this.inventory.sailBoat, context.player.inventory)) {
                            objectives.push(new AcquireItem_1.default(IItem_1.ItemType.Sailboat));
                        }
                        objectives.push(new MoveToNewIsland_1.default());
                        break;
                }
            }
            else {
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
            }
            if (!multiplayer.isConnected()) {
                if (shouldUpgradeToLeather && game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        Logger_1.log.info("Done with all objectives! Disabling...");
                        localPlayer.messages
                            .source(this.messageSource)
                            .type(IMessageManager_1.MessageType.Good)
                            .send(this.messageToggle, false);
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
            let interrupts = [
                this.optionsInterrupt(),
                this.equipmentInterrupt(context),
                this.nearbyCreatureInterrupt(context),
                this.staminaInterrupt(context),
                this.buildItemObjectives(),
                this.healthInterrupt(context),
                this.reduceWeightInterrupt(context),
                this.thirstInterrupt(context),
                this.gatherFromCorpsesInterrupt(context),
                this.hungerInterrupt(context),
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
                if (leftHandEquipped) {
                    if (context.player.options.rightHand) {
                        ui.changeEquipmentOption("rightHand");
                    }
                }
                else if (rightHandEquipped !== context.player.options.rightHand) {
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
                            .sort((a, b) => Item_1.estimateDamageModifier(b, closestCreature) - Item_1.estimateDamageModifier(a, closestCreature));
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
            if (health.value > this.getRecoverThreshold(context, IStats_1.Stat.Health) && !context.player.status.Bleeding &&
                (!context.player.status.Poisoned || (context.player.status.Poisoned && (health.value / health.max) >= poisonHealthPercentThreshold))) {
                return undefined;
            }
            Logger_1.log.info("Heal");
            return new RecoverHealth_1.default();
        }
        staminaInterrupt(context) {
            if (context.player.stat.get(IStats_1.Stat.Stamina).value > this.getRecoverThreshold(context, IStats_1.Stat.Stamina)) {
                return undefined;
            }
            Logger_1.log.info("Stamina");
            return new RecoverStamina_1.default();
        }
        hungerInterrupt(context) {
            return new RecoverHunger_1.default(context.player.stat.get(IStats_1.Stat.Hunger).value <= this.getRecoverThreshold(context, IStats_1.Stat.Hunger));
        }
        thirstInterrupt(context) {
            return new RecoverThirst_1.default(context.player.stat.get(IStats_1.Stat.Thirst).value <= this.getRecoverThreshold(context, IStats_1.Stat.Thirst));
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
            const threshold = Base_1.isNearBase(context) ? 0.2 : 0.1;
            if (item.minDur / item.maxDur >= threshold) {
                return undefined;
            }
            if (((_a = this.inventory.waterContainer) === null || _a === void 0 ? void 0 : _a.includes(item)) && context.player.stat.get(IStats_1.Stat.Thirst).value < 2) {
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
                allowReservedItems: !Base_1.isNearBase(context) && this.weightStatus === IPlayer_1.WeightStatus.Overburdened,
                disableDrop: this.weightStatus !== IPlayer_1.WeightStatus.Overburdened && !Base_1.isNearBase(context),
            });
        }
        returnToBaseInterrupt(context) {
            if (!Base_1.isNearBase(context) &&
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
            const walkPath = context.player.walkPath;
            if (walkPath === undefined || walkPath.path.length === 0) {
                return undefined;
            }
            if (!Base_1.isNearBase(context)) {
                return undefined;
            }
            const target = walkPath.path[walkPath.path.length - 1];
            if (Base_1.isNearBase(context, { x: target.x, y: target.y, z: context.player.z })) {
                return undefined;
            }
            let objectives = [];
            const reservedItems = Item_1.getReservedItems(context);
            const interruptReservedItems = interruptContext ? Item_1.getReservedItems(interruptContext) : undefined;
            if (reservedItems.length > 0) {
                const organizeInventoryObjectives = OrganizeInventory_1.default.moveIntoChestsObjectives(context, reservedItems);
                if (organizeInventoryObjectives) {
                    objectives = objectives.concat(organizeInventoryObjectives);
                }
            }
            let unusedItems = Item_1.getUnusedItems(context);
            const interruptUnusedItems = interruptContext ? Item_1.getUnusedItems(interruptContext) : undefined;
            if (interruptUnusedItems) {
                unusedItems = unusedItems.filter(item => !(interruptReservedItems === null || interruptReservedItems === void 0 ? void 0 : interruptReservedItems.includes(item)) && !interruptUnusedItems.includes(item));
            }
            if (unusedItems.length > 0) {
                const organizeInventoryObjectives = OrganizeInventory_1.default.moveIntoChestsObjectives(context, unusedItems);
                if (organizeInventoryObjectives) {
                    objectives = objectives.concat(organizeInventoryObjectives);
                }
            }
            Logger_1.log.info(objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space", `Reserved items: ${reservedItems.join(",")}, Unused items: ${unusedItems.join(",")}`, `Context reserved items: ${Array.from(context.state.reservedItems).join(",")}`, `Interrupt context reserved items: ${Array.from((_a = interruptContext === null || interruptContext === void 0 ? void 0 : interruptContext.state.reservedItems) !== null && _a !== void 0 ? _a : []).join(",")}`);
            return objectives;
        }
        processQueuedNavigationUpdates() {
            for (const queuedUpdate of this.navigationQueuedUpdates) {
                queuedUpdate();
            }
            this.navigationQueuedUpdates = [];
        }
        getRecoverThreshold(context, stat) {
            const recoverThreshold = recoverThresholds[stat];
            return recoverThreshold > 0 ? recoverThreshold : context.player.stat.get(stat).max + recoverThreshold;
        }
    }
    __decorate([
        Mod_1.default.saveData()
    ], Tars.prototype, "saveData", void 0);
    __decorate([
        ModRegistry_1.default.bindable("ToggleDialog", IInput_1.IInput.key("KeyT", "Shift"))
    ], Tars.prototype, "bindableToggleDialog", void 0);
    __decorate([
        ModRegistry_1.default.bindable("ToggleTars", IInput_1.IInput.key("KeyT"))
    ], Tars.prototype, "bindableToggleTars", void 0);
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
        Mod_1.default.instance(ITars_1.TARS_ID)
    ], Tars, "INSTANCE", void 0);
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWlHQSxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFHdEIsTUFBTSxpQkFBaUIsR0FBZ0M7UUFDdEQsQ0FBQyxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtRQUNqQixDQUFDLGFBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO1FBQ2xCLENBQUMsYUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDaEIsQ0FBQyxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtLQUNqQixDQUFDO0lBR0YsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUM7SUFFMUMsSUFBSyxxQkFJSjtJQUpELFdBQUsscUJBQXFCO1FBQ3pCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNaLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0lBRUQsTUFBcUIsSUFBSyxTQUFRLGFBQUc7UUFBckM7O1lBMkRrQiwwQkFBcUIsR0FBaUMsRUFBRSxDQUFDO1lBU3pELHNCQUFpQixHQUF5QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBb21EdEUsQ0FBQztRQTNsRE8sWUFBWTtZQUNsQixvQkFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV0QyxhQUFHLENBQUMsZUFBZSxDQUFDLGFBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxzQkFBYSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVNLGNBQWM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFTSxNQUFNO1lBQ1osSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFVBQVUsR0FBRyxvQkFBVSxDQUFDLEdB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UyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNsRixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJ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