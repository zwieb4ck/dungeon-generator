import { Vector2 } from "three";

export class Selectable {
    public worldPosition: Vector2 = new Vector2();
    public selected: boolean = false;

    public get height(): number { return 0 };
    public get width(): number { return 0 };

    public select() {
        this.selected = true;
    }

    public deselect() {
        this.selected = false;
    }
}