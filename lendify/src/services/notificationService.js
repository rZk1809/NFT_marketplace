// Notification Service
// Handles user notifications, alerts, system messages, and real-time updates

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = new Set();
    this.unreadCount = 0;
    this.maxNotifications = 100;
    this.apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.wsConnection = null;
    
    // Initialize notification types
    this.types = {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
      BID_RECEIVED: 'bid_received',
      BID_OUTBID: 'bid_outbid',
      AUCTION_WON: 'auction_won',
      AUCTION_ENDED: 'auction_ended',
      OFFER_RECEIVED: 'offer_received',
      OFFER_ACCEPTED: 'offer_accepted',
      SALE_COMPLETED: 'sale_completed',
      NEW_FOLLOWER: 'new_follower',
      COLLECTION_UPDATE: 'collection_update',
      SYSTEM_MAINTENANCE: 'system_maintenance'
    };

    // Auto-connect WebSocket for real-time notifications
    this.initializeWebSocket();
    
    // Load persisted notifications
    this.loadPersistedNotifications();
  }

  // Core Notification Methods
  addNotification(notification) {
    const newNotification = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false,
      persistent: false,
      autoClose: true,
      duration: 5000, // 5 seconds default
      ...notification
    };

    // Add to beginning of array
    this.notifications.unshift(newNotification);
    
    // Update unread count
    if (!newNotification.read) {
      this.unreadCount++;
    }
    
    // Limit notifications count
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Persist to localStorage if persistent
    if (newNotification.persistent) {
      this.persistNotifications();
    }

    // Notify listeners
    this.notifyListeners();
    
    // Auto-remove if not persistent and has duration
    if (!newNotification.persistent && newNotification.autoClose && newNotification.duration) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification;
  }

  removeNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      const notification = this.notifications[index];
      this.notifications.splice(index, 1);
      
      // Update unread count
      if (!notification.read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      
      this.persistNotifications();
      this.notifyListeners();
    }
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.persistNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
      }
    });
    this.unreadCount = 0;
    this.persistNotifications();
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.persistNotifications();
    this.notifyListeners();
  }

  // Convenience Methods for Different Notification Types
  success(message, options = {}) {
    return this.addNotification({
      type: this.types.SUCCESS,
      title: 'Success',
      message,
      icon: '✅',
      ...options
    });
  }

  error(message, options = {}) {
    return this.addNotification({
      type: this.types.ERROR,
      title: 'Error',
      message,
      icon: '❌',
      autoClose: false,
      duration: 0,
      persistent: true,
      ...options
    });
  }

  warning(message, options = {}) {
    return this.addNotification({
      type: this.types.WARNING,
      title: 'Warning',
      message,
      icon: '⚠️',
      duration: 8000,
      ...options
    });
  }

  info(message, options = {}) {
    return this.addNotification({
      type: this.types.INFO,
      title: 'Information',
      message,
      icon: 'ℹ️',
      ...options
    });
  }

  // NFT Marketplace Specific Notifications
  bidReceived(bidData) {
    return this.addNotification({
      type: this.types.BID_RECEIVED,
      title: 'New Bid Received',
      message: `${bidData.bidder?.name || 'Someone'} placed a bid of ${bidData.amount.value} ${bidData.amount.currency} on your NFT`,
      icon: '💰',
      persistent: true,
      autoClose: false,
      data: bidData,
      actions: [
        {
          label: 'View Auction',
          action: 'viewAuction',
          params: { auctionId: bidData.auctionId }
        }
      ]
    });
  }

  bidOutbid(bidData) {
    return this.addNotification({
      type: this.types.BID_OUTBID,
      title: 'You\'ve Been Outbid',
      message: `Your bid of ${bidData.previousBid.value} ${bidData.previousBid.currency} has been exceeded`,
      icon: '📈',
      persistent: true,
      autoClose: false,
      data: bidData,
      actions: [
        {
          label: 'Place New Bid',
          action: 'placeBid',
          params: { auctionId: bidData.auctionId }
        },
        {
          label: 'View Auction',
          action: 'viewAuction',
          params: { auctionId: bidData.auctionId }
        }
      ]
    });
  }

  auctionWon(auctionData) {
    return this.addNotification({
      type: this.types.AUCTION_WON,
      title: 'Auction Won! 🎉',
      message: `Congratulations! You won the auction for ${auctionData.nft.name}`,
      icon: '🏆',
      persistent: true,
      autoClose: false,
      data: auctionData,
      actions: [
        {
          label: 'View NFT',
          action: 'viewNft',
          params: { nftId: auctionData.nft.id }
        }
      ]
    });
  }

  offerReceived(offerData) {
    return this.addNotification({
      type: this.types.OFFER_RECEIVED,
      title: 'New Offer Received',
      message: `${offerData.offerer?.name || 'Someone'} made an offer of ${offerData.amount.value} ${offerData.amount.currency}`,
      icon: '💼',
      persistent: true,
      autoClose: false,
      data: offerData,
      actions: [
        {
          label: 'Accept',
          action: 'acceptOffer',
          params: { offerId: offerData.id }
        },
        {
          label: 'Reject',
          action: 'rejectOffer',
          params: { offerId: offerData.id }
        },
        {
          label: 'View Details',
          action: 'viewOffer',
          params: { offerId: offerData.id }
        }
      ]
    });
  }

  saleCompleted(saleData) {
    return this.addNotification({
      type: this.types.SALE_COMPLETED,
      title: 'Sale Completed',
      message: `Your NFT "${saleData.nft.name}" has been sold for ${saleData.price.value} ${saleData.price.currency}`,
      icon: '💎',
      persistent: true,
      autoClose: false,
      data: saleData
    });
  }

  // System Notifications
  systemMaintenance(maintenanceData) {
    return this.addNotification({
      type: this.types.SYSTEM_MAINTENANCE,
      title: 'Scheduled Maintenance',
      message: maintenanceData.message || 'System maintenance is scheduled',
      icon: '🔧',
      persistent: true,
      autoClose: false,
      duration: 0,
      data: maintenanceData
    });
  }

  // Real-time Notification Handling
  initializeWebSocket() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('Notification WebSocket connected');
        // Subscribe to user notifications
        const userAddress = this.getUserAddress();
        if (userAddress) {
          this.wsConnection.send(JSON.stringify({
            type: 'subscribe',
            channel: 'notifications',
            userAddress
          }));
        }
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketNotification(data);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('Notification WebSocket disconnected');
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          this.initializeWebSocket();
        }, 5000);
      };

      this.wsConnection.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize notification WebSocket:', error);
    }
  }

  handleWebSocketNotification(data) {
    switch (data.type) {
      case 'bid_received':
        this.bidReceived(data.payload);
        break;
      case 'bid_outbid':
        this.bidOutbid(data.payload);
        break;
      case 'auction_won':
        this.auctionWon(data.payload);
        break;
      case 'offer_received':
        this.offerReceived(data.payload);
        break;
      case 'sale_completed':
        this.saleCompleted(data.payload);
        break;
      case 'system_maintenance':
        this.systemMaintenance(data.payload);
        break;
      default:
        // Generic notification
        this.addNotification({
          type: data.notificationType || this.types.INFO,
          title: data.title || 'Notification',
          message: data.message,
          icon: data.icon || 'ℹ️',
          persistent: data.persistent || false,
          data: data.payload
        });
    }
  }

  // API Integration
  async fetchNotifications(userAddress, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unreadOnly: unreadOnly.toString()
      });

      const response = await fetch(
        `${this.apiBase}/users/${userAddress}/notifications?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const result = await response.json();
      
      // Merge with local notifications
      result.notifications.forEach(notification => {
        const existingIndex = this.notifications.findIndex(n => n.id === notification.id);
        if (existingIndex === -1) {
          this.notifications.push({
            ...notification,
            persistent: true // Server notifications are persistent
          });
        }
      });

      this.updateUnreadCount();
      this.notifyListeners();
      
      return result;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  async markAsReadOnServer(notificationId) {
    try {
      await fetch(`${this.apiBase}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to mark notification as read on server:', error);
    }
  }

  // Listener Management
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          notifications: [...this.notifications],
          unreadCount: this.unreadCount
        });
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  // Getters
  getNotifications() {
    return [...this.notifications];
  }

  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  getNotificationById(id) {
    return this.notifications.find(n => n.id === id);
  }

  // Utility Methods
  generateId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserAddress() {
    // Get from localStorage or context
    return localStorage.getItem('userAddress') || '';
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  persistNotifications() {
    try {
      const persistentNotifications = this.notifications.filter(n => n.persistent);
      localStorage.setItem('notifications', JSON.stringify(persistentNotifications));
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }

  loadPersistedNotifications() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const persistedNotifications = JSON.parse(stored);
        this.notifications = persistedNotifications.filter(n => {
          // Remove expired notifications
          const age = Date.now() - new Date(n.timestamp).getTime();
          return age < 7 * 24 * 60 * 60 * 1000; // Keep for 7 days
        });
        this.updateUnreadCount();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load persisted notifications:', error);
    }
  }

  // Browser Notifications (with user permission)
  async requestBrowserNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Handle notification click action
        if (notification.actions?.[0]) {
          this.handleNotificationAction(notification.actions[0], notification);
        }
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  }

  handleNotificationAction(action, notification) {
    // This would integrate with your app's navigation/action system
    console.log('Notification action:', action, notification);
    
    // Emit custom event for action handling
    window.dispatchEvent(new CustomEvent('notificationAction', {
      detail: { action, notification }
    }));
  }

  // Cleanup
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.listeners.clear();
  }
}

export default new NotificationService();