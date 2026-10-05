using System;
using System.Collections.Generic;

namespace XBRLAIAgent;

public static class AnomalyDetectionEngine
{
    public static AnomalyAlert? DetectFactAnomaly(MappedFact fact)
    {
        if (!decimal.TryParse(fact.PreviousValue, out var py) ||
            !decimal.TryParse(fact.CurrentValue, out var cy))
            return null;

        // 1. Sign Inversion
        if ((py > 0 && cy < 0) || (py < 0 && cy > 0))
        {
            return new AnomalyAlert
            {
                IsAnomaly = true,
                Severity = "HIGH",
                Type = "SIGN_INVERSION",
                PctChange = py != 0 ? (double)Math.Round(((cy - py) / Math.Abs(py)) * 100, 1) : 100,
                Message = $"Sign inverted from {(py > 0 ? "positive to negative" : "negative to positive")} YoY",
                RecommendedAction = "Inspect ledger debit/credit reversal, exceptional items, and tax impact."
            };
        }

        // 2. Zero-to-Material
        if (py == 0 && Math.Abs(cy) >= 5000000)
        {
            return new AnomalyAlert
            {
                IsAnomaly = true,
                Severity = "HIGH",
                Type = "NEW_MATERIAL_ITEM",
                PctChange = 100,
                Message = $"New material item in CY (₹ {Math.Abs(cy):N0}) having zero baseline in PY",
                RecommendedAction = "Verify if this line item represents a new business activity or Schedule III reclassification."
            };
        }

        // 3. Percentage Shift
        if (py != 0)
        {
            var pct = ((cy - py) / Math.Abs(py)) * 100;
            var absPct = Math.Abs(pct);

            if (absPct >= 40)
            {
                return new AnomalyAlert
                {
                    IsAnomaly = true,
                    Severity = "HIGH",
                    Type = pct > 0 ? "GROWTH_SPIKE" : "ABRUPT_DROP",
                    PctChange = (double)Math.Round(pct, 1),
                    Message = $"High variance of {(pct > 0 ? "+" : "")}{pct:F1}% YoY",
                    RecommendedAction = "Verify additions, disposals, capacity changes, or revised contracts in Schedule notes."
                };
            }

            if (absPct >= 25)
            {
                return new AnomalyAlert
                {
                    IsAnomaly = true,
                    Severity = "MEDIUM",
                    Type = "THRESHOLD_BREACH",
                    PctChange = (double)Math.Round(pct, 1),
                    Message = $"Trend breach: {(pct > 0 ? "+" : "")}{pct:F1}% shift exceeds 25% threshold",
                    RecommendedAction = "Examine analytical review ratios and cross-check against trial balance note schedules."
                };
            }
        }

        return null;
    }

    public static void RunDetection(List<MappedFact> facts)
    {
        foreach (var fact in facts)
        {
            var alert = DetectFactAnomaly(fact);
            fact.Anomaly = alert;
            if (alert != null && alert.Severity == "HIGH")
            {
                fact.Status = MappingStatus.REVIEW_REQUIRED;
            }
        }
    }
}
