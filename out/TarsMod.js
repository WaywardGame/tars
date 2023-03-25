var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventEmitter", "event/EventManager", "game/entity/action/actions/CreateControllableNPC", "game/entity/player/IMessageManager", "language/Translation", "language/impl/TranslationImpl", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/IMenuBarButton", "utilities/Files", "utilities/Log", "utilities/SearchParams", "./ITarsMod", "./core/ITars", "./core/ITarsOptions", "./core/Tars", "./core/navigation/NavigationKdTrees", "./ui/TarsDialog", "./ui/TarsOverlay", "./ui/components/TarsQuadrantComponent", "./utilities/Logger"], function (require, exports, EventBuses_1, EventEmitter_1, EventManager_1, CreateControllableNPC_1, IMessageManager_1, Translation_1, TranslationImpl_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, IMenuBarButton_1, Files_1, Log_1, SearchParams_1, ITarsMod_1, ITars_1, ITarsOptions_1, Tars_1, NavigationKdTrees_1, TarsDialog_1, TarsOverlay_1, TarsQuadrantComponent_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsMod extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.tarsInstances = new Set();
            this.tarsOverlay = new TarsOverlay_1.TarsOverlay();
            this.tarsNavigationKdTrees = new NavigationKdTrees_1.NavigationKdTrees();
        }
        get tarsInstance() {
            return this.localPlayerTars;
        }
        onInitialize() {
            (0, ITarsMod_1.setTarsMod)(this);
            if (!this.globalSaveData) {
                this.globalSaveData = {
                    dataSlots: [],
                };
            }
            if (!this.globalSaveData.dataSlots) {
                this.globalSaveData.dataSlots = [];
            }
            Log_1.default.setSourceFilter(Log_1.default.LogType.File, false, Logger_1.logSourceName);
        }
        onUninitialize() {
            this.localPlayerTars?.disable(true);
            this.localPlayerTars?.unload();
            this.localPlayerTars = undefined;
            (0, ITarsMod_1.setTarsMod)(undefined);
        }
        onLoad() {
            this.initializeTarsSaveData(this.saveData);
            window.TARS = this;
        }
        onUnload() {
            this.localPlayerTars?.unload();
            this.localPlayerTars = undefined;
            this.tarsOverlay.clear();
            window.TARS = undefined;
        }
        command(_, _player, _args) {
            this.localPlayerTars?.toggle();
        }
        onToggleTars() {
            this.localPlayerTars?.toggle();
            return true;
        }
        addDataSlot(container) {
            this.globalSaveData.dataSlots.push(container);
            this.event.emit("changedGlobalDataSlots");
        }
        renameDataSlot(container, newName) {
            container.name = newName;
            this.event.emit("changedGlobalDataSlots");
        }
        removeDataSlot(container) {
            const index = this.globalSaveData.dataSlots.findIndex(ds => ds === container);
            if (index !== -1) {
                this.globalSaveData.dataSlots.splice(index, 1);
                this.event.emit("changedGlobalDataSlots");
            }
        }
        importDataSlot(fileData) {
            const unserializedContainer = {};
            const serializer = game.saveManager.getSerializer();
            serializer.loadFromUint8Array(unserializedContainer, "container", fileData);
            if (unserializedContainer.container) {
                this.addDataSlot(unserializedContainer.container);
            }
        }
        exportDataSlot(container) {
            const serializer = game.saveManager.getSerializer();
            const serializedData = serializer.saveToUint8Array({ container }, "container");
            if (!serializedData) {
                return;
            }
            Files_1.default.download(`TARS_${container.name}.wayward`, serializedData);
        }
        refreshTarsInstanceReferences() {
            this.saveData.instanceIslandIds.clear();
            for (const tarsInstance of this.tarsInstances) {
                const npc = tarsInstance.human.asNPC;
                if (!npc) {
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
        async onGameStart() {
            if (!this.saveData.island[localIsland.id]) {
                this.saveData.island[localIsland.id] = {};
            }
            this.tarsNavigationKdTrees.load();
            const islandsToLoad = !multiplayer.isConnected() ? Array.from(this.saveData.instanceIslandIds.keys()) : [];
            this.localPlayerTars = this.createAndLoadTars(localPlayer, this.saveData);
            const tarsEvents = this.localPlayerTars.event.until(this.localPlayerTars, "unload");
            tarsEvents.subscribe("enableChange", (_, enabled) => {
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageToggle, enabled);
            });
            tarsEvents.subscribe("statusChange", () => {
                this.event.emit("statusChange");
            });
            tarsEvents.subscribe("quantumBurstChange", (_, status) => {
                switch (status) {
                    case ITars_1.QuantumBurstStatus.Start:
                        localPlayer.messages
                            .source(this.messageSource)
                            .type(IMessageManager_1.MessageType.Good)
                            .send(this.messageQuantumBurstStart);
                        break;
                    case ITars_1.QuantumBurstStatus.CooldownStart:
                        localPlayer.messages
                            .source(this.messageSource)
                            .type(IMessageManager_1.MessageType.Good)
                            .send(this.messageQuantumBurstCooldownStart, false);
                        break;
                    case ITars_1.QuantumBurstStatus.CooldownEnd:
                        localPlayer.messages
                            .source(this.messageSource)
                            .type(IMessageManager_1.MessageType.Good)
                            .send(this.messageQuantumBurstCooldownEnd, false);
                        break;
                }
            });
            tarsEvents.subscribe("navigationChange", (_, status) => {
                switch (status) {
                    case ITars_1.NavigationSystemState.Initializing:
                        localPlayer.messages
                            .source(this.messageSource)
                            .type(IMessageManager_1.MessageType.Good)
                            .send(this.messageNavigationUpdating);
                        break;
                    case ITars_1.NavigationSystemState.Initialized:
                        localPlayer.messages
                            .source(this.messageSource)
                            .type(IMessageManager_1.MessageType.Good)
                            .send(this.messageNavigationUpdated);
                        break;
                }
            });
            tarsEvents.subscribe("modeFinished", (_1, _2, success) => {
                const message = success ? this.messageTaskComplete : this.messageTaskUnableToComplete;
                const messageType = success ? IMessageManager_1.MessageType.Good : IMessageManager_1.MessageType.Bad;
                localPlayer.messages
                    .source(this.messageSource)
                    .type(messageType)
                    .send(message);
            });
            if (localPlayer.isHost()) {
                for (const islandId of islandsToLoad) {
                    const island = game.islands.getIfExists(islandId);
                    if (island && !island.isLoaded) {
                        await island.load({ isSynced: true });
                    }
                }
                const nonPlayerHumans = game.getNonPlayerHumans();
                for (const human of nonPlayerHumans) {
                    const npc = human.asNPC;
                    if (!npc || npc.uniqueNpcType !== ITars_1.tarsUniqueNpcType) {
                        continue;
                    }
                    this.bindControllableNpc(npc);
                }
            }
            if (gameScreen) {
                const dialogsOpened = this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogsOpened];
                if (Array.isArray(dialogsOpened)) {
                    for (const [dialogId, subId] of dialogsOpened) {
                        if (TarsMod.INSTANCE.dialogMain === dialogId) {
                            const tarsInstance = Array.from(this.tarsInstances)
                                .find(tarsInstance => game.islands.getIfExists(tarsInstance.human.islandId) && tarsInstance.dialogSubId === subId);
                            if (tarsInstance) {
                                gameScreen.dialogs.open(dialogId, subId)?.initialize(tarsInstance);
                            }
                        }
                    }
                }
            }
            if (!this.localPlayerTars.isRunning() && (this.localPlayerTars.isEnabled() || SearchParams_1.default.hasSwitch("autotars"))) {
                this.localPlayerTars.toggle(true);
            }
        }
        onGameEnd() {
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
        onPreSaveGame() {
            if (game.playing && this.localPlayerTars) {
                this.saveDialogState();
            }
        }
        saveDialogState() {
            if (gameScreen) {
                this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogsOpened] = [];
                for (const [dialogId, subId] of gameScreen.dialogs.getAll(TarsMod.INSTANCE.dialogMain)) {
                    if (gameScreen.dialogs.isVisible(dialogId, subId) === true) {
                        this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogsOpened].push([dialogId, subId]);
                    }
                }
            }
        }
        createAndLoadTars(human, saveData) {
            const tars = new Tars_1.default(human, saveData, this.tarsOverlay, this.tarsNavigationKdTrees);
            tars.load();
            this.tarsInstances.add(tars);
            tars.event.waitFor("unload").then(() => {
                this.tarsInstances.delete(tars);
                this.refreshTarsInstanceReferences();
            });
            this.refreshTarsInstanceReferences();
            return tars;
        }
        getStatus() {
            const status = this.tarsInstance?.getStatus() ?? "Unknown";
            return typeof (status) === "string" ? status : this.getTranslation(status).getString();
        }
        getTranslation(translation) {
            return translation instanceof TranslationImpl_1.default ? translation : new TranslationImpl_1.default(this.dictionary, translation);
        }
        initializeTarsSaveData(initial = {}) {
            if (initial.island === undefined) {
                initial.island = {};
            }
            if (initial.ui === undefined) {
                initial.ui = {};
            }
            if (!initial.instanceIslandIds || !(initial.instanceIslandIds instanceof Map)) {
                initial.instanceIslandIds = new Map();
            }
            initial.options = (0, ITarsOptions_1.createOptions)((initial.options ?? {}));
            if (initial.options.mode === ITars_1.TarsMode.Manual) {
                initial.options.mode = ITars_1.TarsMode.Survival;
            }
            return initial;
        }
        onNPCSpawn(host, npc) {
            if (npc.uniqueNpcType === ITars_1.tarsUniqueNpcType) {
                this.bindControllableNpc(npc, true);
            }
        }
        spawnNpc() {
            const spawnTile = localPlayer.tile.findMatchingTile(tile => tile.isSuitableSpawnPointTileForMultiplayer());
            if (!spawnTile) {
                throw new Error("Invalid spawn position");
            }
            CreateControllableNPC_1.default.execute(localPlayer, ITars_1.tarsUniqueNpcType, spawnTile);
        }
        bindControllableNpc(npc, openDialog) {
            if (!localPlayer.isHost()) {
                return;
            }
            const tarsNpc = npc;
            npc.event.waitFor("ready").then(() => {
                if (tarsNpc.tarsInstance) {
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
                    gameScreen?.dialogs.get(this.dialogMain, tarsNpc.tarsInstance.dialogSubId)?.close();
                    tarsNpc.tarsInstance.disable(true);
                    tarsNpc.tarsInstance.unload();
                    tarsNpc.tarsInstance = undefined;
                }
            });
            npc.event.subscribe("renamed", () => {
                if (tarsNpc.tarsInstance) {
                    const dialog = gameScreen?.dialogs.get(this.dialogMain, tarsNpc.tarsInstance.dialogSubId);
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
                gameScreen?.dialogs.open(this.dialogMain, tarsNpc.tarsInstance.dialogSubId)?.initialize(tarsNpc.tarsInstance);
            }
        }
    }
    __decorate([
        Mod_1.default.saveData()
    ], TarsMod.prototype, "saveData", void 0);
    __decorate([
        Mod_1.default.globalData()
    ], TarsMod.prototype, "globalSaveData", void 0);
    __decorate([
        ModRegistry_1.default.bindable("ToggleDialog", IInput_1.IInput.key("Comma"))
    ], TarsMod.prototype, "bindableToggleDialog", void 0);
    __decorate([
        ModRegistry_1.default.bindable("ToggleTars", IInput_1.IInput.key("Period"))
    ], TarsMod.prototype, "bindableToggleTars", void 0);
    __decorate([
        ModRegistry_1.default.messageSource("TARS")
    ], TarsMod.prototype, "messageSource", void 0);
    __decorate([
        ModRegistry_1.default.message("Toggle")
    ], TarsMod.prototype, "messageToggle", void 0);
    __decorate([
        ModRegistry_1.default.message("TaskComplete")
    ], TarsMod.prototype, "messageTaskComplete", void 0);
    __decorate([
        ModRegistry_1.default.message("TaskUnableToComplete")
    ], TarsMod.prototype, "messageTaskUnableToComplete", void 0);
    __decorate([
        ModRegistry_1.default.message("NavigationUpdating")
    ], TarsMod.prototype, "messageNavigationUpdating", void 0);
    __decorate([
        ModRegistry_1.default.message("NavigationUpdated")
    ], TarsMod.prototype, "messageNavigationUpdated", void 0);
    __decorate([
        ModRegistry_1.default.message("QuantumBurstStart")
    ], TarsMod.prototype, "messageQuantumBurstStart", void 0);
    __decorate([
        ModRegistry_1.default.message("QuantumBurstCooldownStart")
    ], TarsMod.prototype, "messageQuantumBurstCooldownStart", void 0);
    __decorate([
        ModRegistry_1.default.message("QuantumBurstCooldownEnd")
    ], TarsMod.prototype, "messageQuantumBurstCooldownEnd", void 0);
    __decorate([
        ModRegistry_1.default.dictionary("Tars", ITarsMod_1.TarsTranslation)
    ], TarsMod.prototype, "dictionary", void 0);
    __decorate([
        ModRegistry_1.default.prompt("TarsDeleteConfirm")
    ], TarsMod.prototype, "promptDeleteConfirmation", void 0);
    __decorate([
        ModRegistry_1.default.dialog("Main", TarsDialog_1.default.description, TarsDialog_1.default)
    ], TarsMod.prototype, "dialogMain", void 0);
    __decorate([
        ModRegistry_1.default.menuBarButton("Dialog", {
            onActivate: () => gameScreen?.dialogs.toggle(TarsMod.INSTANCE.dialogMain, undefined, dialog => {
                const tarsDialog = dialog;
                const tarsInstance = TarsMod.INSTANCE.tarsInstance;
                if (tarsInstance) {
                    tarsDialog.initialize(tarsInstance);
                }
                else {
                    gameScreen?.dialogs.close(TarsMod.INSTANCE.dialogMain);
                }
            }),
            group: IMenuBarButton_1.MenuBarButtonGroup.Meta,
            bindable: (0, ModRegistry_1.Registry)().get("bindableToggleDialog"),
            tooltip: tooltip => tooltip.schedule(tooltip => tooltip.getLastBlock().dump())
                .setText(Translation_1.default.get(TarsMod.INSTANCE.dictionary, ITarsMod_1.TarsTranslation.Name)),
        })
    ], TarsMod.prototype, "menuBarButton", void 0);
    __decorate([
        ModRegistry_1.default.quadrantComponent("TARS", TarsQuadrantComponent_1.default)
    ], TarsMod.prototype, "quadrantComponent", void 0);
    __decorate([
        ModRegistry_1.default.command("TARS")
    ], TarsMod.prototype, "command", null);
    __decorate([
        Bind_1.default.onDown((0, ModRegistry_1.Registry)().get("bindableToggleTars"))
    ], TarsMod.prototype, "onToggleTars", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsMod, "refreshTarsInstanceReferences")
    ], TarsMod.prototype, "refreshTarsInstanceReferences", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Game, "play", EventEmitter_1.Priority.Lowest)
    ], TarsMod.prototype, "onGameStart", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Game, "stoppingPlay", EventEmitter_1.Priority.Highest)
    ], TarsMod.prototype, "onGameEnd", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Game, "preSaveGame", EventEmitter_1.Priority.Highest)
    ], TarsMod.prototype, "onPreSaveGame", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.NPCManager, "spawn")
    ], TarsMod.prototype, "onNPCSpawn", null);
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsMod, "INSTANCE", void 0);
    exports.default = TarsMod;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc01vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzTW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQXVDQSxNQUFxQixPQUFRLFNBQVEsYUFBRztRQUF4Qzs7WUEwRmtCLGtCQUFhLEdBQWMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVyQyxnQkFBVyxHQUFnQixJQUFJLHlCQUFXLEVBQUUsQ0FBQztZQUU3QywwQkFBcUIsR0FBc0IsSUFBSSxxQ0FBaUIsRUFBRSxDQUFDO1FBbWFyRixDQUFDO1FBM1pBLElBQVcsWUFBWTtZQUN0QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0IsQ0FBQztRQUVlLFlBQVk7WUFDM0IsSUFBQSxxQkFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN6QixJQUFJLENBQUMsY0FBYyxHQUFHO29CQUNyQixTQUFTLEVBQUUsRUFBRTtpQkFDYixDQUFDO2FBQ0Y7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzthQUNuQztZQUVELGFBQUcsQ0FBQyxlQUFlLENBQUMsYUFBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLHNCQUFhLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRWUsY0FBYztZQUM3QixJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBRWpDLElBQUEscUJBQVUsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRWUsTUFBTTtZQUNyQixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFB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