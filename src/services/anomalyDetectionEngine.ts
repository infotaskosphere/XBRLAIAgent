import { MappedFact, AnomalyAlert } from '../types';

/**
 * Evaluates a single mapped financial fact against previous-year trends
 * and returns an anomaly alert if abnormal patterns or threshold breaches are found.
 */
export function detectFactAnomaly(fact: MappedFact): AnomalyAlert | undefined {
  const py = fact.previousValue;
  const cy = fact.currentValue;

  if (py === null || py === undefined || cy === null || cy === undefined) {
    return undefined;
  }

  const pyNum = typeof py === 'number' ? py : Number(String(py).replace(/,/g, ''));
  const cyNum = typeof cy === 'number' ? cy : Number(String(cy).replace(/,/g, ''));

  if (isNaN(pyNum) || isNaN(cyNum)) {
    return undefined;
  }

  // 1. Sign Inversion (Positive to Negative or vice-versa)
  if ((pyNum > 0 && cyNum < 0) || (pyNum < 0 && cyNum > 0)) {
    const diff = cyNum - pyNum;
    return {
      isAnomaly: true,
      severity: 'HIGH',
      type: 'SIGN_INVERSION',
      pctChange: pyNum !== 0 ? Math.round(((cyNum - pyNum) / Math.abs(pyNum)) * 100) : 100,
      message: `Sign inverted from ${pyNum > 0 ? 'positive' : 'negative'} to ${cyNum > 0 ? 'positive' : 'negative'} YoY (Shift: ₹ ${Math.abs(diff).toLocaleString('en-IN')})`,
      recommendedAction: 'Inspect underlying ledger debit/credit balances, exceptional items, and verify tax impact.'
    };
  }

  // 2. Zero-to-Material (Zero in PY, large non-zero in CY)
  if (pyNum === 0 && Math.abs(cyNum) >= 5000000) { // >= 50 Lakhs
    return {
      isAnomaly: true,
      severity: 'HIGH',
      type: 'NEW_MATERIAL_ITEM',
      pctChange: 100,
      message: `New material item emerged in CY (₹ ${Math.abs(cyNum).toLocaleString('en-IN')}) having zero baseline in PY`,
      recommendedAction: 'Verify whether this line item represents a new business activity, reclassification under Schedule III, or initial adoption.'
    };
  }

  // 3. Material-to-Zero (Substantial prior balance dropped completely to zero)
  if (Math.abs(pyNum) >= 5000000 && cyNum === 0) {
    return {
      isAnomaly: true,
      severity: 'HIGH',
      type: 'ABRUPT_DROP',
      pctChange: -100,
      message: `Substantial prior-year balance of ₹ ${Math.abs(pyNum).toLocaleString('en-IN')} dropped completely to 0 in CY`,
      recommendedAction: 'Confirm write-off, disposal, settlement, or reclassification with supporting auditor workpapers.'
    };
  }

  // 4. Percentage Shift Analysis
  if (pyNum !== 0) {
    const diff = cyNum - pyNum;
    const pct = ((cyNum - pyNum) / Math.abs(pyNum)) * 100;
    const absPct = Math.abs(pct);

    // High severity threshold: >= 40% change on material amounts (> 1 Cr or > 10 Lakhs depending on schedule)
    const isMaterialAmount = Math.abs(cyNum) > 10000000 || Math.abs(pyNum) > 10000000;

    if (absPct >= 40 && isMaterialAmount) {
      const isSpike = pct > 0;
      return {
        isAnomaly: true,
        severity: 'HIGH',
        type: isSpike ? 'GROWTH_SPIKE' : 'ABRUPT_DROP',
        pctChange: Number(pct.toFixed(1)),
        message: `High variance of ${pct > 0 ? '+' : ''}${pct.toFixed(1)}% YoY (Net Shift: ₹ ${Math.abs(diff).toLocaleString('en-IN')})`,
        recommendedAction: isSpike
          ? 'Cross-verify against Schedule additions, CAPEX approvals, or volume expansion in CARO 2020 notes.'
          : 'Check for impairment, amortization acceleration, or disposal of core assets/operations.'
      };
    }

    // Medium severity threshold: >= 25% change
    if (absPct >= 25) {
      return {
        isAnomaly: true,
        severity: 'MEDIUM',
        type: 'THRESHOLD_BREACH',
        pctChange: Number(pct.toFixed(1)),
        message: `Trend breach: ${pct > 0 ? '+' : ''}${pct.toFixed(1)}% shift exceeds standard 25% variance corridor`,
        recommendedAction: 'Examine analytical review ratios and cross-check against trial balance note schedules.'
      };
    }
  }

  return undefined;
}

/**
 * Runs automated anomaly detection across all financial facts,
 * annotates facts with anomaly tags, and updates review status.
 */
export function runAutomatedAnomalyDetection(facts: MappedFact[]): {
  facts: MappedFact[];
  stats: {
    totalOutliers: number;
    highSeverity: number;
    mediumSeverity: number;
    normal: number;
  };
} {
  let highSeverity = 0;
  let mediumSeverity = 0;

  const updatedFacts = facts.map(fact => {
    const alert = detectFactAnomaly(fact);
    if (alert && alert.isAnomaly) {
      if (alert.severity === 'HIGH') highSeverity++;
      else if (alert.severity === 'MEDIUM') mediumSeverity++;

      return {
        ...fact,
        anomaly: alert,
        status: fact.status === 'CONFIRMED' ? ('REVIEW_REQUIRED' as const) : fact.status,
        reviewNotes: alert.message
      };
    }

    return {
      ...fact,
      anomaly: undefined
    };
  });

  const totalOutliers = highSeverity + mediumSeverity;
  const normal = updatedFacts.length - totalOutliers;

  return {
    facts: updatedFacts,
    stats: {
      totalOutliers,
      highSeverity,
      mediumSeverity,
      normal
    }
  };
}
