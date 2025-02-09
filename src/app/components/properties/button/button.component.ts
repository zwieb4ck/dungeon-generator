import { Component } from '@angular/core';
import { PropertyBase } from '../base/property.base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-button',
  imports: [CommonModule, FormsModule],
  templateUrl: './button.component.html',
  styleUrl: '../base/property.base.scss'
})
export class ButtonComponent extends PropertyBase {

}
