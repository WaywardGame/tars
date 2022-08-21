define(["require", "exports", "game/doodad/Doodads", "utilities/game/TileHelpers", "utilities/math/Vector2", "game/doodad/DoodadManager", "../../core/objective/IObjective", "../../core/objective/Objective", "../../core/ITars"], function (require, exports, Doodads_1, TileHelpers_1, Vector2_1, DoodadManager_1, IObjective_1, Objective_1, ITars_1) {
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
                const doodads = context.base[key] = context.base[key]
                    .filter(doodad => {
                    if (!doodad.isValid()) {
                        changed = true;
                        this.log.info(`"${key}" was removed`);
                        context.utilities.navigation.refreshOverlay(doodad.getTile(), doodad.x, doodad.y, doodad.z, false);
                        return false;
                    }
                    return true;
                });
                const info = ITars_1.baseInfo[key];
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
                            if (doodad && AnalyzeBase.matchesBaseInfo(context, info, doodad.type, doodad)) {
                                targets.push(doodad);
                            }
                        }
                    }
                    else {
                        targets = info.findTargets ?
                            info.findTargets(context) :
                            context.utilities.object.findDoodads(context, `${this.getIdentifier()}:${this.getUniqueIdentifier()}`, doodad => doodad.builderIdentifier !== undefined && AnalyzeBase.matchesBaseInfo(context, info, doodad.type, doodad));
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
        static matchesBaseInfo(context, info, doodadType, point) {
            const doodadDescription = Doodads_1.default[doodadType];
            if (!doodadDescription) {
                return false;
            }
            if (point && info.tryPlaceNear !== undefined) {
                const placeNearDoodads = context.base[info.tryPlaceNear];
                const isValid = AnalyzeBase.getNearPoints(point)
                    .some((point) => {
                    const tile = context.island.getTileFromPoint(point);
                    if (tile.doodad && placeNearDoodads.includes(tile.doodad)) {
                        return true;
                    }
                    if (context.utilities.base.isOpenArea(context, point, tile, 0)) {
                        return true;
                    }
                    return false;
                });
                if (!isValid) {
                    return false;
                }
            }
            if (info.doodadTypes) {
                for (const doodadTypeOrGroup of info.doodadTypes) {
                    if (DoodadManager_1.default.isGroup(doodadTypeOrGroup)) {
                        if (DoodadManager_1.default.isInGroup(doodadType, doodadTypeOrGroup)) {
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
                if (litDescription && DoodadManager_1.default.isInGroup(doodadDescription.lit, info.litType)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.default = AnalyzeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hbmFseXplL0FuYWx5emVCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFN0MsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRTFDLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBRXBCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQVEsQ0FBa0IsQ0FBQztZQUNwRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztxQkFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUN0QixPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxlQUFlLENBQUMsQ0FBQzt3QkFFdEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFB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