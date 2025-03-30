import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import { CommonActions } from '@react-navigation/native';


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            email: '',
            password: ''
        };

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
            valid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}/api/auth/login`,
                { email, password },
                { timeout: 10000 } // 10 seconds timeout
            );

            if (response.data.success) {
                await AsyncStorage.multiSet([
                    ['userToken', response.data.token],
                    ['userId', response.data.user.id.toString()],
                    ['userEmail', response.data.user.email]
                ]);

                // Reset navigation stack and go to HomeTabs
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "HomeTabs" }],
                    })
                );
            }
        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "Login failed. Please try again.";
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "Invalid email or password";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Check your internet connection.";
            } else if (error.message === 'Network Error') {
                errorMessage = "Network error. Please check your connection.";
            }

            Alert.alert("Login Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    source={require("../../assets/welcome-illustration.png")}
                    style={styles.illustration}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to your account</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setErrors({...errors, email: ''});
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setErrors({...errors, password: ''});
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                <TouchableOpacity
                    style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={!email || !password || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>



                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate("Signup")}
                    style={styles.signupButton}
                    disabled={loading}
                >
                    <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupHighlight}>Sign Up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 25,
        paddingVertical: 20,
    },
    illustration: {
        width: 250,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        fontSize: 16,
        color: "#333",
    },
    inputError: {
        borderColor: "#ff4444",
        backgroundColor: "#fff9f9",
    },
    errorText: {
        color: "#ff4444",
        fontSize: 14,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    button: {
        backgroundColor: "#14A44D",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        marginTop: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonDisabled: {
        backgroundColor: "#a0a0a0",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    forgotPasswordButton: {
        marginTop: 15,
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: "#666",
        fontSize: 14,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#999',
        fontSize: 14,
    },
    signupButton: {
        marginTop: 10,
    },
    signupText: {
        color: "#666",
        fontSize: 15,
    },
    signupHighlight: {
        color: "#14A44D",
        fontWeight: 'bold',
    },
});