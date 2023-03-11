import type Translation from "language/Translation";
import { TarsTranslation } from "../../ITarsMod";
import TarsMod from "../../TarsMod";
import Tars from "../../core/Tars";
import TarsPanel from "../components/TarsPanel";
export default class DataPanel extends TarsPanel {
    readonly TarsMod: TarsMod;
    private readonly rows;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): Promise<void>;
}
