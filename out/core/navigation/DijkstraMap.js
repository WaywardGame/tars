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
define(["require", "exports", "utilities/math/Direction", "utilities/collection/queue/PriorityQueue"], function (require, exports, Direction_1, PriorityQueue_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlqa3N0cmFNYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uYXZpZ2F0aW9uL0RpamtzdHJhTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUF3QkgsTUFBYSxXQUFXO1FBTXBCLFlBQTZCLE9BQWU7WUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBSjNCLFVBQUssR0FBdUIsRUFBRSxDQUFDO1lBSzVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUc7d0JBQzVCLENBQUM7d0JBQ0QsQ0FBQzt3QkFDRCxPQUFPLEVBQUUsQ0FBQzt3QkFDVixRQUFRLEVBQUUsS0FBSzt3QkFDZixRQUFRLEVBQUUsQ0FBQzt3QkFDWCxLQUFLLEVBQUUsQ0FBQzt3QkFDUixXQUFXLEVBQUUsSUFBSSxHQUFHLEVBQUU7cUJBQ3pCLENBQUM7aUJBQ0w7YUFDSjtZQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUVoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQVMs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