import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Wallet, Banknote } from 'lucide-react-native';

export default function SetupBalanceScreen() {
  const [accountBalance, setAccountBalance] = useState('');
  const [cashBalance, setCashBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSetup = async () => {
    if (!accountBalance || !cashBalance) {
      setError('Please enter both balances');
      return;
    }

    const accountValue = parseFloat(accountBalance);
    const cashValue = parseFloat(cashBalance);

    if (isNaN(accountValue) || isNaN(cashValue) || accountValue < 0 || cashValue < 0) {
      setError('Please enter valid amounts');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('user_balances')
        .insert({
          user_id: user?.id,
          account_balance: accountValue,
          cash_balance: cashValue,
        });

      if (insertError) throw insertError;

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to setup balances');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Wallet size={60} color="#3B82F6" />
          <Text style={styles.title}>Initial Setup</Text>
          <Text style={styles.subtitle}>Enter your current balances to start tracking</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Wallet size={20} color="#374151" />
              <Text style={styles.label}>Account Balance</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={accountBalance}
              onChangeText={setAccountBalance}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Banknote size={20} color="#374151" />
              <Text style={styles.label}>Cash in Hand</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={cashBalance}
              onChangeText={setCashBalance}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSetup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Setting Up...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            You can update these balances anytime from your profile
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: '700', color: '#111827', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginLeft: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    color: '#111827',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  helperText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
});
