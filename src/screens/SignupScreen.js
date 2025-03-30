import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import axios from "axios";
import config from "../config";

export default function SignupScreen({ navigation }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", profile_image: null });
    const [errors, setErrors] = useState({});

    const validateStep = () => {
        let newErrors = {};

        if (step === 1) {
            if (!form.first_name.trim()) newErrors.first_name = "First Name is required";
            if (!form.last_name.trim()) newErrors.last_name = "Last Name is required";
            if (!form.email.trim()) {
                newErrors.email = "Email is required";
            } else if (!/\S+@\S+\.\S+/.test(form.email)) {
                newErrors.email = "Enter a valid email";
            }
        } else if (step === 2) {
            if (!form.password.trim()) newErrors.password = "Password is required";
            else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        } else if (step === 3) {
            if (!form.profile_image) newErrors.profile_image = "Profile image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Allow access to your camera to take a photo.");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setForm({ ...form, profile_image: result.assets[0].uri });
            setErrors({ ...errors, profile_image: "" });
        }
    };

    const nextStep = () => {
        if (validateStep()) setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const pickImage = async () => {
        // Request permission to access the camera and photo library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Allow access to your gallery to upload an image.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setForm({ ...form, profile_image: result.assets[0].uri });
            setErrors({ ...errors, profile_image: "" });
        }
    };

    const handleSignup = async () => {
        if (!validateStep()) return;

        try {
            const formData = new FormData();
            formData.append("first_name", form.first_name);
            formData.append("last_name", form.last_name);
            formData.append("email", form.email);
            formData.append("password", form.password);

            if (form.profile_image) {
                formData.append("profile_image", {
                    uri: form.profile_image,
                    type: "image/jpeg",
                    name: "profile.jpg",
                });
            }

            await axios.post(`${config.API_URL}/api/auth/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Alert.alert("Success", "Signup Successful!");
            navigation.replace("Login");
        } catch (error) {
            Alert.alert("Error", "Signup Failed. Try Again.");
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/welcome-illustration.png")} style={styles.illustration} />

            {step === 1 && (
                <View style={{ width: "100%" }}>
                    <Text style={styles.title}>Step 1: Basic Details</Text>
                    <TextInput
                        placeholder="First Name"
                        value={form.first_name}
                        onChangeText={(text) => setForm({ ...form, first_name: text })}
                        style={styles.input}
                    />
                    {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

                    <TextInput
                        placeholder="Last Name"
                        value={form.last_name}
                        onChangeText={(text) => setForm({ ...form, last_name: text })}
                        style={styles.input}
                    />
                    {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

                    <TextInput
                        placeholder="Email"
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                    <TouchableOpacity style={styles.button} onPress={nextStep}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            )}

            {step === 2 && (
                <View style={{ width: "100%" }}>
                    <Text style={styles.title}>Step 2: Set Password</Text>
                    <TextInput
                        placeholder="Password"
                        secureTextEntry
                        value={form.password}
                        onChangeText={(text) => setForm({ ...form, password: text })}
                        style={styles.input}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                    <TouchableOpacity style={styles.button} onPress={nextStep}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={prevStep}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            )}

            {step === 3 && (
                <View style={{ width: "100%" }}>
                    <Text style={styles.title}>Step 3: Upload Profile Image</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        <Text style={styles.imagePickerText}>Pick Profile Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.imagePicker} onPress={takePhoto}>
                        <Text style={styles.imagePickerText}>Take Photo</Text>
                    </TouchableOpacity>
                    {errors.profile_image && <Text style={styles.errorText}>{errors.profile_image}</Text>}
                    {form.profile_image && <Image source={{ uri: form.profile_image }} style={styles.imagePreview} />}

                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={prevStep}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, backgroundColor: "#ffffff" },
    illustration: { width: "90%", height: 200, resizeMode: "contain", marginBottom: 20 },
    title: { fontSize: 22, fontWeight: "bold", color: "#000", textAlign: "center", marginBottom: 10 },
    input: { borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        paddingVertical: 12, // Ensure same vertical padding
        paddingHorizontal: 10, // Ensure same horizontal padding
        borderRadius: 5,
        width: "100%" },
    button: { backgroundColor: "#14A44D", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, alignItems: "center", width: "100%", marginBottom: 10 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    imagePicker: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5, alignItems: "center", marginBottom: 10 },
    imagePickerText: { color: "#fff", fontWeight: "bold" },
    imagePreview: { width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginBottom: 10 },
    errorText: { color: "red", fontSize: 14, marginBottom: 5 },

});

