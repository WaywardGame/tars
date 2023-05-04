define(["require", "exports", "utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../../core/ITars"], function (require, exports, Vector2_1, IObjective_1, Objective_1, ITars_1) {
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
                        context.utilities.navigation.refreshOverlay(doodad.tile, false);
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
                            const distance = Vector2_1.default.squaredDistance(context.getTile(), target);
                            if (distance < (info.nearBaseDistanceSq ?? baseDoodadDistanceSq) && !context.base[key].includes(target)) {
                                changed = true;
                                context.base[key].push(target);
                                this.log.info(`Found "${key}" - ${target} (distance: ${Math.round(distance)})`);
                                info.onAdd?.(context, target);
                                context.utilities.navigation.refreshOverlay(target.tile, true);
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
                const baseTiles = context.utilities.base.getBaseTiles(context);
                for (const baseTile of baseTiles) {
                    const unlimitedWellTile = baseTile.findMatchingTile(tile => context.utilities.base.isGoodWellBuildTile(context, tile, true), { maxTilesChecked: 50 });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hbmFseXplL0FuYWx5emVCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFN0MsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRTFDLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBRXBCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQVEsQ0FBa0IsQ0FBQztZQUNwRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxJQUFJLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFM0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztxQkFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUdoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDckcsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDZixJQUFJLENBQUMsR0FBRyxDQUFDLElB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