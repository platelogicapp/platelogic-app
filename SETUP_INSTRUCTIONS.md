# PlateLogic Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://jfakxtdvixawnemuzejq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Set Up Supabase Database
Create these tables in your Supabase project:

```sql
-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  cuisine_type TEXT,
  avg_covers INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Protein', 'Produce', 'Dairy', 'Grain', 'Other')),
  cost_per_unit DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waste logs table
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  logged_by UUID REFERENCES auth.users(id),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## File Structure

- `src/app/page.tsx` - Landing page (349 lines)
- `src/app/login/page.tsx` - Login form
- `src/app/signup/page.tsx` - Registration form
- `src/app/onboarding/page.tsx` - 3-step setup wizard
- `src/app/dashboard/` - Main dashboard with sidebar
- `src/app/waste-input/page.tsx` - Core waste logging feature (242 lines)
- `src/app/reports/page.tsx` - Analytics and insights
- `src/app/settings/page.tsx` - Account settings
- `src/lib/supabase.ts` - Supabase client setup
- `src/utils/` - Helper functions and constants
- `tailwind.config.ts` - Tailwind configuration with custom colors

## Key Features Implemented

### Landing Page
- Hero section with CTA
- Features showcase (3 cards)
- ROI calculator (real-time calculation)
- Pricing section
- FAQ section
- Footer

### Authentication
- Email/password signup and login
- Supabase integration
- Session management
- Error handling

### Onboarding
- 3-step wizard with progress bar
- Restaurant details collection
- Pre-populated ingredient library (20 items)
- Confirmation step

### Dashboard
- Stat cards with metrics
- Bar chart for daily waste
- Line chart for cost trends
- Sample insight cards
- Quick action buttons

### Waste Input (Core Feature)
- Touch-friendly ingredient grid (90px+ height)
- 15 pre-loaded ingredients with categories
- Category filtering tabs
- Real-time cost calculation
- Running total display
- Undo functionality
- Flash animation on tap
- Counter badge per ingredient

### Reports
- Monthly trend chart
- Category breakdown pie chart
- Top wasted items table
- Weekly insights cards
- Export options

### Settings
- Restaurant profile management
- Ingredient management
- Team member management
- Data export/account deletion

## Color Scheme

- Primary: #1A1A2E (Dark Navy)
- Accent: #27AE60 (Green)
- Light Accent: #45B373
- Dark Accent: #1E8449

## Responsive Design

All pages are fully responsive:
- Mobile: Single column, hamburger menu
- Tablet: 2-column layouts where appropriate
- Desktop: Full-featured multi-column layouts

## Next Steps

1. Add Supabase RLS policies for security
2. Implement real data persistence
3. Add email verification
4. Set up payment processing
5. Add analytics tracking
6. Implement offline mode
7. Create mobile app

## Troubleshooting

### Supabase Connection Issues
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Check that Supabase project is active
- Clear browser cache and restart dev server

### Build Issues
```bash
npm run build
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

## Support

For issues or questions, check:
- README.md for overview
- Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
