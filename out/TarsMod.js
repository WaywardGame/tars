var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventEmitter", "game/entity/player/IMessageManager", "language/Translation", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/IMenuBarButton", "utilities/Log", "event/EventBuses", "event/EventManager", "language/impl/TranslationImpl", "utilities/game/TileHelpers", "renderer/IRenderer", "utilities/Files", "utilities/SearchParams", "./core/navigation/Navigation", "./ui/TarsDialog", "./utilities/Logger", "./ui/components/TarsQuadrantComponent", "./ITarsMod", "./core/Tars", "./core/ITars", "./ui/TarsOverlay", "./npc/TarsNPC", "./core/ITarsOptions"], function (require, exports, EventEmitter_1, IMessageManager_1, Translation_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, IMenuBarButton_1, Log_1, EventBuses_1, EventManager_1, TranslationImpl_1, TileHelpers_1, IRenderer_1, Files_1, SearchParams_1, Navigation_1, TarsDialog_1, Logger_1, TarsQuadrantComponent_1, ITarsMod_1, Tars_1, ITars_1, TarsOverlay_1, TarsNPC_1, ITarsOptions_1) {
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
        refreshNpcIslandIds() {
            this.saveData.instanceIslandIds.clear();
            for (const tarsInstance of this.tarsInstances) {
                this.saveData.instanceIslandIds.add(tarsInstance.human.islandId);
            }
        }
        async onGameStart() {
            if (!this.saveData.island[localIsland.id]) {
                this.saveData.island[localIsland.id] = {};
            }
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
            if (!multiplayer.isConnected()) {
                for (const islandId of this.saveData.instanceIslandIds) {
                    const island = game.islands.getIfExists(islandId);
                    if (island && !island.isLoaded) {
                        await island.load();
                    }
                }
            }
            if (gameScreen) {
                const dialogsOpened = this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogsOpened];
                if (Array.isArray(dialogsOpened)) {
                    for (const [dialogId, subId] of dialogsOpened) {
                        if (TarsMod.INSTANCE.dialogMain === dialogId) {
                            const tarsInstance = Array.from(this.tarsInstances)
                                .find(tarsInstance => game.islands.getIfExists(tarsInstance.human.islandId) && tarsInstance.getDialogSubId() === subId);
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
        onMultiplayerConnect() {
            if (!multiplayer.isServer()) {
                return;
            }
            for (const island of game.islands.active) {
                for (const npc of island.npcs) {
                    if (npc?.getRegistrarId() === this.npcType) {
                        island.npcs.remove(npc);
                    }
                }
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
            });
            this.saveData.instanceIslandIds.add(human.islandId);
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
            if (!initial.instanceIslandIds) {
                initial.instanceIslandIds = new Set();
            }
            initial.options = (0, ITarsOptions_1.createOptions)((initial.options ?? {}));
            if (initial.options.mode === ITars_1.TarsMode.Manual) {
                initial.options.mode = ITars_1.TarsMode.Survival;
            }
            return initial;
        }
        spawnNpc() {
            if (multiplayer.isConnected()) {
                throw new Error("TARS npcs are not supported in multiplayer");
            }
            const spawnPosition = TileHelpers_1.default.findMatchingTile(localIsland, localPlayer, TileHelpers_1.default.isSuitableSpawnPointTileForMultiplayer);
            if (!spawnPosition) {
                throw new Error("Invalid spawn position");
            }
            const npc = localIsland.npcs.spawn(this.npcType, spawnPosition.x, spawnPosition.y, spawnPosition.z);
            if (!npc) {
                throw new Error("Failed to spawn npc");
            }
            renderer?.updateView(IRenderer_1.RenderSource.Mod, true, true);
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
        ModRegistry_1.default.npc("TARS", TarsNPC_1.default)
    ], TarsMod.prototype, "npcType", void 0);
    __decorate([
        ModRegistry_1.default.command("TARS")
    ], TarsMod.prototype, "command", null);
    __decorate([
        Bind_1.default.onDown((0, ModRegistry_1.Registry)().get("bindableToggleTars"))
    ], TarsMod.prototype, "onToggleTars", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsMod, "refreshNpcIslandIds")
    ], TarsMod.prototype, "refreshNpcIslandIds", null);
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
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Multiplayer, "connect")
    ], TarsMod.prototype, "onMultiplayerConnect", null);
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsMod, "INSTANCE", void 0);
    exports.default = TarsMod;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc01vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzTW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQXlDQSxNQUFxQixPQUFRLFNBQVEsYUFBRztRQUF4Qzs7WUE4RmtCLGtCQUFhLEdBQWMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVyQyxnQkFBVyxHQUFnQixJQUFJLHlCQUFXLEVBQUUsQ0FBQztRQStVL0QsQ0FBQztRQXRVQSxJQUFXLFlBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFZSxZQUFZO1lBQzNCLElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUVqQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRztvQkFDckIsU0FBUyxFQUFFLEVBQUU7aUJBQ2IsQ0FBQzthQUNGO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDbkM7WUFFRCxvQkFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV0QyxhQUFHLENBQUMsZUFBZSxDQUFDLGFBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxzQkFBYSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVlLGNBQWM7WUFDN0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztZQUVqQyxJQUFBLHFCQUFVLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVlLE1BQU07WUFDckIsSUFBSSxDQUFD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