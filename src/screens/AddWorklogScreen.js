import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const AddWorklogScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem("userToken");
            const userId = await AsyncStorage.getItem("userId");

            if (!token || !userId) {
                throw new Error("Authentication required. Please login again.");
            }

            if (!formData.title) {
                throw new Error("Title is required");
            }

            const payload = {
                user_id: parseInt(userId),
                title: formData.title,
                description: formData.description
            };

            const response = await axios.post(
                `${config.API_URL}/api/worklogs`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            Alert.alert("Success", "Worklog added successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Add Worklog Error:", error);
            setError(error.response?.data?.message || error.message || "Failed to add worklog");
            Alert.alert("Error", error.response?.data?.message || error.message || "Failed to add worklog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => handleChange('title', text)}
                    placeholder="Enter title"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={formData.description}
                    onChangeText={(text) => handleChange('description', text)}
                    placeholder="Enter description"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <TouchableOpacity
                style={[
                    styles.submitButton,
                    (!formData.title || loading) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!formData.title || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.submitButtonText}>Save Worklog</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#FFF',
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
        color: '#333',
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddWorklogScreen;