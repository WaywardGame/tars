define(["require", "exports", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../../core/ITars"], function (require, exports, TileHelpers_1, Vector2_1, IObjective_1, Objective_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const baseDoodadDistanceSq = Math.pow(50, 2);
    class AnalyzeBase extends Objective_1.default {
        getIdentifier() {
            return "AnalyzeBase";
        }
        getStatus() {
            return "Analyzing base";
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            let changed = false;
            const keys = Object.keys(ITars_1.baseInfo);
            for (const key of keys) {
                const info = ITars_1.baseInfo[key];
                const doodads = context.base[key] = context.base[key]
                    .filter(doodad => {
                    if (!doodad.isValid() || !context.utilities.base.matchesBaseInfo(context, info, doodad.type, doodad)) {
                        changed = true;
                        this.log.info(`"${key}" was removed`);
                        context.utilities.navigation.refreshOverlay(doodad.getTile(), doodad.x, doodad.y, doodad.z, false);
                        return false;
                    }
                    return true;
                });
                if (doodads.length === 0 || info.allowMultiple) {
                    let targets;
                    const placeNear = info.tryPlaceNear;
                    if (placeNear !== undefined && context.base[placeNear].length > 0) {
                        targets = [];
                        const nearDoodads = context.base[placeNear];
                        const possiblePoints = AnalyzeBase.getNearPointsFromDoodads(nearDoodads);
                        for (const point of possiblePoints) {
                            const tile = context.island.getTileFromPoint(point);
                            const doodad = tile.doodad;
                            if (doodad && context.utilities.base.matchesBaseInfo(context, info, doodad.type, doodad)) {
                                targets.push(doodad);
                            }
                        }
                    }
                    else {
                        targets = info.findTargets ?
                            info.findTargets(context) :
                            context.utilities.object.findDoodads(context, `${this.getIdentifier()}:${this.getUniqueIdentifier()}`, doodad => doodad.builderIdentifier !== undefined && context.utilities.base.matchesBaseInfo(context, info, doodad.type, doodad));
                    }
                    for (const target of targets) {
                        if (!info.canAdd || info.canAdd(context, target)) {
                            const distance = Vector2_1.default.squaredDistance(context.getPosition(), target);
                            if (distance < baseDoodadDistanceSq && !context.base[key].includes(target)) {
                                changed = true;
                                context.base[key].push(target);
                                this.log.info(`Found "${key}" - ${target} (distance: ${Math.round(distance)})`);
                                info.onAdd?.(context, target);
                                context.utilities.navigation.refreshOverlay(target.getTile(), target.x, target.y, target.z, true);
                                if (!info.allowMultiple) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (changed) {
                let availableUnlimitedWellLocation;
                const baseDoodads = context.utilities.base.getBaseDoodads(context);
                for (const baseDoodad of baseDoodads) {
                    const unlimitedWellTile = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: 50 });
                    if (unlimitedWellTile) {
                        availableUnlimitedWellLocation = unlimitedWellTile;
                        break;
                    }
                }
                if (availableUnlimitedWellLocation !== undefined) {
                    if (context.base.availableUnlimitedWellLocation === undefined || (context.base.availableUnlimitedWellLocation.x !== availableUnlimitedWellLocation.x ||
                        context.base.availableUnlimitedWellLocation.y !== availableUnlimitedWellLocation.y ||
                        context.base.availableUnlimitedWellLocation.z !== availableUnlimitedWellLocation.z)) {
                        context.base.availableUnlimitedWellLocation = availableUnlimitedWellLocation;
                        this.log.info(`Found unlimited well location (${context.base.availableUnlimitedWellLocation.x}, ${context.base.availableUnlimitedWellLocation.y}, ${context.base.availableUnlimitedWellLocation.z})`);
                    }
                }
                else if (context.base.availableUnlimitedWellLocation !== undefined) {
                    context.base.availableUnlimitedWellLocation = undefined;
                    this.log.info("Lost unlimited well location");
                }
                context.utilities.base.clearCache();
                await this.execute(context);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
        static getNearPointsFromDoodads(doodads) {
            return doodads.map(doodad => this.getNearPoints(doodad)).flat();
        }
        static getNearPoints(point) {
            return [
                { x: point.x, y: point.y + 2, z: point.z },
                { x: point.x, y: point.y - 2, z: point.z },
                { x: point.x + 2, y: point.y, z: point.z },
                { x: point.x - 2, y: point.y, z: point.z },
            ];
        }
    }
    exports.default = AnalyzeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hbmFseXplL0FuYWx5emVCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFN0MsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRTFDLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBRXBCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQVEsQ0FBa0IsQ0FBQztZQUNwRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxJQUFJLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFM0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztxQkFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUdoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckcsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDZixJQUFJLENBQUMsR0FBRyxDQUFDLElB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