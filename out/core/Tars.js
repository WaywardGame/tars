var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventEmitter", "event/EventManager", "game/entity/action/actions/MoveItem", "game/entity/action/actions/Rename", "game/entity/action/actions/Respawn", "game/entity/action/actions/UpdateWalkPath", "game/entity/IHuman", "game/entity/IStats", "game/entity/player/IPlayer", "game/IGame", "game/item/IItem", "game/meta/prompt/IPrompt", "game/tile/ITerrain", "game/WorldZ", "language/dictionary/InterruptChoice", "renderer/IRenderer", "utilities/Decorators", "utilities/Log", "utilities/math/Direction", "utilities/math/Vector2", "utilities/object/Objects", "utilities/promise/Async", "utilities/promise/ResolvablePromise", "../ITarsMod", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/core/ExecuteAction", "../objectives/core/MoveToTarget", "../objectives/interrupt/ButcherCorpse", "../objectives/interrupt/DefendAgainstCreature", "../objectives/interrupt/OptionsInterrupt", "../objectives/interrupt/ReduceWeight", "../objectives/interrupt/RepairItem", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/item/UnequipItem", "../objectives/other/RunAwayFromTarget", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/recover/RecoverStamina", "../objectives/recover/RecoverThirst", "../objectives/utility/moveTo/MoveToBase", "../objectives/utility/moveTo/MoveToZ", "../objectives/utility/OrganizeInventory", "../utilities/Action", "../utilities/Base", "../utilities/Creature", "../utilities/Doodad", "../utilities/Item", "../utilities/Logger", "../utilities/Movement", "../utilities/Object", "../utilities/Player", "../utilities/Tile", "./context/Context", "./context/IContext", "./Executor", "./ITars", "./mode/Modes", "./navigation/Navigation", "./objective/Objective", "./planning/Plan", "./planning/Planner"], function (require, exports, EventBuses_1, EventEmitter_1, EventManager_1, MoveItem_1, Rename_1, Respawn_1, UpdateWalkPath_1, IHuman_1, IStats_1, IPlayer_1, IGame_1, IItem_1, IPrompt_1, ITerrain_1, WorldZ_1, InterruptChoice_1, IRenderer_1, Decorators_1, Log_1, Direction_1, Vector2_1, Objects_1, Async_1, ResolvablePromise_1, ITarsMod_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, MoveToTarget_1, ButcherCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, EquipItem_1, UnequipItem_1, RunAwayFromTarget_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, MoveToBase_1, MoveToZ_1, OrganizeInventory_1, Action_1, Base_1, Creature_1, Doodad_1, Item_1, Logger_1, Movement_1, Object_1, Player_1, Tile_1, Context_1, IContext_1, Executor_1, ITars_1, Modes_1, Navigation_1, Objective_1, Plan_1, Planner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tars extends EventEmitter_1.default.Host {
        constructor(human, saveData, overlay, navigationKdTrees) {
            super();
            this.human = human;
            this.saveData = saveData;
            this.overlay = overlay;
            this.statThresholdExceeded = {};
            this.quantumBurstCooldown = 0;
            this.interruptContexts = new Map();
            this.navigationSystemState = ITars_1.NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates = [];
            this.modeCache = new Map();
            this.loaded = false;
            const loggingUtilities = new Logger_1.LoggerUtilities(() => this.getName().toString());
            this.log = loggingUtilities.createLog();
            this.planner = new Planner_1.Planner(loggingUtilities, false);
            this.planner.debug = saveData.options.debugLogging;
            this.executor = new Executor_1.Executor(this.planner);
            this.utilities = {
                action: new Action_1.ActionUtilities(),
                base: new Base_1.BaseUtilities(),
                creature: new Creature_1.CreatureUtilities(),
                doodad: new Doodad_1.DoodadUtilities(),
                item: new Item_1.ItemUtilities(),
                logger: loggingUtilities,
                movement: new Movement_1.MovementUtilities(),
                navigation: new Navigation_1.default(this.log, human, overlay, navigationKdTrees),
                object: new Object_1.ObjectUtilities(),
                overlay: this.overlay,
                player: new Player_1.PlayerUtilities(),
                tile: new Tile_1.TileUtilities(),
                ensureSailingMode: (sailingMode) => this.ensureSailingMode(sailingMode),
            };
            this.log.info(`Created TARS instance on island id ${this.human.islandId}`);
            this.dialogSubId = this.getDialogSubId();
        }
        delete() {
            this.reset({
                delete: true,
            });
            this.navigationSystemState = ITars_1.NavigationSystemState.NotInitialized;
            this.navigationQueuedUpdates.length = 0;
            this.utilities.navigation.unload();
            this.log.info(`Deleted TARS instance on island id ${this.human.islandId}`);
        }
        getName() {
            return this.human.getName();
        }
        getSaveDataContainer() {
            const saveData = Objects_1.default.deepClone(this.saveData);
            saveData.enabled = false;
            return {
                name: this.getName().toString(),
                version: (0, ITarsMod_1.getTarsMod)().getVersion(),
                saveData: this.saveData,
            };
        }
        loadSaveData(container) {
            if (this.saveData.enabled) {
                this.disable();
            }
            for (const [key, value] of Object.entries(container.saveData)) {
                if (key === "options") {
                    this.updateOptions(value);
                }
                else {
                    this.saveData[key] = Objects_1.default.deepClone(value);
                }
            }
            const npc = this.asNPC;
            if (npc) {
                Rename_1.default.execute(localPlayer, npc, container.name);
            }
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
            Log_1.default.addPreConsoleCallback(this.utilities.logger.preConsoleCallback);
        }
        unload() {
            if (!this.loaded) {
                return;
            }
            this.loaded = false;
            this.delete();
            EventManager_1.default.deregisterEventBusSubscriber(this);
            this.event.emit("unload");
            Log_1.default.removePreConsoleCallback(this.utilities.logger.preConsoleCallback);
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
            multiplayer.executeClientside(() => {
                UpdateWalkPath_1.default.execute(this.human, undefined);
                OptionsInterrupt_1.default.restore(this.human);
            });
            if (!gameIsTravelingOrEnding && this.saveData.options.mode === ITars_1.TarsMode.Manual) {
                this.updateOptions({ mode: ITars_1.TarsMode.Survival });
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
                this.log.info(`Configured recover thresholds. health: ${this.saveData.options.recoverThresholdHealth}. stamina: ${this.saveData.options.recoverThresholdStamina}. hunger: ${this.saveData.options.recoverThresholdHunger}`);
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
            this.createContext();
            this.interruptContext = undefined;
            this.interruptContexts.clear();
            this.utilities.movement.resetMovementOverlays();
        }
        onPlayerRespawn() {
            if (this.human !== localPlayer) {
                return;
            }
            this.fullInterrupt("Human respawned");
            this.createContext();
            this.interruptContext = undefined;
            this.interruptContexts.clear();
            this.utilities.movement.resetMovementOverlays();
            if (this.navigationSystemState === ITars_1.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(this.human);
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
        onCreatureRemove(_, creature) {
            if (!this.isRunning()) {
                return;
            }
            const objective = this.getCurrentObjective();
            if (objective !== undefined && objective instanceof MoveToTarget_1.default && objective.onCreatureRemoved(this.context, creature)) {
                this.fullInterrupt(`${creature} was removed`);
            }
        }
        onCorpseRemove(_, corpse) {
            if (!this.isRunning()) {
                return;
            }
            const objective = this.getCurrentObjective();
            if (objective !== undefined && objective instanceof MoveToTarget_1.default && objective.onCorpseRemoved(this.context, corpse)) {
                this.fullInterrupt(`${corpse} was removed`);
            }
        }
        onRestEnd(human) {
            if (this.human !== human) {
                return;
            }
            this.processQueuedNavigationUpdates();
        }
        async onCreaturePostMove(creature, fromTile, toTile) {
            if (!this.isRunning()) {
                return;
            }
            const objective = this.getCurrentObjective();
            if (objective !== undefined) {
                const result = await objective.onMove(this.context);
                if (result === true) {
                    this.interrupt("OnMove interrupt");
                }
                else if (result) {
                    this.interrupt("Target creature moved", result);
                }
            }
        }
        onNpcRenamed(npc) {
            if (this.human !== npc) {
                return;
            }
            this.utilities.logger.reloadLogSources();
        }
        async onHumanPostMove(human, fromTile, toTile) {
            if (this.human !== human) {
                return;
            }
            if (human.asPlayer && !this.isRunning()) {
                return;
            }
            this.utilities.movement.clearOverlay(toTile);
            if (this.navigationSystemState === ITars_1.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(human);
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
        onMoveComplete(human) {
            if (this.human !== human) {
                return;
            }
            this.utilities.movement.clearOverlay(human.tile);
        }
        onPrompt(host, prompt) {
            if (this.isRunning() && (prompt.type === IPrompt_1.Prompt.GameIslandTravelConfirmation)) {
                this.log.info(`Resolving true for prompt ${IPrompt_1.Prompt[prompt.type]}`);
                prompt.resolve(InterruptChoice_1.default.Yes);
            }
        }
        onTileUpdate(island, tile, tileUpdateType) {
            if (island !== this.human.island) {
                return;
            }
            if (this.navigationSystemState === ITars_1.NavigationSystemState.Initializing || this.human.isResting()) {
                this.navigationQueuedUpdates.push(() => {
                    this.onTileUpdate(island, tile, tileUpdateType);
                });
            }
            else if (this.navigationSystemState === ITars_1.NavigationSystemState.Initialized) {
                const baseTiles = this.utilities.base.getBaseTiles(this.getContext());
                const updateNeighbors = tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn;
                if (updateNeighbors) {
                    for (let x = -Navigation_1.tileUpdateRadius; x <= Navigation_1.tileUpdateRadius; x++) {
                        for (let y = -Navigation_1.tileUpdateRadius; y <= Navigation_1.tileUpdateRadius; y++) {
                            const otherTile = island.getTileSafe(tile.x + x, tile.y + y, tile.z);
                            if (otherTile) {
                                this.utilities.navigation.onTileUpdate(otherTile, otherTile.type, baseTiles.has(otherTile), tileUpdateType);
                            }
                        }
                    }
                }
                else {
                    this.utilities.navigation.onTileUpdate(tile, tile.type, baseTiles.has(tile), tileUpdateType);
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
        processInput(human) {
            if (this.human !== human || !this.isRunning()) {
                return;
            }
            this.processQuantumBurst();
            return undefined;
        }
        onChangeZ(human, z, lastZ) {
            if (this.human !== human || !this.isRunning()) {
                return;
            }
            if (this.navigationSystemState === ITars_1.NavigationSystemState.Initialized) {
                this.utilities.navigation.queueUpdateOrigin(this.human);
            }
            this.fullInterrupt(`Interrupting due to z movement from ${WorldZ_1.WorldZ[lastZ]} to ${WorldZ_1.WorldZ[z]}`);
        }
        onPreMove(human, prevTile, nextTile) {
            if (this.human !== human || !this.isRunning() || !human.hasWalkPath()) {
                return;
            }
            if ((nextTile.npc && nextTile.npc !== this.human) || (nextTile.doodad && nextTile.doodad.blocksMove()) || nextTile.isPlayerOnTile(false, true)) {
                this.interrupt("Interrupting due to blocked movement");
            }
        }
        onCanAttack(human, weapon, attackType) {
            if (this.human !== human || !this.isRunning()) {
                return undefined;
            }
            if (this.human.hasWalkPath()) {
                multiplayer.executeClientside(() => {
                    UpdateWalkPath_1.default.execute(this.human, undefined);
                });
            }
            return undefined;
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
                            this.fullInterrupt(`Stat threshold exceeded for ${IStats_1.Stat[stat.type]}. ${stat.value} < ${recoverThreshold}`);
                        }
                    }
                }
                else if (this.statThresholdExceeded[stat.type]) {
                    this.statThresholdExceeded[stat.type] = false;
                }
            }
            switch (stat.type) {
                case IStats_1.Stat.Weight:
                    this.onWeightChange(false);
                    break;
            }
        }
        onStatMaxChanged(human, stat, oldValue) {
            if (this.human !== human || !this.isRunning() || stat.max === oldValue) {
                return;
            }
            switch (stat.type) {
                case IStats_1.Stat.Weight:
                    this.onWeightChange(true);
                    break;
            }
        }
        onWeightChange(interruptWhenChangingToNone) {
            this.executor.markWeightChanged();
            const weightStatus = this.human.getWeightStatus();
            if (this.weightStatus !== weightStatus) {
                this.previousWeightStatus = this.weightStatus;
                this.weightStatus = weightStatus;
                if (!interruptWhenChangingToNone && weightStatus === IPlayer_1.WeightStatus.None) {
                    return;
                }
                this.interrupt(`Weight status changed from ${this.previousWeightStatus !== undefined ? IPlayer_1.WeightStatus[this.previousWeightStatus] : "N/A"} to ${IPlayer_1.WeightStatus[this.weightStatus]}`);
            }
        }
        async onMoveToIsland(human) {
            if (this.human !== human) {
                return;
            }
            if (this.isEnabled()) {
                this.disable(true);
            }
            this.delete();
            this.utilities.navigation.load();
            (0, ITarsMod_1.getTarsMod)().event.emit("refreshTarsInstanceReferences");
            if (!this.isEnabled()) {
                return;
            }
            this.toggle(true);
        }
        getContext() {
            return this.context ?? new Context_1.default(this, this.base, this.inventory, this.utilities);
        }
        get asNPC() {
            return this.human.asNPC;
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
        canToggle() {
            return this.navigationSystemState !== ITars_1.NavigationSystemState.Initializing;
        }
        async toggle(enabled = !this.saveData.enabled) {
            if (!this.canToggle()) {
                return;
            }
            this.saveData.enabled = enabled;
            this.event.emit("enableChange", enabled);
            this.log.info(this.saveData.enabled ? "Enabled" : "Disabled");
            this.context = new Context_1.default(this, this.base, this.inventory, this.utilities);
            this.utilities.item.initialize(this.context);
            await this.ensureNavigation(!!this.context.human.vehicleItemReference);
            this.reset();
            if (this.saveData.enabled) {
                if (this.saveData.options.navigationOverlays) {
                    this.utilities.navigation.ensureOverlays(() => this.utilities.base.getBaseTiles(this.context));
                    this.overlay.show();
                    this.human.updateView(IRenderer_1.RenderSource.Mod, false);
                }
                this.utilities.navigation.queueUpdateOrigin(this.human);
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
                this.log.info(`Updating options: ${changedOptions.join(", ")}`);
                this.event.emit("optionsChange", this.saveData.options);
                let shouldInterrupt = this.isRunning();
                for (const changedOption of changedOptions) {
                    switch (changedOption) {
                        case "mode":
                            shouldInterrupt = true;
                            break;
                        case "survivalExploreIslands":
                            if (this.context) {
                                const moveToNewIslandState = this.context.getDataOrDefault(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
                                if (moveToNewIslandState !== IContext_1.MovingToNewIslandState.None) {
                                    this.context.setData(IContext_1.ContextDataType.MovingToNewIsland, IContext_1.MovingToNewIslandState.None);
                                }
                                else {
                                    shouldInterrupt = false;
                                }
                            }
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
                                this.event.emit("quantumBurstChange", ITars_1.QuantumBurstStatus.Start);
                            }
                            else {
                                this.quantumBurstCooldown = 2;
                            }
                            break;
                        case "navigationOverlays":
                            shouldInterrupt = false;
                            if (this.saveData.options.navigationOverlays) {
                                this.utilities.navigation.ensureOverlays(() => this.utilities.base.getBaseTiles(this.getContext()));
                                this.overlay.show();
                            }
                            else {
                                this.overlay.hide();
                            }
                            break;
                        case "debugLogging":
                            shouldInterrupt = false;
                            this.planner.debug = this.saveData.options.debugLogging;
                            break;
                    }
                }
                if (shouldInterrupt) {
                    this.fullInterrupt("Option changed");
                }
            }
        }
        updateWalkPath(path) {
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext, path);
            if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
                this.interrupt("Organize inventory", ...organizeInventoryInterrupts);
            }
            else {
                multiplayer.executeClientside(() => {
                    UpdateWalkPath_1.default.execute(this.human, path, true);
                });
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
            if (this.navigationSystemState === ITars_1.NavigationSystemState.Initializing) {
                return (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogStatusNavigatingInitializing);
            }
            if (!this.isRunning()) {
                return "Not running";
            }
            let statusMessage = this.human.isResting() ? "Resting..." : "Idle";
            let planStatusMessage;
            const plan = this.executor.getPlan();
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
                    this.log.warn("Missing status message for objective", plan.tree.objective.getIdentifier(this.context));
                }
            }
            if (this.lastStatusMessage !== statusMessage) {
                this.lastStatusMessage = statusMessage;
                this.log.info(`Status: ${statusMessage}`);
            }
            const walkPath = this.context.human.walkPath;
            if (walkPath && walkPath.path.length > 0) {
                const tilesAway = Math.ceil(Vector2_1.default.distance(this.human, walkPath.path[walkPath.path.length - 1]));
                if (tilesAway > 0) {
                    statusMessage += ` (${tilesAway} tile${tilesAway > 1 ? "s" : ""} away)`;
                }
            }
            return statusMessage;
        }
        updateStatus() {
            this.event.emit("statusChange");
        }
        async ensureSailingMode(sailingMode) {
            if (!this.utilities.navigation) {
                return;
            }
            if (this.navigationUpdatePromise) {
                return this.navigationUpdatePromise;
            }
            if (this.utilities.navigation.shouldUpdateSailingMode(sailingMode)) {
                this.log.info("Updating sailing mode", sailingMode);
                this.navigationUpdatePromise = new ResolvablePromise_1.default();
                this.navigationSystemState = ITars_1.NavigationSystemState.NotInitialized;
                await this.ensureNavigation(sailingMode);
                this.navigationUpdatePromise.resolve();
                this.navigationUpdatePromise = undefined;
            }
        }
        async ensureNavigation(sailingMode) {
            if (this.navigationSystemState === ITars_1.NavigationSystemState.NotInitialized && this.utilities.navigation) {
                this.navigationSystemState = ITars_1.NavigationSystemState.Initializing;
                this.updateStatus();
                this.event.emit("navigationChange", this.navigationSystemState);
                await (0, Async_1.sleep)(100);
                await this.utilities.navigation.updateAll(sailingMode);
                this.utilities.navigation.queueUpdateOrigin(this.human);
                this.navigationSystemState = ITars_1.NavigationSystemState.Initialized;
                this.processQueuedNavigationUpdates();
                this.event.emit("navigationChange", this.navigationSystemState);
            }
        }
        async getOrCreateModeInstance(context) {
            const mode = this.saveData.options.mode;
            let modeInstance = this.modeCache.get(mode);
            if (!modeInstance) {
                const modeConstructor = Modes_1.modes.get(mode);
                if (modeConstructor) {
                    modeInstance = new modeConstructor();
                    await this.initializeMode(context, mode, modeInstance);
                }
            }
            return modeInstance;
        }
        async initializeMode(context, mode, modeInstance) {
            this.log.info(`Initializing ${ITars_1.TarsMode[mode]}`);
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
                this.log.info(`Disposed of "${ITars_1.TarsMode[mode]}" mode`);
            }
        }
        reset(options) {
            this.executor.reset();
            for (const mode of Array.from(this.modeCache.keys())) {
                if (options?.delete || mode !== ITars_1.TarsMode.Manual) {
                    this.disposeMode(this.context, mode);
                }
            }
            this.lastStatusMessage = undefined;
            this.objectivePipeline = undefined;
            this.interruptObjectivePipeline = undefined;
            this.interruptIds = undefined;
            this.interruptContext = undefined;
            this.interruptContexts.clear();
            this.weightStatus = this.human.getWeightStatus();
            this.previousWeightStatus = undefined;
            Objective_1.default.reset();
            this.clearCaches();
            if (options?.delete || options?.resetInventory) {
                this.inventory = {};
            }
            if (options?.delete || options?.resetBase) {
                if (this.base && typeof (localIsland) !== "undefined") {
                    const baseTiles = this.utilities.base.getBaseTiles(this.getContext());
                    for (const baseTile of baseTiles) {
                        this.utilities.navigation.refreshOverlay(baseTile, false);
                    }
                }
                this.base = {
                    anvil: [],
                    campfire: [],
                    chest: [],
                    furnace: [],
                    intermediateChest: [],
                    kiln: [],
                    sailboat: [],
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
                this.log.debug("Deleted context");
            }
            else if (options?.resetContext || options?.resetInventory || options?.resetBase) {
                this.createContext();
            }
        }
        createContext() {
            this.context = new Context_1.default(this, this.base, this.inventory, this.utilities);
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
            this.log.info(`Interrupt: ${reason}`, Plan_1.default.getPipelineString(this.context, interruptObjectives));
            this.executor.interrupt();
            this.objectivePipeline = undefined;
            if (interruptObjectives && interruptObjectives.length > 0) {
                this.interruptObjectivePipeline = interruptObjectives;
            }
            this.utilities.movement.resetMovementOverlays();
            multiplayer.executeClientside(() => {
                UpdateWalkPath_1.default.execute(this.human, undefined);
            });
        }
        fullInterrupt(reason) {
            this.log.info(`Full interrupt: ${reason}`);
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
                this.log.error("onTick error", ex);
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
            if (!this.context) {
                return;
            }
            if (!this.isRunning() || !this.executor.isReady(this.context, false)) {
                if (this.quantumBurstCooldown === 2) {
                    this.quantumBurstCooldown--;
                    this.event.emit("quantumBurstChange", ITars_1.QuantumBurstStatus.CooldownStart);
                }
                if (game.playing && this.context.human.isGhost() && game.getGameOptions().respawn && this.context.human.asPlayer) {
                    await new ExecuteAction_1.default(Respawn_1.default, []).execute(this.context);
                }
                return;
            }
            if (this.quantumBurstCooldown === 1) {
                this.quantumBurstCooldown--;
                this.event.emit("quantumBurstChange", ITars_1.QuantumBurstStatus.CooldownEnd);
            }
            this.clearCaches();
            for (const context of [this.context, this.interruptContext, ...this.interruptContexts.values()]) {
                context?.resetPosition();
            }
            await this.executor.executeObjectives(this.context, [new AnalyzeInventory_1.default(), new AnalyzeBase_1.default()], false, false);
            const modeInstance = await this.getOrCreateModeInstance(this.context);
            if (!modeInstance) {
                this.disable();
                return;
            }
            const interrupts = modeInstance.getInterrupts ?
                await modeInstance.getInterrupts(this.context) :
                this.getInterrupts(this.context);
            const interruptIds = new Set(interrupts
                .filter(objective => Array.isArray(objective) ? objective.length > 0 : objective !== undefined)
                .map(objective => Array.isArray(objective) ? objective.map(o => o.getIdentifier(this.context)).join(" -> ") : objective.getIdentifier(this.context)));
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
                this.log.info(`Interrupts changed from ${this.interruptIds ? Array.from(this.interruptIds).join(", ") : undefined} to ${Array.from(interruptIds).join(", ")}`);
                this.interruptIds = interruptIds;
                this.interruptObjectivePipeline = undefined;
            }
            if (this.interruptObjectivePipeline || interrupts.length > 0) {
                if (!this.interruptContext) {
                    this.interruptContext = this.context.clone(undefined, undefined, true);
                    this.interruptContext.setInitialState();
                    this.interruptContexts.clear();
                    this.log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
                }
                if (this.interruptObjectivePipeline) {
                    const interruptHashCode = Plan_1.default.getPipelineString(this.context, this.interruptObjectivePipeline);
                    this.log.info("Continuing interrupt execution", interruptHashCode);
                    const result = await this.executor.executeObjectives(this.interruptContext, this.interruptObjectivePipeline, false);
                    switch (result.type) {
                        case Executor_1.ExecuteObjectivesResultType.Completed:
                            this.interruptObjectivePipeline = undefined;
                            this.log.info("Completed interrupt objectives");
                            break;
                        case Executor_1.ExecuteObjectivesResultType.Restart:
                            this.interruptObjectivePipeline = undefined;
                            return;
                        case Executor_1.ExecuteObjectivesResultType.Pending:
                            const afterInterruptHashCode = Plan_1.default.getPipelineString(this.context, this.interruptObjectivePipeline);
                            if (interruptHashCode === afterInterruptHashCode) {
                                this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                                this.log.info(`Updated continuing interrupt objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Plan_1.default.getPipelineString(this.context, this.interruptObjectivePipeline));
                            }
                            else {
                                this.log.info(`Ignoring continuing interrupt objectives due to changed interrupts - ${Executor_1.ExecuteObjectivesResultType[result.type]}. Before: ${interruptHashCode}. After: ${afterInterruptHashCode}`);
                            }
                            return;
                        case Executor_1.ExecuteObjectivesResultType.ContinuingNextTick:
                            this.interruptObjectivePipeline = undefined;
                            this.log.info("Clearing interrupt objective pipeline");
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
                            this.log.debug(`Restored saved context from ${i}. ${this.interruptContext.getHashCode()}`);
                        }
                        if (!this.interruptContext) {
                            return;
                        }
                        const result = await this.executor.executeObjectives(this.interruptContext, [interruptObjectives], true);
                        if (!this.interruptContext) {
                            return;
                        }
                        switch (result.type) {
                            case Executor_1.ExecuteObjectivesResultType.Completed:
                                this.interruptObjectivePipeline = undefined;
                                if (this.interruptContexts.has(i)) {
                                    this.interruptContexts.delete(i);
                                    this.log.debug(`Deleting saved context from ${i}`);
                                }
                                break;
                            default:
                                this.interruptContexts.set(i, this.interruptContext.clone(undefined, undefined, true));
                                this.log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext.getHashCode()}`);
                                this.interruptContext.setInitialState();
                                if (result.type === Executor_1.ExecuteObjectivesResultType.Pending || result.type === Executor_1.ExecuteObjectivesResultType.ContinuingNextTick) {
                                    this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                                    this.objectivePipeline = undefined;
                                }
                                return;
                        }
                    }
                }
                if (this.executor.tryClearInterrupt()) {
                    this.interruptContext.setInitialState();
                    this.log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);
                    return;
                }
            }
            if (this.executor.tryClearInterrupt()) {
                return;
            }
            this.interruptContext = undefined;
            if (this.objectivePipeline !== undefined) {
                const hashCode = Plan_1.default.getPipelineString(this.context, this.objectivePipeline);
                this.log.info("Continuing execution of objectives", hashCode);
                const result = await this.executor.executeObjectives(this.context, this.objectivePipeline, false, true);
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
                            this.log.info(`Updated continuing objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Plan_1.default.getPipelineString(this.context, this.objectivePipeline));
                        }
                        else {
                            this.log.info(`Ignoring continuing objectives due to changed objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}. Resetting. Before: ${hashCode}. After: ${afterHashCode}`);
                            this.objectivePipeline = undefined;
                        }
                        return;
                }
                if (!this.isEnabled()) {
                    return;
                }
            }
            this.context.reset();
            this.log.debug(`Reset context state. Context hash code: ${this.context.getHashCode()}.`);
            const objectives = await modeInstance.determineObjectives(this.context);
            const result = await this.executor.executeObjectives(this.context, objectives, true, true);
            switch (result.type) {
                case Executor_1.ExecuteObjectivesResultType.Pending:
                case Executor_1.ExecuteObjectivesResultType.ContinuingNextTick:
                    this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                    this.log.info(`Saved objectives - ${Executor_1.ExecuteObjectivesResultType[result.type]}`, Plan_1.default.getPipelineString(this.context, this.objectivePipeline));
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
            ];
            if (stayHealthy) {
                interrupts.push(...this.getRecoverInterrupts(context, true, false));
            }
            interrupts.push(this.nearbyCreatureInterrupt(context));
            if (context.options.allowBackpacks && this.inventory.backpack?.length) {
                interrupts.push(...this.organizeBackpackInterrupts(context, this.inventory.backpack));
            }
            interrupts.push(this.reduceWeightInterrupt(context));
            if (stayHealthy) {
                interrupts.push(...this.getRecoverInterrupts(context, true, true));
            }
            interrupts = interrupts.concat([
                this.buildItemObjectives(context),
            ]);
            if (stayHealthy) {
                interrupts.push(...this.getRecoverInterrupts(context, false, true));
            }
            interrupts = interrupts.concat([
                this.gatherFromCorpsesInterrupt(context),
                this.repairsInterrupt(context),
                this.escapeCavesInterrupt(context),
                this.returnToBaseInterrupt(context),
            ]);
            const organizeInventoryInterrupts = this.organizeInventoryInterrupts(context);
            if (organizeInventoryInterrupts) {
                interrupts = interrupts.concat(organizeInventoryInterrupts);
            }
            return interrupts;
        }
        getRecoverInterrupts(context, onlyUseAvailableItems, allowWaiting) {
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
            if (allowWaiting && exceededStaminaThreshold) {
                objectives.push(new RecoverStamina_1.default());
            }
            objectives.push(new RecoverThirst_1.default({
                onlyUseAvailableItems,
                exceededThreshold: exceededThirstThreshold,
                onlyEmergencies: false,
            }));
            objectives.push(new RecoverHunger_1.default(onlyUseAvailableItems, exceededHungerThreshold));
            if (allowWaiting) {
                objectives.push(new RecoverThirst_1.default({
                    onlyUseAvailableItems,
                    exceededThreshold: exceededThirstThreshold,
                    onlyEmergencies: true,
                }));
            }
            return objectives;
        }
        optionsInterrupt() {
            return new OptionsInterrupt_1.default();
        }
        equipmentInterrupt(context) {
            if (context.options.lockEquipment) {
                return [];
            }
            const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
            return [
                handEquipmentChange ? new EquipItem_1.default(handEquipmentChange.equipType, handEquipmentChange.item) : undefined,
                this.equipInterrupt(context, IHuman_1.EquipType.Chest),
                this.equipInterrupt(context, IHuman_1.EquipType.Legs),
                this.equipInterrupt(context, IHuman_1.EquipType.Head),
                this.equipInterrupt(context, IHuman_1.EquipType.Waist),
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
                this.log.info(`Going to equip ${itemToEquip} (score: ${this.utilities.item.calculateEquipItemScore(itemToEquip)}) in slot ${IHuman_1.EquipType[equip]}.${item ? ` Replacing ${item} (score: ${this.utilities.item.calculateEquipItemScore(item)})` : ""}`);
                if (item !== undefined) {
                    return new UnequipItem_1.default(item);
                }
                return new EquipItem_1.default(equip, itemToEquip);
            }
        }
        repairsInterrupt(context) {
            if (this.inventory.hammer === undefined) {
                return undefined;
            }
            const queuedRepairs = new Set();
            const objectives = [
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.MainHand)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.OffHand)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Chest)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Legs)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Head)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Waist)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Feet)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Neck)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Hands)),
                this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(IHuman_1.EquipType.Back)),
                this.repairInterrupt(context, queuedRepairs, this.inventory.knife),
                this.repairInterrupt(context, queuedRepairs, this.inventory.butcher),
                this.repairInterrupt(context, queuedRepairs, this.inventory.fireStarter),
                this.repairInterrupt(context, queuedRepairs, this.inventory.hoe),
                this.repairInterrupt(context, queuedRepairs, this.inventory.axe),
                this.repairInterrupt(context, queuedRepairs, this.inventory.pickAxe),
                this.repairInterrupt(context, queuedRepairs, this.inventory.shovel),
                this.repairInterrupt(context, queuedRepairs, this.inventory.equipSword),
                this.repairInterrupt(context, queuedRepairs, this.inventory.equipShield),
                this.repairInterrupt(context, queuedRepairs, this.inventory.tongs),
                this.repairInterrupt(context, queuedRepairs, this.inventory.bed),
                this.repairInterrupt(context, queuedRepairs, this.inventory.backpack),
                this.repairInterrupt(context, queuedRepairs, this.inventory.waterContainer),
                this.repairInterrupt(context, queuedRepairs, this.inventory.fishing),
            ];
            return objectives.filter(objective => objective !== undefined);
        }
        repairInterrupt(context, queuedRepairs, itemOrItems) {
            for (const item of (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems])) {
                if (item === undefined || item.durability === undefined || item.durabilityMax === undefined || queuedRepairs.has(item)) {
                    return undefined;
                }
                const threshold = this.utilities.base.isNearBase(context) ? 0.2 : 0.1;
                if (item.durability / item.durabilityMax >= threshold) {
                    return undefined;
                }
                if (this.inventory.waterContainer?.includes(item) && context.human.stat.get(IStats_1.Stat.Thirst).value < 2) {
                    return undefined;
                }
                queuedRepairs.add(item);
                return new RepairItem_1.default(item);
            }
        }
        nearbyCreatureInterrupt(context) {
            const shouldRunAwayFromAllCreatures = context.utilities.creature.shouldRunAwayFromAllCreatures(context);
            for (const facingDirecton of Direction_1.Direction.CARDINALS) {
                const creature = this.checkNearbyCreature(context, facingDirecton);
                if (creature !== undefined) {
                    const tamingCreature = context.getData(IContext_1.ContextDataType.TamingCreature);
                    if (tamingCreature && tamingCreature === creature) {
                        this.log.info(`Not defending against ${creature.getName().getString()} because we're trying to tame it`);
                        continue;
                    }
                    const shouldRunAway = shouldRunAwayFromAllCreatures || context.utilities.creature.isScaredOfCreature(context, creature);
                    this.log.info(`Defend against ${creature.getName().getString()}. Should run away: ${shouldRunAway}`);
                    return new DefendAgainstCreature_1.default(creature, shouldRunAway);
                }
            }
            const nearbyCreatures = context.utilities.creature.getNearbyCreatures(context);
            for (const creature of nearbyCreatures) {
                if (shouldRunAwayFromAllCreatures || context.utilities.creature.isScaredOfCreature(context, creature)) {
                    const path = creature.findPath(context.human.tile, creature.getMoveType(), 16, context.human);
                    if (path) {
                        this.log.info(`Run away from ${creature.getName().getString()}`);
                        return new RunAwayFromTarget_1.default(creature);
                    }
                }
            }
        }
        checkNearbyCreature(context, direction) {
            const point = Vector2_1.default.DIRECTIONS[direction];
            const tile = context.island.getTileSafe(context.human.x + point.x, context.human.y + point.y, context.human.z);
            if (tile && tile.creature && !tile.creature.isTamed()) {
                return tile.creature;
            }
        }
        buildItemObjectives(context) {
            return this.utilities.item.getItemsToBuild(context).map(item => new BuildItem_1.default(item));
        }
        gatherFromCorpsesInterrupt(context) {
            if (!this.inventory.butcher) {
                return undefined;
            }
            const targets = this.utilities.object.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2_1.default.distance(context.human, corpse) < 16);
            const objectives = [];
            for (const target of targets) {
                const tile = target.tile;
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
        reduceWeightInterrupt(context) {
            const exceededStaminaThreshold = context.human.stat.get(IStats_1.Stat.Stamina).value <= this.utilities.player.getRecoverThreshold(context, IStats_1.Stat.Stamina);
            return new ReduceWeight_1.default({
                allowChests: !exceededStaminaThreshold || this.weightStatus !== IPlayer_1.WeightStatus.Overburdened,
                allowReservedItems: exceededStaminaThreshold && this.weightStatus === IPlayer_1.WeightStatus.Overburdened && !this.utilities.base.isNearBase(context),
                allowInventoryItems: exceededStaminaThreshold && this.weightStatus === IPlayer_1.WeightStatus.Overburdened,
                disableDrop: this.weightStatus !== IPlayer_1.WeightStatus.Overburdened && !this.utilities.base.isNearBase(context),
            });
        }
        returnToBaseInterrupt(context) {
            if (context.getData(IContext_1.ContextDataType.MovingToNewIsland) !== IContext_1.MovingToNewIslandState.Ready &&
                this.weightStatus !== IPlayer_1.WeightStatus.None &&
                this.previousWeightStatus === IPlayer_1.WeightStatus.Overburdened &&
                !this.utilities.base.isNearBase(context) &&
                context.utilities.item.getUnusedItems(context).length > 0) {
                return new MoveToBase_1.default();
            }
        }
        escapeCavesInterrupt(context) {
            if (!context.options.allowCaves && context.human.z === WorldZ_1.WorldZ.Cave) {
                return new MoveToZ_1.default(WorldZ_1.WorldZ.Overworld);
            }
        }
        organizeInventoryInterrupts(context, interruptContext, walkPath) {
            if (context.getDataOrDefault(IContext_1.ContextDataType.DisableMoveAwayFromBaseItemOrganization, false) ||
                context.getData(IContext_1.ContextDataType.MovingToNewIsland) === IContext_1.MovingToNewIslandState.Ready) {
                return undefined;
            }
            walkPath ??= context.human.walkPath?.path;
            if (walkPath === undefined || walkPath.length === 0) {
                return undefined;
            }
            if (!this.utilities.base.isNearBase(context)) {
                return undefined;
            }
            const target = walkPath[walkPath.length - 1];
            const point = { x: target.x, y: target.y, z: context.human.z };
            if (this.utilities.base.isNearBase(context, point) &&
                context.island.getTileFromPoint(point).type !== ITerrain_1.TerrainType.CaveEntrance) {
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
            this.log.info(objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space", `Reserved items: ${reservedItems.join(",")}`, `Unused items: ${unusedItems.join(",")}`, `Context reserved items: ${Array.from(context.state.reservedItems ?? []).map(reserved => `${reserved[0].id}=${reserved[1]}`).join(",")}`, `Interrupt context hard reserved items: ${Array.from(interruptContext?.state.reservedItems ?? []).map(reserved => `${reserved[0].id}=${reserved[1]}`).join(",")}`, `Objectives: ${Plan_1.default.getPipelineString(this.context, objectives)}`);
            return objectives;
        }
        organizeBackpackInterrupts(context, backpacks) {
            const objectives = [];
            const itemsToMove = context.utilities.item.getItemsInInventory(context)
                .filter(item => !item.isEquipped(true) && !context.island.items.isContainer(item) && item.containedWithin === context.human.inventory)
                .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
            if (itemsToMove.length > 0) {
                for (const backpack of backpacks) {
                    const backpackContainer = backpack;
                    let weight = context.island.items.computeContainerWeight(backpackContainer);
                    const weightCapacity = context.island.items.getWeightCapacity(backpackContainer);
                    if (weightCapacity === undefined) {
                        continue;
                    }
                    while (itemsToMove.length > 0) {
                        const itemToMove = itemsToMove[0];
                        const itemToMoveWeight = itemToMove.getTotalWeight(undefined, backpackContainer);
                        if (weight + itemToMoveWeight < weightCapacity) {
                            objectives.push(new ExecuteAction_1.default(MoveItem_1.default, [itemToMove, backpackContainer])
                                .setStatus(`Moving ${itemToMove.getName()} into ${backpack.getName()}`));
                            weight += itemToMoveWeight;
                            itemsToMove.shift();
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            return objectives;
        }
        processQueuedNavigationUpdates() {
            if (this.navigationSystemState !== ITars_1.NavigationSystemState.Initialized || this.human.isResting()) {
                return;
            }
            for (const queuedUpdate of this.navigationQueuedUpdates) {
                queuedUpdate();
            }
            this.navigationQueuedUpdates.length = 0;
        }
        processQuantumBurst() {
            if (!this.isRunning() || !this.isQuantumBurstEnabled()) {
                return;
            }
            this.context.human.nextMoveTime = 0;
            this.context.human.movingClientside = IHuman_1.MovingClientSide.NoInput;
            this.context.human.attackAnimationTime = undefined;
            while (this.context.human.hasDelay()) {
                game.absoluteTime += 100;
            }
        }
        getDialogSubId() {
            return this.asNPC ? this.human.identifier.toString() : "";
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
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.ItemManager, "remove")
    ], Tars.prototype, "onItemRemove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.CreatureManager, "remove")
    ], Tars.prototype, "onCreatureRemove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.CorpseManager, "remove")
    ], Tars.prototype, "onCorpseRemove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "restEnd")
    ], Tars.prototype, "onRestEnd", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Creatures, "postMove")
    ], Tars.prototype, "onCreaturePostMove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.NPCs, "renamed")
    ], Tars.prototype, "onNpcRenamed", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "postMove")
    ], Tars.prototype, "onHumanPostMove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "moveComplete")
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
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "processInput")
    ], Tars.prototype, "processInput", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "changeZ")
    ], Tars.prototype, "onChangeZ", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "preMove")
    ], Tars.prototype, "onPreMove", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "canAttack")
    ], Tars.prototype, "onCanAttack", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "statChanged")
    ], Tars.prototype, "onStatChange", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "statMaxChanged")
    ], Tars.prototype, "onStatMaxChanged", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Humans, "moveToIsland")
    ], Tars.prototype, "onMoveToIsland", null);
    __decorate([
        Decorators_1.Bound
    ], Tars.prototype, "getStatus", null);
    exports.default = Tars;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL1RhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBK0ZBLE1BQXFCLElBQUssU0FBUSxzQkFBWSxDQUFDLElBQWlCO1FBbUM1RCxZQUE0QixLQUFZLEVBQWtCLFFBQW1CLEVBQW1CLE9BQW9CLEVBQUUsaUJBQW9DO1lBQ3RKLEtBQUssRUFBRSxDQUFDO1lBRGdCLFVBQUssR0FBTCxLQUFLLENBQU87WUFBa0IsYUFBUSxHQUFSLFFBQVEsQ0FBVztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBdkJuRywwQkFBcUIsR0FBNEIsRUFBRSxDQUFDO1lBQzdELHlCQUFvQixHQUFHLENBQUMsQ0FBQztZQVNoQixzQkFBaUIsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUs3RCwwQkFBcUIsR0FBMEIsNkJBQXFCLENBQUMsY0FBYyxDQUFDO1lBRTNFLDRCQUF1QixHQUFzQixFQUFFLENBQUM7WUFFaEQsY0FBUyxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRXpELFdBQU0sR0FBRyxLQUFLLENBQUM7WUFLbkIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHdCQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUV4QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUVuRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0MsSUFB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