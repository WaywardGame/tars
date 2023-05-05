import type Translation from "language/Translation";
import { TarsOptionSection, TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
import TarsPanel from "../components/TarsPanel";
export default abstract class OptionsPanel extends TarsPanel {
    private readonly refreshableComponents;
    constructor(tarsInstance: Tars, options: Array<TarsOptionSection | TarsTranslation | undefined>);
    abstract getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
