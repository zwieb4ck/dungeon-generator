import { Component, OnInit } from '@angular/core';
import { PropertyBase } from '../base/property.base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EPropertiesType } from '../../../models/Room';

@Component({
  selector: 'app-range',
  imports: [CommonModule, FormsModule],
  templateUrl: './range.component.html',
  styleUrls: ['../base/property.base.scss', './range.component.scss']
})
export class RangeComponent extends PropertyBase {

  public isErrorShown: boolean = false;

  public handleInput(event: Event, target: string) {
    this.limitInputToNumbers(event);
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if((this.propertyCache as any)[target] !== val) {
      (this.propertyCache as any)[target] = val;
    }
    this.emitUpdate();
  }

  public override emitUpdate(): void {
    if (!this.propertyCache || this.propertyCache.type !== EPropertiesType.Range) return;
    this.propertyCache.min = parseInt(this.propertyCache.min as unknown as string, 10);
    this.propertyCache.max = parseInt(this.propertyCache.max as unknown as string, 10);

    if (this.propertyCache.min <= this.propertyCache.max) {
      this.isErrorShown = false;
      this.update.emit(this.propertyCache);
    } else {
      this.isErrorShown = true;
    }
  }

}
