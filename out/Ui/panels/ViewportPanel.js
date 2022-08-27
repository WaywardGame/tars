var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "utilities/Decorators", "event/EventManager", "renderer/Renderer", "ui/component/Component", "utilities/math/Vector2", "renderer/IRenderer", "event/EventEmitter", "ui/input/Bind", "ui/input/Bindable", "game/IGame", "../components/TarsPanel", "../../ITarsMod"], function (require, exports, Decorators_1, EventManager_1, Renderer_1, Component_1, Vector2_1, IRenderer_1, EventEmitter_1, Bind_1, Bindable_1, IGame_1, TarsPanel_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ViewportPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            this.disposed = false;
            this.zoomLevel = 2;
        }
        onDispose() {
            this.disposed = true;
            this.disposeCanvas();
        }
        disposeCanvas() {
            this.disposeGl();
            this.canvas?.remove();
            this.canvas = undefined;
        }
        disposeGl() {
            this.renderer?.delete();
            this.renderer = undefined;
            this.webGlContext?.delete();
            this.webGlContext = undefined;
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
            this.disposeCanvas();
            const box = this.getCanvasBox();
            if (!box) {
                return;
            }
            this.canvas = new Component_1.default("canvas")
                .attributes.set("width", box[0].toString())
                .attributes.set("height", box[1].toString())
                .appendTo(this);
            Renderer_1.default.createWebGlContext(this.canvas.element).then(async (context) => {
                if (this.disposed) {
                    context.delete();
                    return;
                }
                await context.load(true);
                if (this.disposed) {
                    context.delete();
                    return;
                }
                this.disposeGl();
                this.webGlContext = context;
                const human = this.tarsInstance.getContext().human;
                this.renderer = new Renderer_1.default(context, human);
                this.renderer.fieldOfView.disabled = true;
                this.renderer.event.subscribe("getZoomLevel", () => this.zoomLevel);
                this.renderer.setViewport(new Vector2_1.default(box[0], box[1]));
                this.resize();
                human.event.until(this, "switchAway", "remove")
                    .subscribe("tickStart", () => this.rerender());
                human.event.until(this, "switchAway", "remove")
                    .subscribe("turnEnd", () => {
                    this.renderer?.updateView(IRenderer_1.RenderSource.Mod, false, false);
                });
                human.event.until(this, "switchAway", "remove")
                    .subscribe("postMove", () => this.rerender());
            });
        }
        resize() {
            if (!this.canvas) {
                return;
            }
            const box = this.getCanvasBox();
            if (!box) {
                return;
            }
            const width = this.canvas.element.width = box[0];
            const height = this.canvas.element.height = box[1];
            this.renderer?.setViewport(new Vector2_1.default(width, height));
            this.rerender(IRenderer_1.RenderSource.Resize);
        }
        onZoomIn(api) {
            if (api.mouse.isWithin(this.canvas)) {
                this.zoomLevel = Math.max(Math.min(this.zoomLevel + (api.bindable === Bindable_1.default.GameZoomIn ? 1 : -1), IGame_1.ZOOM_LEVEL_MAX), IGame_1.ZOOM_LEVEL_MIN);
                this.renderer?.updateZoomLevel();
                return true;
            }
            return false;
        }
        rerender(reason = IRenderer_1.RenderSource.Mod) {
            this.renderer?.updateView(reason, true, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld3BvcnRQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVmlld3BvcnRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFpQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBV2hELFlBQVksWUFBa0I7WUFDMUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBTGhCLGFBQVEsR0FBRyxLQUFLLENBQUM7WUFFakIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUk5QixDQUFDO1FBR1MsU0FBUztZQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBRXJCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRU8sYUFBYTtZQUNqQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUM1QixDQUFDO1FBRU8sU0FBUztZQUNiLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFFMUIsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUNsQyxDQUFDO1FBRU0sY0FBYztZQUNqQixPQUFPLDBCQUFlLENBQUMsbUJBQW1CLENBQUM7UUFDL0MsQ0FBQztRQUVTLFVBQVU7WUFLaEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWQsY0FBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFJUyxZQUFZO1lBQ2xCLGNBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBR1MsUUFBUTtZQUNkLElB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