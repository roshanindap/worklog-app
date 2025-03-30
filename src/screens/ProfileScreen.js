import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
    Alert
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";
import { CommonActions } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserProfile();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const userToken = await AsyncStorage.getItem("userToken");
            const userId = await AsyncStorage.getItem("userId");

            if (!userId || !userToken) {
                throw new Error("Authentication required. Please login again.");
            }

            const response = await axios.get(
                `${config.API_URL}/api/auth/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                    timeout: 10000
                }
            );

            // Improved response data validation
            if (response.data && typeof response.data === 'object') {
                // Check for both possible response structures
                const userData = response.data.user || response.data;

                if (userData && typeof userData === 'object') {
                    setUser({
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                        email: userData.email || '',
                        profile_image: userData.profile_image || ''
                    });
                } else {
                    throw new Error("User data is missing required fields");
                }
            } else {
                throw new Error("Invalid response format from server");
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            let errorMessage = "Failed to load profile data";

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "Session expired. Please login again.";
                    handleLogout();
                } else if (error.response.status === 404) {
                    errorMessage = "User not found. Please try again or contact support.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove(["userToken", "userId", "userEmail"]);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                })
            );
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Logout Failed", "Couldn't logout properly. Please try again.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchUserProfile}
                    disabled={loading}
                >
                    <Text style={styles.retryButtonText}>
                        {loading ? 'Loading...' : 'Retry'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.buttonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {user?.profile_image ? (
                <Image
                    source={{
                        uri: user.profile_image.startsWith("http")
                            ? user.profile_image
                            : `${config.API_URL}/${user.profile_image.replace(/\\/g, "/")}`,
                    }}
                    style={styles.profileImage}
                />
            ) : (
                <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>No Photo</Text>
                </View>
            )}

            <Text style={styles.name}>
                {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#007BFF",
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginVertical: 20,
    },
    profileImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "#e1e1e1",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    profileImageText: {
        color: "#666",
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },
    logoutButton: {
        backgroundColor: "#dc3545",
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center",
        width: "100%",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginTop: 20,
        marginHorizontal: 20,
    },
    retryButton: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignSelf: "center",
        minWidth: 100,
    },
    retryButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: 'center',
    },
});