import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserBalance, Transaction } from '@/types/database';
import { Wallet, Banknote, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(React.useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    if (!user) return;
    try {
      const [balRes, transRes] = await Promise.all([
        supabase.from('user_balances').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', user.id)
          .order('transaction_date', { ascending: false }).limit(10),
      ]);
      if (balRes.data) setBalance(balRes.data);
      if (transRes.data) setTransactions(transRes.data);
    } catch (error) { console.error('Error:', error); }
    finally { setRefreshing(false); }
  };

  const formatCurrency = (n: number) => `₹${n.toFixed(2)}`;
  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const totalBalance = (balance?.account_balance || 0) + (balance?.cash_balance || 0);

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello!</Text>
        <Text style={styles.subGreeting}>Track your expenses</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceItem}>
            <Wallet size={20} color="#3B82F6" />
            <View style={styles.balanceItemText}>
              <Text style={styles.balanceItemLabel}>Account</Text>
              <Text style={styles.balanceItemAmount}>{formatCurrency(balance?.account_balance || 0)}</Text>
            </View>
          </View>
          <View style={styles.balanceItem}>
            <Banknote size={20} color="#10B981" />
            <View style={styles.balanceItemText}>
              <Text style={styles.balanceItemLabel}>Cash</Text>
              <Text style={styles.balanceItemAmount}>{formatCurrency(balance?.cash_balance || 0)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>Start tracking by adding your first transaction</Text>
          </View>
        ) : (
          transactions.map((t) => (
            <View key={t.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, t.type === 'expense' ? styles.expenseIcon : styles.incomeIcon]}>
                  {t.type === 'expense' ? <TrendingDown size={20} color="#FFFFFF" /> : <TrendingUp size={20} color="#FFFFFF" />}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{t.category}</Text>
                  <Text style={styles.transactionDate}>{formatDate(t.transaction_date)} • {t.payment_method === 'cash' ? 'Cash' : 'Account'}</Text>
                  {t.description ? <Text style={styles.transactionDescription}>{t.description}</Text> : null}
                </View>
              </View>
              <Text style={[styles.transactionAmount, t.type === 'expense' ? styles.expenseAmount : styles.incomeAmount]}>
                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 32, fontWeight: '700', color: '#111827' },
  subGreeting: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  balanceCard: { backgroundColor: '#3B82F6', marginHorizontal: 24, borderRadius: 20, padding: 24, marginBottom: 24 },
  balanceLabel: { fontSize: 14, color: '#DBEAFE', fontWeight: '600' },
  balanceAmount: { fontSize: 40, fontWeight: '700', color: '#FFFFFF', marginTop: 8 },
  balanceBreakdown: { flexDirection: 'row', marginTop: 24, gap: 16 },
  balanceItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  balanceItemText: { marginLeft: 12 },
  balanceItemLabel: { fontSize: 12, color: '#DBEAFE', fontWeight: '600' },
  balanceItemAmount: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  transactionCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  expenseIcon: { backgroundColor: '#EF4444' },
  incomeIcon: { backgroundColor: '#10B981' },
  transactionInfo: { marginLeft: 12, flex: 1 },
  transactionCategory: { fontSize: 16, fontWeight: '600', color: '#111827' },
  transactionDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  transactionDescription: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  expenseAmount: { color: '#EF4444' },
  incomeAmount: { color: '#10B981' },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  emptyStateSubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
});
