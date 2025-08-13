import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Settings, 
  MessageSquare, 
  Star,
  TrendingUp,
  FileText,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Bot
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import AgentStats from '../components/dashboard/AgentStats';
import AgentTable from '../components/dashboard/AgentTable';

// Mock data for AI agents
const mockAgents = [
  {
    id: 1,
    name: 'Welcome + Property Info Agent',
    description: 'Sends property brochure and gallery on new lead creation',
    status: 'active',
    messages: 45,
    successRate: 92,
    lastUsed: '2024-01-15',
    icon: 'FileText',
    type: 'welcome'
  },
  {
    id: 2,
    name: 'AI Price Quote Sender',
    description: 'Sends structured pricing breakdown via WhatsApp',
    status: 'active',
    messages: 23,
    successRate: 88,
    lastUsed: '2024-01-14',
    icon: 'Star',
    type: 'pricing'
  },
  {
    id: 3,
    name: 'Booking Confirmation Agent',
    description: 'Confirms bookings with event summary and payment terms',
    status: 'active',
    messages: 18,
    successRate: 95,
    lastUsed: '2024-01-13',
    icon: 'Calendar',
    type: 'booking'
  },
  {
    id: 4,
    name: 'Food Tasting Scheduler',
    description: 'Schedules food tasting appointments via WhatsApp',
    status: 'active',
    messages: 12,
    successRate: 85,
    lastUsed: '2024-01-12',
    icon: 'Clock',
    type: 'scheduling'
  },
  {
    id: 5,
    name: 'Payment Reminder Agent',
    description: 'Sends payment reminders and payment links',
    status: 'inactive',
    messages: 8,
    successRate: 78,
    lastUsed: '2024-01-10',
    icon: 'MessageSquare',
    type: 'payment'
  },
  {
    id: 6,
    name: 'Event Follow-up Agent',
    description: 'Sends post-event feedback requests and thank you messages',
    status: 'active',
    messages: 32,
    successRate: 91,
    lastUsed: '2024-01-11',
    icon: 'Bot',
    type: 'followup'
  }
];

const Agents = () => {
  const [agents, setAgents] = useState(mockAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(agent => agent.status === 'active').length;
    const totalMessages = agents.reduce((sum, agent) => sum + agent.messages, 0);
    const averageSuccessRate = agents.length > 0 
      ? Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length)
      : 0;

    return {
      activeAgents,
      totalAgents,
      totalMessages,
      averageSuccessRate
    };
  }, [agents]);

  // Filter agents based on search and status
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.type.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(agent => agent.status === selectedStatus);
    }

    return result;
  }, [agents, searchQuery, selectedStatus]);

  const handleToggleAgent = (agentId: number) => {
    setAgents(prev => 
      prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
          : agent
      )
    );
  };

  const handleTestAgent = () => {
    // Mock test agent functionality
    console.log('Testing agent...');
    // In a real app, this would trigger a test message
  };

  const handleConfiguration = () => {
    // Mock configuration functionality
    console.log('Opening configuration...');
    // In a real app, this would open configuration settings
  };

  const handleViewAgent = (agent: any) => {
    setSelectedAgent(agent);
    setShowAgentDetails(true);
  };

  const handleViewAnalytics = (agent: any) => {
    // Mock analytics functionality
    console.log('Viewing analytics for:', agent.name);
    // In a real app, this would open analytics dashboard
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
                AI Communication Agents
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Manage automated WhatsApp communication agents
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleTestAgent}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Test Agent
              </Button>
              <Button
                variant="outline"
                onClick={handleConfiguration}
                className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Configuration
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AgentStats {...stats} />
        </motion.div>

        {/* Agent Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AgentTable
            agents={filteredAgents}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onToggleAgent={handleToggleAgent}
            onViewAgent={handleViewAgent}
            onViewAnalytics={handleViewAnalytics}
          />
        </motion.div>
      </div>

      {/* Agent Details Dialog */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold">Agent Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgentDetails(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Agent Name</label>
                    <p className="text-xs md:text-sm font-medium">{selectedAgent.name}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAgent.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedAgent.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Messages Sent</label>
                    <p className="text-xs md:text-sm font-medium">{selectedAgent.messages}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Success Rate</label>
                    <p className="text-xs md:text-sm font-medium">{selectedAgent.successRate}%</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Last Used</label>
                    <p className="text-xs md:text-sm font-medium">{selectedAgent.lastUsed}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-xs md:text-sm font-medium capitalize">{selectedAgent.type}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-xs md:text-sm">{selectedAgent.description}</p>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAgent(selectedAgent.id)}
                    className="flex-1 h-8 text-xs"
                  >
                    {selectedAgent.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewAnalytics(selectedAgent)}
                    className="flex-1 h-8 text-xs"
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents; 