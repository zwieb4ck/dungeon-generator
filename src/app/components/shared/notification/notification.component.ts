import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification/notification.service';
import { ENotificationType, Notification } from '../../../models/Notification';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from "../icon-button/icon-button.component";

@Component({
  selector: 'app-notification',
  imports: [CommonModule, IconComponent, IconButtonComponent],
  templateUrl: './notification.component.html',
  styleUrl: "./notification.component.scss",
  animations: [
    trigger('slideInOut', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateX(100%)' })),
      transition('void => visible', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  public notificationActiveTime: number = 5000;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.subscription = this.notificationService.notificationSubject.subscribe(notification => {
      if (notification.isVisible) {
        this.notifications.push(notification);
        setTimeout(() => {
          if (this.notifications.includes(notification)) {
            this.notificationService.hideNotification(notification);
          }
        }, this.notificationActiveTime);
      } else {
        setTimeout(() => {
          this.notifications = this.notifications.filter(n => n !== notification);
        }, 300); // Wartezeit entspricht der Animationsdauer
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public getIcon(type: ENotificationType) {
    switch (type) {
      case ENotificationType.Info: return "info";
      case ENotificationType.Success: return "check_circle";
      case ENotificationType.Warn: return "warning";
      case ENotificationType.Error: return "error";
    }
  }

  public close(notification: Notification) {
    this.notificationService.hideNotification(notification);
  }
}
