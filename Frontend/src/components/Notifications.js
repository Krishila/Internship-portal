import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setNotifications([]);
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/user/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            console.log("Notification API response:", response.data);

            let data = [];

            // response.data = [...]
            if (Array.isArray(response.data)) {
                data = response.data;
            }

            // response.data = { notifications: [...] }
            else if (
                response.data &&
                Array.isArray(response.data.notifications)
            ) {
                data = response.data.notifications;
            }

            // response.data = { data: [...] }
            else if (
                response.data &&
                Array.isArray(response.data.data)
            ) {
                data = response.data.data;
            }

            setNotifications(data);
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error.response?.data || error.message
            );

            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const loadNotifications = async () => {
            if (!isMounted) return;

            await fetchNotifications();

            if (isMounted) {
                timeoutId = setTimeout(loadNotifications, 5000);
            }
        };

        loadNotifications();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="container mt-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-1">Notifications</h2>

                    <p className="text-muted mb-0">
                        Stay updated with your internship activities.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <span className="badge bg-danger rounded-pill px-3 py-2">
                        {notifications.length} New
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="text-muted mt-2">
                        Loading notifications...
                    </p>
                </div>
            ) : notifications.length > 0 ? (

                /* Notifications */
                <div className="mt-3">

                    {notifications.map((notification, index) => (

                        <div
                            key={notification.id || `notification-${index}`}
                            className="card border-0 shadow-sm mb-3"
                        >

                            <div className="card-body">

                                <div className="d-flex align-items-start">

                                    {/* Notification Icon */}
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: "45px",
                                            height: "45px",
                                            minWidth: "45px",
                                            backgroundColor: "#CCFBF1",
                                            color: "#0D9488",
                                            fontSize: "20px",
                                        }}
                                    >
                                        🔔
                                    </div>

                                    <div className="flex-grow-1">

                                        {/* Title + New Badge */}
                                        <div className="d-flex justify-content-between align-items-start">

                                            <h5 className="mb-1">
                                                {notification.title ||
                                                    "System Notification"}
                                            </h5>

                                            {!notification.is_read && (
                                                <span className="badge bg-danger rounded-pill">
                                                    New
                                                </span>
                                            )}

                                        </div>

                                        {/* Message */}
                                        <p className="text-muted mb-2">
                                            {notification.message ||
                                                "You have a new notification."}
                                        </p>

                                        {/* Date */}
                                        <small className="text-secondary">
                                            {notification.created_at
                                                ? new Date(
                                                      notification.created_at
                                                  ).toLocaleString()
                                                : ""}
                                        </small>

                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                </div>

            ) : (

                /* No Notifications */
                <div className="card border-0 shadow-sm mt-3">

                    <div className="card-body text-center py-5">

                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{
                                width: "65px",
                                height: "65px",
                                backgroundColor: "#CCFBF1",
                                color: "#0D9488",
                                fontSize: "28px",
                            }}
                        >
                            🔔
                        </div>

                        <h5>No Notifications</h5>

                        <p className="text-muted mb-0">
                            You don't have any notifications yet.
                        </p>

                    </div>
                </div>
            )}
        </div>
    );
}