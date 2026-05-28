import { useEffect, useRef } from "react";
import { Animated, Easing, ImageBackground, StyleSheet, View } from "react-native";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export function AuthBackground() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [drift]);

  const backgroundTransform = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-18, 18],
        }),
      },
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [10, -16],
        }),
      },
      {
        scale: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [1.16, 1.22],
        }),
      },
    ],
  } as const;

  return (
    <View pointerEvents="none" style={styles.root}>
      <AnimatedImageBackground
        source={require("../assets/images/descarga.png")}
        resizeMode="cover"
        style={[styles.image, backgroundTransform]}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />
      </AnimatedImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9, 0, 15, 0.48)",
  },
});