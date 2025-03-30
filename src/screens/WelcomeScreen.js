import React from "react";
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";


export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Logo */}
            <Image source={require("../../assets/logoapp.png")} style={styles.logo} />

            {/* Illustration */}
            <Image source={require("../../assets/welcome-illustration.png")} style={styles.illustration} />

            {/* Welcome Message */}
            <Text style={styles.title}>Welcome to Worklog!</Text>
            <Text style={styles.subtitle}>Work log</Text>

            {/* Get Started Button */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.buttonText}>Get Started →</Text>
            </TouchableOpacity>

            {/* Help & Sign In Links */}
            <View style={styles.bottomLinks}>
                <Text style={styles.helpText}>Having issues? <Text style={styles.linkText}>Get Help</Text></Text>
                <Text style={styles.helpText}>Already have an account? <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Sign In</Text></Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: "#ffffff",
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginBottom: 20,
    },
    illustration: {
        width: "90%",
        height: 200,
        resizeMode: "contain",
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#14A44D", // Green color as in the image
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    bottomLinks: {
        alignItems: "center",
        marginTop: 10,
    },
    helpText: {
        fontSize: 14,
        color: "#000",
        marginVertical: 5,
    },
    linkText: {
        color: "#14A44D", // Green text for links
        fontWeight: "bold",
    },
});
