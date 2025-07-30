import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Settings, UserCircle, Bell, Shield } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [name, setName] = React.useState('Wedding Planner');
  const [email, setEmail] = React.useState('planner@wedify.com');
  const [notifications, setNotifications] = React.useState(true);
  
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application settings"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                <a
                  href="#profile"
                  className="flex items-center px-3 py-2 text-sm font-medium text-rose-700 rounded-md bg-rose-50"
                >
                  <UserCircle className="mr-3 h-5 w-5 text-rose-500" />
                  <span className="truncate">Profile</span>
                </a>
                <a
                  href="#notifications"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  <Bell className="mr-3 h-5 w-5 text-gray-400" />
                  <span className="truncate">Notifications</span>
                </a>
                <a
                  href="#security"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  <Shield className="mr-3 h-5 w-5 text-gray-400" />
                  <span className="truncate">Security</span>
                </a>
                <a
                  href="#preferences"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  <span className="truncate">Preferences</span>
                </a>
              </nav>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6" id="profile">Profile Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl font-medium">
                    {name.charAt(0)}
                  </div>
                  <div className="ml-5">
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    id="name"
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                  
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6" id="notifications">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notifications"
                      name="notifications"
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notifications" className="font-medium text-gray-700">
                      Email notifications
                    </label>
                    <p className="text-gray-500">
                      Receive email notifications for new leads, status changes, and upcoming weddings.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;