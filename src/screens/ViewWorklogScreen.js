import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

const ViewWorklogScreen = ({ route, navigation }) => {
    const { worklog } = route.params;

    // Format the date if it exists
    const formattedDate = worklog.date ? format(new Date(worklog.date), 'MMMM dd, yyyy - hh:mm a') : 'Not specified';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{worklog.title || 'Worklog Details'}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
            </View>


            <View style={styles.descriptionCard}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                    {worklog.description || 'No description provided'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    header: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: '#8E8E93',
    },
    detailCard: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginLeft: 10,
        width: 80,
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    descriptionCard: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    closeButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ViewWorklogScreen;