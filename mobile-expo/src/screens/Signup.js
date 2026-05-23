// mobile-expo/src/screens/Signup.js
import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function Signup({ navigation }) {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await register(email, password);
      // after successful signup, navigate to main app (auto-login via onAuthStateChanged)
    } catch (e) {
      Alert.alert('Signup failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#1a1a1a' },
  title: { fontSize: 24, marginBottom: 20, color: '#fff', textAlign: 'center' },
  input: { backgroundColor: '#333', color: '#fff', marginBottom: 12, padding: 10, borderRadius: 6 },
  link: { marginTop: 15, color: '#4da6ff', textAlign: 'center' },
});
