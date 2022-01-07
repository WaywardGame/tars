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
            var _a;
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
                        const possiblePoints = AnalyzeBase.getNearPoints(nearDoodads);
                        for (const point of possiblePoints) {
                            const tile = context.island.getTileFromPoint(point);
                            const doodad = tile.doodad;
                            if (doodad && AnalyzeBase.matchesBaseInfo(info, doodad.type)) {
                                targets.push(doodad);
                            }
                        }
                    }
                    else {
                        targets = info.findTargets ?
                            info.findTargets(context) :
                            context.utilities.object.findDoodads(context, key, doodad => doodad.ownerIdentifier !== undefined && AnalyzeBase.matchesBaseInfo(info, doodad.type));
                    }
                    for (const target of targets) {
                        if (!info.canAdd || info.canAdd(context, target)) {
                            const distance = Vector2_1.default.squaredDistance(context.getPosition(), target);
                            if (distance < baseDoodadDistanceSq && !context.base[key].includes(target)) {
                                changed = true;
                                context.base[key].push(target);
                                this.log.info(`Found "${key}" - ${target} (distance: ${Math.round(distance)})`);
                                (_a = info.onAdd) === null || _a === void 0 ? void 0 : _a.call(info, context, target);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hbmFseXplL0FuYWx5emVCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFN0MsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRTFDLGFBQWE7WUFDbkIsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUVwQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFRLENBQWtCLENBQUM7WUFDcEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7cUJBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDdEIsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDZixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDLENBQUM7d0JBRXRDLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBRW5HLE9BQU8sS0FBSyxDQUFDO3FCQUNiO29CQUVELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE1BQU0sSUFBSSxHQUFHLGdCQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzNCLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDL0MsSUFBSSxPQUFpQixDQUFDO29CQUV0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO29CQUNwQyxJQUFJLFNBQVMsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNsRSxPQUFPLEdBQUcsRUFBRSxDQUFDO3dCQUViLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzVDLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBRTlELEtBQUssTUFBTSxLQUFLLElBQUksY0FBYyxFQUFFOzRCQUNuQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOzRCQUMzQixJQUFJLE1BQU0sSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0NBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7NkJBQ3JCO3lCQUNEO3FCQUVEO3lCQUFNO3dCQUNOLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs0QkFDM0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDdEo7b0JBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFOzRCQUNqRCxNQUFNLFFBQVEsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7NEJBQ3hFLElBQUksUUFBUSxHQUFHLG9CQUFvQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0NBQzNFLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0NBRWYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBRS9CLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLE1BQU0sZUFBZSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FFaEYsTUFBQSxJQUFJLENBQUMsS0FBSywrQ0FBVixJQUFJLEVBQVMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dDQUU5QixPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dDQUVsRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQ0FDeEIsTUFBTTtpQ0FDTjs2QkFDRDt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1lBRUQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSw4QkFBb0QsQ0FBQztnQkFFekQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuRSxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtvQkFDckMsTUFBTSxpQkFBaUIsR0FBRyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3hNLElBQUksaUJBQWlCLEVBQUU7d0JBQ3RCLDhCQUE4QixHQUFHLGlCQUFpQixDQUFDO3dCQUNuRCxNQUFNO3FCQUNOO2lCQUNEO2dCQUVELElBQUksOEJBQThCLEtBQUssU0FBUyxFQUFFO29CQUNqRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEtBQUssU0FBUyxJQUFJLENBQ2hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLENBQUM7d0JBQ2xGLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLENBQUM7d0JBQ2xGLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxLQUFLLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLDhCQUE4QixDQUFDO3dCQUM3RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN0TTtpQkFFRDtxQkFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEtBQUssU0FBUyxFQUFFO29CQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLFNBQVMsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztpQkFDOUM7Z0JBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBSXBDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM1QjtZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQztRQUVNLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBaUI7WUFDNUMsTUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1lBRTlCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO2dCQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUc7b0JBQ2QsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUU7b0JBQzdDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFO29CQUM3QyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRTtvQkFDN0MsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUU7aUJBQzdDLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFlLEVBQUUsVUFBc0I7WUFDcEUsTUFBTSxpQkFBaUIsR0FBRyxpQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3ZCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLEtBQUssTUFBTSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNqRCxJQUFJLHVCQUFhLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7d0JBQzdDLElBQUksdUJBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7NEJBQzNELE9BQU8sSUFBSSxDQUFDO3lCQUNaO3dCQUVELElBQUksaUJBQWlCLENBQUMsS0FBSyxJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTs0QkFDbkYsT0FBTyxJQUFJLENBQUM7eUJBQ1o7cUJBRUQ7eUJBQU0sSUFBSSxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7d0JBQzVDLE9BQU8sSUFBSSxDQUFDO3FCQUNaO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7Z0JBQ3RFLE1BQU0sY0FBYyxHQUFHLGlCQUFrQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLGNBQWMsSUFBSSx1QkFBYSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNuRixPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0Q7SUFwS0QsOEJBb0tDIn0=