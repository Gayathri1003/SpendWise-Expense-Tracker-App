import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const body = await req.json();
    const { monthlyExpense, monthlyIncome, categoryBreakdown } = body;

    const suggestions = generateSpendingSuggestions(
      monthlyExpense,
      monthlyIncome,
      categoryBreakdown
    );

    return new Response(JSON.stringify({ suggestions }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function generateSpendingSuggestions(
  monthlyExpense: number,
  monthlyIncome: number,
  categoryBreakdown: Array<{ category: string; amount: number }>
): string {
  const suggestions: string[] = [];

  if (monthlyIncome === 0) {
    return "No income data available. Start logging your income to get personalized suggestions.";
  }

  const expenseRatio = (monthlyExpense / monthlyIncome) * 100;

  if (expenseRatio > 80) {
    suggestions.push(
      "⚠️ Your spending is very high - you're spending " +
        expenseRatio.toFixed(1) +
        "% of your income. Consider creating a budget and cutting back on non-essential expenses."
    );
  } else if (expenseRatio > 60) {
    suggestions.push(
      "Your spending is moderate at " +
        expenseRatio.toFixed(1) +
        "% of income. Try to aim for 50% or less."
    );
  } else {
    suggestions.push(
      "Great! Your spending is healthy at " +
        expenseRatio.toFixed(1) +
        "% of income. Keep it up!"
    );
  }

  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    const topCategoryRatio =
      (topCategory.amount / monthlyExpense) * 100;

    if (topCategoryRatio > 40) {
      suggestions.push(
        "💡 Your highest spending category is '" +
          topCategory.category +
          "' at " +
          topCategoryRatio.toFixed(1) +
          "% of expenses. Consider reducing this or finding alternatives."
      );
    }

    if (categoryBreakdown.length >= 2) {
      const foodExpense = categoryBreakdown.find(
        (c) => c.category.toLowerCase().includes("food")
      );
      if (foodExpense && (foodExpense.amount / monthlyExpense) * 100 > 30) {
        suggestions.push(
          "🍽️ Food spending is high at ₹" +
            foodExpense.amount.toFixed(2) +
            ". Try meal planning or cooking at home more often."
        );
      }

      const transportExpense = categoryBreakdown.find(
        (c) =>
          c.category.toLowerCase().includes("transport") ||
          c.category.toLowerCase().includes("metro") ||
          c.category.toLowerCase().includes("bus")
      );
      if (transportExpense && (transportExpense.amount / monthlyExpense) * 100 > 15) {
        suggestions.push(
          "🚗 Transport costs are significant at ₹" +
            transportExpense.amount.toFixed(2) +
            ". Consider carpooling or using public transport more."
        );
      }
    }
  }

  if (monthlyIncome - monthlyExpense > monthlyIncome * 0.3) {
    suggestions.push(
      "🎯 You have surplus funds! Consider saving or investing ₹" +
        (monthlyIncome - monthlyExpense).toFixed(2) +
        " for emergencies."
    );
  } else if (monthlyIncome - monthlyExpense < 0) {
    suggestions.push(
      "⛔ Warning: You're spending more than you earn! This is not sustainable. Please review your expenses immediately."
    );
  }

  suggestions.push(
    "\n💰 Monthly Summary: Income ₹" +
      monthlyIncome.toFixed(2) +
      " | Expenses ₹" +
      monthlyExpense.toFixed(2) +
      " | Balance ₹" +
      (monthlyIncome - monthlyExpense).toFixed(2)
  );

  return suggestions.join("\n\n");
}
