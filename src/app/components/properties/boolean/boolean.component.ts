import { Component } from '@angular/core';
import { PropertyBase } from '../base/property.base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-boolean',
    imports: [CommonModule, FormsModule],
  templateUrl: './boolean.component.html',
  styleUrl: '../base/property.base.scss'
})
export class BooleanComponent extends PropertyBase {

  
  
}
