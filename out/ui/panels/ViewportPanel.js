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
define(["require", "exports", "utilities/Decorators", "event/EventManager", "renderer/Renderer", "ui/component/Component", "renderer/IRenderer", "event/EventEmitter", "ui/input/Bind", "ui/input/Bindable", "../components/TarsPanel", "../../ITarsMod"], function (require, exports, Decorators_1, EventManager_1, Renderer_1, Component_1, IRenderer_1, EventEmitter_1, Bind_1, Bindable_1, TarsPanel_1, ITarsMod_1) {
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
        onAppend() {
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
            this.renderer = new Renderer_1.default(this.canvas.element);
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
    exports.default = ViewportPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld3BvcnRQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVmlld3BvcnRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7Ozs7Ozs7SUFnQkgsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBUWhELFlBQVksWUFBa0I7WUFDMUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBSGhCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFJOUIsQ0FBQztRQUdTLFNBQVM7WUFDZixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRU8sd0JBQXdCO1lBQzVCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUV2QixJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFFTyxlQUFlO1lBQ25CLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDOUIsQ0FBQztRQUVNLGNBQWM7WUFDakIsT0FBTywwQkFBZSxDQUFDLG1CQUFtQixDQUFDO1FBQy9DLENBQUM7UUFFUyxVQUFVO1lBS2hCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBSVMsWUFBWTtZQUNsQixjQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUdTLFFBQVE7WUFDZCxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQztpQkFDdEQsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJ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