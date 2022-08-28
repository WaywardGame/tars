import type Translation from "language/Translation";
import Island from "game/island/Island";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
import TarsMod from "../../TarsMod";
export default class NPCsPanel extends TarsPanel {
    readonly TarsMod: TarsMod;
    private readonly rows;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected onIslandActivated(island: Island): void;
    protected onIslandDeactivated(island: Island): void;
    protected refresh(): Promise<void>;
}
