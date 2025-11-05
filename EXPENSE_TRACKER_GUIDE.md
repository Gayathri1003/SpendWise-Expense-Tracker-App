# Expense Tracker App - Complete Guide

A comprehensive Android expense tracking application built with Expo, React Native, and Supabase.

## Features

### Authentication
- **Sign Up**: Create new account with email and password
- **Sign In**: Access existing accounts securely
- **Initial Setup**: Set up account balance and cash in hand on first login

### Core Functionality

#### 1. Home Dashboard
- View total balance (account + cash)
- See breakdown of account and cash balances
- Browse recent 10 transactions
- Refresh data with pull-to-refresh

#### 2. Add Transactions
- **Transaction Type**: Expense or Income
- **Amount**: Enter transaction amount
- **Category**: Choose from predefined categories:
  - Expense: Food, Transport, Metro, Health, Shopping, Entertainment, Bills, Other
  - Income: Salary, Gift, Other Income
- **Payment Method**: Cash or Account
- **Description**: Optional transaction note
- **Date**: Set transaction date (defaults to today)
- Auto-updates balances after transaction

#### 3. Calendar View
- Visual calendar showing months with transaction indicators
- Edit transactions:
  - Tap day to see transactions for that date
  - Click Edit icon to modify amount or description
  - Click Delete icon to remove transaction
- Indicator dots: Red (expense), Green (income)
- Navigate between months with arrow buttons

#### 4. Profile & Analytics
- **Current Balance Display**: Account and Cash totals
- **Daily Statistics**: Today's expenses and income
- **Monthly Statistics**: This month's expenses and income
- **Yearly Statistics**: This year's expenses and income
- **Top Spending Categories**: Top 5 expense categories for current month
- **Update Balances**: Edit account and cash balances anytime
- **AI Spending Suggestions**: Get personalized spending advice based on patterns

### AI Spending Assistant
- Analyzes monthly spending patterns
- Provides spending ratio analysis
- Identifies high-spending categories
- Suggests ways to optimize spending
- Shows financial summary and balance status

## Technical Architecture

### Database (Supabase)
**Tables:**
- `user_balances`: Tracks account and cash balances
- `transactions`: Records all income/expense transactions
- `categories`: Predefined transaction categories

**Security:**
- Row Level Security (RLS) enabled
- Users can only access their own data
- Authenticated access required

### App Structure

```
app/
├── (auth)/                 # Authentication screens
│   ├── login.tsx
│   ├── signup.tsx
│   ├── setup-balance.tsx
│   └── _layout.tsx
├── (tabs)/                 # Main app screens
│   ├── index.tsx          # Home dashboard
│   ├── add.tsx            # Add transaction
│   ├── calendar.tsx       # Calendar view
│   ├── profile.tsx        # Profile & analytics
│   └── _layout.tsx
├── index.tsx              # Auth routing logic
└── _layout.tsx            # Root layout
```

### Supporting Files
- `lib/supabase.ts`: Supabase client initialization
- `contexts/AuthContext.tsx`: Authentication state management
- `types/database.ts`: TypeScript types

### Edge Functions
- `ai-spending-suggestions`: Generates AI-powered spending advice

## Getting Started

### 1. Initial Setup
1. Launch the app
2. Sign up with email and password
3. Enter your initial account balance and cash in hand
4. Start adding transactions

### 2. Adding Transactions
1. Tap the "Add" tab
2. Select transaction type (Expense or Income)
3. Enter amount
4. Choose category
5. Select payment method (Cash or Account)
6. Optionally add description
7. Tap "Add Transaction"

### 3. Viewing Analytics
1. Tap the "Profile" tab
2. View current balance
3. Check daily/monthly/yearly statistics
4. See top spending categories
5. Tap "Get AI Spending Suggestions" for insights

### 4. Managing Transactions
1. Tap "Calendar" tab
2. Click on a date to see transactions
3. Edit or delete transactions using action buttons
4. Changes update balances automatically

## Key Features Explained

### Payment Methods
- **Account**: Deducts from/adds to account balance
- **Cash**: Deducts from/adds to cash balance
- Choose based on how you paid for the transaction

### Categories
- **Expense Categories**: Food, Transport, Metro, Health, Shopping, Entertainment, Bills, Other
- **Income Categories**: Salary, Gift, Other Income
- Easily identifiable with color coding

### Date-Based Tracking
- Add transactions for any date
- Update past transactions via calendar
- Useful for recording missed transactions

### Analytics
- **Daily View**: Today's financial activity
- **Monthly View**: Current month's spending trends
- **Yearly View**: Annual financial overview
- Helps identify spending patterns

### AI Assistance
- Personalized spending recommendations
- Warning alerts for overspending
- Surplus detection and suggestions for saving
- Category-specific insights (food, transport, etc.)

## Security & Privacy
- All data encrypted with RLS policies
- Authentication via Supabase
- Secure token storage using Secure Store
- No sensitive data logged
- User data isolated from other users

## Tips for Effective Tracking

1. **Be Consistent**: Record expenses daily
2. **Use Descriptions**: Add notes for context
3. **Choose Accurate Categories**: Helps with analysis
4. **Regular Reviews**: Check analytics monthly
5. **Monitor AI Suggestions**: Implement recommended changes
6. **Update Balances**: Keep balances accurate for better insights

## Supported Platforms
- Android (primary target)
- iOS (supported via Expo)
- Web (supported via Expo)

## Future Enhancements
- Budget creation and tracking
- Recurring transaction support
- Export data to CSV/PDF
- Bill reminders
- Spending goals
- Multiple account management
- Receipt capture with OCR
- Investment tracking

---

**Version**: 1.0.0
**Last Updated**: November 2025
