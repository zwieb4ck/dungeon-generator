import { MathUtils, Vector2 } from "three";
import { Pin } from "./Pin";
import { Selectable } from "./Selectable";

export type TConnection = {
    from: string,
    to?: string,
    id: string,
}

export class Connection extends Selectable {
    public to: Pin | null = null;
    public override worldPosition: Vector2 = new Vector2();

    public get isCancelable(): boolean {
        return this.to !== null;
    }

    public override get height(): number { return this._height; };
    public override get width(): number { return this._width; };

    private _height: number = 0;
    private _width: number = 0;

    public constructor(public from: Pin, public id: string = MathUtils.generateUUID()) {
        super();
    }

    public setTarget(to: Pin) {
        this.to = to;
    }

    public drawLine(context: CanvasRenderingContext2D, to?: Vector2) {
        let target = to ? to : this.to?.position.add({ x: this.to.width / 2, y: this.to.height / 2 });
        const from = this.from.position.add({ x: this.from.width / 2, y: this.from.width / 2 })
        if (target) {
            if (this.selected) {
                context.beginPath()
                context.moveTo(from.x, from.y);
                context.lineTo(target.x, target.y);
                context.lineWidth = 6;
                context.strokeStyle = "rgba(255,255,255,0.7)";
                context.stroke();
            }
            context.beginPath();
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.moveTo(from.x, from.y);
            context.lineTo(target.x, target.y);
            context.stroke();
            const minX = Math.min(target.x, from.x);
            const minY = Math.min(target.y, from.y);
            const maxX = Math.max(target.x, from.x);
            const maxY = Math.max(target.y, from.y);
            this._width = maxX - minX;
            this._height = maxY - minY;
            this.worldPosition.x = minX;
            this.worldPosition.y = minY;
        }
    }

    public isConnectionAtPoint(point: Vector2): boolean {
        if (!this.to) return false;
        const x1 = this.from.position.x;
        const y1 = this.from.position.y;
        const x2 = this.to.position.x;
        const y2 = this.to.position.y;
        const numerator = Math.abs((x2 - x1) * (y1 - point.y) - (x1 - point.x) * (y2 - y1));
        const denominator = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const distance = numerator / denominator;
        const tolerance = 5;
        return distance <= tolerance;
    }

    public toJson() {
        return {
            from: this.from.id,
            to: this.to?.id,
            id: this.id,
        }
    }
}