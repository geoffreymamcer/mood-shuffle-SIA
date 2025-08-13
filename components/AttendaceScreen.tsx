import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated, Easing, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AttendanceStatus = 'present' | 'absent' | null;

const AttendanceScreen: React.FC = () => {
  const [status, setStatus] = useState<AttendanceStatus>(null);
  const [scaleAnim] = useState<Animated.Value>(new Animated.Value(1));
  const [buttonScale] = useState<[Animated.Value, Animated.Value]>([
    new Animated.Value(1),
    new Animated.Value(1),
  ]);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowDimensions(window);
    });
    return () => subscription.remove();
  }, []);

  const isSmallScreen = windowDimensions.width < 375;
  const isLandscape = windowDimensions.width > windowDimensions.height;

  const handlePress = (type: 'present' | 'absent') => {
    setStatus(type);

    // Text animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Button animation
    Animated.parallel([
      Animated.spring(buttonScale[0], {
        toValue: type === 'present' ? 1.1 : 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale[1], {
        toValue: type === 'absent' ? 1.1 : 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getStatusText = (): string => {
    if (status === 'present') return '🎉 You are present!';
    if (status === 'absent') return '😢 You are absent';
    return '📝 Please take your attendance';
  };

  const getStatusColor = (): string => {
    if (status === 'present') return 'text-emerald-500';
    if (status === 'absent') return 'text-rose-500';
    return 'text-indigo-600';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f0f9ff]">
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe', '#dbeafe']}
        className="flex-1 items-center justify-center p-4">
        {/* Responsive decorative elements */}
        <View
          className="absolute rounded-full bg-sky-200 opacity-40"
          style={{
            width: windowDimensions.width * 0.7,
            height: windowDimensions.width * 0.7,
            top: -windowDimensions.width * 0.25,
            left: -windowDimensions.width * 0.15,
          }}
        />
        <View
          className="absolute rounded-full bg-violet-200 opacity-40"
          style={{
            width: windowDimensions.width * 0.6,
            height: windowDimensions.width * 0.6,
            bottom: -windowDimensions.width * 0.15,
            right: -windowDimensions.width * 0.1,
          }}
        />

        {/* Main card with responsive sizing */}
        <View
          className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-sky-100/50 backdrop-blur-xl"
          style={{
            width: isLandscape ? '80%' : '90%',
            maxWidth: 480,
            padding: isSmallScreen ? 16 : 24,
          }}>
          <View className="mb-8 items-center">
            <Text
              className="text-center font-bold text-slate-800"
              style={{ fontSize: isSmallScreen ? 24 : 28 }}>
              SIA Attendance Tracker
            </Text>
            <View
              className="rounded-full bg-indigo-200"
              style={{
                width: isSmallScreen ? 64 : 96,
                height: 4,
                marginTop: 8,
              }}
            />
          </View>

          <Animated.Text
            style={[
              {
                transform: [{ scale: scaleAnim }],
                marginBottom: isSmallScreen ? 32 : 48,
              },
              { fontSize: isSmallScreen ? 20 : 24 },
            ]}
            className={`text-center font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </Animated.Text>

          {/* Buttons container with gap */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: isLandscape ? 'space-between' : 'center',
              gap: 16, // <-- Always keep at least 16px gap between buttons
            }}>
            <Animated.View style={{ transform: [{ scale: buttonScale[0] }], flex: 1 }}>
              <Pressable
                onPress={() => handlePress('present')}
                className="items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200 active:bg-emerald-600"
                style={{
                  height: isSmallScreen ? 48 : 56,
                  // remove fixed width
                }}
                android_ripple={{ color: 'rgba(255,255,255,0.3)' }}>
                <Text
                  className="font-bold text-white"
                  style={{ fontSize: isSmallScreen ? 16 : 18 }}>
                  Present ✅
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              style={{
                transform: [{ scale: buttonScale[1] }],
                flex: isLandscape ? 1 : undefined,
              }}>
              <Pressable
                onPress={() => handlePress('absent')}
                className="items-center justify-center rounded-2xl bg-rose-500 shadow-md shadow-rose-200 active:bg-rose-600"
                style={{
                  height: isSmallScreen ? 48 : 56,
                  width: isLandscape ? '100%' : isSmallScreen ? 140 : 160,
                }}
                android_ripple={{ color: 'rgba(255,255,255,0.3)' }}>
                <Text
                  className="font-bold text-white"
                  style={{ fontSize: isSmallScreen ? 16 : 18 }}>
                  Absent ❌
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Status indicator with responsive positioning */}
        <View
          className="rounded-full bg-white/80 px-4 py-2"
          style={{
            position: 'absolute',
            bottom: windowDimensions.height * 0.05,
          }}>
          <Text className="text-slate-500">
            {status
              ? `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`
              : 'No status recorded'}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AttendanceScreen;
