import React, { useState, useEffect } from "react";
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

const EditWorklogScreen = ({ route, navigation }) => {
    const [worklog, setWorklog] = useState(route.params.worklog);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [date, setDate] = useState(new Date(worklog.date || worklog.createdAt));
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleChange = (name, value) => {
        setWorklog(prev => ({ ...prev, [name]: value }));
    };


    const saveWorklog = async () => {
        try {
            setSaving(true);
            setError(null);

            const token = await AsyncStorage.getItem("userToken");
            const userId = await AsyncStorage.getItem("userId");

            if (!token || !userId) {
                throw new Error("Authentication required");
            }

            const payload = {
                title: worklog.title,
                description: worklog.description,
            };

            const response = await axios.put(
                `${config.API_URL}/api/worklogs/${userId}/${worklog.id}`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            Alert.alert("Success", "Worklog updated successfully");
            navigation.goBack();
        } catch (error) {
            console.error("Save Error:", error);
            setError(error.response?.data?.message || error.message || "Failed to update worklog");
            Alert.alert("Error", error.response?.data?.message || "Failed to update worklog");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={worklog.title}
                    onChangeText={(text) => handleChange('title', text)}
                    placeholder="Enter title"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={worklog.description}
                    onChangeText={(text) => handleChange('description', text)}
                    placeholder="Enter description"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={saveWorklog}
                disabled={saving || !worklog.title}
            >
                {saving ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#FFF',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#A5D6A7',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditWorklogScreen;