class NewsletterManager {
    static async subscribe(email) {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    }

    static async removeSubscriber(id) {
        const response = await fetch(`/admin/newsletter/subscribers/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    }

    static async sendNewsletter(subject, content) {
        const response = await fetch('/admin/newsletter/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, content })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const data = await NewsletterManager.subscribe(e.target.email.value);
                alert('Thanks for subscribing! Please check your email to confirm.');
                e.target.reset();
            } catch (error) {
                alert(error.message || 'Failed to subscribe. Please try again.');
            }
        });
    }
}); 