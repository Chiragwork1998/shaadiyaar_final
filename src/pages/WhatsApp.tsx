import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Settings, 
  CheckCircle,
  FileText,
  Circle,
  Eye,
  Clock,
  Phone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import WhatsAppStats from '../components/dashboard/WhatsAppStats';
import WhatsAppTable from '../components/dashboard/WhatsAppTable';

// Mock data for WhatsApp messages
const mockMessages = [
  {
    id: 1,
    leadClient: 'Sarah & John Wedding',
    phone: '+91 9876543210',
    messageType: 'welcome',
    status: 'read',
    language: 'English',
    agent: 'Welcome Agent',
    timestamp: '2024-01-15T16:00:00',
    message: 'Welcome to BANQUETY! We\'re excited to help plan your special day.'
  },
  {
    id: 2,
    leadClient: 'Sharma Family Function',
    phone: '+91 9123456789',
    messageType: 'pricing',
    status: 'delivered',
    language: 'Hindi',
    agent: 'Price Quote Agent',
    timestamp: '2024-01-15T17:15:00',
    message: 'Here\'s your detailed pricing breakdown for the family function.'
  },
  {
    id: 3,
    leadClient: 'Priya & Raj Engagement',
    phone: '+91 8765432109',
    messageType: 'booking',
    status: 'sent',
    language: 'English',
    agent: 'Booking Agent',
    timestamp: '2024-01-15T14:30:00',
    message: 'Your booking has been confirmed! Event details attached.'
  },
  {
    id: 4,
    leadClient: 'Kumar Wedding Reception',
    phone: '+91 7654321098',
    messageType: 'reminder',
    status: 'read',
    language: 'Hindi',
    agent: 'Reminder Agent',
    timestamp: '2024-01-15T18:45:00',
    message: 'Friendly reminder: Food tasting session tomorrow at 2 PM.'
  },
  {
    id: 5,
    leadClient: 'Patel Corporate Event',
    phone: '+91 6543210987',
    messageType: 'followup',
    status: 'delivered',
    language: 'English',
    agent: 'Follow-up Agent',
    timestamp: '2024-01-15T12:20:00',
    message: 'Thank you for choosing BANQUETY! How was your experience?'
  }
];

const WhatsApp = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [apiStatus, setApiStatus] = useState('not-connected');

  // Calculate stats
  const stats = useMemo(() => {
    const messagesToday = messages.length;
    const deliveredMessages = messages.filter(msg => msg.status === 'delivered' || msg.status === 'read').length;
    const readMessages = messages.filter(msg => msg.status === 'read').length;
    const deliveryRate = messages.length > 0 ? Math.round((deliveredMessages / messages.length) * 100) : 0;
    const readRate = deliveredMessages > 0 ? Math.round((readMessages / deliveredMessages) * 100) : 0;

    return {
      messagesToday,
      deliveryRate,
      readRate,
      activeTemplates: 3
    };
  }, [messages]);

  // Filter messages based on search and filters
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(msg =>
        msg.leadClient.toLowerCase().includes(query) ||
        msg.phone.toLowerCase().includes(query) ||
        msg.agent.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(msg => msg.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      result = result.filter(msg => msg.messageType === selectedType);
    }

    return result;
  }, [messages, searchQuery, selectedStatus, selectedType]);

  const handleSendMessage = () => {
    // Mock send message functionality
    console.log('Sending message...');
    // In a real app, this would open a message composer
  };

  const handleBulkMessage = () => {
    // Mock bulk message functionality
    console.log('Opening bulk message composer...');
    // In a real app, this would open bulk message interface
  };

  const handleConfigureAPI = () => {
    // Mock API configuration functionality
    console.log('Opening API configuration...');
    // In a real app, this would open API settings
  };

  const handleSetupConnection = () => {
    // Mock connection setup
    setApiStatus('connected');
    console.log('Setting up WhatsApp Business API connection...');
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setShowMessageDetails(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="w-full space-y-4 p-3 md:p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-base md:text-lg lg:text-2xl font-semibold text-foreground">
                WhatsApp Communication
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Manage automated WhatsApp messaging with leads and clients
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSendMessage}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkMessage}
                className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Bulk Message
              </Button>
              <Button
                variant="outline"
                onClick={handleConfigureAPI}
                className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Configure API
              </Button>
            </div>
          </div>
        </motion.div>

        {/* API Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-3 md:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-foreground">
                  WhatsApp Business API Status
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {apiStatus === 'connected' ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
            {apiStatus === 'not-connected' && (
              <Button
                variant="outline"
                onClick={handleSetupConnection}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                Setup Connection
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WhatsAppStats {...stats} />
        </motion.div>

        {/* Recent Messages Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WhatsAppTable
            messages={filteredMessages}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onViewMessage={handleViewMessage}
            formatTimestamp={formatTimestamp}
          />
        </motion.div>
      </div>

      {/* Message Details Dialog */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold">Message Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessageDetails(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Lead/Client</label>
                    <p className="text-xs md:text-sm font-medium">{selectedMessage.leadClient}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-xs md:text-sm font-medium">{selectedMessage.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Message Type</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMessage.messageType === 'welcome' ? 'bg-blue-100 text-blue-700' :
                      selectedMessage.messageType === 'pricing' ? 'bg-green-100 text-green-700' :
                      selectedMessage.messageType === 'booking' ? 'bg-purple-100 text-purple-700' :
                      selectedMessage.messageType === 'reminder' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedMessage.messageType}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${
                        selectedMessage.status === 'read' ? 'text-green-500' :
                        selectedMessage.status === 'delivered' ? 'text-blue-500' :
                        'text-gray-400'
                      }`} />
                      <span className="text-xs md:text-sm font-medium capitalize">{selectedMessage.status}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Language</label>
                    <p className="text-xs md:text-sm font-medium">{selectedMessage.language}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Agent</label>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {selectedMessage.agent}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">Message</label>
                  <p className="text-xs md:text-sm bg-muted p-3 rounded-lg mt-1">{selectedMessage.message}</p>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="text-xs md:text-sm font-medium">{formatTimestamp(selectedMessage.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp; 