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
import { IVector2 } from "utilities/math/IVector";
import { Direction } from "utilities/math/Direction";
export interface IDijkstraMapNode extends IVector2 {
    penalty: number;
    disabled: boolean;
    connections: Map<Direction, IDijkstraMapNode>;
    parent?: IDijkstraMapNode;
    distance: number;
    score: number;
    closed?: boolean;
}
export declare class DijkstraMap {
    private readonly mapSize;
    private readonly nodes;
    private origin;
    constructor(mapSize: number);
    getNode(x: number, y: number): IDijkstraMapNode;
    updateNode(x: number, y: number, penalty: number, disabled: boolean): void;
    updateOrigin(origin: IVector2): void;
    findPath(end: IVector2): {
        success: boolean;
        path: IDijkstraMapNode[];
        score: number;
    } | undefined;
    private update;
    private reset;
}
