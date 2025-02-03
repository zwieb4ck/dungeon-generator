import { Vector2, MathUtils } from "three";

export type TPin = {
    hasConnection: boolean,
    relatedId: string,
    type: EPinType,
    id: string,
}

export enum EPinType {
    In,
    Out,
}

export class Pin {
    public hasConnection: boolean = false;
    public height: number = 0;
    public width: number = 0;
    public position: Vector2 = new Vector2(0, 0);

    constructor(public relatedId: string, public type: EPinType, public id: string = MathUtils.generateUUID()) {
    }

    public setHitbox(x: number, y: number, height: number, width: number) {
        this.position = new Vector2(x, y);
        this.height = height;
        this.width = width;
    }

    public collider(point: Vector2) {
        return point.x > this.position.x && point.x < this.position.x + this.width &&
            point.y > this.position.y && point.y < this.position.y + this.height;
    }

    public toJson(): TPin {
        return {
            hasConnection: this.hasConnection,
            relatedId: this.relatedId,
            type: this.type,
            id: this.id,
        }
    }

    public static fromJson(json: TPin) {
        const newPin = new Pin(json.relatedId, json.type, json.id);
        newPin.hasConnection = json.hasConnection;
        return newPin;
    }
}