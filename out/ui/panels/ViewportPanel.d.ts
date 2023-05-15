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
