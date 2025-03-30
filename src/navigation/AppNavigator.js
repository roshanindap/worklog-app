import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';

// Import your screens
import WelcomeScreen from "../screens/WelcomeScreen";
import SignupScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddWorklogScreen from "../screens/AddWorklogScreen";
import EditWorklogScreen from "../screens/EditWorklogScreen";
import ViewWorklogScreen from "../screens/ViewWorklogScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                headerShown: false
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}


export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                    headerStyle: styles.header,
                    headerTintColor: '#fff',
                    headerTitleStyle: styles.headerTitle,
                }}
            >
                {/* Auth Screens - No Header */}
                <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Signup"
                    component={SignupScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />

                {/* Main App Screens */}
                <Stack.Screen
                    name="HomeTabs"
                    component={HomeTabs}
                    options={({ navigation }) => ({
                        title: 'My Worklogs',
                        headerLeft: () => null,
                        headerRight: () => (
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => navigation.navigate('Profile')}
                            >
                                <MaterialIcons name="person" size={24} color="#fff" />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen
                    name="AddWorklog"
                    component={AddWorklogScreen}
                    options={{ title: 'Add New Worklog' }}
                />
                <Stack.Screen
                    name="EditWorklog"
                    component={EditWorklogScreen}
                    options={{ title: 'Edit Worklog' }}
                />
                <Stack.Screen
                    name="ViewWorklog"
                    component={ViewWorklogScreen}
                    options={{ title: 'Worklog Details' }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: 'My Profile' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: 60,
        paddingBottom: 5,
        paddingTop: 5,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
    },
    tabBarLabel: {
        fontSize: 12,
        marginBottom: 5
    },
    header: {
        backgroundColor: '#007AFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10
    },
    headerButton: {
        marginRight: 15
    }
});