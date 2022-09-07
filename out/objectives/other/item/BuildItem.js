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
                    new MoveToWater_1.default(true, false),
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