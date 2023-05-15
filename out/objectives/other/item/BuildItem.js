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
            const description = item.description;
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
                        const baseTiles = context.utilities.base.getBaseTiles(context);
                        for (const baseTile of baseTiles) {
                            if (isWell) {
                                this.target = baseTile.findMatchingTile((tile) => context.utilities.base.isGoodWellBuildTile(context, tile, true), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                                if (this.target === undefined) {
                                    this.log.info("Couldn't find unlimited well tile");
                                    this.target = baseTile.findMatchingTile((tile) => context.utilities.base.isGoodWellBuildTile(context, tile, false), { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
                                }
                            }
                            else {
                                this.target = baseTile.findMatchingTile((tile) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9CdWlsZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBMkJILE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRWhDLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUsvQyxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFGaEMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUl0QixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDckMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwRixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFB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