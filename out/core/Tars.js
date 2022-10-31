var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventEmitter", "event/EventManager", "game/entity/action/actions/MoveItem", "game/entity/action/actions/Rename", "game/entity/action/actions/Respawn", "game/entity/action/actions/UpdateWalkPath", "game/entity/IHuman", "game/entity/IStats", "game/entity/player/IPlayer", "game/IGame", "game/item/IItem", "game/meta/prompt/IPrompt", "game/tile/ITerrain", "game/WorldZ", "language/dictionary/InterruptChoice", "renderer/IRenderer", "utilities/Decorators", "utilities/game/TileHelpers", "utilities/Log", "utilities/math/Direction", "utilities/math/Vector2", "utilities/object/Objects", "utilities/promise/Async", "utilities/promise/ResolvablePromise", "../ITarsMod", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/core/ExecuteAction", "../objectives/core/MoveToTarget", "../objectives/interrupt/ButcherCorpse", "../objectives/interrupt/DefendAgainstCreature", "../objectives/interrupt/OptionsInterrupt", "../objectives/interrupt/ReduceWeight", "../objectives/interrupt/RepairItem", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../objectives/other/item/UnequipItem", "../objectives/other/RunAwayFromTarget", "../objectives/recover/RecoverHealth", "../objectives/recover/RecoverHunger", "../objectives/recover/RecoverStamina", "../objectives/recover/RecoverThirst", "../objectives/utility/moveTo/MoveToBase", "../objectives/utility/moveTo/MoveToZ", "../objectives/utility/OrganizeInventory", "../utilities/Action", "../utilities/Base", "../utilities/Creature", "../utilities/Doodad", "../utilities/Item", "../utilities/Logger", "../utilities/Movement", "../utilities/Object", "../utilities/Player", "../utilities/Tile", "./context/Context", "./context/IContext", "./Executor", "./ITars", "./mode/Modes", "./navigation/Navigation", "./objective/Objective", "./planning/Plan", "./planning/Planner"], function (require, exports, EventBuses_1, EventEmitter_1, EventManager_1, MoveItem_1, Rename_1, Respawn_1, UpdateWalkPath_1, IHuman_1, IStats_1, IPlayer_1, IGame_1, IItem_1, IPrompt_1, ITerrain_1, WorldZ_1, InterruptChoice_1, IRenderer_1, Decorators_1, TileHelpers_1, Log_1, Direction_1, Vector2_1, Objects_1, Async_1, ResolvablePromise_1, ITarsMod_1, AnalyzeBase_1, AnalyzeInventory_1, ExecuteAction_1, MoveToTarget_1, ButcherCorpse_1, DefendAgainstCreature_1, OptionsInterrupt_1, ReduceWeight_1, RepairItem_1, BuildItem_1, EquipItem_1, UnequipItem_1, RunAwayFromTarget_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, MoveToBase_1, MoveToZ_1, OrganizeInventory_1, Action_1, Base_1, Creature_1, Doodad_1, Item_1, Logger_1, Movement_1, Object_1, Player_1, Tile_1, Context_1, IContext_1, Executor_1, ITars_1, Modes_1, Navigation_1, Objective_1, Plan_1, Planner_1) {
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
        async onCreaturePostMove(creature, fromX, fromY, fromZ, fromTile, toX, toY, toZ, toTile) {
            if (!this.isRunning()) {
                return;
            }
            const objective = this.getCurrentObjective();
            if (objective !== undefined) {
                const result = await objective.onMove(this.context);
                if (result === true) {
                    this.fullInterrupt("Target creature moved");
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
        async onHumanPostMove(human, fromX, fromY, fromZ, fromTile, toX, toY, toZ, toTile) {
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
            this.utilities.movement.clearOverlay(human.getTile());
        }
        onPrompt(host, prompt) {
            if (this.isRunning() && (prompt.type === IPrompt_1.Prompt.GameDangerousStep || prompt.type === IPrompt_1.Prompt.GameIslandTravelConfirmation)) {
                this.log.info(`Resolving true for prompt ${IPrompt_1.Prompt[prompt.type]}`);
                prompt.resolve(InterruptChoice_1.default.Yes);
            }
        }
        onTileUpdate(island, tile, tileX, tileY, tileZ, tileUpdateType) {
            if (island !== this.human.island) {
                return;
            }
            if (this.navigationSystemState === ITars_1.NavigationSystemState.Initializing || this.human.isResting()) {
                this.navigationQueuedUpdates.push(() => {
                    this.onTileUpdate(island, tile, tileX, tileY, tileZ, tileUpdateType);
                });
            }
            else if (this.navigationSystemState === ITars_1.NavigationSystemState.Initialized) {
                const updateNeighbors = tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn;
                if (updateNeighbors) {
                    for (let x = -Navigation_1.tileUpdateRadius; x <= Navigation_1.tileUpdateRadius; x++) {
                        for (let y = -Navigation_1.tileUpdateRadius; y <= Navigation_1.tileUpdateRadius; y++) {
                            const point = island.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                            if (point) {
                                const otherTile = island.getTileFromPoint(point);
                                this.utilities.navigation.onTileUpdate(island, otherTile, TileHelpers_1.default.getType(otherTile), point.x, point.y, point.z, this.utilities.base.isBaseTile(this.getContext(), otherTile), tileUpdateType);
                            }
                        }
                    }
                }
                else {
                    this.utilities.navigation.onTileUpdate(island, tile, TileHelpers_1.default.getType(tile), tileX, tileY, tileZ, this.utilities.base.isBaseTile(this.getContext(), tile), tileUpdateType);
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
        onPreMove(human, prevX, prevY, prevZ, prevTile, nextX, nextY, nextZ, nextTile) {
            if (this.human !== human || !this.isRunning() || !human.hasWalkPath()) {
                return;
            }
            if ((nextTile.npc && nextTile.npc !== this.human) || (nextTile.doodad && nextTile.doodad.blocksMove()) || human.island.isPlayerAtTile(nextTile, false, true)) {
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
                    this.overlay.show();
                    renderers.updateView(IRenderer_1.RenderSource.Mod, false);
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
                    const baseDoodads = this.utilities.base.getBaseDoodads(this.getContext());
                    for (const doodad of baseDoodads) {
                        this.utilities.navigation.refreshOverlay(localIsland, doodad.getTile(), doodad.x, doodad.y, doodad.z, false);
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
            for (const facingDirecton of Direction_1.Direction.CARDINALS_AND_NONE) {
                const creature = this.checkNearbyCreature(context, facingDirecton);
                if (creature !== undefined) {
                    const tamingCreature = context.getData(IContext_1.ContextDataType.TamingCreature);
                    if (tamingCreature && tamingCreature === creature) {
                        this.log.info(`Not defending against ${creature.getName().getString()} because we're trying to tame it`);
                        continue;
                    }
                    this.log.info(`Defend against ${creature.getName().getString()}`);
                    return new DefendAgainstCreature_1.default(creature, shouldRunAwayFromAllCreatures || context.utilities.creature.isScaredOfCreature(context, creature));
                }
            }
            const nearbyCreatures = context.utilities.creature.getNearbyCreatures(context);
            for (const creature of nearbyCreatures) {
                if (shouldRunAwayFromAllCreatures || context.utilities.creature.isScaredOfCreature(context, creature)) {
                    const path = creature.findPath(context.human, 16, context.human);
                    if (path) {
                        this.log.info(`Run away from ${creature.getName().getString()}`);
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
                TileHelpers_1.default.getType(context.island.getTileFromPoint(point)) !== ITerrain_1.TerrainType.CaveEntrance) {
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