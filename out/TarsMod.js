var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/entity/player/IMessageManager", "language/Translation", "mod/Mod", "mod/ModRegistry", "ui/input/Bind", "ui/input/IInput", "ui/screen/screens/game/static/menubar/IMenuBarButton", "utilities/Log", "event/EventBuses", "event/EventManager", "language/impl/TranslationImpl", "./core/navigation/Navigation", "./ui/TarsDialog", "./utilities/Logger", "./ui/components/TarsQuadrantComponent", "./ITarsMod", "./core/Tars", "./core/ITars", "./core/planning/Planner"], function (require, exports, IMessageManager_1, Translation_1, Mod_1, ModRegistry_1, Bind_1, IInput_1, IMenuBarButton_1, Log_1, EventBuses_1, EventManager_1, TranslationImpl_1, Navigation_1, TarsDialog_1, Logger_1, TarsQuadrantComponent_1, ITarsMod_1, Tars_1, ITars_1, Planner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsMod extends Mod_1.default {
        constructor() {
            super(...arguments);
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
            var _a, _b;
            (_a = this.tars) === null || _a === void 0 ? void 0 : _a.disable(true);
            (_b = this.tars) === null || _b === void 0 ? void 0 : _b.unload();
            this.tars = undefined;
            (0, ITarsMod_1.setTarsMod)(undefined);
        }
        onLoad() {
            var _a;
            this.ensureSaveData();
            this.tars = new Tars_1.default(this.saveData);
            (_a = this.tars) === null || _a === void 0 ? void 0 : _a.load();
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
                gameScreen === null || gameScreen === void 0 ? void 0 : gameScreen.dialogs.open(TarsMod.INSTANCE.dialogMain);
            }
        }
        onUnload() {
            var _a;
            (_a = this.tars) === null || _a === void 0 ? void 0 : _a.unload();
            this.tars = undefined;
            Log_1.default.removePreConsoleCallback(Logger_1.loggerUtilities.preConsoleCallback);
            window.TARS = undefined;
            if (this.gamePlaying && (gameScreen === null || gameScreen === void 0 ? void 0 : gameScreen.dialogs.isVisible(TarsMod.INSTANCE.dialogMain))) {
                this.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.DialogOpened] = true;
                gameScreen === null || gameScreen === void 0 ? void 0 : gameScreen.dialogs.close(TarsMod.INSTANCE.dialogMain);
            }
        }
        command(_, _player, _args) {
            var _a;
            (_a = this.tars) === null || _a === void 0 ? void 0 : _a.toggle();
        }
        onToggleTars() {
            var _a;
            (_a = this.tars) === null || _a === void 0 ? void 0 : _a.toggle();
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
            var _a, _b;
            const status = (_b = (_a = this.tarsInstance) === null || _a === void 0 ? void 0 : _a.getStatus()) !== null && _b !== void 0 ? _b : "Unknown";
            return typeof (status) === "string" ? status : this.getTranslation(status).getString();
        }
        getTranslation(translation) {
            return translation instanceof TranslationImpl_1.default ? translation : new TranslationImpl_1.default(this.dictionary, translation);
        }
        ensureSaveData() {
            var _a;
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
                stayHealthy: true,
                recoverThresholdHealth: 30,
                recoverThresholdStamina: 20,
                recoverThresholdHunger: 8,
                recoverThresholdThirst: 10,
                recoverThresholdThirstFromMax: -10,
                quantumBurst: false,
                developerMode: false,
                ...((_a = this.saveData.options) !== null && _a !== void 0 ? _a : {}),
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
            onActivate: () => gameScreen === null || gameScreen === void 0 ? void 0 : gameScreen.dialogs.toggle(TarsMod.INSTANCE.dialogMain),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc01vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXJzTW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWtDQSxNQUFxQixPQUFRLFNBQVEsYUFBRztRQUF4Qzs7WUE0RVMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUE4TTdCLENBQUM7UUE1TUEsSUFBVyxZQUFZO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNsQixDQUFDO1FBRWUsWUFBWTtZQUMzQixJQUFBLHFCQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFFakIsb0JBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFdEMsYUFBRyxDQUFDLGVBQWUsQ0FBQyxhQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsc0JBQWEsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFZSxjQUFjOztZQUM3QixNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBRXRCLElBQUEscUJBQVUsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRWUsTUFBTTs7WUFDckIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXRCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BDLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsSUFBSSxFQUFFLENBQUM7WUFFbEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUQsVUFB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