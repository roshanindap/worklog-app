import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Modal,
    Alert,
    ScrollView
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import config from "../config";

const ITEMS_PER_PAGE = 10;

const WorklogScreen = ({ navigation }) => {
    const [worklogs, setWorklogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorklog, setSelectedWorklog] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchWorklogs = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem("userToken");
            const userId = await AsyncStorage.getItem("userId");

            if (!token || !userId) {
                throw new Error("Authentication required. Please login again.");
            }

            const response = await axios.get(
                `${config.API_URL}/api/worklogs/${userId}?page=${page}&limit=${ITEMS_PER_PAGE}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            if (response.data && response.data.worklogs) {
                const formattedData = response.data.worklogs.map(item => ({
                    ...item,
                    formattedDate: format(new Date(item.date), 'MMM dd, yyyy'),
                }));

                setWorklogs(formattedData);
                setTotalCount(response.data.totalCount);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
            } else {
                throw new Error("Invalid data format from server");
            }
        } catch (error) {
            console.error("Worklog Fetch Error:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch worklogs");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => fetchWorklogs(1));
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWorklogs(1);
    };

    const handleAction = (worklog, type) => {
        setSelectedWorklog(worklog);
        setActionType(type);
        setModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const userId = await AsyncStorage.getItem("userId");

            if (!token) {
                throw new Error("Authentication required");
            }

            await axios.delete(`${config.API_URL}/api/worklogs/${userId}/${selectedWorklog.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            // If we're on the last page with only one item, go to previous page
            if (worklogs.length === 1 && currentPage > 1) {
                fetchWorklogs(currentPage - 1);
            } else {
                fetchWorklogs(currentPage);
            }

            Alert.alert("Success", "Worklog deleted successfully");
        } catch (error) {
            console.error("Delete Error:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to delete worklog");
        } finally {
            setModalVisible(false);
            setSelectedWorklog(null);
            setActionType(null);
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchWorklogs(page);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            <Text style={[styles.headerText, styles.titleColumn]}>Title</Text>
            <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
            <Text style={[styles.headerText, styles.actionsColumn]}>Actions</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.dataRow}>
            <Text style={[styles.dataText, styles.titleColumn]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.dataText, styles.dateColumn]} numberOfLines={1}>{item.formattedDate}</Text>
            <View style={[styles.actionsColumn, styles.actionsContainer]}>
                <TouchableOpacity onPress={() => handleAction(item, 'view')}>
                    <MaterialIcons name="visibility" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAction(item, 'edit')}>
                    <MaterialIcons name="edit" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAction(item, 'delete')}>
                    <MaterialIcons name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            <Text style={styles.totalItemsText}>{totalCount} total </Text>

            <TouchableOpacity
                style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                onPress={() => goToPage(1)}
                disabled={currentPage === 1}
            >
                <MaterialIcons name="first-page" size={24} color={currentPage === 1 ? "#CCC" : "#007AFF"} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <MaterialIcons name="chevron-left" size={24} color={currentPage === 1 ? "#CCC" : "#007AFF"} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
                Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
                style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <MaterialIcons name="chevron-right" size={24} color={currentPage === totalPages ? "#CCC" : "#007AFF"} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                onPress={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
            >
                <MaterialIcons name="last-page" size={24} color={currentPage === totalPages ? "#CCC" : "#007AFF"} />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading worklogs...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchWorklogs(1)}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView horizontal={true}>
                <View>
                    {renderHeader()}
                    <FlatList
                        data={worklogs}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#007AFF']}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="assignment" size={48} color="#AEAEB2" />
                                <Text style={styles.emptyText}>No worklogs found</Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>

            {renderPagination()}

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('AddWorklog')}
            >
                <MaterialIcons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
            {/* Action Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {actionType === 'delete' ? (
                            <>
                                <MaterialIcons
                                    name="warning"
                                    size={48}
                                    color="#FFC107"
                                    style={styles.modalIcon}
                                />
                                <Text style={styles.modalTitle}>Confirm Deletion</Text>
                                <Text style={styles.modalText}>
                                    Are you sure you want to delete this worklog?
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.deleteButton]}
                                        onPress={handleDelete}
                                    >
                                        <Text style={styles.modalButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>
                                    {actionType === 'view' ? 'View Worklog' : 'Edit Worklog'}
                                </Text>

                                <ScrollView style={styles.modalContent}>
                                    <View style={styles.modalField}>
                                        <Text style={styles.modalLabel}>Title:</Text>
                                        <Text style={styles.modalValue}>{selectedWorklog?.title}</Text>
                                    </View>
                                    <View style={styles.modalField}>
                                        <Text style={styles.modalLabel}>Description:</Text>
                                        <Text style={styles.modalValue}>{selectedWorklog?.description}</Text>
                                    </View>
                                    <View style={styles.modalField}>
                                        <Text style={styles.modalLabel}>Date:</Text>
                                        <Text style={styles.modalValue}>{selectedWorklog?.formattedDate}</Text>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalButtons}>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.closeButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Close</Text>
                                    </TouchableOpacity>
                                    {actionType === 'edit' && (
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.saveButton]}
                                            onPress={() => {
                                                setModalVisible(false);
                                                navigation.navigate('EditWorklog', { worklog: selectedWorklog });
                                            }}
                                        >
                                            <Text style={styles.modalButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                    )}
                                    {actionType === 'view' && (
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.saveButton]}
                                            onPress={() => {
                                                setModalVisible(false);
                                                navigation.navigate('ViewWorklog', { worklog: selectedWorklog });
                                            }}
                                        >
                                            <Text style={styles.modalButtonText}>View</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 10,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#007AFF',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        marginVertical: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 8,

    },
    dataRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    dataText: {
        color: '#333333',
        fontSize: 14,
    },
    idColumn: {
        width: 60,
    },
    userIdColumn: {
        width: 80,
    },
    titleColumn: {
        width: 120,
    },
    dateColumn: {
        width: 100,
    },
    actionsColumn: {
        width: 120,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 10,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 40,
        right: 10,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
    },
    modalIcon: {
        marginBottom: 10,
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#555',
    },
    modalContent: {
        maxHeight: 300,
        marginBottom: 20,
    },
    modalField: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalLabel: {
        fontWeight: 'bold',
        width: 100,
        color: '#555',
    },
    modalValue: {
        flex: 1,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    closeButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    pageButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    pageText: {
        marginHorizontal: 15,
        fontSize: 14,
        color: '#333',
    },
    totalItemsText: {
        position: 'absolute',
        left: 15,
        fontSize: 12,
        color: '#666',
    },
});

export default WorklogScreen;