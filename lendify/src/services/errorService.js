// Error Handling Service
// Centralized error management, logging, and user-friendly error reporting

import notificationService from './notificationService';

class ErrorService {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 500;
    this.apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.reportingEnabled = process.env.REACT_APP_ERROR_REPORTING === 'true';
    
    // Error categories for better handling
    this.categories = {
      NETWORK: 'network',
      AUTHENTICATION: 'authentication',
      VALIDATION: 'validation',
      BLOCKCHAIN: 'blockchain',
      PAYMENT: 'payment',
      PERMISSION: 'permission',
      SYSTEM: 'system',
      USER_INPUT: 'user_input',
      API: 'api',
      UNKNOWN: 'unknown'
    };

    // Initialize global error handlers
    this.initializeGlobalHandlers();
  }

  // Core Error Handling Methods
  handleError(error, context = {}) {
    const processedError = this.processError(error, context);
    
    // Log the error
    this.logError(processedError);
    
    // Report to external service if enabled
    if (this.reportingEnabled) {
      this.reportError(processedError);
    }
    
    // Show user notification if appropriate
    this.showUserNotification(processedError);
    
    return processedError;
  }

  processError(error, context) {
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const url = window.location.href;

    let processedError = {
      id: this.generateErrorId(),
      timestamp,
      userAgent,
      url,
      context: { ...context },
      stack: error.stack,
      name: error.name || 'Error',
      message: error.message || 'An unknown error occurred',
      category: this.categorizeError(error),
      severity: this.getSeverity(error),
      userFriendlyMessage: this.getUserFriendlyMessage(error),
      actionable: this.isActionable(error),
      retryable: this.isRetryable(error),
      originalError: error
    };

    // Add additional context based on error type
    if (error.response) {
      // HTTP response error
      processedError.httpStatus = error.response.status;
      processedError.httpStatusText = error.response.statusText;
      processedError.responseData = error.response.data;
    }

    if (error.code) {
      processedError.code = error.code;
    }

    if (error.transaction) {
      // Blockchain transaction error
      processedError.transactionHash = error.transaction.hash;
      processedError.blockchainError = true;
    }

    return processedError;
  }

  categorizeError(error) {
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
      return this.categories.NETWORK;
    }

    // Authentication errors
    if (error.response?.status === 401 || error.message?.includes('unauthorized')) {
      return this.categories.AUTHENTICATION;
    }

    // Permission errors
    if (error.response?.status === 403 || error.message?.includes('forbidden')) {
      return this.categories.PERMISSION;
    }

    // Validation errors
    if (error.response?.status === 400 || error.name === 'ValidationError') {
      return this.categories.VALIDATION;
    }

    // API errors
    if (error.response?.status >= 500) {
      return this.categories.API;
    }

    // Blockchain errors
    if (error.code?.startsWith('UNPREDICTABLE_GAS_LIMIT') || 
        error.message?.includes('gas') || 
        error.message?.includes('revert')) {
      return this.categories.BLOCKCHAIN;
    }

    // Payment errors
    if (error.message?.includes('insufficient funds') || 
        error.message?.includes('payment')) {
      return this.categories.PAYMENT;
    }

    return this.categories.UNKNOWN;
  }

  getSeverity(error) {
    const category = this.categorizeError(error);
    
    switch (category) {
      case this.categories.SYSTEM:
      case this.categories.API:
        return 'high';
      case this.categories.BLOCKCHAIN:
      case this.categories.PAYMENT:
      case this.categories.AUTHENTICATION:
        return 'medium';
      case this.categories.NETWORK:
      case this.categories.VALIDATION:
      case this.categories.USER_INPUT:
        return 'low';
      default:
        return 'medium';
    }
  }

  getUserFriendlyMessage(error) {
    const category = this.categorizeError(error);
    
    switch (category) {
      case this.categories.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      
      case this.categories.AUTHENTICATION:
        return 'Please sign in to continue. Your session may have expired.';
      
      case this.categories.PERMISSION:
        return 'You don\'t have permission to perform this action.';
      
      case this.categories.VALIDATION:
        return 'Please check your input and try again.';
      
      case this.categories.BLOCKCHAIN:
        if (error.message?.includes('gas')) {
          return 'Transaction failed due to insufficient gas. Please try increasing the gas limit.';
        }
        if (error.message?.includes('revert')) {
          return 'Transaction was reverted. Please check the contract conditions.';
        }
        return 'Blockchain transaction failed. Please try again.';
      
      case this.categories.PAYMENT:
        if (error.message?.includes('insufficient funds')) {
          return 'Insufficient funds to complete this transaction.';
        }
        return 'Payment processing failed. Please try again.';
      
      case this.categories.API:
        return 'Server is temporarily unavailable. Please try again in a few moments.';
      
      default:
        return 'Something went wrong. Please try again or contact support if the problem persists.';
    }
  }

  isActionable(error) {
    const category = this.categorizeError(error);
    
    return [
      this.categories.AUTHENTICATION,
      this.categories.VALIDATION,
      this.categories.USER_INPUT,
      this.categories.PAYMENT
    ].includes(category);
  }

  isRetryable(error) {
    const category = this.categorizeError(error);
    
    if (category === this.categories.NETWORK) return true;
    if (category === this.categories.API && error.response?.status >= 500) return true;
    if (category === this.categories.BLOCKCHAIN && !error.message?.includes('revert')) return true;
    
    return false;
  }

  // Specific Error Handlers
  handleNetworkError(error, context) {
    return this.handleError(error, {
      ...context,
      category: this.categories.NETWORK,
      retryAction: 'Check your internet connection and try again'
    });
  }

  handleAuthError(error, context) {
    return this.handleError(error, {
      ...context,
      category: this.categories.AUTHENTICATION,
      redirectAction: '/login'
    });
  }

  handleValidationError(error, context) {
    return this.handleError(error, {
      ...context,
      category: this.categories.VALIDATION,
      fieldErrors: error.fieldErrors || {}
    });
  }

  handleBlockchainError(error, context) {
    return this.handleError(error, {
      ...context,
      category: this.categories.BLOCKCHAIN,
      transactionHash: error.transaction?.hash
    });
  }

  handlePaymentError(error, context) {
    return this.handleError(error, {
      ...context,
      category: this.categories.PAYMENT,
      paymentId: context.paymentId
    });
  }

  // User Notification
  showUserNotification(processedError) {
    const { category, severity, userFriendlyMessage, actionable } = processedError;
    
    // Don't show notifications for low-severity validation errors
    if (category === this.categories.USER_INPUT && severity === 'low') {
      return;
    }

    const notificationOptions = {
      title: this.getNotificationTitle(category),
      message: userFriendlyMessage,
      persistent: severity === 'high' || actionable,
      actions: this.getNotificationActions(processedError)
    };

    if (severity === 'high') {
      notificationService.error(userFriendlyMessage, notificationOptions);
    } else if (severity === 'medium') {
      notificationService.warning(userFriendlyMessage, notificationOptions);
    } else {
      notificationService.info(userFriendlyMessage, notificationOptions);
    }
  }

  getNotificationTitle(category) {
    switch (category) {
      case this.categories.NETWORK:
        return 'Connection Problem';
      case this.categories.AUTHENTICATION:
        return 'Authentication Required';
      case this.categories.PERMISSION:
        return 'Access Denied';
      case this.categories.VALIDATION:
        return 'Invalid Input';
      case this.categories.BLOCKCHAIN:
        return 'Transaction Failed';
      case this.categories.PAYMENT:
        return 'Payment Error';
      case this.categories.API:
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  getNotificationActions(processedError) {
    const actions = [];
    
    if (processedError.retryable) {
      actions.push({
        label: 'Retry',
        action: 'retry',
        params: { errorId: processedError.id }
      });
    }
    
    if (processedError.category === this.categories.AUTHENTICATION) {
      actions.push({
        label: 'Sign In',
        action: 'navigate',
        params: { path: '/login' }
      });
    }
    
    if (processedError.severity === 'high') {
      actions.push({
        label: 'Contact Support',
        action: 'contactSupport',
        params: { errorId: processedError.id }
      });
    }
    
    return actions;
  }

  // Error Logging
  logError(processedError) {
    // Add to local log
    this.errorLog.unshift(processedError);
    
    // Limit log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
    
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${processedError.category.toUpperCase()} ERROR`);
      console.error('Message:', processedError.message);
      console.error('Context:', processedError.context);
      console.error('Stack:', processedError.stack);
      console.error('Full Error:', processedError);
      console.groupEnd();
    }
  }

  // External Error Reporting
  async reportError(processedError) {
    try {
      // Report to your error tracking service (Sentry, LogRocket, etc.)
      await fetch(`${this.apiBase}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          error: processedError,
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: this.getUserId(),
          sessionId: this.getSessionId()
        })
      });
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }

  // Global Error Handlers
  initializeGlobalHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandledRejection',
        promise: event.promise
      });
    });

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError(new Error(`Failed to load resource: ${event.target.src || event.target.href}`), {
          type: 'resourceError',
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
  }

  // Recovery Actions
  async retryOperation(errorId, operation) {
    const error = this.errorLog.find(e => e.id === errorId);
    if (!error || !error.retryable) {
      throw new Error('Operation is not retryable');
    }

    try {
      const result = await operation();
      notificationService.success('Operation completed successfully');
      return result;
    } catch (retryError) {
      this.handleError(retryError, {
        originalErrorId: errorId,
        retryAttempt: true
      });
      throw retryError;
    }
  }

  // Error Analysis & Reporting
  getErrorSummary(timeframe = 'day') {
    const now = new Date();
    const timeframeDuration = {
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = new Date(now.getTime() - timeframeDuration[timeframe]);
    const recentErrors = this.errorLog.filter(error => 
      new Date(error.timestamp) > cutoff
    );

    const summary = {
      total: recentErrors.length,
      byCategory: {},
      bySeverity: {},
      mostCommon: []
    };

    recentErrors.forEach(error => {
      // By category
      summary.byCategory[error.category] = (summary.byCategory[error.category] || 0) + 1;
      
      // By severity
      summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1;
    });

    // Most common errors
    const errorCounts = {};
    recentErrors.forEach(error => {
      const key = `${error.category}:${error.message}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    summary.mostCommon = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ error: key, count }));

    return summary;
  }

  // Utility Methods
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    return localStorage.getItem('userId') || 'anonymous';
  }

  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'no-session';
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  // Public API
  getErrorLog() {
    return [...this.errorLog];
  }

  clearErrorLog() {
    this.errorLog = [];
  }

  getError(errorId) {
    return this.errorLog.find(e => e.id === errorId);
  }

  // Testing helpers (development only)
  simulateError(type = 'test') {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Error simulation is only available in development mode');
      return;
    }

    const testError = new Error('This is a test error');
    testError.code = type.toUpperCase();
    
    this.handleError(testError, {
      type: 'simulation',
      category: type
    });
  }
}

export default new ErrorService();