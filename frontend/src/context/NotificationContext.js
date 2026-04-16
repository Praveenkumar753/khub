import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import notificationService from '../services/notificationService';

// Initial state
const initialState = {
    notifications: [],
    courseNotifications: {},
    unreadCount: 0,
    courseUnreadCounts: {},
    loading: false,
    error: null,
    lastFetch: null
};

// Action types
const ActionTypes = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
    SET_COURSE_NOTIFICATIONS: 'SET_COURSE_NOTIFICATIONS',
    SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
    SET_COURSE_UNREAD_COUNT: 'SET_COURSE_UNREAD_COUNT',
    MARK_AS_READ: 'MARK_AS_READ',
    MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function notificationReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_LOADING:
            return { ...state, loading: action.payload };

        case ActionTypes.SET_ERROR:
            return { ...state, error: action.payload, loading: false };

        case ActionTypes.CLEAR_ERROR:
            return { ...state, error: null };

        case ActionTypes.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.payload.notifications,
                unreadCount: action.payload.unreadCount,
                lastFetch: Date.now(),
                loading: false,
                error: null
            };

        case ActionTypes.SET_COURSE_NOTIFICATIONS:
            return {
                ...state,
                courseNotifications: {
                    ...state.courseNotifications,
                    [action.payload.courseId]: action.payload.notifications
                },
                courseUnreadCounts: {
                    ...state.courseUnreadCounts,
                    [action.payload.courseId]: action.payload.unreadCount
                },
                loading: false,
                error: null
            };

        case ActionTypes.SET_UNREAD_COUNT:
            return { ...state, unreadCount: action.payload };

        case ActionTypes.SET_COURSE_UNREAD_COUNT:
            return {
                ...state,
                courseUnreadCounts: {
                    ...state.courseUnreadCounts,
                    [action.payload.courseId]: action.payload.count
                }
            };

        case ActionTypes.MARK_AS_READ:
            const { notificationIds, optimistic = false } = action.payload;
            
            // Update global notifications
            const updatedNotifications = state.notifications.map(notification =>
                notificationIds.includes(notification._id)
                    ? { ...notification, status: 'read' }
                    : notification
            );

            // Update course notifications
            const updatedCourseNotifications = { ...state.courseNotifications };
            Object.keys(updatedCourseNotifications).forEach(courseId => {
                updatedCourseNotifications[courseId] = updatedCourseNotifications[courseId].map(notification =>
                    notificationIds.includes(notification._id)
                        ? { ...notification, status: 'read' }
                        : notification
                );
            });

            // Calculate new unread counts
            const newUnreadCount = updatedNotifications.filter(n => n.status === 'unread').length;
            const newCourseUnreadCounts = { ...state.courseUnreadCounts };
            Object.keys(updatedCourseNotifications).forEach(courseId => {
                newCourseUnreadCounts[courseId] = updatedCourseNotifications[courseId]
                    .filter(n => n.status === 'unread').length;
            });

            return {
                ...state,
                notifications: updatedNotifications,
                courseNotifications: updatedCourseNotifications,
                unreadCount: newUnreadCount,
                courseUnreadCounts: newCourseUnreadCounts
            };

        case ActionTypes.MARK_ALL_AS_READ:
            const { courseId } = action.payload;
            
            if (courseId) {
                // Mark all course notifications as read
                const updatedCourseNotifs = {
                    ...state.courseNotifications,
                    [courseId]: (state.courseNotifications[courseId] || []).map(n => ({ ...n, status: 'read' }))
                };

                return {
                    ...state,
                    courseNotifications: updatedCourseNotifs,
                    courseUnreadCounts: {
                        ...state.courseUnreadCounts,
                        [courseId]: 0
                    }
                };
            } else {
                // Mark all notifications as read
                return {
                    ...state,
                    notifications: state.notifications.map(n => ({ ...n, status: 'read' })),
                    courseNotifications: Object.keys(state.courseNotifications).reduce((acc, cId) => {
                        acc[cId] = state.courseNotifications[cId].map(n => ({ ...n, status: 'read' }));
                        return acc;
                    }, {}),
                    unreadCount: 0,
                    courseUnreadCounts: Object.keys(state.courseUnreadCounts).reduce((acc, cId) => {
                        acc[cId] = 0;
                        return acc;
                    }, {})
                };
            }

        case ActionTypes.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + 1
            };

        case ActionTypes.REMOVE_NOTIFICATION:
            const filteredNotifications = state.notifications.filter(n => n._id !== action.payload);
            return {
                ...state,
                notifications: filteredNotifications,
                unreadCount: filteredNotifications.filter(n => n.status === 'unread').length
            };

        default:
            return state;
    }
}

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);

    // Handle service updates
    useEffect(() => {
        const unsubscribe = notificationService.subscribe((update) => {
            switch (update.type) {
                case 'ALL_NOTIFICATIONS':
                    dispatch({
                        type: ActionTypes.SET_NOTIFICATIONS,
                        payload: update.data
                    });
                    break;

                case 'COURSE_NOTIFICATIONS':
                    dispatch({
                        type: ActionTypes.SET_COURSE_NOTIFICATIONS,
                        payload: {
                            courseId: update.courseId,
                            notifications: update.data.notifications,
                            unreadCount: update.data.unreadCount
                        }
                    });
                    break;

                case 'MARK_AS_READ':
                    if (update.success || update.optimistic) {
                        dispatch({
                            type: ActionTypes.MARK_AS_READ,
                            payload: {
                                notificationIds: update.notificationIds,
                                optimistic: update.optimistic
                            }
                        });
                    }
                    break;

                case 'MARK_ALL_AS_READ':
                    if (update.success) {
                        dispatch({
                            type: ActionTypes.MARK_ALL_AS_READ,
                            payload: { courseId: update.courseId }
                        });
                    }
                    break;

                case 'NEW_NOTIFICATION':
                    dispatch({
                        type: ActionTypes.ADD_NOTIFICATION,
                        payload: update.notification
                    });
                    break;

                case 'DELETE_NOTIFICATION':
                    dispatch({
                        type: ActionTypes.REMOVE_NOTIFICATION,
                        payload: update.notificationId
                    });
                    break;

                default:
                    break;
            }
        });

        return unsubscribe;
    }, []);

    // Memoize action creators to ensure stable references
    const actions = useMemo(() => ({
        // Load all notifications
        loadNotifications: async (options = {}) => {
            try {
                dispatch({ type: ActionTypes.SET_NOTIFICATIONS_LOADING, payload: true });
                await notificationService.getAllNotifications(options);
            } catch (error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            } finally {
                dispatch({ type: ActionTypes.SET_NOTIFICATIONS_LOADING, payload: false });
            }
        },

        // Load course notifications
        loadCourseNotifications: async (courseId, options = {}) => {
            if (!courseId) return;
            try {
                dispatch({ type: ActionTypes.SET_COURSE_LOADING, payload: { courseId, loading: true } });
                await notificationService.getCourseNotifications(courseId, options);
            } catch (error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            } finally {
                dispatch({ type: ActionTypes.SET_COURSE_LOADING, payload: { courseId, loading: false } });
            }
        },

        // Mark notifications as read
        markAsRead: async (notificationIds) => {
            try {
                await notificationService.markAsRead(notificationIds);
            } catch (error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            }
        },

        // Mark all as read
        markAllAsRead: async (courseId = null) => {
            try {
                await notificationService.markAllAsRead(courseId);
            } catch (error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            }
        },

        // Create notification
        createNotification: async (notificationData) => {
            try {
                await notificationService.createNotification(notificationData);
            } catch (error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            }
        },

        // Delete notification
        deleteNotification: async (notificationId) => {
            try {
                await notificationService.deleteNotification(notificationId);
            } catch (error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
            }
        },

        // Clear error
        clearError: () => {
            dispatch({ type: ActionTypes.CLEAR_ERROR });
        },

        // Refresh notifications
        refresh: async (courseId = null) => {
            if (courseId) {
                await actions.loadCourseNotifications(courseId, { forceRefresh: true });
            } else {
                await actions.loadNotifications({ forceRefresh: true });
            }
        }
    }), []); // No dependencies for actions as they only use dispatch and service

    const value = useMemo(() => ({
        ...state,
        ...actions,
        hasUnread: state.unreadCount > 0,
        getCourseUnreadCount: (courseId) => state.courseUnreadCounts[courseId] || 0,
        getCourseNotifications: (courseId) => state.courseNotifications[courseId] || [],
        isStale: state.lastFetch && (Date.now() - state.lastFetch) > 60000 // 1 minute
    }), [state, actions]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Hook to use notification context
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext;