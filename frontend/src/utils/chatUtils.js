export const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(msg => {
        const date = new Date(msg.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
        });
        
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(msg);
    });
    
    return groups;
};

export const playNotificationSound = () => {
    // Simple pop sound base64
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"); // Placeholder, will replace with better one if needed or user browser default
    // Ideally we use a real mp3 file from public assets
    // For now let's try a very short beep or rely on a public URL if allowed, otherwise we might skip sound if no asset
    // Accessing a safe sound
    try {
        const audioObj = new Audio("/notification.mp3"); // Assuming we might add this later
        audioObj.play().catch(e => console.log("Audio play failed (interaction needed)", e));
    } catch (e) {
        console.error("Audio error", e);
    }
};
