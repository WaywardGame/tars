import { EventBus } from "event/EventBuses";
import EventEmitter, { Priority } from "event/EventEmitter";
import EventManager, { EventHandler } from "event/EventManager";
import MoveItemAction from "game/entity/action/actions/MoveItem";
import Rename from "game/entity/action/actions/Rename";
import Respawn from "game/entity/action/actions/Respawn";
import UpdateWalkPath from "game/entity/action/actions/UpdateWalkPath";
import type { IActionApi } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import Corpse from "game/entity/creature/corpse/Corpse";
import CorpseManager from "game/entity/creature/corpse/CorpseManager";
import type Creature from "game/entity/creature/Creature";
import CreatureManager from "game/entity/creature/CreatureManager";
import Human from "game/entity/Human";
import { EquipType, MovingClientSide } from "game/entity/IHuman";
import type { IStat, IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import NPC from "game/entity/npc/NPC";
import { WeightStatus } from "game/entity/player/IPlayer";
import type { INote } from "game/entity/player/note/NoteManager";
import type Player from "game/entity/player/Player";
import { TileUpdateType } from "game/IGame";
import type Island from "game/island/Island";
import { IContainer, ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import ItemManager from "game/item/ItemManager";
import type { IPromptDescriptionBase } from "game/meta/prompt/IPrompt";
import { Prompt } from "game/meta/prompt/IPrompt";
import type Prompts from "game/meta/prompt/Prompts";
import type { IPrompt } from "game/meta/prompt/Prompts";
import { ITile, TerrainType } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";
import InterruptChoice from "language/dictionary/InterruptChoice";
import Translation from "language/Translation";
import { RenderSource } from "renderer/IRenderer";
import { Bound } from "utilities/Decorators";
import TileHelpers from "utilities/game/TileHelpers";
import Log from "utilities/Log";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";
import Objects from "utilities/object/Objects";
import { sleep } from "utilities/promise/Async";
import ResolvablePromise from "utilities/promise/ResolvablePromise";
import { AttackType } from "game/entity/IEntity";
import ControllableNPC from "game/entity/npc/NPCS/Controllable";
import { IVector2 } from "utilities/math/IVector";

import { getTarsMod, getTarsTranslation, ISaveData, ISaveDataContainer, TarsTranslation } from "../ITarsMod";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import ExecuteAction from "../objectives/core/ExecuteAction";
import MoveToTarget from "../objectives/core/MoveToTarget";
import ButcherCorpse from "../objectives/interrupt/ButcherCorpse";
import DefendAgainstCreature from "../objectives/interrupt/DefendAgainstCreature";
import OptionsInterrupt from "../objectives/interrupt/OptionsInterrupt";
import ReduceWeight from "../objectives/interrupt/ReduceWeight";
import RepairItem from "../objectives/interrupt/RepairItem";
import BuildItem from "../objectives/other/item/BuildItem";
import EquipItem from "../objectives/other/item/EquipItem";
import UnequipItem from "../objectives/other/item/UnequipItem";
import RunAwayFromTarget from "../objectives/other/RunAwayFromTarget";
import RecoverHealth from "../objectives/recover/RecoverHealth";
import RecoverHunger from "../objectives/recover/RecoverHunger";
import RecoverStamina from "../objectives/recover/RecoverStamina";
import RecoverThirst from "../objectives/recover/RecoverThirst";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import MoveToZ from "../objectives/utility/moveTo/MoveToZ";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import { TarsOverlay } from "../ui/TarsOverlay";
import { ActionUtilities } from "../utilities/Action";
import { BaseUtilities } from "../utilities/Base";
import { CreatureUtilities } from "../utilities/Creature";
import { DoodadUtilities } from "../utilities/Doodad";
import { ItemUtilities } from "../utilities/Item";
import { LoggerUtilities } from "../utilities/Logger";
import { MovementUtilities } from "../utilities/Movement";
import { ObjectUtilities } from "../utilities/Object";
import { PlayerUtilities } from "../utilities/Player";
import { TileUtilities } from "../utilities/Tile";
import Context from "./context/Context";
import { ContextDataType, MovingToNewIslandState } from "./context/IContext";
import { ExecuteObjectivesResultType, Executor } from "./Executor";
import { IBase, IInventoryItems, IResetOptions, ITarsEvents, IUtilities, NavigationSystemState, QuantumBurstStatus, TarsMode, tickSpeed } from "./ITars";
import { ITarsOptions } from "./ITarsOptions";
import type { ITarsMode } from "./mode/IMode";
import { modes } from "./mode/Modes";
import Navigation, { tileUpdateRadius } from "./navigation/Navigation";
import type { IObjective } from "./objective/IObjective";
import Objective from "./objective/Objective";
import Plan from "./planning/Plan";
import { Planner } from "./planning/Planner";

export type TarsNPC = ControllableNPC<ISaveData> & { tarsInstance?: Tars };

export default class Tars extends EventEmitter.Host<ITarsEvents> {

    public readonly dialogSubId: string;

    private readonly log: Log;
    private readonly planner: Planner;
    private readonly executor: Executor;

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

    constructor(public readonly human: Human, public readonly saveData: ISaveData, private readonly overlay: TarsOverlay) {
        super();

        const loggingUtilities = new LoggerUtilities(() => this.getName().toString());

        this.log = loggingUtilities.createLog();

        this.planner = new Planner(loggingUtilities, false);
        this.planner.debug = saveData.options.debugLogging;

        this.executor = new Executor(this.planner);

        this.utilities = {
            action: new ActionUtilities(),
            base: new BaseUtilities(),
            creature: new CreatureUtilities(),
            doodad: new DoodadUtilities(),
            item: new ItemUtilities(),
            logger: loggingUtilities,
            movement: new MovementUtilities(),
            navigation: new Navigation(this.log, human, overlay),
            object: new ObjectUtilities(),
            overlay: this.overlay,
            player: new PlayerUtilities(),
            tile: new TileUtilities(),

            ensureSailingMode: (sailingMode) => this.ensureSailingMode(sailingMode),
        };

        this.log.info(`Created TARS instance on island id ${this.human.islandId}`);

        this.dialogSubId = this.getDialogSubId();
    }

    private delete() {
        this.reset({
            delete: true,
        });

        this.navigationSystemState = NavigationSystemState.NotInitialized;
        this.navigationQueuedUpdates.length = 0;

        this.utilities.navigation.unload();

        this.log.info(`Deleted TARS instance on island id ${this.human.islandId}`);
    }

    public getName() {
        return this.human.getName();
    }

    public getSaveDataContainer(): ISaveDataContainer {
        const saveData = Objects.deepClone(this.saveData);
        saveData.enabled = false;

        return {
            name: this.getName().toString(),
            version: getTarsMod().getVersion(),
            saveData: this.saveData,
        };
    }

    public loadSaveData(container: ISaveDataContainer) {
        if (this.saveData.enabled) {
            this.disable();
        }

        for (const [key, value] of Object.entries(container.saveData)) {
            if (key === "options") {
                this.updateOptions(value);

            } else {
                this.saveData[key as keyof ISaveData] = Objects.deepClone(value);
            }
        }

        const npc = this.asNPC;
        if (npc) {
            Rename.execute(localPlayer, npc, container.name);
        }
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

        Log.addPreConsoleCallback(this.utilities.logger.preConsoleCallback);

        // this.log.info("Loaded");
    }

    public unload() {
        if (!this.loaded) {
            return;
        }

        this.loaded = false;

        this.delete();

        EventManager.deregisterEventBusSubscriber(this);

        this.event.emit("unload");

        Log.removePreConsoleCallback(this.utilities.logger.preConsoleCallback);

        // this.log.info("Unloaded");
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

        multiplayer.executeClientside(() => {
            UpdateWalkPath.execute(this.human, undefined);

            OptionsInterrupt.restore(this.human);
        });

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

            this.log.info(`Configured recover thresholds. health: ${this.saveData.options.recoverThresholdHealth}. stamina: ${this.saveData.options.recoverThresholdStamina}. hunger: ${this.saveData.options.recoverThresholdHunger}`);
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
        this.createContext();
        this.interruptContext = undefined;
        this.interruptContexts.clear();

        this.utilities.movement.resetMovementOverlays();
    }

    @EventHandler(EventBus.LocalPlayer, "respawn")
    public onPlayerRespawn() {
        if (this.human !== localPlayer) {
            return;
        }

        this.fullInterrupt("Human respawned");
        this.createContext();
        this.interruptContext = undefined;
        this.interruptContexts.clear();

        this.utilities.movement.resetMovementOverlays();

        if (this.navigationSystemState === NavigationSystemState.Initialized) {
            this.utilities.navigation.queueUpdateOrigin(this.human);
        }
    }

    // @EventHandler(EventBus.LocalPlayer, "processMovement")
    // public async processMovement(player: Player): Promise<void> {
    //     if (this.human !== player || !this.isRunning()) {
    //         return;
    //     }

    //     if (this.navigationSystemState === NavigationSystemState.Initialized) {
    //         this.utilities.navigation.queueUpdateOrigin(player);
    //     }

    //     this.processQuantumBurst();

    //     const objective = this.getCurrentObjective();
    //     if (objective !== undefined) {
    //         const result = await objective.onMove(this.context);
    //         if (result === true) {
    //             this.fullInterrupt("Target moved");

    //         } else if (result) {
    //             this.interrupt("Target moved", result);
    //         }
    //     }
    // }

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

    @EventHandler(EventBus.CreatureManager, "remove")
    public onCreatureRemove(_: CreatureManager, creature: Creature) {
        if (!this.isRunning()) {
            return;
        }

        const objective = this.getCurrentObjective();
        if (objective !== undefined && objective instanceof MoveToTarget && objective.onCreatureRemoved(this.context, creature)) {
            this.fullInterrupt(`${creature} was removed`);
        }
    }

    @EventHandler(EventBus.CorpseManager, "remove")
    public onCorpseRemove(_: CorpseManager, corpse: Corpse) {
        if (!this.isRunning()) {
            return;
        }

        const objective = this.getCurrentObjective();
        if (objective !== undefined && objective instanceof MoveToTarget && objective.onCorpseRemoved(this.context, corpse)) {
            this.fullInterrupt(`${corpse} was removed`);
        }
    }

    @EventHandler(EventBus.Humans, "restEnd")
    public onRestEnd(human: Human) {
        if (this.human !== human) {
            return;
        }

        this.processQueuedNavigationUpdates();
    }

    @EventHandler(EventBus.Creatures, "postMove")
    public async onCreaturePostMove(creature: Creature, fromX: number, fromY: number, fromZ: number, fromTile: ITile, toX: number, toY: number, toZ: number, toTile: ITile) {
        if (!this.isRunning()) {
            return;
        }

        const objective = this.getCurrentObjective();
        if (objective !== undefined) {
            const result = await objective.onMove(this.context);
            if (result === true) {
                this.fullInterrupt("Target creature moved");

            } else if (result) {
                this.interrupt("Target creature moved", result);
            }
        }
    }

    @EventHandler(EventBus.NPCs, "renamed")
    public onNpcRenamed(npc: NPC) {
        if (this.human !== npc) {
            return;
        }

        this.utilities.logger.reloadLogSources();
    }

    @EventHandler(EventBus.Humans, "postMove")
    public async onHumanPostMove(human: Human, fromX: number, fromY: number, fromZ: number, fromTile: ITile, toX: number, toY: number, toZ: number, toTile: ITile) {
        if (this.human !== human) {
            return;
        }

        if (human.asPlayer && !this.isRunning()) {
            return;
        }

        this.utilities.movement.clearOverlay(toTile);

        // todo: sync this up with regular player logic

        if (this.navigationSystemState === NavigationSystemState.Initialized) {
            this.utilities.navigation.queueUpdateOrigin(human);
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

    @EventHandler(EventBus.Humans, "moveComplete")
    public onMoveComplete(human: Human) {
        if (this.human !== human) {
            return;
        }

        this.utilities.movement.clearOverlay(human.getTile());
    }

    @EventHandler(EventBus.Prompt, "queue", Priority.High)
    public onPrompt(host: Prompts.Events, prompt: IPrompt<IPromptDescriptionBase<any[]>>): string | boolean | void | InterruptChoice | undefined {
        if (this.isRunning() && (prompt.type === Prompt.GameDangerousStep || prompt.type === Prompt.GameIslandTravelConfirmation)) {
            this.log.info(`Resolving true for prompt ${Prompt[prompt.type]}`);
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
                                island,
                                otherTile,
                                TileHelpers.getType(otherTile),
                                point.x, point.y, point.z,
                                this.utilities.base.isBaseTile(this.getContext(), otherTile),
                                tileUpdateType);
                        }
                    }
                }

            } else {
                this.utilities.navigation.onTileUpdate(
                    island,
                    tile,
                    TileHelpers.getType(tile),
                    tileX, tileY, tileZ,
                    this.utilities.base.isBaseTile(this.getContext(), tile),
                    tileUpdateType);
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

    @EventHandler(EventBus.Humans, "processInput")
    public processInput(human: Human): false | undefined {
        if (this.human !== human || !this.isRunning()) {
            return;
        }

        this.processQuantumBurst();

        return undefined;
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

    @EventHandler(EventBus.Humans, "canAttack")
    public onCanAttack(human: Human, weapon: Item | undefined, attackType: AttackType): boolean | undefined {
        if (this.human !== human || !this.isRunning()) {
            return undefined;
        }

        // we are attacking something. cancel and pending walk path
        if (this.human.hasWalkPath()) {
            multiplayer.executeClientside(() => {
                UpdateWalkPath.execute(this.human, undefined);
            });
        }

        return undefined;
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
                this.onWeightChange(false);
                break;
        }
    }

    @EventHandler(EventBus.Humans, "statMaxChanged")
    public onStatMaxChanged(human: Human, stat: IStat, oldValue: number | undefined) {
        if (this.human !== human || !this.isRunning() || stat.max === oldValue) {
            return;
        }

        switch (stat.type) {
            case Stat.Weight:
                // interrupt when a max weight increase causes the weight status to change
                this.onWeightChange(true);
                break;
        }
    }

    private onWeightChange(interruptWhenChangingToNone: boolean) {
        this.executor.markWeightChanged();

        const weightStatus = this.human.getWeightStatus();
        if (this.weightStatus !== weightStatus) {
            this.previousWeightStatus = this.weightStatus;

            this.weightStatus = weightStatus;

            if (!interruptWhenChangingToNone && weightStatus === WeightStatus.None) {
                return;
            }

            // players weight status changed
            // reset objectives so we'll handle this immediately
            this.interrupt(`Weight status changed from ${this.previousWeightStatus !== undefined ? WeightStatus[this.previousWeightStatus] : "N/A"} to ${WeightStatus[this.weightStatus]}`);
        }
    }

    @EventHandler(EventBus.Humans, "moveToIsland")
    public async onMoveToIsland(human: Human) {
        if (this.human !== human) {
            return;
        }

        if (this.isEnabled()) {
            this.disable(true);
        }

        this.delete();

        this.utilities.navigation.load();

        getTarsMod().event.emit("refreshTarsInstanceReferences");

        if (!this.isEnabled()) {
            return;
        }

        // this.fullInterrupt();

        this.toggle(true);
    }

    ////////////////////////////////////////////////

    public getContext(): Context {
        return this.context ?? new Context(this, this.base, this.inventory, this.utilities);
    }

    public get asNPC(): TarsNPC | undefined {
        return this.human.asNPC as (TarsNPC | undefined);
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

    public canToggle() {
        return this.navigationSystemState !== NavigationSystemState.Initializing;
    }

    public async toggle(enabled = !this.saveData.enabled) {
        if (!this.canToggle()) {
            return;
        }

        this.saveData.enabled = enabled;
        this.event.emit("enableChange", enabled);

        this.log.info(this.saveData.enabled ? "Enabled" : "Disabled");

        this.context = new Context(this, this.base, this.inventory, this.utilities);

        this.utilities.item.initialize(this.context);

        await this.ensureNavigation(!!this.context.human.vehicleItemReference);

        this.reset();

        if (this.saveData.enabled) {
            if (this.saveData.options.navigationOverlays) {
                this.overlay.show();
                renderers.updateView(RenderSource.Mod, false);
            }

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
                            const moveToNewIslandState = this.context.getDataOrDefault<MovingToNewIslandState>(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);
                            if (moveToNewIslandState !== MovingToNewIslandState.None) {
                                this.context.setData(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);

                            } else {
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
                            this.event.emit("quantumBurstChange", QuantumBurstStatus.Start);

                        } else {
                            this.quantumBurstCooldown = 2;
                        }

                        break;

                    case "navigationOverlays":
                        shouldInterrupt = false;

                        if (this.saveData.options.navigationOverlays) {
                            this.overlay.show();

                        } else {
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

    public updateWalkPath(path: IVector2[]) {
        const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext, path);
        if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
            this.interrupt("Organize inventory", ...organizeInventoryInterrupts);

        } else {
            multiplayer.executeClientside(() => {
                UpdateWalkPath.execute(this.human, path, true);
            });
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
    public getStatus(): Translation | string {
        if (this.navigationSystemState === NavigationSystemState.Initializing) {
            return getTarsTranslation(TarsTranslation.DialogStatusNavigatingInitializing);
        }

        if (!this.isRunning()) {
            return "Not running";
        }

        let statusMessage: string | undefined = this.human.isResting() ? "Resting..." : "Idle";

        let planStatusMessage: string | undefined;

        const plan = this.executor.getPlan();
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
                this.log.warn("Missing status message for objective", plan.tree.objective.getIdentifier(this.context));
            }
        }

        if (this.lastStatusMessage !== statusMessage) {
            this.lastStatusMessage = statusMessage;
            this.log.info(`Status: ${statusMessage}`);
        }

        const walkPath = this.context.human.walkPath;
        if (walkPath && walkPath.path.length > 0) {
            const tilesAway = Math.ceil(Vector2.distance(this.human, walkPath.path[walkPath.path.length - 1]));
            if (tilesAway > 0) {
                statusMessage += ` (${tilesAway} tile${tilesAway > 1 ? "s" : ""} away)`;
            }
        }

        return statusMessage;
    }

    public updateStatus() {
        this.event.emit("statusChange");
    }

    public async ensureSailingMode(sailingMode: boolean) {
        if (!this.utilities.navigation) {
            return;
        }

        if (this.navigationUpdatePromise) {
            return this.navigationUpdatePromise;
        }

        if (this.utilities.navigation.shouldUpdateSailingMode(sailingMode)) {
            this.log.info("Updating sailing mode", sailingMode);

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

            this.utilities.navigation.updateAll(sailingMode);

            this.utilities.navigation.queueUpdateOrigin(this.human);

            this.navigationSystemState = NavigationSystemState.Initialized;

            this.processQueuedNavigationUpdates();

            this.event.emit("navigationChange", this.navigationSystemState);
        }
    }

    private async getOrCreateModeInstance(context: Context): Promise<ITarsMode | undefined> {
        const mode = this.saveData.options.mode;

        let modeInstance = this.modeCache.get(mode);
        if (!modeInstance) {
            const modeConstructor = modes.get(mode);
            if (modeConstructor) {
                modeInstance = new modeConstructor();

                await this.initializeMode(context, mode, modeInstance);
            }
        }

        return modeInstance;
    }

    private async initializeMode(context: Context, mode: TarsMode, modeInstance: ITarsMode) {
        this.log.info(`Initializing ${TarsMode[mode]}`);

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

            this.log.info(`Disposed of "${TarsMode[mode]}" mode`);
        }
    }

    private reset(options?: Partial<IResetOptions>) {
        this.executor.reset();

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

        this.weightStatus = this.human.getWeightStatus();
        this.previousWeightStatus = undefined;

        Objective.reset();

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
            this.context = undefined as any;
            this.modeCache.clear();

        } else if (options?.resetContext || options?.resetInventory || options?.resetBase) {
            this.createContext();
        }
    }

    private createContext() {
        this.context = new Context(this, this.base, this.inventory, this.utilities);
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
        this.log.info(`Interrupt: ${reason}`, Plan.getPipelineString(this.context, interruptObjectives));

        this.executor.interrupt();

        this.objectivePipeline = undefined;

        if (interruptObjectives && interruptObjectives.length > 0) {
            this.interruptObjectivePipeline = interruptObjectives;
        }

        this.utilities.movement.resetMovementOverlays();

        multiplayer.executeClientside(() => {
            UpdateWalkPath.execute(this.human, undefined);
        });
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
            this.log.error("onTick error", ex);
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
        if (!this.isRunning() || !this.executor.isReady(this.context, false)) {
            if (this.quantumBurstCooldown === 2) {
                this.quantumBurstCooldown--;
                this.event.emit("quantumBurstChange", QuantumBurstStatus.CooldownStart);
            }

            if (game.playing && this.context.human.isGhost() && game.getGameOptions().respawn && this.context.human.asPlayer) {
                await new ExecuteAction(Respawn, []).execute(this.context);
            }

            return;
        }

        if (this.quantumBurstCooldown === 1) {
            this.quantumBurstCooldown--;
            this.event.emit("quantumBurstChange", QuantumBurstStatus.CooldownEnd);
        }

        this.clearCaches();

        // ensure context positions are set correctly
        // required since some contexts might not be reset for a while
        for (const context of [this.context, this.interruptContext, ...this.interruptContexts.values()]) {
            context?.resetPosition();
        }

        // system objectives
        await this.executor.executeObjectives(this.context, [new AnalyzeInventory(), new AnalyzeBase()], false, false);

        // interrupts
        const modeInstance = await this.getOrCreateModeInstance(this.context);
        if (!modeInstance) {
            this.disable();
            return;
        }

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
            this.log.info(`Interrupts changed from ${this.interruptIds ? Array.from(this.interruptIds).join(", ") : undefined} to ${Array.from(interruptIds).join(", ")}`);
            this.interruptIds = interruptIds;
            this.interruptObjectivePipeline = undefined;
        }

        // this.log.debug("objectivePipeline", this.objectivePipeline?.map(objective => objective.getHashCode()).join(" -> "));
        // this.log.debug("interruptObjectivePipeline", this.interruptObjectivePipeline?.map(objective => objective.getHashCode()).join(" -> "));

        if (this.interruptObjectivePipeline || interrupts.length > 0) {
            if (!this.interruptContext) {
                // we should use our main context when running interrupt objectives
                // this will prevent interrupts from messing with reserved items
                // when the context is reset, it goes back to this initial state
                this.interruptContext = this.context.clone(undefined, undefined, true);
                this.interruptContext.setInitialState();

                this.interruptContexts.clear();

                this.log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
            }

            if (this.interruptObjectivePipeline) {
                const interruptHashCode = Plan.getPipelineString(this.context, this.interruptObjectivePipeline);

                this.log.info("Continuing interrupt execution", interruptHashCode);

                const result = await this.executor.executeObjectives(this.interruptContext, this.interruptObjectivePipeline, false);
                switch (result.type) {
                    case ExecuteObjectivesResultType.Completed:
                        this.interruptObjectivePipeline = undefined;
                        // this.interruptIds = undefined;
                        this.log.info("Completed interrupt objectives");
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
                            this.log.info(`Updated continuing interrupt objectives - ${ExecuteObjectivesResultType[result.type]}`, Plan.getPipelineString(this.context, this.interruptObjectivePipeline));

                        } else {
                            this.log.info(`Ignoring continuing interrupt objectives due to changed interrupts - ${ExecuteObjectivesResultType[result.type]}. Before: ${interruptHashCode}. After: ${afterInterruptHashCode}`);
                        }

                        return;

                    case ExecuteObjectivesResultType.ContinuingNextTick:
                        this.interruptObjectivePipeline = undefined;
                        // this.interruptIds = undefined;
                        // this.objectivePipeline = undefined;
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

                    // this.log.debug("Interrupt result", result);

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
                                this.log.debug(`Deleting saved context from ${i}`);
                            }
                            break;

                        default:
                            // in progress. run again during the next tick

                            // save this context so it will be restored next time
                            this.interruptContexts.set(i, this.interruptContext.clone(undefined, undefined, true));
                            this.log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext.getHashCode()}`);

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

            // console.this.log.info("this.objective", this.objective ? this.objective.getHashCode() : undefined);

            if (this.executor.tryClearInterrupt()) {
                // nested interrupt. update interrupt context
                this.interruptContext.setInitialState();

                this.log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);

                return;
            }
        }

        if (this.executor.tryClearInterrupt()) {
            return;
        }

        // no longer working on interrupts
        this.interruptContext = undefined;

        if (this.objectivePipeline !== undefined) {
            // we have an objective we are working on
            const hashCode = Plan.getPipelineString(this.context, this.objectivePipeline);

            this.log.info("Continuing execution of objectives", hashCode);

            const result = await this.executor.executeObjectives(this.context, this.objectivePipeline, false, true);
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
                        this.log.info(`Updated continuing objectives - ${ExecuteObjectivesResultType[result.type]}`, Plan.getPipelineString(this.context, this.objectivePipeline));

                    } else {
                        this.log.info(`Ignoring continuing objectives due to changed objectives - ${ExecuteObjectivesResultType[result.type]}. Resetting. Before: ${hashCode}. After: ${afterHashCode}`);

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
        this.log.debug(`Reset context state. Context hash code: ${this.context.getHashCode()}.`);

        const objectives = await modeInstance.determineObjectives(this.context);

        const result = await this.executor.executeObjectives(this.context, objectives, true, true);
        switch (result.type) {
            case ExecuteObjectivesResultType.Pending:
            case ExecuteObjectivesResultType.ContinuingNextTick:
                // save the active objective
                this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
                this.log.info(`Saved objectives - ${ExecuteObjectivesResultType[result.type]}`, Plan.getPipelineString(this.context, this.objectivePipeline));
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
        ];

        if (stayHealthy) {
            // don't allow stamina recovery here since we might need to run away from creatures
            interrupts.push(...this.getRecoverInterrupts(context, true, false));
        }

        interrupts.push(this.nearbyCreatureInterrupt(context));

        if (context.options.allowBackpacks && this.inventory.backpack?.length) {
            interrupts.push(...this.organizeBackpackInterrupts(context, this.inventory.backpack));
        }

        // reduce weight before recovery.. probably fine
        interrupts.push(this.reduceWeightInterrupt(context));

        if (stayHealthy) {
            interrupts.push(...this.getRecoverInterrupts(context, true, true));
        }

        interrupts = interrupts.concat([
            this.buildItemObjectives(context),
            // this.reduceWeightInterrupt(context),
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

    private getRecoverInterrupts(context: Context, onlyUseAvailableItems: boolean, allowWaiting: boolean) {
        // focus on healing if our health is below 85% while poisoned
        const poisonHealthPercentThreshold = 0.85;

        const health = context.human.stat.get<IStatMax>(Stat.Health);
        const needsHealthRecovery = health.value <= this.utilities.player.getRecoverThreshold(context, Stat.Health) ||
            context.human.status.Bleeding ||
            (context.human.status.Poisoned && (health.value / health.max) <= poisonHealthPercentThreshold);

        const exceededThirstThreshold = context.human.stat.get<IStat>(Stat.Thirst).value <= this.utilities.player.getRecoverThreshold(context, Stat.Thirst);
        // const isWaterEmergency = RecoverThirst.isEmergency(context);
        const exceededHungerThreshold = context.human.stat.get<IStat>(Stat.Hunger).value <= this.utilities.player.getRecoverThreshold(context, Stat.Hunger);
        const exceededStaminaThreshold = context.human.stat.get<IStat>(Stat.Stamina).value <= this.utilities.player.getRecoverThreshold(context, Stat.Stamina);

        const objectives: Array<IObjective | undefined> = [];

        // if ((!onlyUseAvailableItems && (needsHealthRecovery || exceededThirstThreshold || exceededHungerThreshold || exceededStaminaThreshold)) ||
        //     (onlyUseAvailableItems && isWaterEmergency)) {
        //     // allow reducing weight in an emergency
        //     objectives.push(this.reduceWeightInterrupt(context, false, false));
        // }

        if (needsHealthRecovery) {
            objectives.push(new RecoverHealth(onlyUseAvailableItems));
        }

        if (allowWaiting && exceededStaminaThreshold) {
            objectives.push(new RecoverStamina());
        }

        objectives.push(new RecoverThirst({
            onlyUseAvailableItems,
            exceededThreshold: exceededThirstThreshold,
            onlyEmergencies: false,
        }));

        objectives.push(new RecoverHunger(onlyUseAvailableItems, exceededHungerThreshold));

        // if (exceededStaminaThreshold) {
        //     objectives.push(new RecoverStamina());
        // }

        if (allowWaiting) {
            objectives.push(new RecoverThirst({
                onlyUseAvailableItems,
                exceededThreshold: exceededThirstThreshold,
                onlyEmergencies: true,
            }));
        }

        return objectives;
    }

    private optionsInterrupt(): IObjective | undefined {
        return new OptionsInterrupt();
    }

    private equipmentInterrupt(context: Context): Array<IObjective | undefined> {
        if (context.options.lockEquipment) {
            return [];
        }

        const handEquipmentChange = context.utilities.item.updateHandEquipment(context);

        return [
            handEquipmentChange ? new EquipItem(handEquipmentChange.equipType, handEquipmentChange.item) : undefined,
            this.equipInterrupt(context, EquipType.Chest),
            this.equipInterrupt(context, EquipType.Legs),
            this.equipInterrupt(context, EquipType.Head),
            this.equipInterrupt(context, EquipType.Waist),
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

            this.log.info(`Going to equip ${itemToEquip} (score: ${this.utilities.item.calculateEquipItemScore(itemToEquip)}) in slot ${EquipType[equip]}.${item ? ` Replacing ${item} (score: ${this.utilities.item.calculateEquipItemScore(item)})` : ""}`);

            if (item !== undefined) {
                return new UnequipItem(item);
            }

            return new EquipItem(equip, itemToEquip);
        }
    }

    private repairsInterrupt(context: Context): IObjective[] | undefined {
        if (this.inventory.hammer === undefined) {
            return undefined;
        }

        const queuedRepairs = new Set<Item>();

        const objectives = [
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.MainHand)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.OffHand)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Chest)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Legs)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Head)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Waist)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Feet)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Neck)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Hands)),
            this.repairInterrupt(context, queuedRepairs, context.human.getEquippedItem(EquipType.Back)),
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

        return objectives.filter(objective => objective !== undefined) as IObjective[];
    }

    private repairInterrupt(context: Context, queuedRepairs: Set<Item>, itemOrItems: Item | Item[] | undefined): IObjective | undefined {
        for (const item of (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems])) {
            if (item === undefined || item.durability === undefined || item.durabilityMax === undefined || queuedRepairs.has(item)) {
                return undefined;
            }

            const threshold = this.utilities.base.isNearBase(context) ? 0.2 : 0.1;
            if (item.durability / item.durabilityMax >= threshold) {
                return undefined;
            }

            if (this.inventory.waterContainer?.includes(item) && context.human.stat.get<IStat>(Stat.Thirst).value < 2) {
                // don't worry about repairing a water container if it's an emergency
                return undefined;
            }

            queuedRepairs.add(item);

            return new RepairItem(item);
        }
    }

    private nearbyCreatureInterrupt(context: Context): IObjective | undefined {
        const shouldRunAwayFromAllCreatures = context.utilities.creature.shouldRunAwayFromAllCreatures(context);

        for (const facingDirecton of Direction.CARDINALS_AND_NONE) {
            const creature = this.checkNearbyCreature(context, facingDirecton);
            if (creature !== undefined) {
                const tamingCreature = context.getData<Creature>(ContextDataType.TamingCreature);
                if (tamingCreature && tamingCreature === creature) {
                    this.log.info(`Not defending against ${creature.getName().getString()} because we're trying to tame it`);
                    continue;
                }

                this.log.info(`Defend against ${creature.getName().getString()}`);
                return new DefendAgainstCreature(creature, shouldRunAwayFromAllCreatures || context.utilities.creature.isScaredOfCreature(context, creature));
            }
        }

        const nearbyCreatures = context.utilities.creature.getNearbyCreatures(context);
        for (const creature of nearbyCreatures) {
            if (shouldRunAwayFromAllCreatures || context.utilities.creature.isScaredOfCreature(context, creature)) {
                // only run away if the creature can path to us
                const path = creature.findPath(context.human, 16, context.human);
                if (path) {
                    this.log.info(`Run away from ${creature.getName().getString()}`);
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

    private buildItemObjectives(context: Context): IObjective[] {
        return this.utilities.item.getItemsToBuild(context).map(item => new BuildItem(item));
    }

    private gatherFromCorpsesInterrupt(context: Context): IObjective[] | undefined {
        if (!this.inventory.butcher) {
            return undefined;
        }

        const targets = this.utilities.object.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2.distance(context.human, corpse) < 16);

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

                    // try to butcher it the maximum amount of times. the actual amount of times could be different due to randomness
                    for (let i = 0; i < count; i++) {
                        objectives.push(new ButcherCorpse(corpse));
                    }
                }
            }
        }

        return objectives;
    }

    private reduceWeightInterrupt(context: Context): IObjective | undefined {
        const exceededStaminaThreshold = context.human.stat.get<IStat>(Stat.Stamina).value <= this.utilities.player.getRecoverThreshold(context, Stat.Stamina);

        return new ReduceWeight({
            allowChests: !exceededStaminaThreshold || this.weightStatus !== WeightStatus.Overburdened,
            allowReservedItems: exceededStaminaThreshold && this.weightStatus === WeightStatus.Overburdened && !this.utilities.base.isNearBase(context),
            allowInventoryItems: exceededStaminaThreshold && this.weightStatus === WeightStatus.Overburdened,
            disableDrop: this.weightStatus !== WeightStatus.Overburdened && !this.utilities.base.isNearBase(context),
        });
    }

    private returnToBaseInterrupt(context: Context): IObjective | undefined {
        if (context.getData(ContextDataType.MovingToNewIsland) !== MovingToNewIslandState.Ready &&
            this.weightStatus !== WeightStatus.None &&
            this.previousWeightStatus === WeightStatus.Overburdened &&
            !this.utilities.base.isNearBase(context) &&
            context.utilities.item.getUnusedItems(context).length > 0) {
            // return to base to put some extra items in a chest
            return new MoveToBase();
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
    private organizeInventoryInterrupts(context: Context, interruptContext?: Context, walkPath?: IVector2[]): IObjective[] | undefined {
        if (context.getDataOrDefault(ContextDataType.DisableMoveAwayFromBaseItemOrganization, false) ||
            context.getData(ContextDataType.MovingToNewIsland) === MovingToNewIslandState.Ready) {
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

        this.log.info(
            objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space",
            `Reserved items: ${reservedItems.join(",")}`,
            `Unused items: ${unusedItems.join(",")}`,
            `Context reserved items: ${Array.from(context.state.reservedItems ?? []).map(reserved => `${reserved[0].id}=${reserved[1]}`).join(",")}`,
            `Interrupt context hard reserved items: ${Array.from(interruptContext?.state.reservedItems ?? []).map(reserved => `${reserved[0].id}=${reserved[1]}`).join(",")}`,
            `Objectives: ${Plan.getPipelineString(this.context, objectives)}`);

        return objectives;
    }

    /**
     * Move items into the backpack
     */
    private organizeBackpackInterrupts(context: Context, backpacks: Item[]): IObjective[] {
        const objectives: IObjective[] = [];

        // sorted by lightest to heaviest
        const itemsToMove = context.utilities.item.getItemsInInventory(context)
            .filter(item => !item.isEquipped(true) && !context.island.items.isContainer(item) && item.containedWithin === context.human.inventory)
            .sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
        if (itemsToMove.length > 0) {
            for (const backpack of backpacks) {
                const backpackContainer = backpack as IContainer;
                let weight = context.island.items.computeContainerWeight(backpackContainer);
                const weightCapacity = context.island.items.getWeightCapacity(backpackContainer);
                if (weightCapacity === undefined) {
                    continue;
                }

                while (itemsToMove.length > 0) {
                    const itemToMove = itemsToMove[0];
                    const itemToMoveWeight = itemToMove.getTotalWeight(undefined, backpackContainer);
                    if (weight + itemToMoveWeight < weightCapacity) {
                        objectives.push(new ExecuteAction(MoveItemAction, [itemToMove, backpackContainer])
                            .setStatus(`Moving ${itemToMove.getName()} into ${backpack.getName()}`));

                        weight += itemToMoveWeight;

                        itemsToMove.shift();

                    } else {
                        break;
                    }
                }
            }
        }

        return objectives;
    }

    private processQueuedNavigationUpdates() {
        if (this.navigationSystemState !== NavigationSystemState.Initialized || this.human.isResting()) {
            return;
        }

        for (const queuedUpdate of this.navigationQueuedUpdates) {
            queuedUpdate();
        }

        this.navigationQueuedUpdates.length = 0;
    }

    private processQuantumBurst() {
        if (!this.isRunning() || !this.isQuantumBurstEnabled()) {
            return;
        }

        this.context.human.nextMoveTime = 0;
        this.context.human.movingClientside = MovingClientSide.NoInput;
        this.context.human.attackAnimationTime = undefined;

        while (this.context.human.hasDelay()) {
            game.absoluteTime += 100;
        }
    }

    private getDialogSubId(): string {
        return this.asNPC ? this.human.identifier.toString() : "";
    }

}
