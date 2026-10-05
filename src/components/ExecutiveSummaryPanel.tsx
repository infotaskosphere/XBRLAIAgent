import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Scale, 
  FileCheck,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import { MappedFact, TaxonomyStandard } from '../types';

interface ExecutiveSummaryPanelProps {
  facts: MappedFact[];
  taxonomy: TaxonomyStandard;
  onNavigateToMapping: () => void;
  onNavigateToSag: () => void;
}

export const ExecutiveSummaryPanel: React.FC<ExecutiveSummaryPanelProps> = ({
  facts,
  taxonomy,
  onNavigateToMapping,
  onNavigateToSag
}) => {
  // 1. Total facts mapped
  const totalFacts = facts.length;
  const confirmedFacts = facts.filter(f => f.status === 'CONFIRMED').length;
  const changedFacts = facts.filter(f => f.status === 'CHANGED').length;
  const bsFacts = facts.filter(f => f.schedule === 'BALANCE_SHEET').length;
  const plFacts = facts.filter(f => f.schedule === 'PROFIT_LOSS').length;

  // 2. Confidence Score Average
  const avgConfidence = totalFacts > 0
    ? (facts.reduce((sum, f) => sum + (f.confidence || 90), 0) / totalFacts).toFixed(1)
    : '0.0';

  // 3. Anomaly Alerts Detected
  const anomalyFacts = facts.filter(f => f.anomaly && f.anomaly.isAnomaly);
  const highSeverityCount = anomalyFacts.filter(f => f.anomaly?.severity === 'HIGH').length;
  const mediumSeverityCount = anomalyFacts.filter(f => f.anomaly?.severity === 'MEDIUM').length;

  // 4. Mathematical balance check
  const totalAssets = facts.find(f => 
    f.conceptName.includes('Assets') && 
    !f.conceptName.includes('Current') && 
    !f.conceptName.includes('Noncurrent')
  )?.currentValue;
  const totalLiab = facts.find(f => f.conceptName.includes('EquityAndLiabilities'))?.currentValue;
  const isBalanced = Boolean(totalAssets && totalLiab && Number(totalAssets) === Number(totalLiab));

  // 5. Readiness score calculation
  const reviewCount = facts.filter(f => f.status === 'REVIEW_REQUIRED').length;
  const readinessScore = totalFacts > 0
    ? Math.round(((totalFacts - reviewCount) / totalFacts) * 100)
    : 85;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#071b36] via-[#0d2a4f] to-[#145ca8] p-5 sm:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#12cbe6]/20 border border-[#12cbe6]/40 text-[#12cbe6] text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                Auditor Executive Overview
              </span>
              <span className="text-white/60 text-xs">•</span>
              <span className="text-white/80 text-xs font-semibold">
                {taxonomy === 'IND_AS' ? 'MCA Ind AS Taxonomy' : 'Non-Ind AS (Companies AS Rules 2021)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Financial Statement Intelligence & Filing Health</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#b0cae6] max-w-2xl">
              Real-time audit telemetry across mapped taxonomy concepts, dual-period variance anomalies, and MCA Schedule III integrity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateToMapping}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 backdrop-blur-xs shadow-xs"
            >
              <span>Inspect Mapping Table</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#12cbe6]" />
            </button>
            <button
              onClick={onNavigateToSag}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Export SAG Gen XBRL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white">
        
        {/* Metric 1: Total Facts Mapped */}
        <div 
          onClick={onNavigateToMapping}
          className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#145ca8]" />
              Total Facts Mapped
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#145ca8] border border-blue-100">
              Active
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-black text-[#071b36] tracking-tight">{totalFacts}</span>
            <span className="text-xs text-slate-400 font-medium">line items</span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>{bsFacts} Balance Sheet • {plFacts} P&L</span>
            <span className="text-[#145ca8] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Confidence Score Average */}
        <div className="p-5 hover:bg-slate-50/70 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Confidence Score Avg
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              High Precision
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-black text-emerald-700 tracking-tight">{avgConfidence}%</span>
            <span className="text-xs text-emerald-600 font-semibold">AI Match</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, Number(avgConfidence)))}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>MCA Schema Grounded</span>
            <span className="text-emerald-700 font-bold">{confirmedFacts} Auto-Verified</span>
          </div>
        </div>

        {/* Metric 3: Anomaly Alerts Detected */}
        <div 
          onClick={onNavigateToMapping}
          className={`p-5 transition-colors cursor-pointer group ${
            anomalyFacts.length > 0 ? 'hover:bg-red-50/30' : 'hover:bg-slate-50/70'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className={`w-4 h-4 ${anomalyFacts.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
              Anomaly Alerts Detected
            </span>
            {anomalyFacts.length > 0 ? (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse">
                {highSeverityCount} High Priority
              </span>
            ) : (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Clean Trend
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span className={`text-3xl font-black tracking-tight ${
              anomalyFacts.length > 0 ? 'text-red-700' : 'text-slate-700'
            }`}>
              {anomalyFacts.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">outliers flagged</span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>
              {anomalyFacts.length > 0 
                ? `${highSeverityCount} High • ${mediumSeverityCount} Medium` 
                : 'Zero material variances'}
            </span>
            <span className="text-red-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Review <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Balance Sheet Integrity & Readiness */}
        <div className="p-5 hover:bg-slate-50/70 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#145ca8]" />
              Filing Readiness & Balance
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              isBalanced 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isBalanced ? 'Balanced' : 'Check Variance'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-3xl font-black text-[#071b36] tracking-tight">{readinessScore}%</span>
            <span className="text-xs text-slate-400 font-medium">statutory audit ready</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                readinessScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Assets = Equity + Liab</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Balance Sheet Check</span>
                </>
              )}
            </span>
            <span className="text-slate-600 font-bold">{reviewCount} Pending Reviews</span>
          </div>
        </div>

      </div>

      {/* Outlier Quick-Notice Strip (Visible only when outliers exist) */}
      {anomalyFacts.length > 0 && (
        <div className="bg-red-50/70 border-t border-red-100 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            </div>
            <div className="text-xs text-red-950">
              <strong className="font-bold">Automated Anomaly Detector: </strong>
              <span>
                {anomalyFacts.length} financial facts exhibit significant YoY growth spikes or sign inversions (&gt; 25% to 40%).
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateToMapping}
            className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 hover:underline whitespace-nowrap self-end sm:self-auto"
          >
            <span>Review Anomaly Outliers Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
