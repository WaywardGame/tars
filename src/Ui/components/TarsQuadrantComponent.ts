/*!
 * Copyright 2011-2021 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Mod from "mod/Mod";
import Text from "ui/component/Text";
import { Quadrant } from "ui/screen/screens/game/component/IQuadrantComponent";
import QuadrantComponent from "ui/screen/screens/game/component/QuadrantComponent";
import type { QuadrantComponentId } from "ui/screen/screens/game/IGameScreenApi";
import { Bound } from "utilities/Decorators";
import type TarsMod from "../../TarsMod";
import { TarsTranslation, getTarsTranslation, TARS_ID } from "../../ITarsMod";

export default class TarsQuadrantComponent extends QuadrantComponent {

    @Mod.instance<TarsMod>(TARS_ID)
    public readonly TarsMod: TarsMod;

    public static preferredQuadrant = Quadrant.BottomRight;

    private readonly statusText: Text;

    public override get preferredQuadrant() {
        return TarsQuadrantComponent.preferredQuadrant;
    }

    public constructor(id: QuadrantComponentId) {
        super(id);

        this.classes.add("hide-in-screenshot-mode");

        // advanced styling
        this.element.style.textAlign = "right";

        if (!steamworks.isElectron() || steamworks.isDevelopmentBranch()) {
            this.element.style.marginBottom = "7px";
        }

        this.statusText = new Text()
            .setText(this.TarsMod.getTranslation(TarsTranslation.DialogTitleMain))
            .appendTo(this);

        this.TarsMod.event.until(this, "remove").subscribe("statusChange", this.refresh);

        this.refresh();
    }

    @Bound
    private refresh() {
        this.statusText.setText(getTarsTranslation(TarsTranslation.DialogTitleMain).addArgs(this.TarsMod.getStatus()));
    }

}
