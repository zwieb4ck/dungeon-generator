import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "./components/header/header.component";
import { EditorComponent } from "./components/editor/editor.component";
import { PreviewComponent } from "./components/preview/preview.component";
import { PropertiesComponent } from "./components/properties/properties.component";
import { HierarchyComponent } from './components/hierarchy/hierarchy.component';
import { NotificationComponent } from './components/shared/notification/notification.component';
import { NotificationService } from './services/notification/notification.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, HierarchyComponent, EditorComponent, PreviewComponent, PropertiesComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'dungeon-maker';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    setTimeout(() => {
      console.log("jetzt");
    },
      2500);
  }
}
