var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/entity/player/IMessageManager", "language/Translation", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/IMenuBarButton", "utilities/Log", "event/EventBuses", "event/EventManager", "language/impl/TranslationImpl", "./core/navigation/Navigation", "./ui/TarsDialog", "./utilities/Logger", "./ui/components/TarsQuadrantComponent", "./ITarsMod", "./core/Tars", "./core/ITars", "./core/planning/Planner", "./ui/TarsOverlay"], function (require, exports, IMessageManager_1, Translation_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, IMenuBarButton_1, Log_1, EventBuses_1, EventManager_1, TranslationImpl_1, Navigation_1, TarsDialog_1, Logger_1, TarsQuadrantComponent_1, ITarsMod_1, Tars_1, ITars_1, Planner_1, TarsOverlay_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsMod extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.tarsOverlay = new TarsOverlay_1.TarsOverlay();
            this.gamePlaying = false;
        }
        get tarsInstance() {
            return this.tars;
        }
        onInitialize() {
            (0, ITarsMod_1.setTarsMod)(this);
            Navigation_1.default.setModPath(this.getPath());
            Log_1.default.setSourceFilter(Log_1.default.LogType.File, false, Logger_1.logSourceName);
        }
        onUninitialize() {
            this.tars?.disable(true);
            this.tars?.unload();
            this.tars = undefined;
            (0, ITarsMod_1.setTarsMod)(undefined);
        }
        onLoad() {
            this.ensureSaveData();
            this.tars = new Tars_1.default(this.saveData, this.tarsOverlay);
            this.tars.load();
            const tarsEvents = this.tars.event.until(this.tars, "delete");
            tarsEvents.subscribe("enableChange", (_, enabled) => {
                localPlayer.messages
                    .source(this.messageSource)
                    .type(IMessageManager_1.MessageType.Good)
                    .send(this.messageToggle, enabled);
                this.event.emit("enableChange", enabled);
            });
            tarsEvents.subscribe("optionsChange", (_, options) => {
                this.event.emit("optionsChange", options);
            });
            tarsEvents.subscribe("statusChange", (_, status) => {
                this.event.emit("statusChange", typeof (status) === "string" ? status : this.getTranslation(status).getString());
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
            tarsEvents.subscribe("modeFinished", (_, success) => {
                const message = success ? this.messageTaskComplete : this.messageTaskUnableToComplete;
                const messageType = success ? IMessageManager_1.MessageType.Good : IMessageManager_1.MessageType.Bad;
                localPlayer.messages
                    .source(this.messageSource)
                    .type(messageType)
                    .send(message);
            });
            Log_1.default.addPreConsoleCallback(Logger_1.loggerUtilities.preConsoleCallback);
            window.TARS = this;
            if (this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogOpened]) {
                this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogOpened] = undefined;
                gameScreen?.dialogs.open(TarsMod.INSTANCE.dialogMain);
            }
        }
        onUnload() {
            this.tars?.unload();
            this.tars = undefined;
            this.tarsOverlay.clear();
            Log_1.default.removePreConsoleCallback(Logger_1.loggerUtilities.preConsoleCallback);
            window.TARS = undefined;
            if (this.gamePlaying && gameScreen?.dialogs.isVisible(TarsMod.INSTANCE.dialogMain)) {
                this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogOpened] = true;
                gameScreen?.dialogs.close(TarsMod.INSTANCE.dialogMain);
            }
        }
        command(_, _player, _args) {
            this.tars?.toggle();
        }
        onToggleTars() {
            this.tars?.toggle();
            return true;
        }
        onGameStart() {
            this.gamePlaying = true;
            if (!this.saveData.island[localIsland.id]) {
                this.saveData.island[localIsland.id] = {};
            }
            if (this.tars && !this.tars.isRunning() && (this.tars.isEnabled() || new URLSearchParams(window.location.search).has("autotars"))) {
                this.tars.toggle(true);
            }
        }
        onGameEnd(state) {
            this.gamePlaying = false;
            if (!this.tars) {
                return;
            }
            this.tars.disable(true);
            this.tars.unload();
            this.tars = undefined;
        }
        getStatus() {
            const status = this.tarsInstance?.getStatus() ?? "Unknown";
            return typeof (status) === "string" ? status : this.getTranslation(status).getString();
        }
        getTranslation(translation) {
            return translation instanceof TranslationImpl_1.default ? translation : new TranslationImpl_1.default(this.dictionary, translation);
        }
        ensureSaveData() {
            if (this.saveData.island === undefined) {
                this.saveData.island = {};
            }
            if (this.saveData.ui === undefined) {
                this.saveData.ui = {};
            }
            this.saveData.options = {
                mode: ITars_1.TarsMode.Survival,
                exploreIslands: true,
                useOrbsOfInfluence: true,
                goodCitizen: true,
                stayHealthy: true,
                recoverThresholdHealth: 30,
                recoverThresholdStamina: 20,
                recoverThresholdHunger: 8,
                recoverThresholdThirst: 10,
                recoverThresholdThirstFromMax: -10,
                quantumBurst: false,
                developerMode: false,
                ...(this.saveData.options ?? {}),
            };
            if (this.saveData.options.mode === ITars_1.TarsMode.Manual) {
                this.saveData.options.mode = ITars_1.TarsMode.Survival;
            }
            Planner_1.default.debug = this.saveData.options.developerMode;
        }
    }
    __decorate([
        Mod_1.default.saveData()
    ], TarsMod.prototype, "saveData", void 0);
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
        ModRegistry_1.default.dialog("Main", TarsDialog_1.default.description, TarsDialog_1.default)
    ], TarsMod.prototype, "dialogMain", void 0);
    __decorate([
        ModRegistry_1.default.menuBarButton("Dialog", {
            onActivate: () => gameScreen?.dialogs.toggle(TarsMod.INSTANCE.dialogMain),
            group: IMenuBarButton_1.MenuBarButtonGroup.Meta,
            bindable: (0, ModRegistry_1.Registry)().get("bindableToggleDialog"),
            tooltip: tooltip => tooltip.dump().addText(text => text.setText(Translation_1.default.get(TarsMod.INSTANCE.dictionary, ITarsMod_1.TarsTranslation.DialogTitleMain))),
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
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Game, "play")
    ], TarsMod.prototype, "onGameStart", null);
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Game, "stoppingPlay")
    ], TarsMod.prototype, "onGameEnd", null);
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsMod, "INSTANCE", void 0);
    exports.default = TarsMod;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc01vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzTW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW1DQSxNQUFxQixPQUFRLFNBQVEsYUFBRztRQUF4Qzs7WUE0RWtCLGdCQUFXLEdBQWdCLElBQUkseUJBQVcsRUFBRSxDQUFDO1lBRXRELGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBaU43QixDQUFDO1FBL01BLElBQVcsWUFBWTtZQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVlLFlBQVk7WUFDM0IsSUFBQSxxQkFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpCLG9CQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLGFBQUcsQ0FBQyxlQUFlLENBQUMsYUFBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLHNCQUFhLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRWUsY0FBYztZQUM3QixJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBRXRCLElBQUEscUJBQVUsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRWUsTUFBTTtZQUNyQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGNBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWpCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJ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