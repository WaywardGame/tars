define(["require", "exports", "doodad/Doodads", "utilities/math/Vector2", "utilities/TileHelpers", "../../IObjective", "../../ITars", "../../Objective", "../../Utilities/Base", "../../Utilities/Object"], function (require, exports, Doodads_1, Vector2_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, Base_1, objectUtilities) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const baseDoodadDistanceSq = Math.pow(150, 2);
    class AnalyzeBase extends Objective_1.default {
        getIdentifier() {
            return "AnalyzeBase";
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            let changed = false;
            const keys = Object.keys(ITars_1.baseInfo);
            for (const key of keys) {
                const doodads = context.base[key] = context.base[key]
                    .filter(doodad => {
                    if (!doodad.isValid()) {
                        changed = true;
                        this.log.info(`"${key}" was removed`);
                        return false;
                    }
                    return true;
                });
                const info = ITars_1.baseInfo[key];
                if (doodads.length === 0 || info.allowMultiple) {
                    let targets;
                    const placeNear = info.tryPlaceNear;
                    if (placeNear !== undefined) {
                        targets = [];
                        const nearDoodads = context.base[placeNear];
                        const possiblePoints = AnalyzeBase.getNearPoints(nearDoodads);
                        for (const point of possiblePoints) {
                            const tile = game.getTileFromPoint(point);
                            const doodad = tile.doodad;
                            if (doodad && AnalyzeBase.matchesBaseInfo(info, doodad.type)) {
                                targets.push(doodad);
                            }
                        }
                    }
                    else {
                        targets = info.findTargets ?
                            info.findTargets(context.base) :
                            objectUtilities.findDoodads(context, key, doodad => doodad.ownerIdentifier !== undefined && AnalyzeBase.matchesBaseInfo(info, doodad.type));
                    }
                    for (const target of targets) {
                        if (!info.canAdd || info.canAdd(context.base, target)) {
                            const distance = Vector2_1.default.squaredDistance(context.player, target);
                            if (distance < baseDoodadDistanceSq && context.base[key].indexOf(target) === -1) {
                                changed = true;
                                context.base[key].push(target);
                                this.log.info(`Found "${key}" - ${target} (distance: ${Math.round(distance)})`);
                                if (info.onAdd) {
                                    info.onAdd(context.base, target);
                                }
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
                const baseDoodads = Base_1.getBaseDoodads(context);
                for (const baseDoodad of baseDoodads) {
                    const unlimitedWellTile = TileHelpers_1.default.findMatchingTile(baseDoodad, (point, tile) => Base_1.isGoodWellBuildTile(context, point, tile, true), 50);
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
                await this.execute(context);
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
        static getNearPoints(doodads) {
            const points = [];
            for (const doodad of doodads) {
                points.push(...[
                    { x: doodad.x, y: doodad.y + 2, z: doodad.z },
                    { x: doodad.x, y: doodad.y - 2, z: doodad.z },
                    { x: doodad.x + 2, y: doodad.y, z: doodad.z },
                    { x: doodad.x - 2, y: doodad.y, z: doodad.z },
                ]);
            }
            return points;
        }
        static matchesBaseInfo(info, doodadType) {
            const doodadDescription = Doodads_1.default[doodadType];
            if (!doodadDescription) {
                return false;
            }
            if (info.doodadTypes) {
                for (const doodadTypeOrGroup of info.doodadTypes) {
                    if (doodadManager.isGroup(doodadTypeOrGroup)) {
                        if (doodadManager.isInGroup(doodadType, doodadTypeOrGroup)) {
                            return true;
                        }
                        if (doodadDescription.group && doodadDescription.group.includes(doodadTypeOrGroup)) {
                            return true;
                        }
                    }
                    else if (doodadTypeOrGroup === doodadType) {
                        return true;
                    }
                }
            }
            if (info.litType !== undefined && doodadDescription.lit !== undefined) {
                const litDescription = Doodads_1.default[doodadDescription.lit];
                if (litDescription && doodadManager.isInGroup(doodadDescription.lit, info.litType)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.default = AnalyzeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9BbmFseXplL0FuYWx5emVCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFOUMsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRTFDLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFFcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBUSxDQUFrQixDQUFDO1lBQ3BELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO3FCQUNuRCxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7d0JBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxDQUFDO3dCQUN0QyxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDLENBQUMsQ0FBQztnQkFFSixNQUFNLElBQUksR0FBRyxnQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJ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