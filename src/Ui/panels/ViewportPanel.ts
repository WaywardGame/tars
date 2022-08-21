import type Translation from "language/Translation";
import { Debounce } from "utilities/Decorators";
import { OwnEventHandler } from "event/EventManager";
import Renderer from "renderer/Renderer";
import Component from "ui/component/Component";
import Vector2 from "utilities/math/Vector2";
import WebGlContext from "renderer/WebGlContext";
import { RenderSource } from "renderer/IRenderer";
import { Priority } from "event/EventEmitter";
import Bind, { IBindHandlerApi } from "ui/input/Bind";
import Bindable from "ui/input/Bindable";
import { ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "game/IGame";

import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";

export default class ViewportPanel extends TarsPanel {

    private canvas: Component<HTMLCanvasElement> | undefined;

    private webGlContext?: WebGlContext;
    private renderer?: Renderer;

    private disposed = false;

    private zoomLevel: number = 2;

    constructor(tarsInstance: Tars) {
        super(tarsInstance);
    }

    @OwnEventHandler(ViewportPanel, "remove")
    protected onDispose() {
        this.disposed = true;

        this.disposeCanvas();
    }

    private disposeCanvas() {
        this.disposeGl();

        this.canvas?.remove();
        this.canvas = undefined;
    }

    private disposeGl() {
        this.renderer?.delete();
        this.renderer = undefined;

        this.webGlContext?.delete();
        this.webGlContext = undefined;
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelViewport;
    }

    protected onSwitchTo() {
        // const events = this.tarsInstance.getContext().island.npcs.event.until(this, "switchAway", "remove");
        // events.subscribe("spawn", this.refresh);
        // events.subscribe("remove", this.refresh);

        this.resize();

        Bind.registerHandlers(this);
    }

    @OwnEventHandler(ViewportPanel, "switchAway")
    @OwnEventHandler(ViewportPanel, "remove")
    protected onSwitchAway() {
        Bind.deregisterHandlers(this);
    }

    @OwnEventHandler(ViewportPanel, "append")
    protected onAppend() {
        this.getDialog()?.event.until(this, "switchAway", "remove")
            .subscribe("resize", () => this.resize());

        this.disposeCanvas();

        const box = this.getCanvasBox();
        if (!box) {
            return;

        }
        this.canvas = new Component<HTMLCanvasElement>("canvas")
            .attributes.set("width", box[0].toString())
            .attributes.set("height", box[1].toString())
            // .hide()
            .appendTo(this);

        Renderer.createWebGlContext(this.canvas.element).then(async (context) => {
            if (this.disposed) {
                context.delete();
                return;
            }

            await context.load(true);

            if (this.disposed) {
                context.delete();
                return;
            }

            // ensure any existing gl resources are deleted
            this.disposeGl();

            this.webGlContext = context;

            const human = this.tarsInstance.getContext().human;

            this.renderer = new Renderer(context, human);
            this.renderer.fieldOfView.disabled = true;
            this.renderer.event.subscribe("getZoomLevel", () => this.zoomLevel);
            this.renderer.setViewport(new Vector2(box[0], box[1]));

            this.resize();

            human.event.until(this, "switchAway", "remove")
                .subscribe("tickStart", () => this.rerender());

            // human.event.until(this, "switchAway", "remove")
            //     .subscribe("tickEnd", () => this.rerender());

            human.event.until(this, "switchAway", "remove")
                .subscribe("postMove", () => this.rerender());
        });
    }

    @Debounce(250)
    private resize() {
        if (!this.canvas) {
            return;
        }

        const box = this.getCanvasBox();
        if (!box) {
            return;
        }

        const width = this.canvas.element.width = box[0];
        const height = this.canvas.element.height = box[1];
        this.renderer?.setViewport(new Vector2(width, height));

        this.rerender(RenderSource.Resize);
    }

    @Bind.onDown(Bindable.GameZoomIn, Priority.High)
    @Bind.onDown(Bindable.GameZoomOut, Priority.High)
    public onZoomIn(api: IBindHandlerApi) {
        this.zoomLevel = Math.max(Math.min(this.zoomLevel + (api.bindable === Bindable.GameZoomIn ? 1 : -1), ZOOM_LEVEL_MAX), ZOOM_LEVEL_MIN);
        this.renderer?.updateZoomLevel();

        return true;
    }

    private rerender(reason = RenderSource.Mod) {
        this.renderer?.updateView(reason, true, true);
    }

    protected refresh(): void {
        this.rerender();
    }

    private getCanvasBox(): [number, number] | undefined {
        // box for tab-dialog-subpanel-wrapper
        const box = this.getParent()?.getParent()?.getBox(true, true);
        if (!box) {
            return undefined;
        }

        return [box.width - 10, box.height];
    }
}
