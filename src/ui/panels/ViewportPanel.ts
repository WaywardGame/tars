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

import type Translation from "language/Translation";
import { Debounce } from "utilities/Decorators";
import { OwnEventHandler } from "event/EventManager";
import Renderer from "renderer/Renderer";
import Component from "ui/component/Component";
import { RenderSource, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "renderer/IRenderer";
import { Priority } from "event/EventEmitter";
import Bind, { IBindHandlerApi } from "ui/input/Bind";
import Bindable from "ui/input/Bindable";

import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";

export default class ViewportPanel extends TarsPanel {

    private canvas: Component<HTMLCanvasElement> | undefined;

    private renderer?: Renderer;

    private zoomLevel: number = 2;

    constructor(tarsInstance: Tars) {
        super(tarsInstance);
    }

    @OwnEventHandler(ViewportPanel, "remove")
    protected onDispose() {
        this.disposeRendererAndCanvas();
    }

    private disposeRendererAndCanvas() {
        this.disposeRenderer();

        this.canvas?.remove();
        this.canvas = undefined;
    }

    private disposeRenderer() {
        this.renderer?.delete();
        this.renderer = undefined;
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

        this.disposeRendererAndCanvas();

        const box = this.getCanvasBox();
        if (!box) {
            return;
        }

        this.canvas = new Component<HTMLCanvasElement>("canvas")
            .attributes.set("width", box[0].toString())
            .attributes.set("height", box[1].toString())
            .appendTo(this);

        const human = this.tarsInstance.getContext().human;

        this.renderer = new Renderer(this.canvas.element);
        this.renderer.fieldOfView.disabled = true;
        this.renderer.event.subscribe("getZoomLevel", () => this.zoomLevel);
        this.renderer.setOrigin(human);
        this.renderer.setViewportSize(box[0], box[1]);

        this.resize();

        human.event.until(this, "switchAway", "remove")
            .subscribe("tickStart", () => this.rerender());

        // ensures animations show correctly
        human.event.until(this, "switchAway", "remove")
            .subscribe("turnEnd", () => {
                this.renderer?.updateView(RenderSource.Mod, false);
            });

        human.event.until(this, "switchAway", "remove")
            .subscribe("postMove", () => this.rerender());
    }

    @Debounce(250)
    private resize() {
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

        this.rerender(RenderSource.Resize);
    }

    @Bind.onDown(Bindable.GameZoomIn, Priority.High)
    @Bind.onDown(Bindable.GameZoomOut, Priority.High)
    public onZoomIn(api: IBindHandlerApi) {
        if (api.mouse.isWithin(this.canvas)) {
            this.zoomLevel = Math.max(Math.min(this.zoomLevel + (api.bindable === Bindable.GameZoomIn ? 1 : -1), ZOOM_LEVEL_MAX), ZOOM_LEVEL_MIN);
            this.renderer?.updateZoomLevel();
            return true;
        }

        return false;
    }

    private rerender(reason = RenderSource.Mod) {
        this.renderer?.updateView(reason, true);
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
