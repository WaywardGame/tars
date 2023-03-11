define(["require", "exports", "game/doodad/DoodadManager", "game/doodad/IDoodad", "game/entity/action/actions/UpdateWalkPath", "game/entity/action/IAction", "game/entity/action/actions/Build", "game/item/IItem", "../../../core/context/IContext", "../../../core/ITars", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../analyze/AnalyzeBase", "../../core/Lambda", "../../core/MoveToTarget", "../tile/PickUpAllTileItems", "./UseItem", "../../analyze/AnalyzeInventory", "../../utility/moveTo/MoveToWater"], function (require, exports, DoodadManager_1, IDoodad_1, UpdateWalkPath_1, IAction_1, Build_1, IItem_1, IContext_1, ITars_1, IObjective_1, Objective_1, AnalyzeBase_1, Lambda_1, MoveToTarget_1, PickUpAllTileItems_1, UseItem_1, AnalyzeInventory_1, MoveToWater_1) {
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
                                const tile = context.island.getTileFromPoint(point);
                                if (context.utilities.base.isGoodBuildTile(context, tile, { openAreaRadius: 0 })) {
                                    this.target = tile;
                                    break;
                                }
                            }
                        }
                    }
                    if (!this.target) {
                        const baseDoodads = context.utilities.base.getBaseDoodads(context);
                        for (const baseDoodad of baseDoodads) {
                            if (isWell) {
                                this.target = baseDoodad.tile.findMatchingTile((tile) => context.utilities.base.isGoodWellBuildTile(context, tile, true), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                                if (this.target === undefined) {
                                    this.log.info("Couldn't find unlimited well tile");
                                    this.target = baseDoodad.tile.findMatchingTile((tile) => context.utilities.base.isGoodWellBuildTile(context, tile, false), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                                }
                            }
                            else {
                                this.target = baseDoodad.tile.findMatchingTile((tile) => {
                                    if (baseInfo && !context.utilities.base.matchesBaseInfo(context, baseInfo, buildDoodadType, tile)) {
                                        return false;
                                    }
                                    return context.utilities.base.isGoodBuildTile(context, tile, baseInfo);
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
                    const tile = context.human.facingTile;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9CdWlsZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRWhDLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUsvQyxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFGaEMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUl0QixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BGLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxD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