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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventEmitter", "event/EventManager", "game/entity/action/actions/CreateControllableNPC", "game/entity/player/IMessageManager", "language/Translation", "language/impl/TranslationImpl", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/IMenuBarButton", "utilities/Files", "utilities/Log", "utilities/SearchParams", "./ITarsMod", "./core/ITars", "./core/ITarsOptions", "./core/Tars", "./core/navigation/NavigationKdTrees", "./ui/TarsDialog", "./ui/TarsOverlay", "./ui/components/TarsQuadrantComponent", "./utilities/LoggerUtilities"], function (require, exports, EventBuses_1, EventEmitter_1, EventManager_1, CreateControllableNPC_1, IMessageManager_1, Translation_1, TranslationImpl_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, IMenuBarButton_1, Files_1, Log_1, SearchParams_1, ITarsMod_1, ITars_1, ITarsOptions_1, Tars_1, NavigationKdTrees_1, TarsDialog_1, TarsOverlay_1, TarsQuadrantComponent_1, LoggerUtilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsMod extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.tarsInstances = new Set();
            this.tarsOverlay = new TarsOverlay_1.TarsOverlay(true);
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
            Log_1.default.setSourceFilter(Log_1.default.LogType.File, false, LoggerUtilities_1.logSourceName);
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
                                gameScreen.dialogs.open(dialogId, undefined, subId)?.initialize(tarsInstance);
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
                gameScreen?.dialogs.open(this.dialogMain, undefined, tarsNpc.tarsInstance.dialogSubId)?.initialize(tarsNpc.tarsInstance);
            }
        }
    }
    exports.default = TarsMod;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc01vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzTW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQXlDSCxNQUFxQixPQUFRLFNBQVEsYUFBRztRQUF4Qzs7WUEwRmtCLGtCQUFhLEdBQWMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVyQyxnQkFBVyxHQUFnQixJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakQsMEJBQXFCLEdBQXNCLElBQUkscUNBQWlCLEVBQUUsQ0FBQztRQW1hckYsQ0FBQztRQTNaQSxJQUFXLFlBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFZSxZQUFZO1lBQzNCLElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUVqQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRztvQkFDckIsU0FBUyxFQUFFLEVBQUU7aUJBQ2IsQ0FBQzthQUNGO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDbkM7WUFFRCxhQUFHLENBQUMsZUFBZSxDQUFDLGFBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSwrQkFBYSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVlLGNBQWM7WUFDN0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztZQUVqQyxJQUFBLHFCQUFVLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVlLE1BQU07WUFD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