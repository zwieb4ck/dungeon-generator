import { MathUtils, Vector2 } from "three";
import { ENodeType, Node, TNode } from "./Node";
import { generateSeed } from "../utils/generateSeed";
import { PRNG } from "./prng";
import { EDirection, TDungeonTile } from "../services/generator/generator.service";

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

export type TProperty = {
    type: EPropertiesType,
    label: string,
    id: number,
} & ({
    type: EPropertiesType.Range,
    min: number,
    max: number,
    propName: Record<string, string>,
} | {
    type: EPropertiesType.Button,
    action: () => void,
    buttonLabel: string,
} | {
    type: EPropertiesType.Boolean | EPropertiesType.String | EPropertiesType.Number | EPropertiesType.Text,
    model: any,
    propName: string,
});

export default class Room extends Node {
    // default properties
    public minRoomWidth: number = 1;
    public maxRoomWidth: number = 3;
    public minRoomHeight: number = 1;
    public maxRoomHeight: number = 3;
    public propertyCache: TProperty[] = [];

    public get Properties(): TProperty[] {
        return this.propertyCache;
    }

    private roomWidth: number = 0;
    private roomHeight: number = 0;

    someNumber: number = 12;

    constructor(position: Vector2, type: ENodeType, id: string = MathUtils.generateUUID(), createInitialPins: boolean, seed: string = "") {
        super(position, type, id, createInitialPins, seed);
        this.updateCache();
    }

    public updateCache() {
        this.propertyCache = [
            { id: 0, type: EPropertiesType.String, model: this.title, label: "Title", propName: "title" },
            { id: 1, type: EPropertiesType.Boolean, model: this.isStart, label: "Is Start?", propName: "isStart" },
            { id: 2, type: EPropertiesType.Range, min: this.minRoomHeight, max: this.maxRoomHeight, label: "Room Height", propName: { min: "minRoomHeight", max: "maxRoomHeight" } },
            { id: 3, type: EPropertiesType.Range, min: this.minRoomWidth, max: this.maxRoomWidth, label: "Room Width", propName: { min: "minRoomWidth", max: "maxRoomWidth" } },
            { id: 4, type: EPropertiesType.Text, model: this.seed, label: "Seed", propName: "seed" },
            { id: 5, type: EPropertiesType.Button, action: this.applyNewSeed.bind(this), label: "Generate new seed", buttonLabel: "Generate" },
        ];
        this.regenerateRoom();
    }

    private applyNewSeed() {
        this.updateSeed(generateSeed());
        this.updateCache();
    }

    // utility
    public override toJson(): TNode {
        const res = super.toJson();
        return res;
    }

    public assingProperties(properties: TProperty[]) {
        properties.forEach(prop => {
            this.updateProperty(prop);
        });
        this.updateCache();
    }

    public updateProperty(property: TProperty) {
        if (property.type === EPropertiesType.Range) {
            Object.entries(property.propName).forEach(([key, propKey]) => {
                (this as any)[propKey] = (property as any)[key];
            })
        } else if (property.type !== EPropertiesType.Button && property.type !== EPropertiesType.Text) {
            (this as any)[property.propName] = property.model;
        }
        this.updateCache();
    }

    protected override getProperties() {
        return this.propertyCache.filter(p => p.type !== EPropertiesType.Button);
    }

    public regenerateRoom(): TDungeonTile {
        this.random = new PRNG(this.seed);
        const height = this.random.nextRange(this.minRoomHeight, this.maxRoomHeight + 1);
        const width = this.random.nextRange(this.minRoomWidth, this.maxRoomWidth + 1);
        return {
            type: this.type,
            w: width,
            h: height,
            pos: {
                x: 0,
                y: 0,
            },
            connections: []
        };
    }
}
