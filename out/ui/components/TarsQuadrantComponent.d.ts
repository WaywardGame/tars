/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import type { QuadrantComponentId } from "@wayward/game/ui/screen/screens/game/IGameScreenApi";
import { Quadrant } from "@wayward/game/ui/screen/screens/game/component/IQuadrantComponent";
import QuadrantComponent from "@wayward/game/ui/screen/screens/game/component/QuadrantComponent";
import type TarsMod from "../../TarsMod";
export default class TarsQuadrantComponent extends QuadrantComponent {
    readonly TarsMod: TarsMod;
    static preferredQuadrant: Quadrant;
    get preferredQuadrant(): Quadrant;
    private readonly statusText;
    constructor(id: QuadrantComponentId);
    private refresh;
}
