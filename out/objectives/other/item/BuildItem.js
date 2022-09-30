define(["require", "exports", "game/doodad/DoodadManager", "game/doodad/IDoodad", "game/entity/action/actions/UpdateWalkPath", "game/entity/action/IAction", "utilities/game/TileHelpers", "game/entity/action/actions/Build", "../../../core/context/IContext", "../../../core/ITars", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../analyze/AnalyzeBase", "../../core/Lambda", "../../core/MoveToTarget", "../tile/PickUpAllTileItems", "./UseItem", "../../analyze/AnalyzeInventory", "game/item/IItem", "../../utility/moveTo/MoveToWater"], function (require, exports, DoodadManager_1, IDoodad_1, UpdateWalkPath_1, IAction_1, TileHelpers_1, Build_1, IContext_1, ITars_1, IObjective_1, Objective_1, AnalyzeBase_1, Lambda_1, MoveToTarget_1, PickUpAllTileItems_1, UseItem_1, AnalyzeInventory_1, IItem_1, MoveToWater_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const recalculateMovements = 40;
    class BuildItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
            this.movements = 0;
        }
        getIdentifier() {
            return `BuildItem:${this.item}`;
        }
        getStatus() {
            return `Building ${this.item?.getName()}`;
        }
        async execute(context) {
            const item = this.item ?? this.getAcquiredItem(context);
            if (!item?.isValid()) {
                this.log.warn("Invalid build item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.use || !description.use.includes(IAction_1.ActionType.Build)) {
                this.log.error(`Invalid build item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            if (!description.onUse) {
                this.log.error(`Invalid build item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const buildDoodadType = description.onUse[IAction_1.ActionType.Build]?.type;
            if (buildDoodadType === undefined) {
                this.log.error(`Invalid build item. ${item}`);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            let moveToTargetObjectives;
            if (item.type === IItem_1.ItemType.Sailboat) {
                moveToTargetObjectives = [
                    new MoveToWater_1.default(MoveToWater_1.MoveToWaterType.SailAwayWater, { disallowBoats: true }),
                ];
            }
            else {
                const baseInfo = this.getBaseInfo(context, buildDoodadType);
                const isWell = DoodadManager_1.default.isInGroup(buildDoodadType, IDoodad_1.DoodadTypeGroup.Well);
                if (isWell) {
                    this.log.info("Going build a well");
                }
                if (context.utilities.base.hasBase(context)) {
                    if (baseInfo && baseInfo.tryPlaceNear !== undefined) {
                        const nearDoodads = context.base[baseInfo.tryPlaceNear];
                        if (nearDoodads.length > 0) {
                            const possiblePoints = AnalyzeBase_1.default.getNearPointsFromDoodads(nearDoodads);
                            for (const point of possiblePoints) {
                                if (context.utilities.base.isGoodBuildTile(context, point, context.island.getTileFromPoint(point), { openAreaRadius: 0 })) {
                                    this.target = point;
                                    break;
                                }
                            }
                        }
                    }
                    if (!this.target) {
                        const baseDoodads = context.utilities.base.getBaseDoodads(context);
                        for (const baseDoodad of baseDoodads) {
                            if (isWell) {
                                this.target = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                                if (this.target === undefined) {
                                    this.log.info("Couldn't find unlimited well tile");
                                    this.target = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodWellBuildTile(context, point, tile, false), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                                }
                            }
                            else {
                                this.target = TileHelpers_1.default.findMatchingTile(context.island, baseDoodad, (_, point, tile) => {
                                    if (baseInfo && !context.utilities.base.matchesBaseInfo(context, baseInfo, buildDoodadType, point)) {
                                        return false;
                                    }
                                    return context.utilities.base.isGoodBuildTile(context, point, tile, baseInfo);
                                }, { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                            }
                            if (this.target !== undefined) {
                                break;
                            }
                        }
                    }
                }
                else if (!isWell) {
                    this.log.info("Looking for build tile...");
                    this.target = await context.utilities.base.findInitialBuildTile(context);
                }
                if (this.target === undefined) {
                    this.log.info("Unable to find location for build item");
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                moveToTargetObjectives = [
                    new MoveToTarget_1.default(this.target, true),
                    new PickUpAllTileItems_1.default(this.target),
                ];
            }
            return [
                ...moveToTargetObjectives,
                new UseItem_1.default(Build_1.default, item),
                new Lambda_1.default(async (context) => {
                    const tile = context.human.getFacingTile();
                    if (tile.doodad) {
                        context.setData(IContext_1.ContextDataType.LastBuiltDoodad, tile.doodad);
                    }
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this),
                new AnalyzeBase_1.default(),
                new AnalyzeInventory_1.default(),
            ];
        }
        async onMove(context) {
            this.movements++;
            if (this.movements >= recalculateMovements) {
                this.movements = 0;
                this.target = undefined;
                context.utilities.movement.resetMovementOverlays();
                multiplayer.executeClientside(() => {
                    UpdateWalkPath_1.default.execute(context.human, undefined);
                });
            }
            return super.onMove(context);
        }
        getBaseInfo(context, buildDoodadType) {
            for (const [, info] of Object.entries(ITars_1.baseInfo)) {
                if (context.utilities.base.matchesBaseInfo(context, info, buildDoodadType)) {
                    return info;
                }
            }
            return undefined;
        }
    }
    exports.default = BuildItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9CdWlsZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMEJBLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRWhDLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUsvQyxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFGaEMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUl0QixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BGLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxD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