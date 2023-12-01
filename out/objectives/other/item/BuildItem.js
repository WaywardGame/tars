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
define(["require", "exports", "@wayward/game/game/doodad/DoodadManager", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/actions/UpdateWalkPath", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/action/actions/Build", "@wayward/game/game/item/IItem", "../../../core/context/IContext", "../../../core/ITars", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../analyze/AnalyzeBase", "../../core/Lambda", "../../core/MoveToTarget", "../tile/PickUpAllTileItems", "./UseItem", "../../analyze/AnalyzeInventory", "../../utility/moveTo/MoveToWater"], function (require, exports, DoodadManager_1, IDoodad_1, UpdateWalkPath_1, IAction_1, Build_1, IItem_1, IContext_1, ITars_1, IObjective_1, Objective_1, AnalyzeBase_1, Lambda_1, MoveToTarget_1, PickUpAllTileItems_1, UseItem_1, AnalyzeInventory_1, MoveToWater_1) {
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
            if (!item?.isValid) {
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
                            const possibleTiles = AnalyzeBase_1.default.getNearTilesFromDoodads(context, nearDoodads);
                            for (const tile of possibleTiles) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9CdWlsZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBMkJILE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRWhDLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUsvQyxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFGaEMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUl0QixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDckYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMs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