import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Target,
  ArrowUp,
  Eye
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Lead {
  id: number;
  name: string;
  score: number;
  likelihood: 'hot' | 'warm' | 'cold';
  occasion: string;
  pax: number;
  keyFactors: string[];
}

interface IntelligenceTableProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedLikelihood: string;
  onLikelihoodChange: (likelihood: string) => void;
  onPrioritize: (leadId: number) => void;
  onViewFactors: (lead: Lead) => void;
}

const IntelligenceTable: React.FC<IntelligenceTableProps> = ({
  leads,
  searchQuery,
  onSearchChange,
  selectedLikelihood,
  onLikelihoodChange,
  onPrioritize,
  onViewFactors
}) => {
  const getLikelihoodStyle = (likelihood: string) => {
    switch (likelihood) {
      case 'hot':
        return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400';
      case 'warm':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400';
      case 'cold':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400';
      default:
        return 'bg-accent text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold text-foreground">MCP-01: Lead Qualification Scores</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  AI-generated likelihood to convert scores
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                {leads.length} leads
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Likelihood Filter */}
              <Select value={selectedLikelihood} onValueChange={onLikelihoodChange}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="All Likelihood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Likelihood</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
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
              <th className="text-left py-3 px-4 font-medium">Lead Name</th>
              <th className="text-left py-3 px-4 font-medium">Score</th>
              <th className="text-left py-3 px-4 font-medium">Likelihood</th>
              <th className="text-left py-3 px-4 font-medium">Occasion</th>
              <th className="text-left py-3 px-4 font-medium">Pax</th>
              <th className="text-left py-3 px-4 font-medium">Key Factors</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Target className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No leads found</p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{lead.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getScoreColor(lead.score)}`}
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{lead.score}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLikelihoodStyle(lead.likelihood)}`}>
                      {lead.likelihood}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{lead.occasion}</td>
                  <td className="py-3 px-4 text-sm">{lead.pax}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewFactors(lead)}
                      className="h-7 text-xs"
                    >
                      View Factors
                    </Button>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPrioritize(lead.id)}
                      className="h-7 text-xs"
                    >
                      <ArrowUp className="w-3 h-3 mr-1" />
                      Prioritize
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
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {lead.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lead.occasion} • {lead.pax} pax
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLikelihoodStyle(lead.likelihood)}`}>
                    {lead.likelihood}
                  </span>
                </div>
              </div>

              {/* Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Score</span>
                  <span className="text-sm font-medium">{lead.score}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getScoreColor(lead.score)}`}
                    style={{ width: `${lead.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewFactors(lead)}
                  className="flex-1 h-8 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Factors
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPrioritize(lead.id)}
                  className="flex-1 h-8 text-xs"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  Prioritize
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default IntelligenceTable; 