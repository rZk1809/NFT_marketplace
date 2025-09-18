import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import nodemailer from 'nodemailer';
import axios from 'axios';

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'push' | 'sms' | 'websocket';
  name: string;
  subject?: string;
  template: string;
  variables: string[];
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  websocket: boolean;
  categories: {
    rental: boolean;
    lending: boolean;
    payments: boolean;
    disputes: boolean;
    marketing: boolean;
    system: boolean;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'rental' | 'lending' | 'payment' | 'dispute' | 'system' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  channels: Array<'email' | 'push' | 'sms' | 'websocket'>;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface PushConfig {
  fcmServerKey: string;
  apnsKeyId: string;
  apnsTeamId: string;
  apnsKeyFile: string;
}

export class NotificationService extends EventEmitter {
  private io: SocketIOServer;
  private emailTransporter?: nodemailer.Transporter;
  private templates: Map<string, NotificationTemplate> = new Map();
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private notificationQueue: Notification[] = [];
  private isProcessing: boolean = false;

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.initializeEmailTransporter();
    this.initializeTemplates();
    this.startNotificationProcessor();
  }

  private initializeEmailTransporter(): void {
    try {
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        },
        from: process.env.SMTP_FROM || 'noreply@lendify.com'
      };

      this.emailTransporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email transporter initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize email transporter:', error);
    }
  }

  private initializeTemplates(): void {
    // Rental-related templates
    this.templates.set('rental_created', {
      id: 'rental_created',
      type: 'websocket',
      name: 'Rental Created',
      template: 'Your NFT {{nftName}} has been listed for rent at {{price}} ETH/day',
      variables: ['nftName', 'price', 'duration']
    });

    this.templates.set('rental_request', {
      id: 'rental_request',
      type: 'email',
      name: 'Rental Request',
      subject: 'New rental request for your NFT',
      template: `
        <h2>New Rental Request</h2>
        <p>Someone wants to rent your NFT <strong>{{nftName}}</strong></p>
        <p>Rental Details:</p>
        <ul>
          <li>Duration: {{duration}} days</li>
          <li>Total Price: {{totalPrice}} ETH</li>
          <li>Collateral: {{collateral}} ETH</li>
        </ul>
        <p>Click <a href="{{approveLink}}">here</a> to approve the rental.</p>
      `,
      variables: ['nftName', 'duration', 'totalPrice', 'collateral', 'approveLink']
    });

    this.templates.set('rental_approved', {
      id: 'rental_approved',
      type: 'push',
      name: 'Rental Approved',
      template: 'Your rental request for {{nftName}} has been approved! 🎉',
      variables: ['nftName']
    });

    this.templates.set('rental_expiring', {
      id: 'rental_expiring',
      type: 'email',
      name: 'Rental Expiring',
      subject: 'Your NFT rental is expiring soon',
      template: `
        <h2>Rental Expiring Soon</h2>
        <p>Your rental for <strong>{{nftName}}</strong> expires in {{timeLeft}}.</p>
        <p>Would you like to extend your rental?</p>
        <a href="{{extendLink}}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Extend Rental</a>
      `,
      variables: ['nftName', 'timeLeft', 'extendLink']
    });

    // Lending-related templates
    this.templates.set('loan_request', {
      id: 'loan_request',
      type: 'email',
      name: 'Loan Request',
      subject: 'New loan request against your NFT',
      template: `
        <h2>Loan Request</h2>
        <p>Someone wants to borrow against your NFT <strong>{{nftName}}</strong></p>
        <p>Loan Details:</p>
        <ul>
          <li>Requested Amount: {{loanAmount}} ETH</li>
          <li>Duration: {{duration}} days</li>
          <li>Interest Rate: {{interestRate}}%</li>
          <li>Collateral Value: {{collateralValue}} ETH</li>
        </ul>
      `,
      variables: ['nftName', 'loanAmount', 'duration', 'interestRate', 'collateralValue']
    });

    this.templates.set('loan_funded', {
      id: 'loan_funded',
      type: 'websocket',
      name: 'Loan Funded',
      template: 'Your loan of {{loanAmount}} ETH has been funded! 💰',
      variables: ['loanAmount']
    });

    // Payment-related templates
    this.templates.set('payment_received', {
      id: 'payment_received',
      type: 'push',
      name: 'Payment Received',
      template: 'Payment of {{amount}} ETH received for {{nftName}} rental',
      variables: ['amount', 'nftName']
    });

    this.templates.set('payment_overdue', {
      id: 'payment_overdue',
      type: 'email',
      name: 'Payment Overdue',
      subject: 'Payment overdue - Action required',
      template: `
        <h2>Payment Overdue</h2>
        <p>Your payment for the rental of <strong>{{nftName}}</strong> is overdue.</p>
        <p>Amount Due: {{amountDue}} ETH</p>
        <p>Days Overdue: {{daysOverdue}}</p>
        <p>Please make the payment to avoid penalties.</p>
      `,
      variables: ['nftName', 'amountDue', 'daysOverdue']
    });

    // System notifications
    this.templates.set('welcome', {
      id: 'welcome',
      type: 'email',
      name: 'Welcome',
      subject: 'Welcome to Lendify! 🎉',
      template: `
        <h2>Welcome to Lendify!</h2>
        <p>Hi {{username}},</p>
        <p>Welcome to the future of NFT rentals! We're excited to have you on board.</p>
        <p>Get started by:</p>
        <ul>
          <li>Listing your first NFT for rent</li>
          <li>Exploring available NFTs to rent</li>
          <li>Building your reputation</li>
        </ul>
        <p>Happy renting!</p>
      `,
      variables: ['username']
    });

    console.log(`✅ Initialized ${this.templates.size} notification templates`);
  }

  private startNotificationProcessor(): void {
    setInterval(() => {
      this.processNotificationQueue();
    }, 5000); // Process every 5 seconds

    console.log('✅ Notification processor started');
  }

  // Core notification methods
  public async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): Promise<boolean> {
    const fullNotification: Notification = {
      id: this.generateNotificationId(),
      createdAt: new Date(),
      status: 'pending',
      ...notification
    };

    // Check user preferences
    const preferences = await this.getUserPreferences(notification.userId);
    if (!this.shouldSendNotification(fullNotification, preferences)) {
      console.log(`Notification skipped due to user preferences: ${fullNotification.id}`);
      return false;
    }

    this.notificationQueue.push(fullNotification);
    this.emit('notificationQueued', fullNotification);

    return true;
  }

  public async sendRentalNotification(
    type: 'rental_created' | 'rental_request' | 'rental_approved' | 'rental_expiring',
    userId: string,
    data: any,
    channels: Array<'email' | 'push' | 'sms' | 'websocket'> = ['websocket', 'push']
  ): Promise<boolean> {
    const template = this.templates.get(type);
    if (!template) {
      console.error(`Template not found: ${type}`);
      return false;
    }

    const message = this.renderTemplate(template.template, data);
    const title = this.getNotificationTitle(type, data);

    return await this.sendNotification({
      userId,
      type: 'rental',
      priority: this.getNotificationPriority(type),
      title,
      message,
      data,
      channels
    });
  }

  public async sendLendingNotification(
    type: 'loan_request' | 'loan_funded' | 'loan_repaid',
    userId: string,
    data: any,
    channels: Array<'email' | 'push' | 'sms' | 'websocket'> = ['email', 'websocket']
  ): Promise<boolean> {
    const title = this.getNotificationTitle(type, data);
    const message = this.renderTemplate(this.getTemplateForType(type), data);

    return await this.sendNotification({
      userId,
      type: 'lending',
      priority: this.getNotificationPriority(type),
      title,
      message,
      data,
      channels
    });
  }

  public async sendPaymentNotification(
    type: 'payment_received' | 'payment_overdue' | 'payment_failed',
    userId: string,
    data: any,
    channels: Array<'email' | 'push' | 'sms' | 'websocket'> = ['push', 'email']
  ): Promise<boolean> {
    const title = this.getNotificationTitle(type, data);
    const message = this.renderTemplate(this.getTemplateForType(type), data);

    return await this.sendNotification({
      userId,
      type: 'payment',
      priority: type === 'payment_overdue' ? 'high' : 'medium',
      title,
      message,
      data,
      channels
    });
  }

  public async sendSystemNotification(
    type: 'welcome' | 'maintenance' | 'security_alert',
    userId: string,
    data: any,
    channels: Array<'email' | 'push' | 'sms' | 'websocket'> = ['email']
  ): Promise<boolean> {
    const title = this.getNotificationTitle(type, data);
    const message = this.renderTemplate(this.getTemplateForType(type), data);

    return await this.sendNotification({
      userId,
      type: 'system',
      priority: type === 'security_alert' ? 'critical' : 'medium',
      title,
      message,
      data,
      channels
    });
  }

  // Channel-specific sending methods
  private async sendWebSocketNotification(notification: Notification): Promise<boolean> {
    try {
      const room = `user:${notification.userId}`;
      this.io.to(room).emit('notification', {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.createdAt
      });

      console.log(`WebSocket notification sent to user ${notification.userId}`);
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
      return false;
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<boolean> {
    if (!this.emailTransporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const template = this.templates.get(notification.type);
      const subject = template?.subject ? this.renderTemplate(template.subject, notification.data) : notification.title;
      
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: await this.getUserEmail(notification.userId),
        subject,
        html: this.renderEmailTemplate(notification)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email notification sent: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  private async sendPushNotification(notification: Notification): Promise<boolean> {
    try {
      const pushTokens = await this.getUserPushTokens(notification.userId);
      if (pushTokens.length === 0) {
        console.log(`No push tokens found for user ${notification.userId}`);
        return false;
      }

      // Firebase Cloud Messaging
      if (process.env.FCM_SERVER_KEY) {
        const payload = {
          notification: {
            title: notification.title,
            body: notification.message,
            icon: '/icons/notification.png'
          },
          data: notification.data ? JSON.stringify(notification.data) : '{}'
        };

        for (const token of pushTokens) {
          await this.sendFCMNotification(token, payload);
        }
      }

      console.log(`Push notification sent to ${pushTokens.length} devices`);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  private async sendSMSNotification(notification: Notification): Promise<boolean> {
    try {
      const phoneNumber = await this.getUserPhoneNumber(notification.userId);
      if (!phoneNumber) {
        console.log(`No phone number found for user ${notification.userId}`);
        return false;
      }

      // Using Twilio or similar SMS service
      if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
        const message = `${notification.title}\n${notification.message}`;
        
        const response = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`,
          new URLSearchParams({
            From: process.env.TWILIO_PHONE!,
            To: phoneNumber,
            Body: message
          }),
          {
            auth: {
              username: process.env.TWILIO_SID,
              password: process.env.TWILIO_TOKEN
            }
          }
        );

        console.log(`SMS notification sent: ${response.data.sid}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      return false;
    }
  }

  // Notification processing
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const notification = this.notificationQueue.shift();
      if (!notification) return;

      notification.status = 'sent';
      notification.sentAt = new Date();

      const results = await Promise.all(
        notification.channels.map(channel => this.sendToChannel(notification, channel))
      );

      const success = results.some(result => result);
      notification.status = success ? 'delivered' : 'failed';

      this.emit('notificationProcessed', notification);

      // Store notification in database (would implement with actual DB)
      await this.storeNotification(notification);

    } catch (error) {
      console.error('Error processing notification:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendToChannel(notification: Notification, channel: string): Promise<boolean> {
    switch (channel) {
      case 'websocket':
        return await this.sendWebSocketNotification(notification);
      case 'email':
        return await this.sendEmailNotification(notification);
      case 'push':
        return await this.sendPushNotification(notification);
      case 'sms':
        return await this.sendSMSNotification(notification);
      default:
        console.error(`Unknown notification channel: ${channel}`);
        return false;
    }
  }

  // User preferences and settings
  public async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    let preferences = this.userPreferences.get(userId);
    
    if (!preferences) {
      // Load from database or create default
      preferences = {
        userId,
        email: true,
        push: true,
        sms: false,
        websocket: true,
        categories: {
          rental: true,
          lending: true,
          payments: true,
          disputes: true,
          marketing: false,
          system: true
        }
      };
      
      this.userPreferences.set(userId, preferences);
    }

    return preferences;
  }

  public async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = await this.getUserPreferences(userId);
    const updated = { ...current, ...preferences };
    
    this.userPreferences.set(userId, updated);
    
    // Save to database
    await this.saveUserPreferences(updated);
    
    this.emit('preferencesUpdated', { userId, preferences: updated });
  }

  // Bulk notifications
  public async sendBulkNotification(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'status'>
  ): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendNotification({ ...notification, userId })
    );

    await Promise.all(promises);
    console.log(`Bulk notification sent to ${userIds.length} users`);
  }

  public async sendBroadcast(
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'status'>,
    criteria?: { active?: boolean; category?: string }
  ): Promise<void> {
    const userIds = await this.getUsersForBroadcast(criteria);
    await this.sendBulkNotification(userIds, notification);
  }

  // Real-time features
  public async sendInstantNotification(userId: string, message: string, data?: any): Promise<void> {
    const room = `user:${userId}`;
    this.io.to(room).emit('instant-notification', {
      message,
      data,
      timestamp: new Date()
    });
  }

  public async broadcastToAll(message: string, data?: any): Promise<void> {
    this.io.emit('broadcast', {
      message,
      data,
      timestamp: new Date()
    });
  }

  // Utility methods
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private renderTemplate(template: string, data: any): string {
    let rendered = template;
    
    Object.keys(data || {}).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(placeholder, data[key] || '');
    });

    return rendered;
  }

  private renderEmailTemplate(notification: Notification): string {
    const template = this.templates.get(notification.type);
    if (template && template.type === 'email') {
      return this.renderTemplate(template.template, notification.data);
    }

    // Fallback to basic HTML template
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Lendify. Please do not reply.
        </p>
      </div>
    `;
  }

  private getNotificationTitle(type: string, data: any): string {
    const titles: { [key: string]: string } = {
      rental_created: 'NFT Listed for Rent',
      rental_request: 'New Rental Request',
      rental_approved: 'Rental Approved',
      rental_expiring: 'Rental Expiring Soon',
      loan_request: 'New Loan Request',
      loan_funded: 'Loan Funded',
      payment_received: 'Payment Received',
      payment_overdue: 'Payment Overdue',
      welcome: 'Welcome to Lendify!'
    };

    return titles[type] || 'Notification';
  }

  private getNotificationPriority(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const priorities: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
      rental_created: 'low',
      rental_request: 'medium',
      rental_approved: 'high',
      rental_expiring: 'medium',
      loan_request: 'medium',
      loan_funded: 'high',
      payment_received: 'medium',
      payment_overdue: 'high',
      welcome: 'low'
    };

    return priorities[type] || 'medium';
  }

  private getTemplateForType(type: string): string {
    const templates: { [key: string]: string } = {
      loan_request: 'New loan request for {{loanAmount}} ETH against your NFT {{nftName}}',
      loan_funded: 'Your loan has been funded with {{loanAmount}} ETH',
      payment_received: 'Payment of {{amount}} ETH received',
      payment_overdue: 'Payment overdue: {{amountDue}} ETH for {{nftName}}',
      welcome: 'Welcome to Lendify, {{username}}!'
    };

    return templates[type] || 'You have a new notification';
  }

  private shouldSendNotification(notification: Notification, preferences: NotificationPreferences): boolean {
    // Check if user has enabled notifications for this category
    if (!preferences.categories[notification.type as keyof typeof preferences.categories]) {
      return false;
    }

    // Check if any of the requested channels are enabled
    return notification.channels.some(channel => {
      switch (channel) {
        case 'email': return preferences.email;
        case 'push': return preferences.push;
        case 'sms': return preferences.sms;
        case 'websocket': return preferences.websocket;
        default: return false;
      }
    });
  }

  private async sendFCMNotification(token: string, payload: any): Promise<void> {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: token,
        ...payload
      },
      {
        headers: {
          'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`FCM notification sent: ${response.data.message_id || 'success'}`);
  }

  // Database operations (placeholder - would implement with actual DB)
  private async storeNotification(notification: Notification): Promise<void> {
    // Store notification in database
    console.log(`Storing notification ${notification.id} in database`);
  }

  private async saveUserPreferences(preferences: NotificationPreferences): Promise<void> {
    // Save preferences to database
    console.log(`Saving preferences for user ${preferences.userId}`);
  }

  private async getUserEmail(userId: string): Promise<string> {
    // Get user email from database
    return 'user@example.com'; // Placeholder
  }

  private async getUserPushTokens(userId: string): Promise<string[]> {
    // Get user's push notification tokens from database
    return []; // Placeholder
  }

  private async getUserPhoneNumber(userId: string): Promise<string | null> {
    // Get user phone number from database
    return null; // Placeholder
  }

  private async getUsersForBroadcast(criteria?: any): Promise<string[]> {
    // Get user IDs based on criteria
    return []; // Placeholder
  }

  // Public methods for external use
  public getQueueSize(): number {
    return this.notificationQueue.length;
  }

  public getProcessingStatus(): boolean {
    return this.isProcessing;
  }

  public clearQueue(): void {
    this.notificationQueue = [];
  }
}