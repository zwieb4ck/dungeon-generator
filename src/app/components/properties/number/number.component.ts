import { Component } from '@angular/core';
import { PropertyBase } from '../base/property.base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EPropertiesType } from '../../../models/Room';

@Component({
  selector: 'app-number',
  imports: [CommonModule, FormsModule],
  templateUrl: './number.component.html',
  styleUrl: '../base/property.base.scss'
})
export class NumberComponent extends PropertyBase {
  
public override emitUpdate(): void {
  if (!this.propertyCache || this.propertyCache?.type !== EPropertiesType.Number) return;
  this.propertyCache.model = parseInt(this.propertyCache.model, 10);
  this.update.emit(this.propertyCache);
}

}
