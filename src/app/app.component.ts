import { Component } from '@angular/core';
import { HeaderComponent } from "./components/header/header.component";
import { EditorComponent } from "./components/editor/editor.component";
import { PreviewComponent } from "./components/preview/preview.component";
import { PropertiesComponent } from "./components/properties/properties.component";
import { HierarchyComponent } from './components/hierarchy/hierarchy.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, HierarchyComponent, EditorComponent, PreviewComponent, PropertiesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dungeon-maker';
}
