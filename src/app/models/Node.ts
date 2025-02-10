import { MathUtils, Vector2 } from "three";
import { GetContrastByHex } from "../utils/getContrastByHex";
import { ENodeClickTarget } from "../enums/NodeClickTarget";
import { Pin, EPinType, TPin } from "./Pin";
import { Selectable } from "./Selectable";
import { generateSeed } from "../utils/generateSeed";
import { PRNG } from "./prng";
import { TProperty } from "./Room";

//#region types and config for nodes
export const NodeConfig = {
    defaultHeight: 100,
    defaultWidth: 150,
    borderRadius: 5,
    colors: {
        0: "#00d8d6",
        1: "#ffd32a",
        2: "#05c46b",
        3: "#ef5777",
        4: "#ff3f34",
        5: "#3c40c6",
        6: "#cccccc",
    },
    backgroundColor: '#1a1b1c',
}

export enum ENodeType {
    Entry,
    Room,
    Hallway,
    Elite,
    Teleport,
    Boss,
    Path,
}
export type TNode = {
    position: {
        x: number,
        y: number
    },
    type: ENodeType,
    id: string,
    title: string,
    pins: TPin[],
    seed: string,
    properties: TProperty[],
}

export type TNodeCollisionObject = {
    type: ENodeClickTarget,
} | {
    type: ENodeClickTarget.InPin | ENodeClickTarget.OutPin
    target: Pin
} | {
    type: ENodeClickTarget.AddButton | ENodeClickTarget.Node
    target: Node
}
//#endregion

export class Node extends Selectable {
    //#region public
    public title: string = "New Node";
    public override worldPosition: Vector2 = new Vector2(0, 0);
    public pins: Pin[] = [];
    public seed: string = "";
    public isStart: boolean = false;

    public override get height(): number {
        const maxLenghtPerSide = Math.max(this.pins.filter(p => p.type === EPinType.In).length, this.pins.filter(p => p.type === EPinType.Out).length);
        return NodeConfig.defaultHeight - 30 + maxLenghtPerSide * (this.pinParameters.pinRadius * 2 + this.pinParameters.pinSpacing);
    }

    public override get width(): number {
        return NodeConfig.defaultWidth;
    }

    public get addButtonPosition(): { button: Vector2, text: Vector2, height: number, width: number } {
        return {
            button: new Vector2(this.width - 15 + this.worldPosition.x, this.height - 15 + this.worldPosition.y),
            text: new Vector2(this.width - 20 + this.worldPosition.x, this.height - 8 + this.worldPosition.y),
            height: 14,
            width: 14,
        }
    }

    public get pinParameters(): { pinSpacing: number, pinRadius: number } {
        return {
            pinRadius: 7,
            pinSpacing: 7,
        }
    }

    //#endregion
    //#region protected
    protected hasAddButton = true;
    protected random: PRNG;
    protected properties: Record<string, any> = {};
    //#endregion
    constructor(public position: Vector2, public type: ENodeType, public id: string = MathUtils.generateUUID(), public createInitialPins = true, seed: string = "") {
        super();
        this.seed = seed || generateSeed();
        this.random = new PRNG(this.seed);
        if (this.createInitialPins) {
            this.pins.push(new Pin(id, EPinType.In));
            this.pins.push(new Pin(id, EPinType.Out));
        }
    }
    //#region draw call
    public DrawNode(context: CanvasRenderingContext2D, position: Vector2, zoomFactor: number) {
        const scaledWidth = this.width * zoomFactor;
        const scaledHeight = this.height * zoomFactor;
        const scaledBorderRadius = NodeConfig.borderRadius * zoomFactor;

        // background
        context.beginPath();
        context.fillStyle = NodeConfig.backgroundColor;
        context.roundRect(position.x, position.y, scaledWidth, scaledHeight, scaledBorderRadius);
        context.fill();

        // header
        context.beginPath();
        context.fillStyle = NodeConfig.colors[this.type];
        context.roundRect(
            position.x + 4 * zoomFactor,
            position.y + 4 * zoomFactor,
            scaledWidth - 8 * zoomFactor,
            24 * zoomFactor,
            [scaledBorderRadius, scaledBorderRadius, 0, 0]
        );
        context.fill();

        // Titeltext
        context.font = "14px Smooch Sans";
        context.fillStyle = GetContrastByHex(NodeConfig.colors[this.type]);
        context.fillText(this.title, position.x + 10, position.y + 20);

        // selection border
        context.beginPath()
        if (this.selected) {
            context.strokeStyle = "rgba(255,255,255,1)";
            context.lineWidth = 2 * zoomFactor; // Skalierung der Rahmenbreite
        } else {
            context.strokeStyle = "rgba(255,255,255,0.3)";
            context.lineWidth = 1 * zoomFactor;
        }

        context.roundRect(position.x, position.y, scaledWidth, scaledHeight, scaledBorderRadius);
        context.stroke();

        const inPins = this.pins.filter(p => p.type === EPinType.In);
        const outPins = this.pins.filter(p => p.type === EPinType.Out);

        // InPins
        inPins.forEach((pin, index) => {
            context.beginPath();
            context.fillStyle = "rgba(255,255,255,1)";
            context.strokeStyle = "rgba(255,255,255,1)";
            const pos = new Vector2(position.x + 15 * zoomFactor, position.y + 45 + index * (this.pinParameters.pinRadius * 2 + this.pinParameters.pinSpacing))
            context.arc(pos.x, pos.y, 7, 0, Math.PI * 2, false);
            if (pin.hasConnection) {
                context.fill();
            } else {
                context.stroke();
            }
            pin.setHitbox(
                pos.x - this.pinParameters.pinRadius,
                pos.y - this.pinParameters.pinRadius,
                this.pinParameters.pinRadius * 2,
                this.pinParameters.pinRadius * 2
            );
        });

        // OutPins
        outPins.forEach((pin, index) => {
            context.beginPath();
            context.fillStyle = "rgba(255,255,255,1)";
            context.strokeStyle = "rgba(255,255,255,1)";
            const pos = new Vector2(position.x + scaledWidth - 15 * zoomFactor, position.y + 45 + index * (this.pinParameters.pinRadius * 2 + this.pinParameters.pinSpacing))
            context.arc(pos.x, pos.y, 7, 0, Math.PI * 2, false);
            if (pin.hasConnection) {
                context.fill();
            } else {
                context.stroke();
            }
            pin.setHitbox(
                pos.x - this.pinParameters.pinRadius,
                pos.y - this.pinParameters.pinRadius,
                this.pinParameters.pinRadius * 2,
                this.pinParameters.pinRadius * 2
            );
        });

        // add button
        if (this.hasAddButton) {
            context.beginPath();
            context.arc(this.addButtonPosition.button.x * zoomFactor, this.addButtonPosition.button.y * zoomFactor, 7 * zoomFactor, 0, Math.PI * 2, false);
            context.lineWidth = 1;
            context.strokeStyle = "rgba(255,255,255,1)";
            context.stroke();
            context.font = "24px Smooch Sans";
            context.fillStyle = "white";
            context.fillText("+", this.addButtonPosition.text.x * zoomFactor, this.addButtonPosition.text.y * zoomFactor);
        }

        if (this.isStart) {
            this.drawStartSymbol(context, (this.worldPosition.x + this.width / 2) * zoomFactor, (this.worldPosition.y + this.height / 2 + 12) * zoomFactor, 20 * zoomFactor);
        }

        this.worldPosition = position;
    }

    private drawStartSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
        // Berechne die Punkte des Dreiecks
        const height = size * Math.sqrt(3) / 2; // Höhe eines gleichseitigen Dreiecks
        const halfSize = size / 3;

        const p1 = { x: x - halfSize, y: y - height / 2 }; // Linke Ecke
        const p2 = { x: x + halfSize, y: y }; // Rechte Spitze
        const p3 = { x: x - halfSize, y: y + height / 2 }; // Untere Ecke

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - size * 0.1, y, size / 1.2, 0, Math.PI * 2, false);
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.stroke();
    }

    //#endregion
    //#region collision
    public isNodeAtPoint(point: Vector2) {
        return point.x > this.worldPosition.x && point.x < this.worldPosition.x + this.width &&
            point.y > this.worldPosition.y && point.y < this.worldPosition.y + this.height;
    }

    private isPointOnButton(point: Vector2) {
        return point.x > this.addButtonPosition.button.x - this.addButtonPosition.width / 2 &&
            point.x < this.addButtonPosition.button.x - this.addButtonPosition.height / 2 + this.addButtonPosition.width &&
            point.y > this.addButtonPosition.button.y - this.addButtonPosition.width / 2 &&
            point.y < this.addButtonPosition.button.y - this.addButtonPosition.height / 2 + this.addButtonPosition.height;
    }

    public getClickedCollision(point: Vector2) {
        let target: Pin | Node | null = null;
        this.pins.forEach((p) => {
            if (p.collider(point) && target === null) {
                target = p;
            }
        });
        if (target === null) {
            if (this.isPointOnButton(point)) {
                return {
                    type: ENodeClickTarget.AddButton,
                    target: this,
                }
            } else {
                return {
                    type: ENodeClickTarget.Node,
                    target: this,
                }
            }
        } else {
            return {
                type: (target as Pin).type === EPinType.In ? ENodeClickTarget.InPin : ENodeClickTarget.OutPin,
                target: target as Pin,
            }
        }
    }

    //#endregion
    //#region utility
    public addOutPin(): Pin {
        const newPin = new Pin(this.id, EPinType.Out);
        this.pins.push(newPin);
        return newPin;
    }

    public addInPin(): Pin {
        const newPin = new Pin(this.id, EPinType.In);
        this.pins.push(newPin);
        return newPin;
    }

    public updateSeed(seed: string) {
        this.seed = seed;
        this.random = new PRNG(seed);
    }

    toJson(): TNode {
        return {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            type: this.type,
            id: this.id,
            title: this.title,
            pins: this.pins.map(p => p.toJson()),
            seed: this.seed,
            properties: this.getProperties(),
        }
    }

    protected getProperties(): TProperty[] {
        return [];
    }
    //#endregion
}
