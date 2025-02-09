import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ENotificationType, Notification } from '../../models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() { }
  
  notificationSubject = new Subject<Notification>();

  sendNotification(message: string, type: ENotificationType) {
    const notification = new Notification(message, type);
    this.notificationSubject.next(notification);
  }

  hideNotification(notification: Notification) {
    notification.isVisible = false;
    this.notificationSubject.next(notification);
  }

}
