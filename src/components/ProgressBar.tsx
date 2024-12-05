import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ChildComponentProps {
    value: string,
    onSendData: (data: string) => void;
}

const ProgressBar: React.FC<ChildComponentProps> = ({ value, onSendData }) => {

    // console.log(value)
    const [progressValue, setProgressInitValue] = useState( value == '' ? '0' : value);

    const progress = useRef(new Animated.Value(0)).current;

    const navigations = useNavigation();

    const panResponder = useRef(

        PanResponder.create({

            onMoveShouldSetPanResponder: () => true,

            onPanResponderMove: (evt, gestureState) => {

                const { moveX } = gestureState;
                const newProgress = Math.max(0, Math.min(1, moveX / width));
                progress.setValue(newProgress);
            },
            onPanResponderRelease: (evt, gestureState) => {

                const { moveX } = gestureState;
                const newProgress = Math.max(0, Math.min(1, moveX / width));

                getProgressValue();

                Animated.timing(progress, {
                    toValue: newProgress,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    const setProgressValue = () => {

        const value = parseFloat(progressValue)
        const clampedValue = Math.max(0, Math.min(1, value / 100));
        Animated.timing(progress, {
            toValue: clampedValue,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    useFocusEffect(
        React.useCallback(() => {
            setProgressValue();
        }, [navigations]) // Dependency array
    );

    const progressBarWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width],
    });

    const getProgressValue = () => {

        onSendData((progress.__getValue() * 100).toFixed(0));
        return (progress.__getValue() * 100).toFixed(0); // Get progress as a percentage
    };

    return (
        <View style={styles.container}>
            <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
            </View>
            <View {...panResponder.panHandlers} style={styles.touchableArea} />
            <Text style={styles.progressText}>{getProgressValue()}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBackground: {
        height: 20,
        width: '90%',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3b5998',
        borderRadius: 10,
    },
    touchableArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 20,
        width: '90%',
    },
    progressText: {
        color: 'white',
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProgressBar;