import type Translation from "language/Translation";
import Tars from "../../core/Tars";
import { TarsTranslation } from "../../ITarsMod";
import TarsPanel from "../components/TarsPanel";
export default class GeneralPanel extends TarsPanel {
    private readonly buttonEnable;
    private readonly choiceListMode;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
