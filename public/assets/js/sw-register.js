// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available, show update notification
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div id="sw-update-notification" style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; font-family: Arial, sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>🔄 Nueva versión disponible</span>
                <button id="sw-update-button" style="background: white; color: #28a745; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">Actualizar</button>
                <button id="sw-dismiss-button" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Attach event listeners to the buttons
    document.getElementById('sw-update-button').addEventListener('click', () => {
        window.location.reload();
    });
    document.getElementById('sw-dismiss-button').addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}
