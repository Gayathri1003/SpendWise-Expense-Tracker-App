import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserBalance, Transaction } from '@/types/database';
import { LogOut, TrendingUp, TrendingDown, Calendar, Wallet, Banknote, Edit, X, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

type PeriodStats = { totalExpense: number; totalIncome: number; netBalance: number };

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [dailyStats, setDailyStats] = useState<PeriodStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<PeriodStats | null>(null);
  const [yearlyStats, setYearlyStats] = useState<PeriodStats | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{ category: string; amount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editAccountBalance, setEditAccountBalance] = useState('');
  const [editCashBalance, setEditCashBalance] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useFocusEffect(React.useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    if (!user) return;
    try {
      const balResult = await supabase.from('user_balances').select('*').eq('user_id', user.id).maybeSingle();
      if (balResult.data) {
        setBalance(balResult.data);
        setEditAccountBalance(balResult.data.account_balance.toString());
        setEditCashBalance(balResult.data.cash_balance.toString());
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();
      const startOfDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const startOfYear = `${year}-01-01`;

      const [dailyRes, monthlyRes, yearlyRes, categoryRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).gte('transaction_date', startOfDay),
        supabase.from('transactions').select('*').eq('user_id', user.id).gte('transaction_date', startOfMonth),
        supabase.from('transactions').select('*').eq('user_id', user.id).gte('transaction_date', startOfYear),
        supabase.from('transactions').select('*').eq('user_id', user.id).eq('type', 'expense').gte('transaction_date', startOfMonth),
      ]);

      if (dailyRes.data) setDailyStats(calculateStats(dailyRes.data));
      if (monthlyRes.data) {
        setMonthlyStats(calculateStats(monthlyRes.data));
        if (categoryRes.data) {
          const breakdown = calculateCategoryBreakdown(categoryRes.data);
          setCategoryBreakdown(breakdown);
        }
      }
      if (yearlyRes.data) setYearlyStats(calculateStats(yearlyRes.data));
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const calculateStats = (transactions: Transaction[]): PeriodStats => {
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    return { totalExpense, totalIncome, netBalance: totalIncome - totalExpense };
  };

  const calculateCategoryBreakdown = (transactions: Transaction[]) => {
    const categoryMap = new Map<string, number>();
    transactions.forEach((t) => { const current = categoryMap.get(t.category) || 0; categoryMap.set(t.category, current + t.amount); });
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount).slice(0, 5);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleUpdateBalance = async () => {
    const accountValue = parseFloat(editAccountBalance);
    const cashValue = parseFloat(editCashBalance);
    if (isNaN(accountValue) || isNaN(cashValue)) return;
    try {
      await supabase.from('user_balances').update({ account_balance: accountValue, cash_balance: cashValue }).eq('user_id', user?.id);
      setShowBalanceModal(false);
      loadData();
    } catch (error) { console.error('Error:', error); }
  };

  const handleGetAiSuggestions = async () => {
    setLoadingAi(true);
    setShowAiModal(true);
    try {
      const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-spending-suggestions`;
      const headers = { Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
      const response = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify({ monthlyExpense: monthlyStats?.totalExpense || 0, monthlyIncome: monthlyStats?.totalIncome || 0, categoryBreakdown }) });
      const data = await response.json();
      setAiSuggestions(data.suggestions || 'No suggestions available');
    } catch (error) {
      console.error('Error:', error);
      setAiSuggestions('Unable to generate suggestions at the moment. Please try again later.');
    } finally { setLoadingAi(false); }
  };

  const formatCurrency = (n: number) => `₹${n.toFixed(2)}`;

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceSection}>
        <View style={styles.balanceHeader}>
          <Text style={styles.sectionTitle}>Current Balance</Text>
          <TouchableOpacity onPress={() => setShowBalanceModal(true)}>
            <Edit size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceCards}>
          <View style={styles.balanceCard}>
            <Wallet size={24} color="#3B82F6" />
            <Text style={styles.balanceLabel}>Account</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance?.account_balance || 0)}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Banknote size={24} color="#10B981" />
            <Text style={styles.balanceLabel}>Cash</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance?.cash_balance || 0)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.aiButton} onPress={handleGetAiSuggestions}>
        <Sparkles size={20} color="#FFFFFF" />
        <Text style={styles.aiButtonText}>Get AI Spending Suggestions</Text>
      </TouchableOpacity>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.statPeriod}>Today</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <TrendingDown size={16} color="#EF4444" />
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.statValue}>{formatCurrency(dailyStats?.totalExpense || 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{formatCurrency(dailyStats?.totalIncome || 0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.statPeriod}>This Month</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <TrendingDown size={16} color="#EF4444" />
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.statValue}>{formatCurrency(monthlyStats?.totalExpense || 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{formatCurrency(monthlyStats?.totalIncome || 0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.statPeriod}>This Year</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <TrendingDown size={16} color="#EF4444" />
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.statValue}>{formatCurrency(yearlyStats?.totalExpense || 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{formatCurrency(yearlyStats?.totalIncome || 0)}</Text>
            </View>
          </View>
        </View>
      </View>

      {categoryBreakdown.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Top Spending Categories</Text>
          {categoryBreakdown.map((item, idx) => (
            <View key={idx} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{item.category}</Text>
              <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      <Modal visible={showBalanceModal} animationType="slide" transparent={true} onRequestClose={() => setShowBalanceModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Balance</Text>
              <TouchableOpacity onPress={() => setShowBalanceModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Account Balance</Text>
                <TextInput style={styles.input} value={editAccountBalance} onChangeText={setEditAccountBalance} keyboardType="decimal-pad" />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cash Balance</Text>
                <TextInput style={styles.input} value={editCashBalance} onChangeText={setEditCashBalance} keyboardType="decimal-pad" />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleUpdateBalance}>
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAiModal} animationType="slide" transparent={true} onRequestClose={() => setShowAiModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Spending Suggestions</Text>
              <TouchableOpacity onPress={() => setShowAiModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.aiSuggestionsContainer}>
              {loadingAi ? <Text style={styles.loadingText}>Generating suggestions...</Text> : <Text style={styles.aiSuggestionsText}>{aiSuggestions}</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  logoutButton: { padding: 8 },
  balanceSection: { paddingHorizontal: 24, marginBottom: 24 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  balanceCards: { flexDirection: 'row', gap: 12 },
  balanceCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  balanceLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, fontWeight: '600' },
  balanceAmount: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 4 },
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', marginHorizontal: 24, borderRadius: 12, padding: 16, marginBottom: 24, gap: 8 },
  aiButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  statsSection: { paddingHorizontal: 24, marginBottom: 24 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginTop: 12 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statPeriod: { fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 8 },
  statRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 4 },
  categorySection: { paddingHorizontal: 24, marginBottom: 32 },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 8 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  categoryAmount: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalForm: { paddingHorizontal: 24, paddingBottom: 32 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827' },
  submitButton: { backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  aiSuggestionsContainer: { paddingHorizontal: 24, paddingBottom: 32 },
  aiSuggestionsText: { fontSize: 16, lineHeight: 24, color: '#374151' },
  loadingText: { fontSize: 16, color: '#6B7280', textAlign: 'center', padding: 32 },
});
