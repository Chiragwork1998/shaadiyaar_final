// Service Worker Manager for handling updates and notifications
class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private updateCallbacks: (() => void)[] = [];

  async initialize() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Listen for controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Only reload if we're not already reloading
          if (!window.location.href.includes('reload=true')) {
            window.location.reload();
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Fallback to minimal service worker
        try {
          this.registration = await navigator.serviceWorker.register('/sw-fallback.js');
          console.log('Fallback Service Worker registered');
        } catch (fallbackError) {
          console.error('Fallback Service Worker also failed:', fallbackError);
        }
      }
    }
  }

  private notifyUpdateAvailable() {
    // Notify all registered callbacks
    this.updateCallbacks.forEach(callback => callback());
  }

  onUpdateAvailable(callback: () => void) {
    this.updateCallbacks.push(callback);
  }

  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  async forceUpdate() {
    if (this.registration && this.registration.waiting) {
      // Tell the waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  async getCacheInfo() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            size: keys.length,
            urls: keys.map(request => request.url)
          };
        })
      );
      return cacheInfo;
    }
    return [];
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  serviceWorkerManager.initialize();
}
