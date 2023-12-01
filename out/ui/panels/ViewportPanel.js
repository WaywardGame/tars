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
define(["require", "exports", "@wayward/utilities/Decorators", "@wayward/utilities/event/EventManager", "@wayward/game/renderer/Renderer", "@wayward/game/ui/component/Component", "@wayward/game/renderer/IRenderer", "@wayward/utilities/event/EventEmitter", "@wayward/game/ui/input/Bind", "@wayward/game/ui/input/Bindable", "../components/TarsPanel", "../../ITarsMod"], function (require, exports, Decorators_1, EventManager_1, Renderer_1, Component_1, IRenderer_1, EventEmitter_1, Bind_1, Bindable_1, TarsPanel_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ViewportPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            this.zoomLevel = 2;
        }
        onDispose() {
            this.disposeRendererAndCanvas();
        }
        disposeRendererAndCanvas() {
            this.disposeRenderer();
            this.canvas?.remove();
            this.canvas = undefined;
        }
        disposeRenderer() {
            this.renderer?.delete();
            this.renderer = undefined;
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelViewport;
        }
        onSwitchTo() {
            this.resize();
            Bind_1.default.registerHandlers(this);
        }
        onSwitchAway() {
            Bind_1.default.deregisterHandlers(this);
        }
        async onAppend() {
            this.getDialog()?.event.until(this, "switchAway", "remove")
                .subscribe("resize", () => this.resize());
            this.disposeRendererAndCanvas();
            const box = this.getCanvasBox();
            if (!box) {
                return;
            }
            this.canvas = new Component_1.default("canvas")
                .attributes.set("width", box[0].toString())
                .attributes.set("height", box[1].toString())
                .appendTo(this);
            const human = this.tarsInstance.getContext().human;
            this.renderer = await Renderer_1.Renderer.create(this.canvas.element);
            this.renderer.fieldOfView.disabled = true;
            this.renderer.event.subscribe("getZoomLevel", () => this.zoomLevel);
            this.renderer.setOrigin(human);
            this.renderer.setViewportSize(box[0], box[1]);
            this.resize();
            human.event.until(this, "switchAway", "remove")
                .subscribe("tickStart", () => this.rerender());
            human.event.until(this, "switchAway", "remove")
                .subscribe("turnEnd", () => {
                this.renderer?.updateView(IRenderer_1.RenderSource.Mod, false);
            });
            human.event.until(this, "switchAway", "remove")
                .subscribe("postMove", () => this.rerender());
        }
        resize() {
            if (!this.canvas || !this.renderer) {
                return;
            }
            const box = this.getCanvasBox();
            if (!box) {
                return;
            }
            const width = this.canvas.element.width = box[0];
            const height = this.canvas.element.height = box[1];
            this.renderer.setViewportSize(width, height);
            this.rerender(IRenderer_1.RenderSource.Resize);
        }
        onZoomIn(api) {
            if (api.mouse.isWithin(this.canvas)) {
                this.zoomLevel = Math.max(Math.min(this.zoomLevel + (api.bindable === Bindable_1.default.GameZoomIn ? 1 : -1), IRenderer_1.ZOOM_LEVEL_MAX), IRenderer_1.ZOOM_LEVEL_MIN);
                this.renderer?.updateZoomLevel();
                return true;
            }
            return false;
        }
        rerender(reason = IRenderer_1.RenderSource.Mod) {
            this.renderer?.updateView(reason, true);
        }
        refresh() {
            this.rerender();
        }
        getCanvasBox() {
            const box = this.getParent()?.getParent()?.getBox(true, true);
            if (!box) {
                return undefined;
            }
            return [box.width - 10, box.height];
        }
    }
    exports.default = ViewportPanel;
    __decorate([
        (0, EventManager_1.OwnEventHandler)(ViewportPanel, "remove")
    ], ViewportPanel.prototype, "onDispose", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(ViewportPanel, "switchAway"),
        (0, EventManager_1.OwnEventHandler)(ViewportPanel, "remove")
    ], ViewportPanel.prototype, "onSwitchAway", null);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(ViewportPanel, "append")
    ], ViewportPanel.prototype, "onAppend", null);
    __decorate([
        (0, Decorators_1.Debounce)(250)
    ], ViewportPanel.prototype, "resize", null);
    __decorate([
        Bind_1.default.onDown(Bindable_1.default.GameZoomIn, EventEmitter_1.Priority.High),
        Bind_1.default.onDown(Bindable_1.default.GameZoomOut, EventEmitter_1.Priority.High)
    ], ViewportPanel.prototype, "onZoomIn", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld3BvcnRQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVmlld3BvcnRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7Ozs7Ozs7SUFnQkgsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBUW5ELFlBQVksWUFBa0I7WUFDN0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBSGIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUk5QixDQUFDO1FBR1MsU0FBUztZQUNsQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUV2QixJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLENBQUM7UUFFTyxlQUFlO1lBQ3RCLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDM0IsQ0FBQztRQUVNLGNBQWM7WUFDcEIsT0FBTywwQkFBZSxDQUFDLG1CQUFtQixDQUFDO1FBQzVDLENBQUM7UUFFUyxVQUFVO1lBS25CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBSVMsWUFBWTtZQUNyQixjQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUdlLEFBQU4sS0FBSyxDQUFDLFFBQVE7WUFDdkIsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUM7aUJBQ3pELFNBQVMsQ0FBQyxRQUFRLEVBQUUs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