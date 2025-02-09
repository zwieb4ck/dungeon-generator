import { Component } from '@angular/core';
import { PropertyBase } from '../base/property.base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text',
  imports: [CommonModule, FormsModule],
  templateUrl: './text.component.html',
  styleUrl: '../base/property.base.scss'
})
export class TextComponent extends PropertyBase {
}
