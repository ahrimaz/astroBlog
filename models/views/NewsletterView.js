export default class NewsletterView {
    static formatSubscriber(subscriber) {
        return {
            id: subscriber._id,
            email: subscriber.email,
            status: subscriber.isVerified ? 'Verified' : 'Pending',
            statusClass: subscriber.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
            subscribedOn: new Date(subscriber.createdAt).toLocaleDateString()
        };
    }

    static formatDashboardStats(subscriberCount) {
        return {
            total: subscriberCount,
            formattedTotal: subscriberCount.toLocaleString(),
            hasSubscribers: subscriberCount > 0
        };
    }
} 