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
define(["require", "exports", "@wayward/game/utilities/math/Direction", "@wayward/utilities/collection/queue/PriorityQueue"], function (require, exports, Direction_1, PriorityQueue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DijkstraMap = void 0;
    class DijkstraMap {
        constructor(mapSize) {
            this.mapSize = mapSize;
            this.nodes = [];
            for (let x = 0; x < mapSize; x++) {
                for (let y = 0; y < mapSize; y++) {
                    this.nodes[(y * mapSize) + x] = {
                        x,
                        y,
                        penalty: 0,
                        disabled: false,
                        distance: 0,
                        score: 0,
                        connections: new Map(),
                    };
                }
            }
            for (let x = 0; x < mapSize; x++) {
                for (let y = 0; y < mapSize; y++) {
                    const node = this.getNode(x, y);
                    if (x != 0) {
                        node.connections.set(Direction_1.Direction.West, this.getNode(x - 1, y));
                    }
                    if (x != mapSize - 1) {
                        node.connections.set(Direction_1.Direction.East, this.getNode(x + 1, y));
                    }
                    if (y != 0) {
                        node.connections.set(Direction_1.Direction.North, this.getNode(x, y - 1));
                    }
                    if (y != mapSize - 1) {
                        node.connections.set(Direction_1.Direction.South, this.getNode(x, y + 1));
                    }
                }
            }
        }
        getNode(x, y) {
            return this.nodes[(y * this.mapSize) + x];
        }
        updateNode(x, y, penalty, disabled) {
            const node = this.getNode(x, y);
            node.penalty = penalty;
            node.disabled = disabled;
        }
        updateOrigin(origin) {
            this.origin = this.getNode(origin.x, origin.y);
            this.update();
        }
        findPath(end) {
            if (this.origin === undefined) {
                return undefined;
            }
            let endNode = this.getNode(end.x, end.y);
            const path = [];
            let success = false;
            let current = endNode;
            while (current !== undefined) {
                path[current.distance] = current;
                if (current === this.origin) {
                    success = true;
                    break;
                }
                current = current.parent;
            }
            return {
                success,
                path,
                score: endNode.score,
            };
        }
        update() {
            if (!this.origin) {
                return;
            }
            this.reset();
            const opened = new PriorityQueue_1.default(PriorityQueue_1.PriorityQueueType.LowestToHighest);
            opened.push(this.origin, 0);
            this.origin.parent = undefined;
            this.origin.distance = 0;
            this.origin.score = this.origin.penalty;
            while (true) {
                const current = opened.pop();
                if (current === undefined || current.closed) {
                    break;
                }
                current.closed = true;
                const distance = current.distance;
                const score = current.score;
                for (const direction of Direction_1.Direction.CARDINALS) {
                    const connection = current.connections.get(direction);
                    if (connection === undefined || connection.closed || connection.disabled) {
                        continue;
                    }
                    const tentativeScore = score + 1 + connection.penalty;
                    if (tentativeScore < connection.score) {
                        opened.push(connection, tentativeScore);
                        connection.parent = current;
                        connection.distance = distance + 1;
                        connection.score = tentativeScore;
                    }
                }
            }
        }
        reset() {
            for (const node of this.nodes) {
                node.parent = undefined;
                node.closed = false;
                node.distance = 0;
                node.score = 999999999;
            }
        }
    }
    exports.DijkstraMap = DijkstraMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlqa3N0cmFNYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uYXZpZ2F0aW9uL0RpamtzdHJhTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUF3QkgsTUFBYSxXQUFXO1FBTXZCLFlBQTZCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBSjNCLFVBQUssR0FBdUIsRUFBRSxDQUFDO1lBSy9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO3dCQUMvQixDQUFDO3dCQUNELENBQUM7d0JBQ0QsT0FBTyxFQUFFLENBQUM7d0JBQ1YsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsUUFBUSxFQUFFLENBQUM7d0JBQ1gsS0FBSyxFQUFFLENBQUM7d0JBQ1IsV0FBVyxFQUFFLElBQUksR0FBRyxFQUFFO3FCQUN0QixDQUFDO2dCQUNILENBQUM7WUFDRixDQUFDO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUVoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDWixJ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