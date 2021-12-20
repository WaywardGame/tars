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
import { Quadrant } from "ui/screen/screens/game/component/IQuadrantComponent";
import QuadrantComponent from "ui/screen/screens/game/component/QuadrantComponent";
import { QuadrantComponentId } from "ui/screen/screens/game/IGameScreenApi";
import Tars from "../../Tars";
export default class TarsQuadrantComponent extends QuadrantComponent {
    readonly TARS: Tars;
    static preferredQuadrant: Quadrant;
    private statusText;
    get preferredQuadrant(): Quadrant;
    constructor(id: QuadrantComponentId);
    private refresh;
}
