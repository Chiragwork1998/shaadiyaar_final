import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Eye,
  AlertTriangle,
  Zap,
  Target,
  ArrowUp,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import IntelligenceStats from '../components/dashboard/IntelligenceStats';
import IntelligenceTable from '../components/dashboard/IntelligenceTable';

// Mock data for lead qualification scores
const mockLeads = [
  {
    id: 1,
    name: 'Sarah & John Wedding',
    score: 92,
    likelihood: 'hot',
    occasion: 'Wedding',
    pax: 250,
    keyFactors: ['High budget', 'Quick decision timeline', 'Premium venue preference', 'Multiple vendor requirements']
  },
  {
    id: 2,
    name: 'Sharma Family Function',
    score: 73,
    likelihood: 'warm',
    occasion: 'Family Function',
    pax: 150,
    keyFactors: ['Moderate budget', 'Flexible timeline', 'Standard venue preference', 'Basic catering needs']
  },
  {
    id: 3,
    name: 'Patel Corporate Event',
    score: 85,
    likelihood: 'hot',
    occasion: 'Corporate Event',
    pax: 100,
    keyFactors: ['High budget', 'Corporate requirements', 'Premium service needs', 'Quick booking']
  },
  {
    id: 4,
    name: 'Kumar Birthday Party',
    score: 45,
    likelihood: 'cold',
    occasion: 'Birthday Party',
    pax: 50,
    keyFactors: ['Low budget', 'Basic requirements', 'Price sensitive', 'Long decision timeline']
  }
];

const Intelligence = () => {
  const [leads, setLeads] = useState(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLikelihood, setSelectedLikelihood] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const hotLeads = leads.filter(lead => lead.likelihood === 'hot').length;
    const paymentRisks = 1; // Mock data
    const surgeDates = 2; // Mock data
    const aiConfidence = 89; // Mock data

    return {
      hotLeads,
      paymentRisks,
      surgeDates,
      aiConfidence
    };
  }, [leads]);

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.occasion.toLowerCase().includes(query)
      );
    }

    if (selectedLikelihood !== 'all') {
      result = result.filter(lead => lead.likelihood === selectedLikelihood);
    }

    return result;
  }, [leads, searchQuery, selectedLikelihood]);

  const handleGenerateInsights = () => {
    // Mock generate insights functionality
    console.log('Generating AI insights...');
    // In a real app, this would trigger AI analysis
  };

  const handleModelPerformance = () => {
    // Mock model performance functionality
    console.log('Opening model performance dashboard...');
    // In a real app, this would open performance metrics
  };

  const handlePrioritize = (leadId: number) => {
    // Mock prioritize functionality
    console.log('Prioritizing lead:', leadId);
    // In a real app, this would mark the lead as priority
  };

  const handleViewFactors = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
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
                Decision Intelligence MCPs
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                AI-powered insights for critical business decisions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleGenerateInsights}
                className="bg-primary text-primary-foreground hover:bg-accent-vibrant-purple-darker shadow-lg shadow-primary/20 h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <Brain className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Generate AI Insights
              </Button>
              <Button
                variant="outline"
                onClick={handleModelPerformance}
                className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
              >
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Model Performance
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
          <IntelligenceStats {...stats} />
        </motion.div>

        {/* Alert Banners */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* High Demand Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800">High Demand Alert</h3>
                <p className="text-xs md:text-sm text-yellow-700">
                  March 15th shows 95% demand surge. Consider applying +15% premium pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Risk Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Payment Risk Warning</h3>
                <p className="text-xs md:text-sm text-red-700">
                  2 high-risk bookings detected. Review payment terms and advance requirements.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lead Qualification Scores Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <IntelligenceTable
            leads={filteredLeads}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            selectedLikelihood={selectedLikelihood}
            onLikelihoodChange={setSelectedLikelihood}
            onPrioritize={handlePrioritize}
            onViewFactors={handleViewFactors}
          />
        </motion.div>
      </div>

      {/* Lead Details Dialog */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold">Lead Qualification Factors</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLeadDetails(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Lead Name</label>
                    <p className="text-xs md:text-sm font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Score</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            selectedLead.score >= 80 ? 'bg-green-500' :
                            selectedLead.score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${selectedLead.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs md:text-sm font-medium">{selectedLead.score}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Likelihood</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedLead.likelihood === 'hot' ? 'bg-green-100 text-green-700' :
                      selectedLead.likelihood === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedLead.likelihood}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Occasion</label>
                    <p className="text-xs md:text-sm font-medium">{selectedLead.occasion}</p>
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium text-muted-foreground">Pax</label>
                    <p className="text-xs md:text-sm font-medium">{selectedLead.pax}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-muted-foreground">Key Factors</label>
                  <div className="mt-2 space-y-2">
                    {selectedLead.keyFactors.map((factor: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs md:text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrioritize(selectedLead.id)}
                    className="flex-1 h-8 text-xs"
                  >
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Prioritize Lead
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

export default Intelligence; 