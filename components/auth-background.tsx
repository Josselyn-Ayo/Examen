import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function AuthBackground() {
  const drift = useRef(new Animated.Value(0)).current;
  const [BlurComponent, setBlurComponent] = useState<any | null>(null);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 11000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 11000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [drift]);

  useEffect(() => {
    let mounted = true;
    // Try to dynamically import expo-blur so the app won't break if it's not installed.
    // eslint-disable-next-line import/no-unresolved
    import("expo-blur")
      .then((mod) => {
        if (mounted && mod && mod.BlurView) setBlurComponent(() => mod.BlurView);
      })
      .catch(() => {
        // ignore — we'll render a translucent fallback
      });
    return () => {
      mounted = false;
    };
  }, []);

  const topOrb = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [10, -12],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 10],
        }),
      },
    ],
  } as const;

  const bottomOrb = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 14],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [14, -6],
        }),
      },
    ],
  } as const;

  const sideOrb = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [6, -4],
        }),
      },
    ],
  } as const;

  const midOrb = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [12, -12],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 6],
        }),
      },
    ],
  } as const;

  const smallOrb = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 6],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [4, -4],
        }),
      },
    ],
  } as const;

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View style={[styles.topOrb, topOrb]} />
      <Animated.View style={[styles.midOrb, midOrb]} />
      <Animated.View style={[styles.sideOrb, sideOrb]} />
      <Animated.View style={[styles.bottomOrb, bottomOrb]} />
      <Animated.View style={[styles.smallOrb, smallOrb]} />

      {BlurComponent ? (
        <BlurComponent intensity={40} tint="light" style={styles.blurPanel} />
      ) : (
        <View style={styles.blurPanelFallback} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  topOrb: {
    position: "absolute",
    left: -72,
    top: 52,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 228, 134, 0.12)",
  },
  midOrb: {
    position: "absolute",
    left: 36,
    top: 180,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 230, 140, 0.08)",
  },
  bottomOrb: {
    position: "absolute",
    right: -92,
    bottom: -125,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 232, 144, 0.14)",
  },
  sideOrb: {
    position: "absolute",
    right: 28,
    top: 210,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255, 243, 194, 0.10)",
  },
  smallOrb: {
    position: "absolute",
    left: 16,
    bottom: 48,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 235, 165, 0.08)",
  },
  blurPanel: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 120,
    height: 420,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  blurPanelFallback: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 120,
    height: 420,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
});