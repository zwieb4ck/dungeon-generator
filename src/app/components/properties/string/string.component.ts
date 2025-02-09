import { Component } from '@angular/core';
import { PropertyBase } from '../base/property.base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-string',
  imports: [CommonModule, FormsModule],
  templateUrl: './string.component.html',
  styleUrl: '../base/property.base.scss'
})
export class StringComponent extends PropertyBase {

  public override emitUpdate(): void {
    if (this.propertyCache) {
      this.update.emit(this.propertyCache);
    }
  }
}
