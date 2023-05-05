import type Translation from "language/Translation";
import { IBindHandlerApi } from "ui/input/Bind";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
export default class ViewportPanel extends TarsPanel {
    private canvas;
    private renderer?;
    private zoomLevel;
    constructor(tarsInstance: Tars);
    protected onDispose(): void;
    private disposeRendererAndCanvas;
    private disposeRenderer;
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected onSwitchAway(): void;
    protected onAppend(): void;
    private resize;
    onZoomIn(api: IBindHandlerApi): boolean;
    private rerender;
    protected refresh(): void;
    private getCanvasBox;
}
