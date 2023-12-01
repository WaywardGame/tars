/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type CommandManager from "@wayward/game/command/CommandManager";
import { EventBus } from "@wayward/game/event/EventBuses";
import { IEventEmitter, Priority } from "@wayward/utilities/event/EventEmitter";
import { OwnEventHandler } from "@wayward/utilities/event/EventManager";
import { EventHandler } from "@wayward/game/event/EventManager";
import Human from "@wayward/game/game/entity/Human";
import CreateControllableNPC from "@wayward/game/game/entity/action/actions/CreateControllableNPC";
import type { Source } from "@wayward/game/game/entity/player/IMessageManager";
import { MessageType } from "@wayward/game/game/entity/player/IMessageManager";
import type Player from "@wayward/game/game/entity/player/Player";
import { IPromptConfirmDescription } from "@wayward/game/game/meta/prompt/IPrompt";
import type Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Message from "@wayward/game/language/dictionary/Message";
import TranslationImpl from "@wayward/game/language/impl/TranslationImpl";
import Mod from "@wayward/game/mod/Mod";
import Register, { Registry } from "@wayward/game/mod/ModRegistry";
import Bind from "@wayward/game/ui/input/Bind";
import type Bindable from "@wayward/game/ui/input/Bindable";
import { IInput } from "@wayward/game/ui/input/IInput";
import type { DialogId } from "@wayward/game/ui/screen/screens/game/Dialogs";
import type { QuadrantComponentId } from "@wayward/game/ui/screen/screens/game/IGameScreenApi";
import { MenuBarButtonGroup, type MenuBarButtonType } from "@wayward/game/ui/screen/screens/game/static/menubar/IMenuBarButton";
import Files from "@wayward/game/utilities/Files";
import Log from "@wayward/utilities/Log";
import SearchParams from "@wayward/utilities/SearchParams";

import NPC from "@wayward/game/game/entity/npc/NPC";
import { TranslationArg } from "@wayward/game/language/ITranslation";
import type { IGlobalSaveData, ISaveData, ISaveDataContainer, ITarsModEvents } from "./ITarsMod";
import { TARS_ID, TarsTranslation, TarsUiSaveDataKey, setTarsMod } from "./ITarsMod";
import { NavigationSystemState, QuantumBurstStatus, TarsMode, tarsUniqueNpcType } from "./core/ITars";
import { ITarsOptions, createOptions } from "./core/ITarsOptions";
import Tars, { TarsNPC } from "./core/Tars";
import { NavigationKdTrees } from "./core/navigation/NavigationKdTrees";
import TarsDialog from "./ui/TarsDialog";
import { TarsOverlay } from "./ui/TarsOverlay";
import TarsQuadrantComponent from "./ui/components/TarsQuadrantComponent";
import { logSourceName } from "./utilities/LoggerUtilities";

export default class TarsMod extends Mod {

	@Mod.instance<TarsMod>(TARS_ID)
	public static readonly INSTANCE: TarsMod;

	////////////////////////////////////

	public override event: IEventEmitter<this, ITarsModEvents>;

	////////////////////////////////////

	@Mod.saveData<TarsMod>()
	public saveData: ISaveData;

	@Mod.globalData<TarsMod>()
	public globalSaveData: IGlobalSaveData;

	////////////////////////////////////

	@Register.bindable("ToggleDialog", IInput.key("Comma"))
	public readonly bindableToggleDialog: Bindable;

	@Register.bindable("ToggleTars", IInput.key("Period"))
	public readonly bindableToggleTars: Bindable;

	////////////////////////////////////

	@Register.messageSource("TARS")
	public readonly messageSource: Source;

	@Register.message("Toggle")
	public readonly messageToggle: Message;

	@Register.message("TaskComplete")
	public readonly messageTaskComplete: Message;

	@Register.message("TaskUnableToComplete")
	public readonly messageTaskUnableToComplete: Message;

	@Register.message("NavigationUpdating")
	public readonly messageNavigationUpdating: Message;

	@Register.message("NavigationUpdated")
	public readonly messageNavigationUpdated: Message;

	@Register.message("QuantumBurstStart")
	public readonly messageQuantumBurstStart: Message;

	@Register.message("QuantumBurstCooldownStart")
	public readonly messageQuantumBurstCooldownStart: Message;

	@Register.message("QuantumBurstCooldownEnd")
	public readonly messageQuantumBurstCooldownEnd: Message;

	////////////////////////////////////

	@Register.dictionary("Tars", TarsTranslation)
	public readonly dictionary: Dictionary;

	////////////////////////////////////

	@Register.prompt("TarsDeleteConfirm", (type, prompt) => prompt.confirm<[deleteName: TranslationArg]>(type))
	public readonly promptDeleteConfirmation: IPromptConfirmDescription<[deleteName: TranslationArg]>;

	@Register.dialog("Main", TarsDialog.description, TarsDialog)
	public readonly dialogMain: DialogId;

	@Register.menuBarButton("Dialog", {
		onActivate: () => gameScreen?.dialogs.toggle<TarsDialog>(TarsMod.INSTANCE.dialogMain, undefined, dialog => {
			const tarsDialog = dialog as any as TarsDialog;

			const tarsInstance = TarsMod.INSTANCE.tarsInstance;
			if (tarsInstance) {
				tarsDialog.initialize(tarsInstance);
			} else {
				gameScreen?.dialogs.close(TarsMod.INSTANCE.dialogMain);
			}
		}),
		group: MenuBarButtonGroup.Meta,
		bindable: Registry<TarsMod>().get("bindableToggleDialog"),
		tooltip: tooltip => tooltip.schedule(tooltip => tooltip.getLastBlock().dump())
			.setText(Translation.get(TarsMod.INSTANCE.dictionary, TarsTranslation.Name)),
	})
	public readonly menuBarButton: MenuBarButtonType;

	@Register.quadrantComponent("TARS", TarsQuadrantComponent)
	public readonly quadrantComponent: QuadrantComponentId;

	////////////////////////////////////

	private readonly tarsInstances: Set<Tars> = new Set();

	private readonly tarsOverlay: TarsOverlay = new TarsOverlay(true);

	private readonly tarsNavigationKdTrees: NavigationKdTrees = new NavigationKdTrees();

	////////////////////////////////////

	private localPlayerTars: Tars | undefined;

	////////////////////////////////////

	public get tarsInstance(): Tars | undefined {
		return this.localPlayerTars;
	}

	public override onInitialize(): void {
		setTarsMod(this);

		if (!this.globalSaveData) {
			this.globalSaveData = {
				dataSlots: [],
			};
		}

		if (!this.globalSaveData.dataSlots) {
			this.globalSaveData.dataSlots = [];
		}

		Log.disableFileLogging(logSourceName);
	}

	public override onUninitialize(): void {
		this.localPlayerTars?.disable(true);
		this.localPlayerTars?.unload();
		this.localPlayerTars = undefined;

		setTarsMod(undefined);
	}

	public override onLoad(): void {
		this.initializeTarsSaveData(this.saveData);

		(window as any).TARS = this;
	}

	public override onUnload(): void {
		this.localPlayerTars?.unload();
		this.localPlayerTars = undefined;

		this.tarsOverlay.clear();

		(window as any).TARS = undefined;
	}

	@Register.command("TARS")
	public command(_: CommandManager, _player: Player, _args: string): void {
		this.localPlayerTars?.toggle();
	}

	@Bind.onDown(Registry<TarsMod>().get("bindableToggleTars"))
	public onToggleTars(): boolean {
		this.localPlayerTars?.toggle();
		return true;
	}

	////////////////////////////////////////////////

	public addDataSlot(container: ISaveDataContainer): void {
		this.globalSaveData.dataSlots.push(container);
		this.event.emit("changedGlobalDataSlots");
	}

	public renameDataSlot(container: ISaveDataContainer, newName: string): void {
		container.name = newName;
		this.event.emit("changedGlobalDataSlots");
	}

	public removeDataSlot(container: ISaveDataContainer): void {
		const index = this.globalSaveData.dataSlots.findIndex(ds => ds === container);
		if (index !== -1) {
			this.globalSaveData.dataSlots.splice(index, 1);
			this.event.emit("changedGlobalDataSlots");
		}
	}

	public importDataSlot(fileData: Uint8Array): void {
		const unserializedContainer: { container?: ISaveDataContainer } = {};

		const serializer = game.saveManager.getSerializer();
		serializer.loadFromUint8Array(unserializedContainer, "container", fileData);

		if (unserializedContainer.container) {
			this.addDataSlot(unserializedContainer.container);
		}
	}

	public exportDataSlot(container: ISaveDataContainer): void {
		const serializer = game.saveManager.getSerializer();
		const serializedData = serializer.saveToUint8Array({ container }, "container");
		if (!serializedData) {
			return;
		}

		Files.download(`TARS_${container.name}.wayward`, serializedData);
	}

	////////////////////////////////////////////////
	// Event Handlers

	@OwnEventHandler(TarsMod, "refreshTarsInstanceReferences")
	public refreshTarsInstanceReferences(): void {
		this.saveData.instanceIslandIds.clear();

		for (const tarsInstance of this.tarsInstances) {
			const npc = tarsInstance.human.asNPC;
			if (!npc) {
				// the local player island will always be loaded
				continue;
			}

			const referenceId = game.references.get(npc);
			if (!referenceId) {
				continue;
			}

			let referencesOnIsland = this.saveData.instanceIslandIds.get(tarsInstance.human.islandId);
			if (!referencesOnIsland) {
				referencesOnIsland = [];
				this.saveData.instanceIslandIds.set(tarsInstance.human.islandId, referencesOnIsland);
			}

			referencesOnIsland.push(referenceId);
		}
	}

	// lowest priority will ensure TarsNPC tars instances are initialized before this is ran
	@EventHandler(EventBus.Game, "play", Priority.Lowest)
	public async onGameStart(): Promise<void> {
		if (!this.saveData.island[localIsland.id]) {
			this.saveData.island[localIsland.id] = {};
		}

		this.tarsNavigationKdTrees.load();

		const islandsToLoad = !multiplayer.isConnected ? Array.from(this.saveData.instanceIslandIds.keys()) : [];

		this.localPlayerTars = this.createAndLoadTars(localPlayer, this.saveData);

		const tarsEvents = this.localPlayerTars.event.until(this.localPlayerTars, "unload");
		tarsEvents.subscribe("enableChange", (_, enabled) => {
			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageToggle, enabled);
		});
		tarsEvents.subscribe("statusChange", () => {
			this.event.emit("statusChange");
		});
		tarsEvents.subscribe("quantumBurstChange", (_, status) => {
			switch (status) {
				case QuantumBurstStatus.Start:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageQuantumBurstStart);
					break;

				case QuantumBurstStatus.CooldownStart:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageQuantumBurstCooldownStart, false);
					break;

				case QuantumBurstStatus.CooldownEnd:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageQuantumBurstCooldownEnd, false);
					break;
			}
		});
		tarsEvents.subscribe("navigationChange", (_, status) => {
			switch (status) {
				case NavigationSystemState.Initializing:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageNavigationUpdating);
					break;

				case NavigationSystemState.Initialized:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageNavigationUpdated);
					break;
			}
		});
		tarsEvents.subscribe("modeFinished", (_1, _2, success) => {
			const message = success ? this.messageTaskComplete : this.messageTaskUnableToComplete;
			const messageType = success ? MessageType.Good : MessageType.Bad;

			localPlayer.messages
				.source(this.messageSource)
				.type(messageType)
				.send(message);
		});

		if (localPlayer.isHost) {
			// ensure islands are loaded for all TARS instances
			for (const islandId of islandsToLoad) {
				const island = game.islands.getIfExists(islandId);
				if (island && !island.isLoaded) {
					await island.load({ isSynced: true });
				}
			}

			// activate TARS NPCs
			const nonPlayerHumans = game.getNonPlayerHumans();
			for (const human of nonPlayerHumans) {
				const npc = human.asNPC;
				if (!npc || (npc as TarsNPC).uniqueNpcType !== tarsUniqueNpcType) {
					continue;
				}

				this.bindControllableNpc(npc as TarsNPC);
			}
		}

		// reopen dialogs
		if (gameScreen) {
			const dialogsOpened = this.saveData.ui[TarsUiSaveDataKey.DialogsOpened] as Array<[DialogId, string]>;
			if (Array.isArray(dialogsOpened)) {
				for (const [dialogId, subId] of dialogsOpened) {
					if (TarsMod.INSTANCE.dialogMain === dialogId) {
						const tarsInstance = Array.from(this.tarsInstances)
							.find(tarsInstance => game.islands.getIfExists(tarsInstance.human.islandId) && tarsInstance.dialogSubId === subId);
						if (tarsInstance) {
							gameScreen.dialogs.open<TarsDialog>(dialogId, undefined, subId)?.initialize(tarsInstance);
						}
					}
				}
			}
		}

		if (!this.localPlayerTars.isRunning() && (this.localPlayerTars.isEnabled() || SearchParams.hasSwitch("autotars"))) {
			this.localPlayerTars.toggle(true);
		}
	}

	// this must run before the game screen is removed
	@EventHandler(EventBus.Game, "stoppingPlay", Priority.Highest)
	public onGameEnd(): void {
		this.saveDialogState();

		const tarsInstances = Array.from(this.tarsInstances);
		for (const tars of tarsInstances) {
			tars.disable(true);
			tars.unload();
		}

		this.tarsInstances.clear();

		this.tarsNavigationKdTrees.unload();

		this.localPlayerTars = undefined;
	}

	@EventHandler(EventBus.Game, "preSaveGame", Priority.Highest)
	public onPreSaveGame(): void {
		if (game.playing && this.localPlayerTars) {
			this.saveDialogState();
		}
	}

	private saveDialogState(): void {
		if (gameScreen) {
			this.saveData.ui[TarsUiSaveDataKey.DialogsOpened] = [];

			for (const [dialogId, subId] of gameScreen.dialogs.getAll(TarsMod.INSTANCE.dialogMain)) {
				if (gameScreen.dialogs.isVisible(dialogId, subId) === true) {
					this.saveData.ui[TarsUiSaveDataKey.DialogsOpened].push([dialogId, subId]);
				}
			}
		}
	}

	////////////////////////////////////

	public createAndLoadTars(human: Human, saveData: ISaveData): Tars {
		const tars = new Tars(human, saveData, this.tarsOverlay, this.tarsNavigationKdTrees);
		tars.load();

		this.tarsInstances.add(tars);

		tars.event.waitFor("unload").then(() => {
			this.tarsInstances.delete(tars);

			this.refreshTarsInstanceReferences();
		});

		this.refreshTarsInstanceReferences();

		return tars;
	}

	public getStatus(): string {
		const status = this.tarsInstance?.getStatus() ?? "Unknown";
		return typeof (status) === "string" ? status : this.getTranslation(status).getString();
	}

	public getTranslation(translation: TarsTranslation | string | Translation): Translation {
		return translation instanceof TranslationImpl ? translation : new TranslationImpl(this.dictionary, translation);
	}

	public initializeTarsSaveData(initial: Partial<ISaveData> = {}): ISaveData {
		if (initial.island === undefined) {
			initial.island = {};
		}

		if (initial.ui === undefined) {
			initial.ui = {};
		}

		if (!initial.instanceIslandIds || !(initial.instanceIslandIds instanceof Map)) {
			initial.instanceIslandIds = new Map();
		}

		initial.options = createOptions((initial.options ?? {}) as Partial<ITarsOptions>);

		if (initial.options.mode === TarsMode.Manual) {
			initial.options.mode = TarsMode.Survival;
		}

		return initial as ISaveData;
	}

	//////////////////////////////////////////////////

	@EventHandler(EventBus.NPCManager, "create")
	public onNPCSpawn(host: any, npc: NPC): void {
		if ((npc as TarsNPC).uniqueNpcType === tarsUniqueNpcType) {
			this.bindControllableNpc(npc as TarsNPC, true);
		}
	}

	public spawnNpc(): void {
		const spawnTile = localPlayer.tile.findMatchingTile(tile => tile.isSuitableSpawnPointTileForMultiplayer());
		if (!spawnTile) {
			throw new Error("Invalid spawn position");
		}

		CreateControllableNPC.execute(localPlayer, tarsUniqueNpcType, spawnTile);
	}

	/**
	 * Assume direct control of an NPC
	 */
	private bindControllableNpc(npc: TarsNPC, openDialog?: boolean): void {
		if (!localPlayer.isHost) {
			// never bind against server-controlled npcs
			return;
		}

		const tarsNpc: typeof npc & { tarsInstance?: Tars } = npc;

		npc.event.waitFor("ready").then(() => {
			if (tarsNpc.tarsInstance) {
				// already ready
				return;
			}

			if (!tarsNpc.saveData) {
				tarsNpc.saveData = this.initializeTarsSaveData();
			}

			tarsNpc.tarsInstance = this.createAndLoadTars(tarsNpc, tarsNpc.saveData);

			if (tarsNpc.tarsInstance.isEnabled()) {
				tarsNpc.tarsInstance.toggle(true);
			}
		});

		npc.event.waitFor("cleanup").then(() => {
			if (tarsNpc.tarsInstance) {
				gameScreen?.dialogs.get<TarsDialog>(this.dialogMain, tarsNpc.tarsInstance.dialogSubId)?.close();

				tarsNpc.tarsInstance.disable(true);
				tarsNpc.tarsInstance.unload();
				tarsNpc.tarsInstance = undefined;
			}
		});

		npc.event.subscribe("renamed", () => {
			if (tarsNpc.tarsInstance) {
				const dialog = gameScreen?.dialogs.get<TarsDialog>(this.dialogMain, tarsNpc.tarsInstance.dialogSubId);
				if (dialog) {
					dialog.refreshHeader();
				}
			}
		});

		npc.event.subscribe("loadedOnIsland", () => {
			this.event.emit("refreshTarsInstanceReferences");
		});

		if (!tarsNpc.saveData) {
			tarsNpc.saveData = this.initializeTarsSaveData();
		}

		tarsNpc.tarsInstance = this.createAndLoadTars(tarsNpc, tarsNpc.saveData);

		if (tarsNpc.tarsInstance.isEnabled()) {
			tarsNpc.tarsInstance.toggle(true);
		}

		if (openDialog) {
			gameScreen?.dialogs.open<TarsDialog>(this.dialogMain, undefined, tarsNpc.tarsInstance.dialogSubId)?.initialize(tarsNpc.tarsInstance);
		}
	}

}
