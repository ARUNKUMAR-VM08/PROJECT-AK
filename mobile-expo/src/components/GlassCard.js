// src/components/GlassCard.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/theme';

export default function GlassCard({ children, style }) {
  const { colors } = useTheme();
  return (
    <BlurView intensity={50} tint="dark" style={[styles.container, { backgroundColor: colors.glass }, style]}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    margin: 8,
  },
  inner: {
    // inner content styling can be added here
  },
});
