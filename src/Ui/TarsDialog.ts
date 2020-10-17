import Translation from "language/Translation";
import Mod from "mod/Mod";
import { CheckButton } from "newui/component/CheckButton";
import { LabelledRow } from "newui/component/LabelledRow";
import Dialog from "newui/screen/screens/game/component/Dialog";
import { DialogId, Edge, IDialogDescription } from "newui/screen/screens/game/Dialogs";
import Vector2 from "utilities/math/Vector2";

import { TarsTranslation, TARS_ID } from "../ITars";
import Tars from "../Tars";

export default class TarsDialog extends Dialog {

	public static description: IDialogDescription = {
		minSize: new Vector2(15, 20),
		size: new Vector2(15, 25),
		maxSize: new Vector2(20, 25),
		edges: [
			[Edge.Left, 25],
			[Edge.Bottom, 33],
		],
	};

	@Mod.instance<Tars>(TARS_ID)
	public readonly TARS: Tars;

	private readonly statusLabel: LabelledRow;
	private readonly enableButton: CheckButton;

	public constructor(id: DialogId) {
		super(id);

		this.registerHookHost("TarsDialog");

		this.statusLabel = new LabelledRow()
			.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
			.appendTo(this.body);

		this.enableButton = new CheckButton()
			.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonEnable))
			.setRefreshMethod(() => this.TARS.isEnabled())
			.event.subscribe("willToggle", (_, checked) => {
				if (this.TARS.isEnabled() !== checked) {
					this.TARS.toggle();
				}

				return true;
			})
			.appendTo(this.body);

		const events = this.TARS.event.until(this, "close");
		events.subscribe("enableChange", () => this.enableButton.refresh());
		events.subscribe("statusChange", (_, status) => {
			// don't call refresh because we already calculated status when passing it to this method
			// this.statusLabel.refresh();
			this.statusLabel.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(status)));
		});
	}

	@Override public getName(): Translation {
		return this.TARS.getTranslation(TarsTranslation.DialogTitleMain);
	}
}
