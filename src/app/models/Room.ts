import { MathUtils, Vector2 } from "three";
import { ENodeType, Node, TNode } from "./Node";
import { generateSeed } from "../utils/generateSeed";

export enum EOrientation {
    North,
    East,
    South,
    West,
}

export enum EPropertiesType {
    String,
    Boolean,
    Number,
    Range,
    Text,
    Button
}

export type TProperties = {
    type: EPropertiesType,
    label: string,
} & ({
    type: EPropertiesType.Range,
    min: number,
    max: number,
} | {
    type: EPropertiesType.Button,
    action: () => void
} | {
    type: EPropertiesType.Boolean | EPropertiesType.String | EPropertiesType.Number | EPropertiesType.Text,
    model: any,
});

export default class Room extends Node {
    // default properties
    public minRoomWidth: number = 1;
    public maxRoomWidth: number = 3;
    public minRoomHeight: number = 1;
    public maxRoomHeight: number = 3;
    public isStart: boolean = false;
    public propertyCache: TProperties[] = [];

    public get Properties(): TProperties[] {
        return this.propertyCache;
    }

    private roomWidth: number = 0;
    private roomHeight: number = 0;

    constructor(position: Vector2, type: ENodeType, id: string = MathUtils.generateUUID(), createInitialPins: boolean) {
        super(position, type, id, createInitialPins);

    }

    public updateCache() {
        this.propertyCache = [
            { type: EPropertiesType.Text, model: this.seed, label: "Seed" },
            { type: EPropertiesType.Button, action: this.applyNewSeed.bind(this), label: "Generate new seed" },
            { type: EPropertiesType.String, model: this.title, label: "Title" },
            { type: EPropertiesType.Range, min: this.minRoomHeight, max: this.maxRoomHeight, label: "Room Height" },
            { type: EPropertiesType.Range, min: this.minRoomWidth, max: this.maxRoomWidth, label: "Room Width" },
            { type: EPropertiesType.Boolean, model: this.isStart, label: "Is Start?" },
        ];
    }

    private applyNewSeed() {
        this.updateSeed(generateSeed());
    }

    // utility
    public override toJson(): TNode {
        const res = super.toJson();
        return res;
    }

    public assingProperties(properties: Record<string, any>) {
        Object.entries(properties).forEach(([key, value]) => {
            (this as any)[key] = value;
        });
    }
}
