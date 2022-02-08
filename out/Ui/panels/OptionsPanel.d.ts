import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation, TarsOptionSection } from "../../ITarsMod";
export default abstract class OptionsPanel extends TarsPanel {
    private readonly refreshableComponents;
    constructor(options: Array<TarsOptionSection | TarsTranslation | undefined>);
    abstract getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
