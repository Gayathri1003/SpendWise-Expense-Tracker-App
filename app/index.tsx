import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) checkUserSetup();
  }, [user, loading]);

  const checkUserSetup = async () => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const { data } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      router.replace('/(auth)/setup-balance');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
