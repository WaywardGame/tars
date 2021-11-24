import Translation from "language/Translation";
import TabDialog, { SubpanelInformation } from "ui/screen/screens/game/component/TabDialog";
import { DialogId, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import Tars from "../Tars";
import TarsPanel from "./components/TarsPanel";
export declare type TabDialogPanelClass = new () => TarsPanel;
export default class TarsDialog extends TabDialog<TarsPanel> {
    static description: IDialogDescription;
    readonly TARS: Tars;
    constructor(id: DialogId);
    protected getDefaultSubpanelInformation(): SubpanelInformation;
    protected onChangeSubpanel(activeSubpanel: SubpanelInformation): void;
    getName(): Translation;
    protected getSubpanels(): TarsPanel[];
    protected getSubpanelInformation(subpanels: TarsPanel[]): SubpanelInformation[];
}
