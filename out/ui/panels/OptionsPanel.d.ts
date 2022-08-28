import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation, TarsOptionSection } from "../../ITarsMod";
import Tars from "../../core/Tars";
export default abstract class OptionsPanel extends TarsPanel {
    private readonly refreshableComponents;
    constructor(tarsInstance: Tars, options: Array<TarsOptionSection | TarsTranslation | undefined>);
    abstract getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
