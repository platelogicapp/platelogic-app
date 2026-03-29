# PlateLogic - Food Waste Tracking SaaS

A modern, mobile-first SaaS application for restaurants to track food waste and reduce costs.

## Features

- **Quick Waste Logging**: Tap ingredient cards to log waste in 3 seconds
- **Real-time Analytics**: Track costs and waste patterns in real-time
- **Weekly Insights**: AI-powered recommendations to reduce waste
- **Team Management**: Invite staff to help track waste
- **Mobile Optimized**: Works beautifully on phones and tablets
- **Professional Reports**: Export and share waste metrics

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Ready for Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jfakxtdvixawnemuzejq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Authentication
│   ├── signup/               # User registration
│   ├── onboarding/           # Setup wizard
│   ├── dashboard/            # Main dashboard
│   ├── waste-input/          # Core waste logging
│   ├── reports/              # Analytics & insights
│   ├── settings/             # User & restaurant settings
│   ├── api/                  # API routes
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── lib/
│   └── supabase.ts          # Supabase client
├── utils/
│   ├── constants.ts         # App constants
│   └── formatting.ts        # Utility functions
└── components/
    └── ui/                  # Reusable UI components
```

## Pages

### Landing Page (`/`)
Professional landing page with hero section, features, ROI calculator, pricing, and FAQ.

### Authentication (`/login`, `/signup`)
Email/password authentication with Supabase.

### Onboarding (`/onboarding`)
3-step wizard to set up restaurant profile and ingredients.

### Dashboard (`/dashboard`)
Overview with key metrics, charts, and quick actions.

### Waste Input (`/waste-input`)
Primary feature: Quick-tap ingredient grid with real-time cost tracking.

### Reports (`/reports`)
Analytics dashboard with insights, trends, and exportable reports.

### Settings (`/settings`)
Manage restaurant profile, ingredients, and team members.

## Database Schema

The following tables are needed in Supabase:

```sql
-- Users (handled by Supabase Auth)
-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  address TEXT,
  cuisine_type TEXT,
  avg_covers INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients
CREATE TABLE ingredients (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants,
  name TEXT,
  category TEXT,
  cost_per_unit DECIMAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waste Log
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants,
  ingredient_id UUID REFERENCES ingredients,
  quantity INT,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Color Scheme

- **Primary**: #1A1A2E (Dark Navy)
- **Accent**: #27AE60 (Green)
- **Light Accent**: #45B373
- **Dark Accent**: #1E8449

## Future Enhancements

- Offline mode for kitchen
- Advanced ML insights
- Multi-location support
- Integration with POS systems
- Video tutorials
- Email digest reports
- Sustainability scoring

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

Proprietary - All rights reserved
