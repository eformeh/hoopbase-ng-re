import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.replace('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/auth/sign-up" style={styles.link}>
          <Text style={styles.linkText}>Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  link: {
    marginLeft: 4,
  },
  linkText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#F97316',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
});