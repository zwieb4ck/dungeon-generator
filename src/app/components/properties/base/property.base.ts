import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { EPropertiesType, TProperty } from "../../../models/Room";
import { CommonModule } from "@angular/common";
import { MathUtils } from "three";

@Component({
    template: "<ng-content></ng-content>",
    imports: [CommonModule]
})
export class PropertyBase implements OnInit {
    @Input() property: TProperty | null = null;
    @Output() update: EventEmitter<TProperty> = new EventEmitter();

    protected propertyCache: TProperty | null = null;
    protected EPropertiesType = EPropertiesType;
    protected id = MathUtils.generateUUID();

    public ngOnInit(): void {
        this.propertyCache = this.property !== null ? {...this.property} : null;
    }

    public limitInputToNumbers(event: any): void {
      const input = event.target;
      input.value = input.value.replace(/[^0-9]/g, '');
    }

    protected emitUpdate() {
        if (this.propertyCache == null) return;
        this.update.emit(this.propertyCache);
    }

    protected preventDefaultChangeEmit(event: Event)  {
      event.preventDefault();
    }
}