export const generateRuleBasedInsights = ({ monthlySpendPaise, monthlyIncomePaise }) => {
  if (!monthlyIncomePaise) {
    return ["Add income transactions to enable savings and budget insights."];
  }

  const savingsRate = ((monthlyIncomePaise - monthlySpendPaise) / monthlyIncomePaise) * 100;
  const insights = [];

  if (savingsRate < 20) {
    insights.push("Savings rate is below 20%. Reduce discretionary categories by 10-15%.");
  } else {
    insights.push("Savings rate is healthy. Consider redirecting surplus to SIP investments.");
  }

  insights.push("Enable AI advisor endpoint to get personalized suggestions from your transaction history.");
  return insights;
};
