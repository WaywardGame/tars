import { ItemTypeGroup } from "game/item/IItem";

import type Context from "../../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import { IAcquireItemOptions } from "../AcquireBase";
import AcquireItemByGroup from "../AcquireItemByGroup";

export interface IAcquireWaterOptions extends IAcquireItemOptions {
    onlySafeToDrink: boolean;
    onlyForDesalination: boolean;
}

export default class AcquireWater extends Objective {

    constructor(private readonly options?: Partial<IAcquireWaterOptions>) {
        super();
    }

    public getIdentifier(): string {
        return `AcquireWater:${this.options?.onlySafeToDrink},${this.options?.onlyForDesalination}`;
    }

    public getStatus(): string | undefined {
        return "Acquiring water";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (this.options?.onlyForDesalination) {
            return [
                [new AcquireItemByGroup(ItemTypeGroup.ContainerOfSeawater, this.options).passAcquireData(this)],
            ];
        }

        if (this.options?.onlySafeToDrink) {
            return [
                [new AcquireItemByGroup(ItemTypeGroup.ContainerOfDesalinatedWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup(ItemTypeGroup.ContainerOfFilteredWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup(ItemTypeGroup.ContainerOfMedicinalWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup(ItemTypeGroup.ContainerOfPurifiedFreshWater, this.options).passAcquireData(this)],
            ];
        }

        return [
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfDesalinatedWater, this.options).passAcquireData(this)],
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfFilteredWater, this.options).passAcquireData(this)],
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfMedicinalWater, this.options).passAcquireData(this)],
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfPurifiedFreshWater, this.options).passAcquireData(this)],
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfSeawater, this.options).passAcquireData(this)],
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfSwampWater, this.options).passAcquireData(this)],
            [new AcquireItemByGroup(ItemTypeGroup.ContainerOfUnpurifiedFreshWater, this.options).passAcquireData(this)],
        ];
    }

}
