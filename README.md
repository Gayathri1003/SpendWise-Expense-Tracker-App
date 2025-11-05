# Expense Tracker App

A beautiful, feature-rich expense tracking application built with Expo and React Native, designed specifically for Android with seamless cross-platform support.

## Overview

This personal expense tracker helps you monitor your finances with:
- **Dual Balance Tracking**: Separate account and cash tracking
- **Smart Transaction Management**: Quick expense/income logging
- **Visual Calendar**: See transactions by date
- **Advanced Analytics**: Daily, monthly, and yearly insights
- **AI Assistant**: Get personalized spending recommendations
- **Secure Authentication**: Email/password authentication with Supabase

## Quick Start

### 1. Sign Up or Log In
- New users: Create account with email and password
- Set initial balance (account balance + cash in hand)

### 2. Add Transactions
- Tap "Add" tab
- Enter amount and select category
- Choose payment method (cash or account)
- Transaction balances update automatically

### 3. View Analytics
- Dashboard shows recent transactions
- Profile tab displays daily/monthly/yearly statistics
- AI suggestions provide spending insights

### 4. Manage History
- Calendar view shows all transactions by date
- Edit or delete past transactions
- Date-based filtering for easy reference

## Project Structure

```
project/
├── app/
│   ├── (auth)/                 # Authentication screens
│   │   ├── login.tsx          # Sign in screen
│   │   ├── signup.tsx         # Register screen
│   │   └── setup-balance.tsx  # Initial setup
│   ├── (tabs)/                # Main app screens
│   │   ├── index.tsx          # Home/Dashboard
│   │   ├── add.tsx            # Add transaction
│   │   ├── calendar.tsx       # Calendar view
│   │   └── profile.tsx        # Profile & analytics
│   ├── index.tsx              # Auth routing
│   └── _layout.tsx            # Root layout
├── lib/
│   └── supabase.ts            # Supabase client
├── contexts/
│   └── AuthContext.tsx        # Auth state management
├── types/
│   └── database.ts            # TypeScript types
├── hooks/
│   └── useFrameworkReady.ts   # Framework initialization
└── supabase/
    └── functions/
        └── ai-spending-suggestions/  # AI Edge Function
```

## Core Features

### Authentication
- Email/password sign up and sign in
- Secure token storage
- Session persistence
- Initial balance setup on first login

### Transaction Management
- Add expense or income transactions
- 8 expense categories: Food, Transport, Metro, Health, Shopping, Entertainment, Bills, Other
- 3 income categories: Salary, Gift, Other Income
- Flexible date selection (past/current/future)
- Optional transaction descriptions

### Dual Balance System
- **Account Balance**: Bank/card funds
- **Cash Balance**: Physical money in hand
- Choose payment method for each transaction
- Automatic balance updates

### Dashboard
- Total balance display
- Account vs. cash breakdown
- Recent 10 transactions list
- Pull-to-refresh functionality

### Calendar Interface
- Month view with transaction indicators
- Red dots for expenses, green for income
- Tap date to view transactions
- Edit or delete transactions
- Navigate between months

### Analytics & Insights
- **Daily Statistics**: Today's expense/income
- **Monthly Statistics**: Current month analysis
- **Yearly Statistics**: Annual financial overview
- **Top Categories**: 5 highest spending categories
- **AI Suggestions**: Personalized spending advice

### AI Assistant
Analyzes spending patterns and provides:
- Spending ratio analysis (% of income spent)
- Category-specific recommendations
- Warnings for overspending
- Surplus suggestions for saving
- Monthly financial summary

## Database Schema

### Tables

#### user_balances
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key, unique)
- `account_balance`: Decimal
- `cash_balance`: Decimal
- `created_at`, `updated_at`: Timestamps

#### transactions
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `amount`: Decimal
- `type`: 'expense' | 'income'
- `category`: String
- `payment_method`: 'cash' | 'account'
- `description`: String (optional)
- `transaction_date`: Date
- `created_at`, `updated_at`: Timestamps

#### categories
- `id`: UUID (primary key)
- `user_id`: UUID (nullable)
- `name`: String
- `icon`: String
- `color`: String
- `type`: 'expense' | 'income'
- `is_default`: Boolean
- `created_at`: Timestamp

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authentication required for all operations

## Technology Stack

- **Frontend**: React Native + Expo
- **Navigation**: Expo Router with tab-based layout
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **Storage**: Secure Store (encrypted)
- **AI**: Supabase Edge Functions
- **UI Components**: Lucide React Native icons

## Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI

### Installation
```bash
# Install dependencies
npm install

# Type checking
npm run typecheck

# Dev server
npm run dev
```

### Environment Variables
Already configured in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Usage Examples

### Add an Expense
```
1. Tap "Add" tab
2. Select "Expense"
3. Enter ₹500
4. Select "Food"
5. Choose "Cash"
6. Add description "Lunch"
7. Tap "Add Transaction"
→ Cash balance decreases by ₹500
```

### Update Balance
```
1. Go to "Profile" tab
2. Tap Edit icon on balances
3. Update values
4. Tap Update
→ Balances reflect new amounts
```

### View Monthly Analysis
```
1. Go to "Profile" tab
2. Scroll to "This Month" section
3. See expenses, income, and balance
4. View top 5 spending categories
```

### Get AI Suggestions
```
1. Go to "Profile" tab
2. Tap "Get AI Spending Suggestions"
3. Read personalized recommendations
4. Implement suggested changes
```

## Key Metrics

- **Total Balance**: Account + Cash amounts
- **Expense Ratio**: % of income spent
- **Net Balance**: Income - Expenses
- **Category Spending**: Top categories breakdown
- **Trends**: Daily/monthly/yearly patterns

## Security Features

- Encrypted secure storage for auth tokens
- Row Level Security on database
- User isolation (can only see own data)
- Secure API endpoints
- No sensitive data logging

## Color Scheme

- **Primary**: Blue (#3B82F6) - Primary actions
- **Success**: Green (#10B981) - Income, positive actions
- **Danger**: Red (#EF4444) - Expenses, negative actions
- **Purple**: (#8B5CF6) - AI features
- **Neutral**: Grays for backgrounds and text

## Responsive Design

- Optimized for Android devices
- Cross-platform compatibility (iOS, Web)
- Touch-friendly interface
- Mobile-first approach

## Performance

- Efficient database queries with indexes
- Lazy loading of transactions
- Optimized re-renders with React hooks
- Fast transaction processing
- Smooth animations and transitions

## Future Enhancements

- Budget creation and tracking
- Recurring transactions
- Receipt/image capture with OCR
- Export to CSV/PDF
- Bill reminders
- Spending goals
- Multiple accounts
- Data backup and restore
- Cloud sync improvements

## Troubleshooting

### Authentication Issues
- Verify email format
- Check password requirements (min 6 chars)
- Ensure internet connection

### Balance Discrepancies
- Update balances manually in Profile
- Verify all transactions recorded
- Check transaction dates

### Sync Issues
- Pull refresh dashboard
- Check internet connection
- Logout and login again

## Support & Documentation

- **Quick Start**: See `QUICKSTART.md`
- **Full Guide**: See `EXPENSE_TRACKER_GUIDE.md`
- **Database**: See Supabase dashboard

## License

This is a personal expense tracker application.

## Version

**Current Version**: 1.0.0
**Last Updated**: November 2025
**Status**: Production Ready

---

## Getting Help

1. Read the quick start guide: `QUICKSTART.md`
2. Check the full documentation: `EXPENSE_TRACKER_GUIDE.md`
3. Review the app screens and their functions

**Start tracking your expenses today!** 💰
# Expense_Tracker
