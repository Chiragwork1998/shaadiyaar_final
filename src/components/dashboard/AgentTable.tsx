import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Settings, 
  BarChart3,
  FileText,
  Star,
  Calendar,
  Clock,
  MessageSquare,
  Bot,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Agent {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  messages: number;
  successRate: number;
  lastUsed: string;
  icon: string;
  type: string;
}

interface AgentTableProps {
  agents: Agent[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onToggleAgent: (agentId: number) => void;
  onViewAgent: (agent: Agent) => void;
  onViewAnalytics: (agent: Agent) => void;
}

const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onToggleAgent,
  onViewAgent,
  onViewAnalytics
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'Star':
        return <Star className="w-4 h-4" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" />;
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4" />;
      case 'Bot':
        return <Bot className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Agent Management</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Configure and monitor your AI communication agents
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {agents.length} agents
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search agents..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
              <th className="text-left py-3 px-4 font-medium">Agent</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Messages</th>
              <th className="text-left py-3 px-4 font-medium">Success Rate</th>
              <th className="text-left py-3 px-4 font-medium">Last Used</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Bot className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No agents found</p>
                  </div>
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getAgentIcon(agent.icon)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleAgent(agent.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          agent.status === 'active' ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            agent.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{agent.messages}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{agent.successRate}%</div>
                  </td>
                  <td className="py-3 px-4 text-sm">{formatDate(agent.lastUsed)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAgent(agent)}
                        className="h-7 w-7 p-0"
                        title="Configure Agent"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAnalytics(agent)}
                        className="h-7 w-7 p-0"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden p-3 md:p-6 space-y-4">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No agents found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or add a new agent</p>
          </div>
        ) : (
          agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getAgentIcon(agent.icon)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {agent.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(agent.lastUsed)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {agent.messages} messages
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agent.successRate}% success
                  </div>
                </div>
              </div>

              {/* Agent Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Description</div>
                    <div className="text-sm font-medium">{agent.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleAgent(agent.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        agent.status === 'active' ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          agent.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewAgent(agent)}
                  className="flex-1 h-8 text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewAnalytics(agent)}
                  className="flex-1 h-8 text-xs"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Analytics
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentTable; 