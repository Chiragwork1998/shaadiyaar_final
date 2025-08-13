import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Eye,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface WhatsAppMessage {
  id: number;
  leadClient: string;
  phone: string;
  messageType: string;
  status: string;
  language: string;
  agent: string;
  timestamp: string;
  message: string;
}

interface WhatsAppTableProps {
  messages: WhatsAppMessage[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onViewMessage: (message: WhatsAppMessage) => void;
  formatTimestamp: (timestamp: string) => string;
}

const WhatsAppTable: React.FC<WhatsAppTableProps> = ({
  messages,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  onViewMessage,
  formatTimestamp
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400';
      case 'pricing':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'booking':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400';
      case 'reminder':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-400';
      case 'followup':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-700/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Messages</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Latest WhatsApp communications with leads and clients
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {messages.length} messages
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Lead/Client</th>
              <th className="text-left py-3 px-4 font-medium">Phone</th>
              <th className="text-left py-3 px-4 font-medium">Message Type</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Language</th>
              <th className="text-left py-3 px-4 font-medium">Agent</th>
              <th className="text-left py-3 px-4 font-medium">Timestamp</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No messages found</p>
                  </div>
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{message.leadClient}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{message.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeStyle(message.messageType)}`}>
                      {message.messageType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(message.status)}
                      <span className="text-sm capitalize">{message.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{message.language}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {message.agent}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{formatTimestamp(message.timestamp)}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewMessage(message)}
                      className="h-7 w-7 p-0"
                      title="View Message"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden p-3 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No messages found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {message.leadClient}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(message.status)}
                    <span className="text-xs capitalize">{message.status}</span>
                  </div>
                </div>
              </div>

              {/* Message Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="text-sm font-medium flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{message.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Message Type</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeStyle(message.messageType)}`}>
                      {message.messageType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Agent</div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {message.agent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Language</div>
                    <div className="text-sm font-medium">{message.language}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewMessage(message)}
                  className="w-full h-8 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Message
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default WhatsAppTable; 