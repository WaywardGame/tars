import TabDialogPanel from "ui/screen/screens/game/component/TabDialogPanel";
import type Translation from "language/Translation";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
export default abstract class TarsPanel extends TabDialogPanel {
    protected readonly tarsInstance: Tars;
    abstract getTranslation(): TarsTranslation | Translation;
    protected abstract onSwitchTo(): void;
    protected abstract refresh(): void;
    constructor(tarsInstance: Tars);
    protected _onSwitchTo(): void;
}
