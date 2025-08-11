import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

type Mood = {
  emoji: string;
  description: string;
};

const MoodShuffler: React.FC = () => {
  const moods: Mood[] = [
    { emoji: '😄', description: 'Happy and joyful!' },
    { emoji: '😴', description: 'Sleepy and tired' },
    { emoji: '😎', description: 'Cool and confident' },
    { emoji: '🥺', description: 'Feeling tender' },
    { emoji: '🤩', description: 'Star-struck!' },
    { emoji: '😡', description: 'Frustrated' },
    { emoji: '😍', description: 'In love' },
    { emoji: '🤯', description: 'Mind blown' },
  ];

  const [currentMood, setCurrentMood] = useState<Mood>(moods[0]);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shuffleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalDuration = 3000; // 3 seconds
  const minSpeed = 60; // fast start
  const maxSpeed = 250; // slow end

  const getRandomMood = (excludeCurrent = false): Mood => {
    let newMood: Mood;
    do {
      newMood = moods[Math.floor(Math.random() * moods.length)];
    } while (excludeCurrent && newMood === currentMood && moods.length > 1);
    return newMood;
  };

  const shuffleStep = (startTime: number): void => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);

    if (progress >= 1) {
      setCurrentMood(getRandomMood(true));
      setIsShuffling(false);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 2,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setCurrentMood(getRandomMood());

    // Make emoji/text do a quick pulse
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    const speed = minSpeed + (maxSpeed - minSpeed) * progress;
    shuffleTimeout.current = setTimeout(() => shuffleStep(startTime), speed);
  };

  const startShuffle = (): void => {
    if (isShuffling) return;
    setIsShuffling(true);

    // Remove big opacity drop — keep it near 1
    Animated.timing(opacityAnim, {
      toValue: 1, // was 0.3 before
      duration: 100,
      useNativeDriver: true,
    }).start();

    shuffleStep(Date.now());
  };

  useEffect(() => {
    return () => {
      if (shuffleTimeout.current) clearTimeout(shuffleTimeout.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.moodContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>{currentMood.emoji}</Text>
        <Text style={styles.description}>{currentMood.description}</Text>
      </Animated.View>

      <TouchableOpacity
        style={[styles.button, isShuffling && styles.disabledButton]}
        onPress={startShuffle}
        disabled={isShuffling}>
        <Text style={styles.buttonText}>{isShuffling ? 'Shuffling...' : 'Shuffle Mood'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  moodContainer: { alignItems: 'center', marginBottom: 40 },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
    maxWidth: '80%',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledButton: { backgroundColor: '#a5b4fc' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});

export default MoodShuffler;
