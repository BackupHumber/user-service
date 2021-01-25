"use strict";


exports.fetchServices = async () => {
    return [
        {
            name: "User/Auth Service",
            key: "user-service",
            description: "Handles Authorization, Authentication and User profile"
        },
        {
            name: "Subscription Service",
            key: "subscription-service",
            description: "Handles subscription and renewal triggers"
        },
        {
            name: "Event Service",
            key: "event-service",
            description: "Handles broadcasting of events and handling of external events"
        },
        {
            name: "Notification Service",
            key: "notification-service",
            description: "Handles SMS/Email/Chat notification via multiple providers and channel"
        },
        {
            name: "Payment Service",
            key: "payment-service",
            description: "Handles Card/USSD/Mobile-Money payments via multiple providers"
        }
    ];
};