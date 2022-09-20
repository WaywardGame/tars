var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventEmitter", "game/entity/action/actions/CreateControllableNPC", "game/entity/player/IMessageManager", "language/Translation", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/IMenuBarButton", "utilities/Log", "event/EventBuses", "event/EventManager", "language/impl/TranslationImpl", "utilities/game/TileHelpers", "utilities/Files", "utilities/SearchParams", "./core/navigation/Navigation", "./ui/TarsDialog", "./utilities/Logger", "./ui/components/TarsQuadrantComponent", "./ITarsMod", "./core/Tars", "./core/ITars", "./ui/TarsOverlay", "./core/ITarsOptions"], function (require, exports, EventEmitter_1, CreateControllableNPC_1, IMessageManager_1, Translation_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, IMenuBarButton_1, Log_1, EventBuses_1, EventManager_1, TranslationImpl_1, TileHelpers_1, Files_1, SearchParams_1, Navigation_1, TarsDialog_1, Logger_1, TarsQuadrantComponent_1, ITarsMod_1, Tars_1, ITars_1, TarsOverlay_1, ITarsOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsMod extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.tarsInstances = new Set();
            this.tarsOverlay = new TarsOverlay_1.TarsOverlay();
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
            Navigation_1.default.setModPath(this.getPath());
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
            const serializer = saveManager.getSerializer();
            serializer.loadFromUint8Array(unserializedContainer, "container", fileData);
            if (unserializedContainer.container) {
                this.addDataSlot(unserializedContainer.container);
            }
        }
        exportDataSlot(container) {
            const serializer = saveManager.getSerializer();
            const serializedData = serializer.saveToUint8Array({ container }, "container");
            if (!serializedData) {
                return;
            }
            Files_1.default.download(`TARS_${container.name}.wayward`, serializedData);
        }
        refreshTarsInstanceReferences() {
            this.saveData.instanceIslandIds.clear();
            for (const tarsInstance of this.tarsInstances) {
                const referenceId = game.references.get((tarsInstance.human.asNPC || tarsInstance.human.asPlayer));
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
            if (!multiplayer.isConnected() || localPlayer.isMultiplayerHost()) {
                for (const islandId of islandsToLoad) {
                    const island = game.islands.getIfExists(islandId);
                    if (island && !island.isLoaded) {
                        await island.load();
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
            const tars = new Tars_1.default(human, saveData, this.tarsOverlay);
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
                this.bindControllableNpc(npc);
            }
        }
        spawnNpc() {
            const spawnPosition = TileHelpers_1.default.findMatchingTile(localIsland, localPlayer, TileHelpers_1.default.isSuitableSpawnPointTileForMultiplayer);
            if (!spawnPosition) {
                throw new Error("Invalid spawn position");
            }
            CreateControllableNPC_1.default.execute(localPlayer, ITars_1.tarsUniqueNpcType, spawnPosition);
        }
        bindControllableNpc(npc) {
            if (multiplayer.isConnected() && !localPlayer.isMultiplayerHost()) {
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
            tooltip: tooltip => tooltip.dump().addText(text => text.setText(Translation_1.default.get(TarsMod.INSTANCE.dictionary, ITarsMod_1.TarsTranslation.Name))),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc01vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzTW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQXdDQSxNQUFxQixPQUFRLFNBQVEsYUFBRztRQUF4Qzs7WUF5RmtCLGtCQUFhLEdBQWMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVyQyxnQkFBVyxHQUFnQixJQUFJLHlCQUFXLEVBQUUsQ0FBQztRQXdaL0QsQ0FBQztRQS9ZQSxJQUFXLFlBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFZSxZQUFZO1lBQzNCLElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUVqQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRztvQkFDckIsU0FBUyxFQUFFLEVBQUU7aUJBQ2IsQ0FBQzthQUNGO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDbkM7WUFFRCxvQkFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV0QyxhQUFHLENBQUMsZUFBZSxDQUFDLGFBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxzQkFBYSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVlLGNBQWM7WUFDN0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztZQUVqQyxJQUFBLHFCQUFVLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVlLE1BQU07WUFDckIsSUFBSSxDQUFD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