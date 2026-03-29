import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // This is a placeholder endpoint for generating AI insights
    // In a real implementation, this would call an AI service like OpenAI

    const insights = [
      {
        id: 1,
        title: 'Salmon waste is up 35% this week',
        description: "You've wasted $560 worth of salmon. Check your prep portions or ordering quantities.",
        icon: '🐟',
        severity: 'high',
        recommendation: 'Reduce salmon portions by 10% or review ordering quantities with your supplier.',
      },
      {
        id: 2,
        title: 'Friday had your highest waste day',
        description: 'Total of $880 in waste. Consider adjusting your ordering for weekend prep.',
        icon: '📈',
        severity: 'medium',
        recommendation: 'Pre-plan weekend ingredients on Thursday to avoid over-ordering.',
      },
      {
        id: 3,
        title: 'Potential monthly savings: $1,200',
        description:
          'If you reduce waste by 20%, you could save $1,200 per month. Here\'s how other restaurants do it.',
        icon: '💰',
        severity: 'info',
        recommendation: 'Implement portion control standards in your kitchen.',
      },
    ];

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
