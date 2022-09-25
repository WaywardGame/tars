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
        constructor(human, saveData, overlay) {
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
                navigation: new Navigation_1.default(this.log, human, overlay),
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
                                this.utilities.navigation.onTileUpdate(otherTile, TileHelpers_1.default.getType(otherTile), point.x, point.y, point.z, this.utilities.base.isBaseTile(this.getContext(), otherTile), undefined, tileUpdateType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL1RhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBNkZBLE1BQXFCLElBQUssU0FBUSxzQkFBWSxDQUFDLElBQWlCO1FBbUM1RCxZQUE0QixLQUFZLEVBQWtCLFFBQW1CLEVBQW1CLE9BQW9CO1lBQ2hILEtBQUssRUFBRSxDQUFDO1lBRGdCLFVBQUssR0FBTCxLQUFLLENBQU87WUFBa0IsYUFBUSxHQUFSLFFBQVEsQ0FBVztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBdkJuRywwQkFBcUIsR0FBNEIsRUFBRSxDQUFDO1lBQzdELHlCQUFvQixHQUFHLENBQUMsQ0FBQztZQVNoQixzQkFBaUIsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUs3RCwwQkFBcUIsR0FBMEIsNkJBQXFCLENBQUMsY0FBYyxDQUFDO1lBRTNFLDRCQUF1QixHQUFzQixFQUFFLENBQUM7WUFFaEQsY0FBUyxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRXpELFdBQU0sR0FBRyxLQUFLLENBQUM7WUFLbkIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHdCQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUV4QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUVuRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLFNBQVMs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