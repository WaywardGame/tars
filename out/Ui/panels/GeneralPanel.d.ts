import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
export default class GeneralPanel extends TarsPanel {
    private readonly buttonEnable;
    private readonly choiceListMode;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
