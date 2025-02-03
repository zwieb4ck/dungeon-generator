import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Node } from '../../../models/Node';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item',
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent {
  @Input() public node!: Node;
  @Output() public selected: EventEmitter<Node> = new EventEmitter<Node>();

  public getType() {
    switch(this.node.type) {
      case 0: return "entry";
      case 1: return "room";
      case 2: return "hallway";
      case 3: return "elite";
      case 4: return "teleport";
      case 5: return "boss";
      default: return "unknown";
    }
  }

  public selectNode() {
    this.selected.emit(this.node);
  }
}
