import type Translation from "@wayward/game/language/Translation";
// eslint-disable-next-line import/no-deprecated
import { Debounce } from "@wayward/utilities/Decorators";
import { OwnEventHandler } from "@wayward/utilities/event/EventManager";
import { Renderer } from "@wayward/game/renderer/Renderer";
import Component from "@wayward/game/ui/component/Component";
import { RenderSource, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "@wayward/game/renderer/IRenderer";
import { Priority } from "@wayward/utilities/event/EventEmitter";
import type { IBindHandlerApi } from "@wayward/game/ui/input/Bind";
import Bind from "@wayward/game/ui/input/Bind";
import Bindable from "@wayward/game/ui/input/Bindable";

import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";

export default class ViewportPanel extends TarsPanel {

	private canvas: Component<HTMLCanvasElement> | undefined;

	private renderer?: Renderer;

	private zoomLevel = 2;

	@OwnEventHandler(ViewportPanel, "remove")
	protected onDispose(): void {
		this.disposeRendererAndCanvas();
	}

	private disposeRendererAndCanvas(): void {
		this.disposeRenderer();

		this.canvas?.remove();
		this.canvas = undefined;
	}

	private disposeRenderer(): void {
		void this.renderer?.delete();
		this.renderer = undefined;
	}

	public getTranslation(): TarsTranslation | Translation {
		return TarsTranslation.DialogPanelViewport;
	}

	protected onSwitchTo(): void {
		// const events = this.tarsInstance.getContext().island.npcs.event.until(this, "switchAway", "remove");
		// events.subscribe("spawn", this.refresh);
		// events.subscribe("remove", this.refresh);

		this.resize();

		Bind.registerHandlers(this);
	}

	@OwnEventHandler(ViewportPanel, "switchAway")
	@OwnEventHandler(ViewportPanel, "remove")
	protected onSwitchAway(): void {
		Bind.deregisterHandlers(this);
	}

	@OwnEventHandler(ViewportPanel, "append")
	protected async onAppend(): Promise<void> {
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

		this.renderer = await Renderer.create(this.canvas.element);
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

	// eslint-disable-next-line import/no-deprecated
	@Debounce(250)
	private resize(): void {
		if (!this.canvas || !this.renderer) {
			return;
		}

		const box = this.getCanvasBox();
		if (!box) {
			return;
		}

		const width = this.canvas.element.width = Math.round(box[0]);
		const height = this.canvas.element.height = Math.round(box[1]);
		this.renderer.setViewportSize(width, height);

		this.rerender(RenderSource.Resize);
	}

	@Bind.onDown(Bindable.GameZoomIn, Priority.High)
	@Bind.onDown(Bindable.GameZoomOut, Priority.High)
	public onZoomIn(api: IBindHandlerApi): boolean {
		if (api.mouse.isWithin(this.canvas)) {
			this.zoomLevel = Math.max(Math.min(this.zoomLevel + (api.bindable === Bindable.GameZoomIn ? 1 : -1), ZOOM_LEVEL_MAX), ZOOM_LEVEL_MIN);
			this.renderer?.updateZoomLevel();
			return true;
		}

		return false;
	}

	private rerender(reason = RenderSource.Mod): void {
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
