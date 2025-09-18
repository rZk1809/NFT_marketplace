import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, X, Check, AlertTriangle, Info, CheckCircle, 
  ExternalLink, RefreshCw, Settings, Trash2, MessageSquare,
  Clock, Eye, Filter, Search
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Subscribe to notification service updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });

    // Initial load
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle notification actions
  useEffect(() => {
    const handleNotificationAction = (event) => {
      const { action, notification } = event.detail;
      
      switch (action.action) {
        case 'viewAuction':
          window.location.href = `/auctions/${action.params.auctionId}`;
          break;
        case 'viewNft':
          window.location.href = `/nfts/${action.params.nftId}`;
          break;
        case 'placeBid':
          window.location.href = `/auctions/${action.params.auctionId}#bid`;
          break;
        case 'acceptOffer':
          handleOfferAction('accept', action.params.offerId);
          break;
        case 'rejectOffer':
          handleOfferAction('reject', action.params.offerId);
          break;
        case 'contactSupport':
          window.open('/support', '_blank');
          break;
        case 'retry':
          handleRetryAction(action.params.errorId);
          break;
        default:
          console.log('Unhandled notification action:', action);
      }
      
      // Mark notification as read when action is taken
      if (notification && !notification.read) {
        handleMarkAsRead(notification.id);
      }
    };

    window.addEventListener('notificationAction', handleNotificationAction);
    return () => window.removeEventListener('notificationAction', handleNotificationAction);
  }, []);

  // Filter and search notifications
  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(query) ||
        notification.message?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    setLoading(true);
    notificationService.markAllAsRead();
    setTimeout(() => setLoading(false), 500);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      notificationService.clearAll();
    }
  };

  const handleRemoveNotification = (notificationId) => {
    notificationService.removeNotification(notificationId);
  };

  const handleOfferAction = async (action, offerId) => {
    try {
      setLoading(true);
      // This would integrate with your bidding service
      console.log(`${action} offer:`, offerId);
      notificationService.success(`Offer ${action}ed successfully`);
    } catch (error) {
      notificationService.error(`Failed to ${action} offer`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAction = async (errorId) => {
    try {
      setLoading(true);
      // This would integrate with your error service
      console.log('Retry error:', errorId);
      notificationService.success('Operation retried successfully');
    } catch (error) {
      notificationService.error('Retry failed');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="notification-type-icon success" size={16} />;
      case 'error':
        return <AlertTriangle className="notification-type-icon error" size={16} />;
      case 'warning':
        return <AlertTriangle className="notification-type-icon warning" size={16} />;
      case 'bid_received':
      case 'bid_outbid':
        return <span className="notification-emoji">💰</span>;
      case 'auction_won':
        return <span className="notification-emoji">🏆</span>;
      case 'offer_received':
        return <span className="notification-emoji">💼</span>;
      case 'sale_completed':
        return <span className="notification-emoji">💎</span>;
      default:
        return <Info className="notification-type-icon info" size={16} />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderNotificationActions = (notification) => {
    if (!notification.actions || notification.actions.length === 0) {
      return null;
    }

    return (
      <div className="notification-actions">
        {notification.actions.map((action, index) => (
          <button
            key={index}
            className={`action-btn ${action.action === 'accept' ? 'accept' : 
              action.action === 'reject' ? 'reject' : 'primary'}`}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('notificationAction', {
                detail: { action, notification }
              }));
            }}
            disabled={loading}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderNotification = (notification) => (
    <div
      key={notification.id}
      className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
    >
      <div className="notification-icon">
        {getNotificationIcon(notification)}
      </div>
      
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <div className="notification-meta">
            <span className="notification-time">
              <Clock size={12} />
              {formatTimeAgo(notification.timestamp)}
            </span>
            {!notification.read && <div className="unread-indicator" />}
          </div>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        {renderNotificationActions(notification)}
      </div>
      
      <button
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveNotification(notification.id);
        }}
        title="Remove notification"
      >
        <X size={14} />
      </button>
    </div>
  );

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={handleToggleDropdown}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div className="header-title">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} unread</span>
              )}
            </div>
            
            <div className="header-actions">
              <button
                className="header-action-btn"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || loading}
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
              <button
                className="header-action-btn"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="notification-filters">
            <div className="filter-tabs">
              {['all', 'unread', 'read'].map(filterType => (
                <button
                  key={filterType}
                  className={`filter-tab ${filter === filterType ? 'active' : ''}`}
                  onClick={() => setFilter(filterType)}
                >
                  {filterType === 'all' ? 'All' : 
                   filterType === 'unread' ? 'Unread' : 'Read'}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="tab-count">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
            
            {notifications.length > 5 && (
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            )}
          </div>

          <div className="notification-list">
            {loading && (
              <div className="loading-state">
                <RefreshCw className="loading-spinner" size={20} />
                <span>Processing...</span>
              </div>
            )}

            {!loading && filteredNotifications.length === 0 && (
              <div className="empty-state">
                <Bell size={48} />
                <h4>No notifications</h4>
                <p>
                  {notifications.length === 0
                    ? "You're all caught up!"
                    : searchQuery
                    ? "No notifications match your search"
                    : `No ${filter} notifications`}
                </p>
              </div>
            )}

            {!loading && filteredNotifications.map(renderNotification)}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                View All Notifications
                <ExternalLink size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Toast Notification Component for immediate feedback
export const ToastNotification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration && notification.autoClose) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const getToastIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="toast-icon success" size={20} />;
      case 'error':
        return <AlertTriangle className="toast-icon error" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon warning" size={20} />;
      default:
        return <Info className="toast-icon info" size={20} />;
    }
  };

  return (
    <div className={`toast-notification ${notification.type}`}>
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {getToastIcon()}
        </div>
        
        <div className="toast-message">
          <h4 className="toast-title">{notification.title}</h4>
          <p className="toast-text">{notification.message}</p>
          
          {notification.actions && notification.actions.length > 0 && (
            <div className="toast-actions">
              {notification.actions.slice(0, 2).map((action, index) => (
                <button
                  key={index}
                  className={`toast-action-btn ${action.action}`}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('notificationAction', {
                      detail: { action, notification }
                    }));
                    onClose(notification.id);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button
        className="toast-close"
        onClick={() => onClose(notification.id)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((data) => {
      // Only show non-persistent notifications as toasts
      const newToasts = data.notifications.filter(n => 
        !n.persistent && !n.read && Date.now() - new Date(n.timestamp).getTime() < 500
      );
      
      setToasts(prev => {
        const combined = [...prev];
        newToasts.forEach(newToast => {
          if (!combined.find(t => t.id === newToast.id)) {
            combined.push(newToast);
          }
        });
        return combined.slice(-5); // Limit to 5 toasts
      });
    });

    return unsubscribe;
  }, []);

  const handleCloseToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
    notificationService.removeNotification(toastId);
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          notification={toast}
          onClose={handleCloseToast}
        />
      ))}
    </div>
  );
};

export default NotificationCenter;