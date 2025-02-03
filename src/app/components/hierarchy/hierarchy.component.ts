import { Component } from '@angular/core';
import { ObjectsService } from '../../services/objects/objects.service';
import { CommonModule } from '@angular/common';
import { ItemComponent } from './item/item.component';
import { Node } from '../../models/Node';

@Component({
  selector: 'app-hierarchy',
  imports: [CommonModule, ItemComponent],
  templateUrl: './hierarchy.component.html',
  styleUrl: './hierarchy.component.scss'
})
export class HierarchyComponent {

  constructor(public objectService: ObjectsService) { }

  public selectNode(node: Node) {
    this.objectService.nodes.forEach(n => n.selected = false);
    this.objectService.selectedElements = [node];
    node.select();
  }
}
