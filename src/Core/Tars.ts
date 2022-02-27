import { EventBus } from "event/EventBuses";
import EventEmitter, { Priority } from "event/EventEmitter";
import EventManager, { EventHandler } from "event/EventManager";
import type { IActionApi } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import type Creature from "game/entity/creature/Creature";
import type { DamageType } from "game/entity/IEntity";
import { EquipType } from "game/entity/IHuman";
import type { IStatMax, IStat } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { WeightStatus } from "game/entity/player/IPlayer";
import type { INote } from "game/entity/player/note/NoteManager";
import type Player from "game/entity/player/Player";
import { TileUpdateType } from "game/IGame";
import type Island from "game/island/Island";
import type { ItemTypeGroup } from "game/item/IItem";
import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import { WorldZ } from "game/WorldZ";
import type { IPromptDescriptionBase } from "game/meta/prompt/IPrompt";
import { Prompt } from "game/meta/prompt/IPrompt";
import type { IPrompt } from "game/meta/prompt/Prompts";
import type Prompts from "game/meta/prompt/Prompts";
import { ITile, TerrainType } from "game/tile/ITerrain";
import InterruptChoice from "language/dictionary/InterruptChoice";
import { Bound } from "utilities/Decorators";
import TileHelpers from "utilities/game/TileHelpers";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";
import { sleep } from "utilities/promise/Async";
import ResolvablePromise from "utilities/promise/ResolvablePromise";

import type { ISaveData } from "../ITarsMod";
import { TarsTranslation } from "../ITarsMod";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import ExecuteAction from "../objectives/core/ExecuteAction";
import ButcherCorpse from "../objectives/interrupt/ButcherCorpse";
import DefendAgainstCreature from "../objectives/interrupt/DefendAgainstCreature";
import OptionsInterrupt from "../objectives/interrupt/OptionsInterrupt";
import ReduceWeight from "../objectives/interrupt/ReduceWeight";
import RepairItem from "../objectives/interrupt/RepairItem";
import BuildItem from "../objectives/other/item/BuildItem";
import EquipItem from "../objectives/other/item/EquipItem";
import UnequipItem from "../objectives/other/item/UnequipItem";
import ReturnToBase from "../objectives/other/ReturnToBase";
import RunAwayFromTarget from "../objectives/other/RunAwayFromTarget";
import RecoverHealth from "../objectives/recover/RecoverHealth";
import RecoverHunger from "../objectives/recover/RecoverHunger";
import RecoverStamina from "../objectives/recover/RecoverStamina";
import RecoverThirst from "../objectives/recover/RecoverThirst";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import { ActionUtilities } from "../utilities/Action";
import { BaseUtilities } from "../utilities/Base";
import { creatureUtilities } from "../utilities/Creature";
import { ItemUtilities } from "../utilities/Item";
import { log } from "../utilities/Logger";
import { MovementUtilities } from "../utilities/Movement";
import { ObjectUtilities } from "../utilities/Object";
import { PlayerUtilities } from "../utilities/Player";
import { TileUtilities } from "../utilities/Tile";
import Context from "./context/Context";
import { ContextDataType, MovingToNewIslandState } from "./context/IContext";
import executor, { ExecuteObjectivesResultType } from "./Executor";
import { IBase, IInventoryItems, IResetOptions, ITarsEvents, IUtilities, tickSpeed, TarsMode, NavigationSystemState, QuantumBurstStatus } from "./ITars";
import type { ITarsMode } from "./mode/IMode";
import { modes } from "./mode/Modes";
import { tileUpdateRadius } from "./navigation/Navigation";
import Navigation from "./navigation/Navigation";
import type { IObjective } from "./objective/IObjective";
import { ObjectiveResult } from "./objective/IObjective";
import planner from "./planning/Planner";
import Plan from "./planning/Plan";
import { DoodadUtilities } from "../utilities/Doodad";
import { TarsOverlay } from "../ui/TarsOverlay";
import Human from "game/entity/Human";
import NPC from "game/entity/npc/NPC";
import ItemManager from "game/item/ItemManager";
import MoveToTarget from "../objectives/core/MoveToTarget";
import CorpseManager from "game/entity/creature/corpse/CorpseManager";
import Corpse from "game/entity/creature/corpse/Corpse";
import { ITarsOptions } from "./ITarsOptions";
import Objective from "./objective/Objective";
import MoveToZ from "../objectives/utility/moveTo/MoveToZ";

export default class Tars extends EventEmitter.Host<ITarsEvents> {

    private base: IBase;
    private inventory: IInventoryItems;
    private readonly utilities: IUtilities;

    private readonly statThresholdExceeded: Record<number, boolean> = {};
    private quantumBurstCooldown = 0;
    private weightStatus: WeightStatus | undefined;
    private previousWeightStatus: WeightStatus | undefined;
    private lastStatusMessage: string | undefined;

    private context: Context;
    private objectivePipeline: Array<IObjective | IObjective[]> | undefined;
    private interruptObjectivePipeline: Array<IObjective | IObjective[]> | undefined;
    private interruptContext: Context | undefined;
    private readonly interruptContexts: Map<number, Context> = new Map();
    private interruptIds: Set<string> | undefined;

    private tickTimeoutId: number | undefined;

    private navigationSystemState: NavigationSystemState = NavigationSystemState.NotInitialized;
    private navigationUpdatePromise: ResolvablePromise | undefined;
    private readonly navigationQueuedUpdates: Array<() => void> = [];

    private readonly modeCache: Map<TarsMode, ITarsMode> = new Map();

    private loaded = false;

    constructor(private readonly human: Human, private readonly saveData: ISaveData, private readonly overlay: TarsOverlay) {
        super();

        this.utilities = {
            action: new ActionUtilities(),
            base: new BaseUtilities(),
            doodad: new DoodadUtilities(),
            item: new ItemUtilities(),
            movement: new MovementUtilities(),
            navigation: new Navigation(human, overlay),
            object: new ObjectUtilities(),
            overlay: this.overlay,
            player: new PlayerUtilities(),
            tile: new TileUtilities(),

            ensureSailingMode: (sailingMode) => this.ensureSailingMode(sailingMode),
        };

        log.info("Created TARS instance");
    }

    private delete() {
        this.reset({
            delete: true,
        });

        this.navigationSystemState = NavigationSystemState.NotInitialized;
        this.navigationQueuedUpdates.length = 0;

        this.utilities.navigation.unload();

        log.info("Deleted TARS instance");
    }

    public load() {
        if (this.loaded) {
            return;
        }

        this.loaded = true;

        this.reset({
            resetInventory: true,
            resetBase: true,
        });

        // this.delete();

        this.utilities.navigation.load();

        EventManager.registerEventBusSubscriber(this);

        // log.info("Loaded");
    }

    public unload() {
        if (!this.loaded) {
            return;
        }

        this.loaded = false;

        this.delete();

        EventManager.deregisterEventBusSubscriber(this);

        this.event.emit("unload");

        // log.info("Unloaded");
    }

    public disable(gameIsTravelingOrEnding: boolean = false) {
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
            OptionsInterrupt.restore(player);
        }

        if (!gameIsTravelingOrEnding && this.saveData.options.mode === TarsMode.Manual) {
            this.updateOptions({ mode: TarsMode.Survival });
        }

        this.updateStatus();
    }

    ////////////////////////////////////////////////
    // Event Handlers

    @EventHandler(EventBus.LocalPlayer, "spawn")
    public onPlayerSpawn(player: Player) {
        if (!this.saveData.configuredThresholds) {
            this.saveData.configuredThresholds = true;

            this.saveData.options.recoverThresholdHealth = Math.round(player.stat.get<IStatMax>(Stat.Health).max * 0.6);
            this.saveData.options.recoverThresholdStamina = Math.round(player.stat.get<IStatMax>(Stat.Stamina).max * 0.25);
            this.saveData.options.recoverThresholdHunger = Math.round(player.stat.get<IStatMax>(Stat.Hunger).max * 0.40);
            this.saveData.options.recoverThresholdThirst = 10;
            this.saveData.options.recoverThresholdThirstFromMax = -10;

            log.info(`Configured recover thresholds. health: ${this.saveData.options.recoverThresholdHealth}. stamina: ${this.saveData.options.recoverThresholdStamina}. hunger: ${this.saveData.options.recoverThresholdHunger}`);
        }
    }

    @EventHandler(EventBus.Players, "writeNote")
    public onWriteNote(player: Player, note: INote): false | void {
        if (this.human !== player || !this.isRunning()) {
            return;
        }

        // hide notes
        return false;
    }

    @EventHandler(EventBus.LocalPlayer, "die")
    public onPlayerDeath() {
        if (this.human !== localPlayer) {
            return;
        }

        this.fullInterrupt("Human died");
        this.utilities.movement.resetMovementOverlays();
    }

    @EventHandler(EventBus.LocalPlayer, "respawn")
    public onPlayerRespawn() {
        if (this.human !== localPlayer) {
            return;
        }

        this.fullInterrupt("Human respawned");
        this.utilities.movement.resetMovementOverlays();

        if (this.navigationSystemState === NavigationSystemState.Initialized) {
            this.utilities.navigation.queueUpdateOrigin(this.human);
        }
    }

    @EventHandler(EventBus.LocalPlayer, "processMovement")
    public async processMovement(player: Player): Promise<void> {
        if (this.human !== player || !this.isRunning()) {
            return;
        }

        if (this.navigationSystemState === NavigationSystemState.Initialized) {
            this.utilities.navigation.queueUpdateOrigin(player);
        }

        this.processQuantumBurst();

        const objective = this.getCurrentObjective();
        if (objective !== undefined) {
            const result = await objective.onMove(this.context);
            if (result === true) {
                this.fullInterrupt("Target moved");

            } else if (result) {
                this.interrupt("Target moved", result);
            }
        }
    }

    @EventHandler(EventBus.ItemManager, "remove")
    public onItemRemove(_: ItemManager, item: Item) {
        if (!this.isRunning()) {
            return;
        }

        const objective = this.getCurrentObjective();
        if (objective !== undefined && objective instanceof MoveToTarget) {
            const result = objective.onItemRemoved(this.context, item);
            if (result === true) {
                this.fullInterrupt(`${item} was removed`);
            }
        }

        // if (this.context.isSoftReservedItem(item)) {
        //     // we have a problem if the is still needed in more of the pipeline..
        // }
    }

    @EventHandler(EventBus.CorpseManager, "remove")
    public onCorpseRemove(_: CorpseManager, corpse: Corpse) {
        if (!this.isRunning()) {
            return;
        }

        const objective = this.getCurrentObjective();
        if (objective !== undefined && objective instanceof MoveToTarget) {
            const result = objective.onCorpseRemoved(this.context, corpse);
            if (result === true) {
                this.fullInterrupt(`${corpse} was removed`);
            }
        }
    }

    @EventHandler(EventBus.Players, "restEnd")
    public onRestEnd(player: Player) {
        if (this.human !== player) {
            return;
        }

        this.processQueuedNavigationUpdates();
    }

    @EventHandler(EventBus.NPCs, "postMove")
    public async onPostMove(npc: NPC, fromX: number, fromY: number, fromZ: number, fromTile: ITile, toX: number, toY: number, toZ: number, toTile: ITile) {
        if (this.human !== npc) {
            return;
        }

        this.utilities.movement.clearOverlay(toTile);

        // todo: sync this up with regular player logic

        if (this.navigationSystemState === NavigationSystemState.Initialized) {
            this.utilities.navigation.queueUpdateOrigin(npc);
        }

        this.processQuantumBurst();

        const objective = this.getCurrentObjective();
        if (objective !== undefined) {
            const result = await objective.onMove(this.context);
            if (result === true) {
                this.fullInterrupt("Target moved");

            } else if (result) {
                this.interrupt("Target moved", result);
            }
        }
    }

    @EventHandler(EventBus.Players, "moveComplete")
    public onMoveComplete(player: Player) {
        if (this.human !== player) {
            return;
        }

        this.utilities.movement.clearOverlay(player.getTile());
    }

    @EventHandler(EventBus.Prompt, "queue", Priority.High)
    public onPrompt(host: Prompts.Events, prompt: IPrompt<IPromptDescriptionBase<any[]>>): string | boolean | void | InterruptChoice | undefined {
        if (this.isRunning() && (prompt.type === Prompt.GameDangerousStep || prompt.type === Prompt.GameIslandTravelConfirmation)) {
            log.info(`Resolving true for prompt ${Prompt[prompt.type]}`);
            prompt.resolve(InterruptChoice.Yes as any);
        }
    }

    @EventHandler(EventBus.Island, "tileUpdate")
    public onTileUpdate(island: Island, tile: ITile, tileX: number, tileY: number, tileZ: number, tileUpdateType: TileUpdateType): void {
        if (island !== this.human.island) {
            return;
        }

        if (this.navigationSystemState === NavigationSystemState.Initializing || this.human.isResting()) {
            this.navigationQueuedUpdates.push(() => {
                this.onTileUpdate(island, tile, tileX, tileY, tileZ, tileUpdateType);
            });

        } else if (this.navigationSystemState === NavigationSystemState.Initialized) {
            const updateNeighbors = tileUpdateType === TileUpdateType.Creature || tileUpdateType === TileUpdateType.CreatureSpawn;
            if (updateNeighbors) {
                for (let x = -tileUpdateRadius; x <= tileUpdateRadius; x++) {
                    for (let y = -tileUpdateRadius; y <= tileUpdateRadius; y++) {
                        const point = island.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                        if (point) {
                            const otherTile = island.getTileFromPoint(point);
                            this.utilities.navigation.onTileUpdate(
                                otherTile,
                                TileHelpers.getType(otherTile),
                                tileX + x, tileY + y, tileZ,
                                this.utilities.base.isBaseTile(this.getContext(), otherTile),
                                undefined, tileUpdateType);
                        }
                    }
                }

            } else {
                this.utilities.navigation.onTileUpdate(
                    tile,
                    TileHelpers.getType(tile),
                    tileX, tileY, tileZ,
                    this.utilities.base.isBaseTile(this.getContext(), tile),
                    undefined, tileUpdateType);
            }
        }
    }

    @EventHandler(EventBus.Actions, "postExecuteAction")
    public postExecuteAction(_: any, actionType: ActionType, api: IActionApi, args: any[]): void {
        if (this.human !== api.executor) {
            return;
        }

        this.processQuantumBurst();

        this.utilities.action.postExecuteAction(api.type);
    }

    @EventHandler(EventBus.Players, "processInput")
    public processInput(player: Player): boolean | undefined {
        if (this.human !== player || !this.isRunning()) {
            return;
        }

        this.processQuantumBurst();

        return undefined;
    }

    @EventHandler(EventBus.Humans, "walkPathChange")
    public onWalkPathChange(human: Human, walkPath: IVector2[] | undefined) {
        if (this.human !== human || !this.isRunning() || !walkPath || walkPath.length === 0) {
            return;
        }

        const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext);
        if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
            this.interrupt("Organize inventory", ...organizeInventoryInterrupts);
        }
    }

    @EventHandler(EventBus.Humans, "changeZ")
    public onChangeZ(human: Human, z: WorldZ, lastZ: WorldZ) {
        if (this.human !== human || !this.isRunning()) {
            return;
        }

        if (this.navigationSystemState === NavigationSystemState.Initialized) {
            this.utilities.navigation.queueUpdateOrigin(this.human);
        }

        this.fullInterrupt(`Interrupting due to z movement from ${WorldZ[lastZ]} to ${WorldZ[z]}`);
    }

    @EventHandler(EventBus.Humans, "preMove")
    public onPreMove(human: Human, prevX: number, prevY: number, prevZ: number, prevTile: ITile, nextX: number, nextY: number, nextZ: number, nextTile: ITile) {
        if (this.human !== human || !this.isRunning() || !human.hasWalkPath()) {
            return;
        }

        if ((nextTile.npc && nextTile.npc !== this.human) || (nextTile.doodad && nextTile.doodad.blocksMove()) || human.island.isPlayerAtTile(nextTile, false, true)) {
            this.interrupt("Interrupting due to blocked movement");
        }
    }

    @EventHandler(EventBus.Humans, "statChanged")
    public onStatChange(human: Human, stat: IStat) {
        if (this.human !== human || !this.isRunning()) {
            return;
        }

        if (stat.type === Stat.Health || stat.type === Stat.Stamina || stat.type === Stat.Hunger || stat.type === Stat.Thirst) {
            const recoverThreshold = this.utilities.player.getRecoverThreshold(this.context, stat.type);
            if (stat.value <= recoverThreshold) {
                if (!this.statThresholdExceeded[stat.type]) {
                    this.statThresholdExceeded[stat.type] = true;

                    if (this.isRunning()) {
                        this.fullInterrupt(`Stat threshold exceeded for ${Stat[stat.type]}. ${stat.value} < ${recoverThreshold}`);
                    }
                }

            } else if (this.statThresholdExceeded[stat.type]) {
                this.statThresholdExceeded[stat.type] = false;
            }
        }

        switch (stat.type) {
            case Stat.Weight:
                executor.markWeightChanged();

                const weightStatus = human.getWeightStatus();
                if (this.weightStatus !== weightStatus) {
                    this.previousWeightStatus = this.weightStatus;

                    this.weightStatus = weightStatus;

                    if (weightStatus === WeightStatus.None) {
                        return;
                    }

                    if (this.isRunning()) {
                        // players weight status changed
                        // reset objectives so we'll handle this immediately
                        this.interrupt(`Weight status changed from ${this.previousWeightStatus !== undefined ? WeightStatus[this.previousWeightStatus] : "N/A"} to ${WeightStatus[this.weightStatus]}`);
                    }
                }

                break;
        }
    }

    @EventHandler(EventBus.LocalPlayer, "moveToIsland")
    public async onMoveToIsland() {
        if (this.isEnabled()) {
            this.disable(true);
        }

        this.delete();

        this.utilities.navigation.load();

        if (!this.isEnabled()) {
            return;
        }

        // this.fullInterrupt();

        this.toggle(true);
    }

    ////////////////////////////////////////////////

    public getContext(): Context {
        return this.context ?? new Context(this.human, this.base, this.inventory, this.utilities, this.saveData.options);
    }

    public isEnabled(): boolean {
        return this.saveData.enabled;
    }

    public isRunning(): boolean {
        return this.tickTimeoutId !== undefined;
    }

    public isQuantumBurstEnabled(): boolean {
        return this.isEnabled() && this.saveData.options.quantumBurst && !multiplayer.isConnected();
    }

    public async toggle(enabled = !this.saveData.enabled) {
        if (this.navigationSystemState === NavigationSystemState.Initializing) {
            return;
        }

        this.saveData.enabled = enabled;
        this.event.emit("enableChange", enabled);

        log.info(this.saveData.enabled ? "Enabled" : "Disabled");

        this.context = new Context(this.human, this.base, this.inventory, this.utilities, this.saveData.options);

        this.utilities.item.initialize(this.context);

        await this.ensureNavigation(!!this.context.human.vehicleItemReference);

        this.reset();

        if (this.saveData.enabled) {
            this.overlay.show();

            this.utilities.navigation.queueUpdateOrigin(this.human);

            this.tickTimeoutId = window.setTimeout(this.tick.bind(this), tickSpeed);

        } else {
            this.disable();
        }
    }

    public updateOptions(options: Partial<ITarsOptions>) {
        const changedOptions: Array<keyof ITarsOptions> = [];

        for (const key of (Object.keys(options) as Array<keyof ITarsOptions>)) {
            const newValue = options[key];
            if (newValue !== undefined && this.saveData.options[key] !== newValue) {
                (this.saveData.options as any)[key] = newValue;
                changedOptions.push(key);
            }
        }

        if (changedOptions.length > 0) {
            log.info(`Updating options: ${changedOptions.join(", ")}`);

            this.event.emit("optionsChange", this.saveData.options);

            let shouldInterrupt = this.isRunning();

            for (const changedOption of changedOptions) {
                switch (changedOption) {
                    case "mode":
                        shouldInterrupt = true;
                        break;

                    case "survivalExploreIslands":
                        this.context?.setData(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);
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
                            this.event.emit("quantumBurstChange", QuantumBurstStatus.Start);

                        } else {
                            this.quantumBurstCooldown = 2;
                        }

                        break;

                    case "debugLogging":
                        shouldInterrupt = false;
                        planner.debug = this.saveData.options.debugLogging;
                        break;
                }
            }

            if (shouldInterrupt) {
                this.fullInterrupt("Option changed");
            }
        }
    }

    public async activateManualMode(modeInstance: ITarsMode) {
        this.updateOptions({ mode: TarsMode.Manual });

        if (!this.isRunning()) {
            this.toggle();
        }

        await this.initializeMode(this.context, TarsMode.Manual, modeInstance);
    }

    @Bound
    public getStatus(): TarsTranslation | string {
        if (this.navigationSystemState === NavigationSystemState.Initializing) {
            return TarsTranslation.DialogStatusNavigatingInitializing;
        }

        if (!this.isRunning()) {
            return "Not running";
        }

        let statusMessage: string | undefined = "Idle";

        let planStatusMessage: string | undefined;

        const plan = executor.getPlan();
        if (plan !== undefined) {
            planStatusMessage = plan.tree.objective.getStatusMessage(this.context);
        }

        const objectivePipeline = this.objectivePipeline ?? this.interruptObjectivePipeline;
        if (objectivePipeline) {
            statusMessage = objectivePipeline.flat()[0].getStatusMessage(this.context);

            // todo: make this more generic. only show statusMessage if it's interesting
            if (!statusMessage) {
                statusMessage = planStatusMessage;

            } else if (planStatusMessage && planStatusMessage !== statusMessage &&
                statusMessage !== "Miscellaneous processing" && statusMessage !== "Calculating objective...") {
                statusMessage = `${planStatusMessage} - ${statusMessage}`;
            }

        } else if (planStatusMessage) {
            statusMessage = planStatusMessage;
        }

        if (statusMessage === undefined) {
            statusMessage = "Miscellaneous processing";

            if (plan) {
                log.warn("Missing status message for objective", plan.tree.objective.getIdentifier(this.context));
            }
        }

        if (this.lastStatusMessage !== statusMessage) {
            this.lastStatusMessage = statusMessage;
            log.info(`Status: ${statusMessage}`);
        }

        return statusMessage;
    }

    public updateStatus() {
        this.event.emit("statusChange", this.getStatus());
    }

    public async ensureSailingMode(sailingMode: boolean) {
        if (!this.utilities.navigation) {
            return;
        }

        if (this.navigationUpdatePromise) {
            return this.navigationUpdatePromise;
        }

        if (this.utilities.navigation.shouldUpdateSailingMode(sailingMode)) {
            log.info("Updating sailing mode", sailingMode);

            this.navigationUpdatePromise = new ResolvablePromise();

            this.navigationSystemState = NavigationSystemState.NotInitialized;

            await this.ensureNavigation(sailingMode);

            this.navigationUpdatePromise.resolve();
            this.navigationUpdatePromise = undefined;
        }
    }

    ////////////////////////////////////////////////

    /**
     * Ensure navigation is running and up to date
     */
    private async ensureNavigation(sailingMode: boolean) {
        if (this.navigationSystemState === NavigationSystemState.NotInitialized && this.utilities.navigation) {
            this.navigationSystemState = NavigationSystemState.Initializing;

            this.updateStatus();

            this.event.emit("navigationChange", this.navigationSystemState);

            // give a chance for the message to show up on screen before starting nav update
            await sleep(100);

            await this.utilities.navigation.updateAll(sailingMode);

            this.utilities.navigation.queueUpdateOrigin(this.human);

            this.navigationSystemState = NavigationSystemState.Initialized;

            this.processQueuedNavigationUpdates();

            this.event.emit("navigationChange", this.navigationSystemState);
        }
    }

    private async getOrCreateModeInstance(context: Context): Promise<ITarsMode> {
        const mode = this.saveData.options.mode;

        let modeInstance = this.modeCache.get(mode);
        if (!modeInstance) {
            const modeConstructor = modes.get(mode);
            if (!modeConstructor) {
                this.disable();
                throw new Error(`Missing mode initializer for ${TarsMode[mode]}`);
            }

            modeInstance = new modeConstructor();

            await this.initializeMode(context, mode, modeInstance);
        }

        return modeInstance;
    }

    private async initializeMode(context: Context, mode: TarsMode, modeInstance: ITarsMode) {
        log.info(`Initializing ${TarsMode[mode]}`);

        this.disposeMode(context, mode);

        this.modeCache.set(mode, modeInstance);

        EventManager.registerEventBusSubscriber(modeInstance);

        await modeInstance.initialize?.(context, (success: boolean) => {
            this.event.emit("modeFinished", mode, success);
            this.disable();
        });
    }

    private disposeMode(context: Context, mode: TarsMode) {
        const modeInstance = this.modeCache.get(mode);
        if (modeInstance) {
            modeInstance.dispose?.(this.context);
            EventManager.deregisterEventBusSubscriber(modeInstance);
            this.modeCache.delete(mode);

            log.info(`Disposed of "${TarsMode[mode]}" mode`);
        }
    }

    private reset(options?: Partial<IResetOptions>) {
        executor.reset();

        for (const mode of Array.from(this.modeCache.keys())) {
            if (options?.delete || mode !== TarsMode.Manual) {
                this.disposeMode(this.context, mode);
            }
        }

        this.lastStatusMessage = undefined;
        this.objectivePipeline = undefined;
        this.interruptObjectivePipeline = undefined;
        this.interruptIds = undefined;
        this.interruptContext = undefined;
        this.interruptContexts.clear();

        Objective.reset();

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
            this.context = undefined as any;
            this.modeCache.clear();

        } else if (options?.resetContext) {
            this.context = new Context(this.human, this.base, this.inventory, this.utilities, this.saveData.options);
        }
    }

    private clearCaches(): void {
        this.utilities.object.clearCache();
        this.utilities.tile.clearCache();
        this.utilities.item.clearCache();
        this.utilities.movement.clearCache();
    }

    private getCurrentObjective(): IObjective | undefined {
        const objective = this.interruptObjectivePipeline || this.objectivePipeline;
        if (objective !== undefined && !Array.isArray(objective[0])) {
            return objective[0];
        }

        return undefined;
    }

    private interrupt(reason: string, ...interruptObjectives: IObjective[]) {
        log.info(`Interrupt: ${reason}`, Plan.getPipelineString(this.context, interruptObjectives));

        executor.interrupt();

        this.objectivePipeline = undefined;

        if (interruptObjectives && interruptObjectives.length > 0) {
            this.interruptObjectivePipeline = interruptObjectives;
        }

        this.utilities.movement.resetMovementOverlays();
        this.human.walkAlongPath(undefined);
    }

    // todo: make this the default?
    private fullInterrupt(reason: string) {
        this.interrupt(reason);

        this.interruptObjectivePipeline = undefined;
        this.interruptIds = undefined;
    }

    private async tick() {
        try {
            if (this.context.human.hasDelay()) {
                this.processQuantumBurst();
            }

            await this.onTick();

            this.updateStatus();

        } catch (ex) {
            log.error("onTick error", ex);
        }

        if (this.tickTimeoutId === undefined) {
            this.disable();
            return;
        }

        if (this.context.human.hasDelay()) {
            this.processQuantumBurst();
        }

        this.tickTimeoutId = window.setTimeout(this.tick.bind(this), this.isQuantumBurstEnabled() ? game.interval : tickSpeed);
    }

    private async onTick() {
        if (!this.isRunning() || !executor.isReady(this.context, false)) {
            if (this.quantumBurstCooldown === 2) {
                this.quantumBurstCooldown--;
                this.event.emit("quantumBurstChange", QuantumBurstStatus.CooldownStart);
            }

            if (game.playing && this.context.human.isGhost() && game.getGameOptions().respawn && this.context.human.asPlayer) {
                await new ExecuteAction(ActionType.Respawn, (context, action) => {
                    action.execute(context.actionExecutor as Player);
                    return ObjectiveResult.Complete;
                }).execute(this.context);
            }

            return;
        }

        if (this.quantumBurstCooldown === 1) {
            this.quantumBurstCooldown--;
            this.event.emit("quantumBurstChange", QuantumBurstStatus.CooldownEnd);
        }

        this.clearCaches();

        await this.utilities.navigation.processQueuedOriginUpdate();

        // system objectives
        await executor.executeObjectives(this.context, [new AnalyzeInventory(), new AnalyzeBase()], false, false);

        // interrupts
        const modeInstance = await this.getOrCreateModeInstance(this.context);

        const interrupts = modeInstance.getInterrupts ?
            await modeInstance.getInterrupts(this.context) :
            this.getInterrupts(this.context);

        const interruptIds = new Set<string>(interrupts
            .filter(objective => Array.isArray(objective) ? objective.length > 0 : objective !== undefined)
            .map(objective => Array.isArray(objective) ? objective.map(o => o.getIdentifier(this.context)).join(" -> ") : objective!.getIdentifier(this.context)));

        let interruptsChanged = this.interruptIds === undefined && interruptIds.size > 0;
        if (!interruptsChanged && this.interruptIds !== undefined) {
            // change if a new interrupt was added - ignore removes
            for (const interruptId of interruptIds) {
                if (!this.interruptIds.has(interruptId)) {
                    // a new interrupt was added
                    interruptsChanged = true;
                    break;
                }
            }
        }

        if (interruptsChanged) {
            log.info(`Interrupts changed from ${this.interruptIds ? Array.from(this.interruptIds).join(", ") : undefined} to ${Array.from(interruptIds).join(", ")}`);
            this.interruptIds = interruptIds;
            this.interruptObjectivePipeline = undefined;
        }

        // log.debug("objectivePipeline", this.objectivePipeline?.map(objective => objective.getHashCode()).join(" -> "));
        // log.debug("interruptObjectivePipeline", this.interruptObjectivePipeline?.map(objective => objective.getHashCode()).join(" -> "));

        if (this.interruptObjectivePipeline || interrupts.length > 0) {
            if (!this.interruptContext) {
                // we should use our main context when running interrupt objectives
                // this will prevent interrupts from messing with reserved items
                // when the context is reset, it goes back to this initial state
                this.interruptContext = this.context.clone();
                this.interruptContext.setInitialState();

                this.interruptContexts.clear();

                log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
            }

            if (this.interruptObjectivePipeline) {
                const interruptHashCode = Plan.getPipelineString(this.context, this.interruptObjectivePipeline);

                log.info("Continuing interrupt execution", interruptHashCode);

                const result = await executor.executeObjectives(this.interruptContext, this.interruptObjectivePipeline, false);
                switch (result.type) {
                    case ExecuteObjectivesResultType.Completed:
                        this.interruptObjectivePipeline = undefined;
                        // this.interruptIds = undefined;
                        log.info("Completed interrupt objectives");
                        break;

                    case ExecuteObjectivesResultType.Restart:
                        this.interruptObjectivePipeline = undefined;
                        // this.interruptIds = undefined;
                        return;

                    case ExecuteObjectivesResultType.Pending:
                        const afterInterruptHashCode = Plan.getPipelineString(this.context, this.interruptObjectivePipeline);

                        if (interruptHashCode === afterInterruptHashCode) {
                            this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                            // this.objectivePipeline = undefined;
                            log.info(`Updated continuing interrupt objectives - ${ExecuteObjectivesResultType[result.type]}`, Plan.getPipelineString(this.context, this.interruptObjectivePipeline));

                        } else {
                            log.info(`Ignoring continuing interrupt objectives due to changed interrupts - ${ExecuteObjectivesResultType[result.type]}. Before: ${interruptHashCode}. After: ${afterInterruptHashCode}`);
                        }

                        return;

                    case ExecuteObjectivesResultType.ContinuingNextTick:
                        this.interruptObjectivePipeline = undefined;
                        // this.interruptIds = undefined;
                        // this.objectivePipeline = undefined;
                        log.info("Clearing interrupt objective pipeline");
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

                        log.debug(`Restored saved context from ${i}. ${this.interruptContext.getHashCode()}`);
                    }

                    const result = await executor.executeObjectives(this.interruptContext, [interruptObjectives], true);

                    // log.debug("Interrupt result", result);

                    if (!this.interruptContext) {
                        // tars was disabled mid run
                        return;
                    }

                    switch (result.type) {
                        case ExecuteObjectivesResultType.Completed:
                            // finished working on it
                            // update the initial state of the interrupt context
                            // it's possible interrupt() was called, so we'll come back here with the same context
                            // this.interruptContext.setInitialState();
                            // todo: nest interrupt support / contexts?

                            // ensure the current objective is cleared
                            this.interruptObjectivePipeline = undefined;

                            if (this.interruptContexts.has(i)) {
                                this.interruptContexts.delete(i);
                                log.debug(`Deleting saved context from ${i}`);
                            }
                            break;

                        default:
                            // in progress. run again during the next tick

                            // save this context so it will be restored next time
                            this.interruptContexts.set(i, this.interruptContext.clone());
                            log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext.getHashCode()}`);

                            // update the initial state so we don't mess with items between interrupts
                            this.interruptContext.setInitialState();

                            if (result.type === ExecuteObjectivesResultType.Pending || result.type === ExecuteObjectivesResultType.ContinuingNextTick) {
                                // save the active objective
                                this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;

                                // reset main objective
                                this.objectivePipeline = undefined;
                            }

                            return;
                    }
                }
            }

            // console.log.info("this.objective", this.objective ? this.objective.getHashCode() : undefined);

            if (executor.tryClearInterrupt()) {
                // nested interrupt. update interrupt context
                this.interruptContext.setInitialState();

                log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);

                return;
            }
        }

        if (executor.tryClearInterrupt()) {
            return;
        }

        // no longer working on interrupts
        this.interruptContext = undefined;

        if (this.objectivePipeline !== undefined) {
            // we have an objective we are working on
            const hashCode = Plan.getPipelineString(this.context, this.objectivePipeline);

            log.info("Continuing execution of objectives", hashCode);

            const result = await executor.executeObjectives(this.context, this.objectivePipeline, false, true);
            switch (result.type) {
                case ExecuteObjectivesResultType.Completed:
                    this.objectivePipeline = undefined;
                    break;

                case ExecuteObjectivesResultType.Restart:
                    this.objectivePipeline = undefined;
                    return;

                case ExecuteObjectivesResultType.Pending:
                case ExecuteObjectivesResultType.ContinuingNextTick:
                    const afterHashCode = Plan.getPipelineString(this.context, this.objectivePipeline);

                    if (hashCode === afterHashCode) {
                        this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                        log.info(`Updated continuing objectives - ${ExecuteObjectivesResultType[result.type]}`, Plan.getPipelineString(this.context, this.objectivePipeline));

                    } else {
                        log.info(`Ignoring continuing objectives due to changed objectives - ${ExecuteObjectivesResultType[result.type]}. Resetting. Before: ${hashCode}. After: ${afterHashCode}`);

                        // todo: the hash code might change because a StoneWaterStill became a LitStoneWaterStill. that might be okay
                        this.objectivePipeline = undefined;
                    }

                    return;
            }

            if (!this.isEnabled()) {
                // execution finished from running the objectivePipeline
                return;
            }
        }

        // reset before determining objectives
        this.context.reset();
        log.debug(`Reset context state. Context hash code: ${this.context.getHashCode()}.`);

        const objectives = await modeInstance.determineObjectives(this.context);

        const result = await executor.executeObjectives(this.context, objectives, true, true);
        switch (result.type) {
            case ExecuteObjectivesResultType.Pending:
            case ExecuteObjectivesResultType.ContinuingNextTick:
                // save the active objective
                this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                log.info(`Saved objectives - ${ExecuteObjectivesResultType[result.type]}`, Plan.getPipelineString(this.context, this.objectivePipeline));
                this.updateStatus();
                return;

            default:
                this.objectivePipeline = undefined;
                return;
        }
    }

    // todo: add severity to stat interrupts to prioritize which one to run
    private getInterrupts(context: Context): Array<IObjective | IObjective[] | undefined> {
        const stayHealthy = this.saveData.options.stayHealthy;

        let interrupts: Array<IObjective | IObjective[] | undefined> = [
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
            this.escapeCavesInterrupt(context),
            this.returnToBaseInterrupt(context),
        ]);

        const organizeInventoryInterrupts = this.organizeInventoryInterrupts(context);
        if (organizeInventoryInterrupts) {
            interrupts = interrupts.concat(organizeInventoryInterrupts);
        }

        return interrupts;
    }

    private getRecoverInterrupts(context: Context, onlyUseAvailableItems: boolean) {
        // focus on healing if our health is below 85% while poisoned
        const poisonHealthPercentThreshold = 0.85;

        const health = context.human.stat.get<IStatMax>(Stat.Health);
        const needsHealthRecovery = health.value <= this.utilities.player.getRecoverThreshold(context, Stat.Health) ||
            context.human.status.Bleeding ||
            (context.human.status.Poisoned && (health.value / health.max) <= poisonHealthPercentThreshold);

        const exceededThirstThreshold = context.human.stat.get<IStat>(Stat.Thirst).value <= this.utilities.player.getRecoverThreshold(context, Stat.Thirst);
        const exceededHungerThreshold = context.human.stat.get<IStat>(Stat.Hunger).value <= this.utilities.player.getRecoverThreshold(context, Stat.Hunger);
        const exceededStaminaThreshold = context.human.stat.get<IStat>(Stat.Stamina).value <= this.utilities.player.getRecoverThreshold(context, Stat.Stamina);

        const objectives: IObjective[] = [];

        if (needsHealthRecovery) {
            objectives.push(new RecoverHealth(onlyUseAvailableItems));
        }

        objectives.push(new RecoverThirst({
            onlyUseAvailableItems: onlyUseAvailableItems,
            exceededThreshold: exceededThirstThreshold,
            onlyEmergencies: false,
        }));

        objectives.push(new RecoverHunger(onlyUseAvailableItems, exceededHungerThreshold));

        if (exceededStaminaThreshold) {
            objectives.push(new RecoverStamina());
        }

        objectives.push(new RecoverThirst({
            onlyUseAvailableItems: onlyUseAvailableItems,
            exceededThreshold: exceededThirstThreshold,
            onlyEmergencies: true,
        }));

        return objectives;
    }

    private optionsInterrupt(): IObjective | undefined {
        return new OptionsInterrupt();
    }

    private equipmentInterrupt(context: Context): Array<IObjective | undefined> {
        return [
            this.handsEquipInterrupt(context),
            this.equipInterrupt(context, EquipType.Chest),
            this.equipInterrupt(context, EquipType.Legs),
            this.equipInterrupt(context, EquipType.Head),
            this.equipInterrupt(context, EquipType.Belt),
            this.equipInterrupt(context, EquipType.Feet),
            this.equipInterrupt(context, EquipType.Hands),
            this.equipInterrupt(context, EquipType.Neck),
            this.equipInterrupt(context, EquipType.Back),
        ];
    }

    private equipInterrupt(context: Context, equip: EquipType): IObjective | undefined {
        const item = context.human.getEquippedItem(equip);
        if (item && (item.type === ItemType.SlitherSucker || item.type === ItemType.AberrantSlitherSucker)) {
            // brain slugs are bad
            return new UnequipItem(item);
        }

        const bestEquipment = this.utilities.item.getBestEquipment(context, equip);
        if (bestEquipment.length > 0) {
            const itemToEquip = bestEquipment[0];
            if (itemToEquip === item) {
                return undefined;
            }

            if (item !== undefined) {
                return new UnequipItem(item);
            }

            return new EquipItem(equip, itemToEquip);
        }
    }

    private handsEquipInterrupt(context: Context, preferredDamageType?: DamageType): IObjective | undefined {
        const leftHandEquipInterrupt = this.handEquipInterrupt(context, EquipType.LeftHand, ActionType.Attack);
        if (leftHandEquipInterrupt) {
            return leftHandEquipInterrupt;
        }

        if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
            return new EquipItem(EquipType.RightHand, context.inventory.equipShield);
        }

        const leftHandItem = context.human.getEquippedItem(EquipType.LeftHand);
        const rightHandItem = context.human.getEquippedItem(EquipType.RightHand);

        const leftHandDescription = leftHandItem ? leftHandItem.description() : undefined;
        const leftHandEquipped = leftHandDescription ? leftHandDescription.attack !== undefined : false;

        const rightHandDescription = rightHandItem ? rightHandItem.description() : undefined;
        const rightHandEquipped = rightHandDescription ? rightHandDescription.attack !== undefined : false;

        if (preferredDamageType !== undefined) {
            let leftHandDamageTypeMatches = false;
            if (leftHandEquipped) {
                const itemDescription = leftHandItem!.description();
                leftHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
            }

            let rightHandDamageTypeMatches = false;
            if (rightHandEquipped) {
                const itemDescription = rightHandItem!.description();
                rightHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
            }

            if (leftHandDamageTypeMatches || rightHandDamageTypeMatches) {
                if (leftHandDamageTypeMatches !== context.human.options.leftHand) {
                    this.changeEquipmentOption("leftHand");
                }

                if (rightHandDamageTypeMatches !== context.human.options.rightHand) {
                    this.changeEquipmentOption("rightHand");
                }

            } else if (leftHandEquipped || rightHandEquipped) {
                if (leftHandEquipped && !context.human.options.leftHand) {
                    this.changeEquipmentOption("leftHand");
                }

                if (rightHandEquipped && !context.human.options.rightHand) {
                    this.changeEquipmentOption("rightHand");
                }

            } else {
                if (!context.human.options.leftHand) {
                    this.changeEquipmentOption("leftHand");
                }

                if (!context.human.options.rightHand) {
                    this.changeEquipmentOption("rightHand");
                }
            }

        } else {
            if (!leftHandEquipped && !rightHandEquipped) {
                // if we have nothing equipped in both hands, make sure the left hand is enabled
                if (!context.human.options.leftHand) {
                    this.changeEquipmentOption("leftHand");
                }

            } else if (leftHandEquipped !== context.human.options.leftHand) {
                this.changeEquipmentOption("leftHand");
            }

            if (leftHandEquipped) {
                // if we have the left hand equipped, disable right hand
                if (context.human.options.rightHand) {
                    this.changeEquipmentOption("rightHand");
                }

            } else if (rightHandEquipped !== context.human.options.rightHand) {
                this.changeEquipmentOption("rightHand");
            }
        }
    }

    private changeEquipmentOption(id: "leftHand" | "rightHand") {
        if (this.human.isLocalPlayer()) {
            oldui.changeEquipmentOption(id);

        } else if (!this.human.asPlayer) {
            const isLeftHand = id === "leftHand";
            const newValue = isLeftHand ? !this.human.options.leftHand : !this.human.options.rightHand;
            (this.human.options as any)[id] = newValue;

            // todo: mp somehow?
        }
    }

    private handEquipInterrupt(context: Context, equipType: EquipType, use?: ActionType, itemTypes?: Array<ItemType | ItemTypeGroup>, preferredDamageType?: DamageType): IObjective | undefined {
        const equippedItem = context.human.getEquippedItem(equipType);

        let possibleEquips: Item[];
        if (use) {
            possibleEquips = this.utilities.item.getPossibleHandEquips(context, use, preferredDamageType, false);

            if (use === ActionType.Attack) {
                // equip based on how effective it will be against nearby creatures
                let closestCreature: Creature | undefined;
                let closestCreatureDistance: number | undefined;

                for (let x = -2; x <= 2; x++) {
                    for (let y = -2; y <= 2; y++) {
                        const point = context.human.island.ensureValidPoint({ x: context.human.x + x, y: context.human.y + y, z: context.human.z });
                        if (point) {
                            const tile = context.island.getTileFromPoint(point);
                            if (tile.creature && !tile.creature.isTamed()) {
                                const distance = Vector2.squaredDistance(context.human, tile.creature.getPoint());
                                if (closestCreatureDistance === undefined || closestCreatureDistance > distance) {
                                    closestCreatureDistance = distance;
                                    closestCreature = tile.creature;
                                }
                            }
                        }
                    }
                }

                if (closestCreature) {
                    // creature is close, calculate it
                    possibleEquips
                        .sort((a, b) => this.utilities.item.estimateDamageModifier(b, closestCreature!) - this.utilities.item.estimateDamageModifier(a, closestCreature!));

                } else if (context.human.getEquippedItem(equipType) !== undefined) {
                    // don't switch until we're close to a creature
                    return undefined;
                }
            }

            if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                // fall back to not caring about the damage type
                possibleEquips = this.utilities.item.getPossibleHandEquips(context, use, undefined, false);
            }

        } else if (itemTypes) {
            possibleEquips = [];

            for (const itemType of itemTypes) {
                if (context.island.items.isGroup(itemType)) {
                    possibleEquips.push(...context.utilities.item.getItemsInContainerByGroup(context, context.human.inventory, itemType));

                } else {
                    possibleEquips.push(...context.utilities.item.getItemsInContainerByType(context, context.human.inventory, itemType));
                }
            }

        } else {
            return undefined;
        }

        if (possibleEquips.length > 0) {
            // always try to equip the two best items
            for (let i = 0; i < 2; i++) {
                const possibleEquipItem = possibleEquips[i];
                if (!possibleEquipItem || possibleEquipItem === equippedItem) {
                    return undefined;
                }

                if (!possibleEquipItem.isEquipped()) {
                    return new EquipItem(equipType, possibleEquips[i]);
                }
            }
        }
    }

    private repairsInterrupt(context: Context): IObjective[] | undefined {
        if (this.inventory.hammer === undefined) {
            return undefined;
        }

        const objectives = [
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.LeftHand)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.RightHand)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Chest)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Legs)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Head)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Belt)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Feet)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Neck)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Hands)),
            this.repairInterrupt(context, context.human.getEquippedItem(EquipType.Back)),
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

        return objectives.filter(objective => objective !== undefined) as IObjective[];
    }

    private repairInterrupt(context: Context, item: Item | undefined): IObjective | undefined {
        if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
            return undefined;
        }

        const threshold = this.utilities.base.isNearBase(context) ? 0.2 : 0.1;
        if (item.minDur / item.maxDur >= threshold) {
            return undefined;
        }

        if (this.inventory.waterContainer?.includes(item) && context.human.stat.get<IStat>(Stat.Thirst).value < 2) {
            // don't worry about repairing a water container if it's an emergency
            return undefined;
        }

        return new RepairItem(item);
    }

    private nearbyCreatureInterrupt(context: Context): IObjective | undefined {
        const shouldRunAwayFromAllCreatures = creatureUtilities.shouldRunAwayFromAllCreatures(context);

        for (const facingDirecton of Direction.CARDINALS_AND_NONE) {
            const creature = this.checkNearbyCreature(context, facingDirecton);
            if (creature !== undefined) {
                const tamingCreature = context.getData<Creature>(ContextDataType.TamingCreature);
                if (tamingCreature && tamingCreature === creature) {
                    log.info(`Not defending against ${creature.getName().getString()} because we're trying to tame it`);
                    continue;
                }

                log.info(`Defend against ${creature.getName().getString()}`);
                return new DefendAgainstCreature(creature, shouldRunAwayFromAllCreatures || creatureUtilities.isScaredOfCreature(context, creature));
            }
        }

        const nearbyCreatures = creatureUtilities.getNearbyCreatures(context);
        for (const creature of nearbyCreatures) {
            if (shouldRunAwayFromAllCreatures || creatureUtilities.isScaredOfCreature(context, creature)) {
                // only run away if the creature can path to us
                const path = creature.findPath(context.human, 16, context.human);
                if (path) {
                    log.info(`Run away from ${creature.getName().getString()}`);
                    return new RunAwayFromTarget(creature);
                }
            }
        }
    }

    private checkNearbyCreature(context: Context, direction: Direction.Cardinal | Direction.None): Creature | undefined {
        if (direction !== Direction.None) {
            const point = Vector2.DIRECTIONS[direction];
            const validPoint = context.island.ensureValidPoint({ x: context.human.x + point.x, y: context.human.y + point.y, z: context.human.z });
            if (validPoint) {
                const tile = context.island.getTileFromPoint(validPoint);
                if (tile && tile.creature && !tile.creature.isTamed()) {
                    //  && (tile.creature.ai & AiType.Hostile) !== 0
                    return tile.creature;
                }
            }
        }
    }

    private buildItemObjectives(): IObjective[] {
        const objectives: IObjective[] = [];

        // prioritize building items that are in the inventory
        if (this.inventory.campfire !== undefined) {
            objectives.push(new BuildItem(this.inventory.campfire));
        }

        if (this.inventory.waterStill !== undefined) {
            objectives.push(new BuildItem(this.inventory.waterStill));
        }

        if (this.inventory.chest !== undefined) {
            objectives.push(new BuildItem(this.inventory.chest));
        }

        if (this.inventory.kiln !== undefined) {
            objectives.push(new BuildItem(this.inventory.kiln));
        }

        if (this.inventory.well !== undefined) {
            objectives.push(new BuildItem(this.inventory.well));
        }

        if (this.inventory.furnace !== undefined) {
            objectives.push(new BuildItem(this.inventory.furnace));
        }

        if (this.inventory.anvil !== undefined) {
            objectives.push(new BuildItem(this.inventory.anvil));
        }

        if (this.inventory.solarStill !== undefined) {
            objectives.push(new BuildItem(this.inventory.solarStill));
        }

        return objectives;
    }

    private gatherFromCorpsesInterrupt(context: Context): IObjective[] | undefined {
        if (this.utilities.item.getInventoryItemsWithUse(context, ActionType.Butcher).length === 0) {
            return undefined;
        }

        const targets = this.utilities.object.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2.distance(context.human, corpse) < 16);
        if (targets) {
            const objectives: IObjective[] = [];

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
                            objectives.push(new ButcherCorpse(corpse));
                        }
                    }
                }
            }

            return objectives;
        }
    }

    private reduceWeightInterrupt(context: Context): IObjective | undefined {
        return new ReduceWeight({
            allowReservedItems: !this.utilities.base.isNearBase(context) && this.weightStatus === WeightStatus.Overburdened,
            disableDrop: this.weightStatus !== WeightStatus.Overburdened && !this.utilities.base.isNearBase(context),
        });
    }

    private returnToBaseInterrupt(context: Context): IObjective | undefined {
        if (!this.utilities.base.isNearBase(context) &&
            this.weightStatus !== WeightStatus.None &&
            this.previousWeightStatus === WeightStatus.Overburdened &&
            context.getData(ContextDataType.MovingToNewIsland) !== MovingToNewIslandState.Ready) {
            return new ReturnToBase();
        }
    }

    private escapeCavesInterrupt(context: Context) {
        if (!context.options.allowCaves && context.human.z === WorldZ.Cave) {
            return new MoveToZ(WorldZ.Overworld);
        }
    }


    /**
     * Move reserved items into intermediate chests if the player is near the base and is moving away
     * Explicitly not using OrganizeInventory for this - the exact objectives should be specified to prevent issues
     */
    private organizeInventoryInterrupts(context: Context, interruptContext?: Context): IObjective[] | undefined {
        if (context.getDataOrDefault(ContextDataType.DisableMoveAwayFromBaseItemOrganization, false) ||
            context.getData(ContextDataType.MovingToNewIsland) === MovingToNewIslandState.Ready) {
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
        const point = { x: target.x, y: target.y, z: context.human.z };
        if (this.utilities.base.isNearBase(context, point) &&
            TileHelpers.getType(context.island.getTileFromPoint(point)) !== TerrainType.CaveEntrance) {
            return undefined;
        }

        let objectives: IObjective[] = [];

        const reservedItems = this.utilities.item.getReservedItems(context, false);

        const interruptReservedItems = interruptContext ? this.utilities.item.getReservedItems(interruptContext, false) : undefined;
        // if (interruptReservedItems) {
        // 	reservedItems = reservedItems.filter(item => !interruptReservedItems.includes(item));
        // }

        if (reservedItems.length > 0) {
            const organizeInventoryObjectives = OrganizeInventory.moveIntoChestsObjectives(context, reservedItems);
            if (organizeInventoryObjectives) {
                objectives = objectives.concat(organizeInventoryObjectives);
            }
        }

        let unusedItems = this.utilities.item.getUnusedItems(context);

        // todo: this might be hiding a bug related to CompleteRequirements running after aquiring items from chests (infinite looping)
        const interruptUnusedItems = interruptContext ? this.utilities.item.getUnusedItems(interruptContext) : undefined;
        if (interruptUnusedItems) {
            unusedItems = unusedItems.filter(item => !interruptReservedItems?.includes(item) && !interruptUnusedItems.includes(item));
        }

        if (unusedItems.length > 0) {
            const organizeInventoryObjectives = OrganizeInventory.moveIntoChestsObjectives(context, unusedItems);
            if (organizeInventoryObjectives) {
                objectives = objectives.concat(organizeInventoryObjectives);
            }
        }

        log.info(
            objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space",
            `Reserved items: ${reservedItems.join(",")}`,
            `Unused items: ${unusedItems.join(",")}`,
            `Context soft reserved items: ${Array.from(context.state.softReservedItems).map(item => item.id).join(",")}`,
            `Context hard reserved items: ${Array.from(context.state.hardReservedItems).map(item => item.id).join(",")}`,
            `Interrupt context soft reserved items: ${Array.from(interruptContext?.state.softReservedItems ?? []).map(item => item.id).join(",")}`,
            `Interrupt context hard reserved items: ${Array.from(interruptContext?.state.hardReservedItems ?? []).map(item => item.id).join(",")}`,
            `Objectives: ${Plan.getPipelineString(this.context, objectives)}`);

        return objectives;
    }

    private processQueuedNavigationUpdates() {
        for (const queuedUpdate of this.navigationQueuedUpdates) {
            queuedUpdate();
        }

        this.navigationQueuedUpdates.length = 0;
    }

    private processQuantumBurst() {
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
