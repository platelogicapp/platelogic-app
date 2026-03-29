import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Get restaurant for the user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    const restaurantId = restaurants?.[0]?.id;
    if (!restaurantId) {
      return NextResponse.json({ insights: [] }, { status: 200 });
    }

    // Get last 30 days of waste logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    if (!logs || logs.length === 0) {
      return NextResponse.json({
        insights: [{
          id: 1,
          title: 'Start logging to get insights',
          description: 'Log your first waste items and we\'ll analyze patterns to help you reduce costs.',
          icon: '💡',
          severity: 'info',
          recommendation: 'Head to the Log Waste page to start tracking.',
        }],
      });
    }

    const insights: any[] = [];
    let insightId = 1;

    // Analyze: most wasted ingredient
    const ingredientCosts: Record<string, { name: string; cost: number; count: number }> = {};
    logs.forEach((l: any) => {
      if (!ingredientCosts[l.ingredient_name]) {
        ingredientCosts[l.ingredient_name] = { name: l.ingredient_name, cost: 0, count: 0 };
      }
      ingredientCosts[l.ingredient_name].cost += Number(l.cost);
      ingredientCosts[l.ingredient_name].count += Number(l.quantity);
    });

    const sorted = Object.values(ingredientCosts).sort((a, b) => b.cost - a.cost);
    if (sorted[0]) {
      insights.push({
        id: insightId++,
        title: `${sorted[0].name} is your biggest cost driver`,
        description: `You've spent $${sorted[0].cost.toFixed(2)} on wasted ${sorted[0].name} this month (${sorted[0].count.toFixed(1)} units).`,
        icon: '🎯',
        severity: 'high',
        recommendation: `Review your ${sorted[0].name} ordering quantities and prep portions.`,
      });
    }

    // Analyze: day of week patterns
    const dayTotals: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    logs.forEach((l: any) => {
      const day = dayNames[new Date(l.created_at).getDay()];
      dayTotals[day] = (dayTotals[day] || 0) + Number(l.cost);
    });

    const worstDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
    if (worstDay) {
      insights.push({
        id: insightId++,
        title: `${worstDay[0]} has your highest waste`,
        description: `$${worstDay[1].toFixed(2)} total waste on ${worstDay[0]}s this month.`,
        icon: '📅',
        severity: 'medium',
        recommendation: `Adjust your ${worstDay[0]} prep and ordering to reduce overproduction.`,
      });
    }

    // Analyze: total savings potential
    const totalCost = logs.reduce((s: number, l: any) => s + Number(l.cost), 0);
    const potentialSavings = totalCost * 0.4;
    insights.push({
      id: insightId++,
      title: `Potential monthly savings: $${potentialSavings.toFixed(0)}`,
      description: `Your total waste cost is $${totalCost.toFixed(2)} this month. A 40% reduction is achievable.`,
      icon: '💰',
      severity: 'info',
      recommendation: 'Focus on your top 3 most wasted items for the biggest impact.',
    });

    // Analyze: most common reason
    const reasonCounts: Record<string, number> = {};
    logs.forEach((l: any) => {
      const r = l.reason || 'Unknown';
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
    if (topReason) {
      insights.push({
        id: insightId++,
        title: `"${topReason[0]}" is your #1 waste reason`,
        description: `${topReason[1]} entries logged as "${topReason[0]}".`,
        icon: '🔍',
        severity: 'medium',
        recommendation: topReason[0] === 'Expired'
          ? 'Implement FIFO (first-in, first-out) for inventory rotation.'
          : topReason[0] === 'Overprepped'
          ? 'Review prep sheets and align quantities with actual demand.'
          : `Address the root cause of "${topReason[0]}" waste in your kitchen.`,
      });
    }

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
