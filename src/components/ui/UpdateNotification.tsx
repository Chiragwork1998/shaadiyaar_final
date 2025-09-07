import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';
import { serviceWorkerManager } from '../../utils/serviceWorkerManager';

interface UpdateNotificationProps {
  className?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ className = '' }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for update availability
    serviceWorkerManager.onUpdateAvailable(() => {
      setShowNotification(true);
    });

    // Check for updates on mount (with error handling)
    try {
      serviceWorkerManager.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates on mount:', error);
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await serviceWorkerManager.forceUpdate();
      // The page will reload automatically when the new service worker takes control
    } catch (error) {
      console.error('Failed to update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className={`fixed top-4 left-4 right-4 z-50 ${className}`}
        >
          <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  App Update Available
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  A new version of Shaadiyaar is ready. Update now to get the latest features and improvements.
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="text-xs h-7"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1" />
                        Update Now
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-xs h-7 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
