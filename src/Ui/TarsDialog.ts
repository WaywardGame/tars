import { OwnEventHandler } from "event/EventManager";
import Translation from "language/Translation";
import type { SubpanelInformation } from "ui/screen/screens/game/component/TabDialog";
import TabDialog from "ui/screen/screens/game/component/TabDialog";
import type { DialogId, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import { Edge } from "ui/screen/screens/game/Dialogs";
import { Tuple } from "utilities/collection/Arrays";
import Vector2 from "utilities/math/Vector2";
import { TarsUiSaveDataKey, getTarsTranslation, TarsTranslation } from "../ITarsMod";
import type TarsPanel from "./components/TarsPanel";
import GeneralPanel from "./panels/GeneralPanel";
import MoveToPanel from "./panels/MoveToPanel";
import TasksPanel from "./panels/TasksPanel";
import GlobalOptionsPanel from "./panels/GlobalOptionsPanel";
import ModeOptionsPanel from "./panels/ModeOptionsPanel";
import NPCsPanel from "./panels/NPCsPanel";
import Tars from "../core/Tars";
import Message from "language/dictionary/Message";
import ViewportPanel from "./panels/ViewportPanel";
import DataPanel from "./panels/DataPanel";

export type TabDialogPanelClass = new (tarsInstance: Tars) => TarsPanel;

/**
 * A list of panel classes that will appear in the dialog.
 */
const subpanelClasses: TabDialogPanelClass[] = [
	GeneralPanel,
	TasksPanel,
	MoveToPanel,
	GlobalOptionsPanel,
	ModeOptionsPanel,
	NPCsPanel,
	ViewportPanel,
	DataPanel,
];

export default class TarsDialog extends TabDialog<TarsPanel> {

	public static description: IDialogDescription = {
		minSize: new Vector2(30, 21),
		size: new Vector2(40, 70),
		maxSize: new Vector2(60, 140),
		edges: [
			[Edge.Left, 25],
			[Edge.Bottom, 33],
		],
		saveOpen: false, // the dialog has custom initialization logic
	};

	private tarsInstance: Tars | undefined;

	public constructor(id: DialogId, subId: string = "") {
		super(id, subId, false);
	}

	protected override getDefaultSubpanelInformation(): SubpanelInformation {
		for (const subpanelInformation of this.subpanelInformations) {
			if (subpanelInformation[0] === this.tarsInstance!.saveData.ui[TarsUiSaveDataKey.ActivePanelId]) {
				return subpanelInformation;
			}
		}

		return super.getDefaultSubpanelInformation();
	}

	@OwnEventHandler(TarsDialog, "changeSubpanel")
	protected onChangeSubpanel(activeSubpanel: SubpanelInformation) {
		this.tarsInstance!.saveData.ui[TarsUiSaveDataKey.ActivePanelId] = activeSubpanel[0];
	}

	public override getName(): Translation {
		if (!this.tarsInstance) {
			return Translation.message(Message.None)
		}

		return getTarsTranslation(TarsTranslation.DialogTitleMain)
			.addArgs(this.tarsInstance.getName(), this.tarsInstance.getStatus());
	}

	public initialize(tarsInstance: Tars) {
		if (this.tarsInstance !== tarsInstance) {
			this.tarsInstance = tarsInstance;
			this.initializeSubpanels();
		}

		this.tarsInstance.event.until(this, "remove").subscribe("statusChange", () => this.refreshHeader());

		this.refreshHeader();
	}

	public refreshHeader() {
		this.header.refresh();
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of subpanels.
	 * This will only be called once
	 */
	protected override getSubpanels(): TarsPanel[] {
		if (!this.tarsInstance) {
			return [];
		}

		let panels: TarsPanel[] = [];

		for (const panelClass of subpanelClasses) {
			if (panelClass === NPCsPanel && this.subId.length !== 0) {
				// don't show npc panel for npc dialog
				continue;
			}

			if (panelClass === ViewportPanel && this.subId.length === 0) {
				// don't show viewport panel for main dialog
				continue;
			}

			panels.push(new panelClass(this.tarsInstance));
		}

		return panels;
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of tuples containing information used to set-up the
	 * subpanels of this dialog.
	 * 
	 * If the subpanel classes haven't been instantiated yet, it first instantiates them by calling getSubpanels.
	 * This includes binding a `WillRemove` event handler to the panel, which will `store` (cache) the panel instead of removing it,
	 * and trigger a `SwitchAway` event on the panel when this occurs.
	 */
	protected override getSubpanelInformation(subpanels: TarsPanel[]): SubpanelInformation[] {
		return subpanels
			.map(subpanel => Tuple(
				getTarsTranslation(subpanel.getTranslation()).getString(),
				getTarsTranslation(subpanel.getTranslation()),
				this.onShowSubpanel(subpanel),
			));
	}
}
