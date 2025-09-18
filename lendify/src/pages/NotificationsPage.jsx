import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, X, Eye, EyeOff, Filter, Search,
  Clock, DollarSign, Gavel, Heart, Star, AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../services/notificationService';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({
        filter,
        limit: 100
      });
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Use mock data for development
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = () => [
    {
      id: 'notif-1',
      type: 'bid_received',
      title: 'New bid on your NFT',
      message: 'Someone placed a bid of 2.5 ETH on Cosmic Voyager #1234',
      data: {
        nftId: 'nft-1',
        nftName: 'Cosmic Voyager #1234',
        bidAmount: { value: 2.5, currency: 'ETH' },
        bidder: { name: 'BidMaster', address: '0x1234...5678' }
      },
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      icon: 'gavel',
      priority: 'high'
    },
    {
      id: 'notif-2',
      type: 'auction_ending',
      title: 'Auction ending soon',
      message: 'Your auction for Digital Dreams #0789 ends in 1 hour',
      data: {
        nftId: 'nft-2',
        nftName: 'Digital Dreams #0789',
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        currentBid: { value: 0.8, currency: 'ETH' }
      },
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: 'clock',
      priority: 'high'
    },
    {
      id: 'notif-3',
      type: 'price_alert',
      title: 'Price alert triggered',
      message: 'Pixel Warriors floor price dropped to 1.2 ETH',
      data: {
        collectionName: 'Pixel Warriors',
        floorPrice: { value: 1.2, currency: 'ETH' },
        previousPrice: { value: 1.5, currency: 'ETH' }
      },
      read: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: 'dollar-sign',
      priority: 'medium'
    },
    {
      id: 'notif-4',
      type: 'follow',
      title: 'New follower',
      message: 'CryptoCollector started following you',
      data: {
        follower: { name: 'CryptoCollector', address: '0x8765...4321', verified: true }
      },
      read: true,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      icon: 'heart',
      priority: 'low'
    },
    {
      id: 'notif-5',
      type: 'sale_completed',
      title: 'NFT sold successfully',
      message: 'Your Pixel Warriors #0456 sold for 1.2 ETH',
      data: {
        nftId: 'nft-3',
        nftName: 'Pixel Warriors #0456',
        salePrice: { value: 1.2, currency: 'ETH' },
        buyer: { name: 'ArtCollector', address: '0x2468...1357' }
      },
      read: true,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      icon: 'check',
      priority: 'medium'
    }
  ];

  const getNotificationIcon = (iconType) => {
    const iconMap = {
      'gavel': Gavel,
      'clock': Clock,
      'dollar-sign': DollarSign,
      'heart': Heart,
      'check': Check,
      'star': Star,
      'alert': AlertCircle
    };
    return iconMap[iconType] || Bell;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === 'mark_read') {
        await Promise.all(selectedNotifications.map(id => 
          notificationService.markAsRead(id)
        ));
        setNotifications(prev => prev.map(notif => 
          selectedNotifications.includes(notif.id) ? { ...notif, read: true } : notif
        ));
      } else if (action === 'delete') {
        await Promise.all(selectedNotifications.map(id => 
          notificationService.deleteNotification(id)
        ));
        setNotifications(prev => prev.filter(notif => 
          !selectedNotifications.includes(notif.id)
        ));
      }
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter !== 'all' && filter !== notif.type) return false;
    if (searchTerm && !notif.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notif.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const renderNotification = (notification) => {
    const Icon = getNotificationIcon(notification.icon);
    const isSelected = selectedNotifications.includes(notification.id);

    return (
      <div 
        key={notification.id} 
        className={`notification-item ${!notification.read ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
      >
        <div className="notification-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedNotifications(prev => [...prev, notification.id]);
              } else {
                setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
              }
            }}
          />
        </div>

        <div className={`notification-icon ${notification.priority}`}>
          <Icon size={20} />
        </div>

        <div className="notification-content">
          <div className="notification-header">
            <h4 className="notification-title">{notification.title}</h4>
            <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
          </div>
          <p className="notification-message">{notification.message}</p>
          
          {notification.data && (
            <div className="notification-data">
              {notification.data.nftName && (
                <span className="data-item">NFT: {notification.data.nftName}</span>
              )}
              {notification.data.bidAmount && (
                <span className="data-item">
                  Amount: {notification.data.bidAmount.value} {notification.data.bidAmount.currency}
                </span>
              )}
              {notification.data.collectionName && (
                <span className="data-item">Collection: {notification.data.collectionName}</span>
              )}
            </div>
          )}
        </div>

        <div className="notification-actions">
          {!notification.read && (
            <button
              className="action-btn mark-read"
              onClick={() => handleMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <Eye size={16} />
            </button>
          )}
          <button
            className="action-btn delete"
            onClick={() => handleDeleteNotification(notification.id)}
            title="Delete notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="auth-required">
          <Bell size={48} />
          <h2>Authentication Required</h2>
          <p>Please connect your wallet to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <header className="notifications-header">
        <div className="header-container">
          <div className="header-content">
            <div className="brand">
              <h1>Notifications</h1>
              <p>Stay updated with your NFT activity</p>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} unread</span>
              )}
            </div>
            
            <div className="header-actions">
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check size={16} />
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="notifications-main">
        {/* Controls */}
        <section className="controls-section">
          <div className="container">
            <div className="controls-bar">
              <div className="search-controls">
                <div className="search-input">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-controls">
                <Filter size={16} />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Notifications</option>
                  <option value="bid_received">Bids Received</option>
                  <option value="auction_ending">Auctions Ending</option>
                  <option value="price_alert">Price Alerts</option>
                  <option value="follow">Followers</option>
                  <option value="sale_completed">Sales</option>
                </select>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedNotifications.length} selected</span>
                  <button 
                    className="bulk-btn"
                    onClick={() => handleBulkAction('mark_read')}
                  >
                    Mark Read
                  </button>
                  <button 
                    className="bulk-btn delete"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notifications List */}
        <section className="notifications-section">
          <div className="container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <h3>No notifications found</h3>
                <p>You're all caught up!</p>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default NotificationsPage;
