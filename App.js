import { useState, useEffect, useCallback } from "react";
import { Platform, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import { SafeAreaProvider } from "react-native-safe-area-context";
import UserAvatar from "react-native-user-avatar";
import { FAB } from '@rneui/themed';

export default function App() {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to handle retries with exponential backoff
  const fetchWithRetry = async (url, retries = 3, delay = 3000) => {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.warn("Too many requests, retrying...");
        await new Promise(res => setTimeout(res, delay)); // Wait for delay period
        return fetchWithRetry(url, retries - 1, delay * 2);  // Retry with increased delay
      }
      throw error;  // Rethrow error if it's not a 429 or retries exceeded
    }
  };

  // Fetch a single user with a throttling delay of 1 second
  const oneUser = useCallback(() => {
    setTimeout(() => {
      fetchWithRetry(
        `https://random-data-api.com/api/v3/projects/c8765941-69fa-4af9-9bcf-03cbacf9f79f?api_key=vQxYfvg-ZnrStO7rK86gUA`
      )
        .then((response) => {
          setUsers((users) => [...users, response.data.user[0]]);
        })
        .catch((e) => {
          console.error("Error fetching data: ", e);
        });
    }, 1000); // 1 second delay between requests
  }, []);

  // Fetch the initial batch of users on component mount
  const getUsers = useCallback(() => {
    fetchWithRetry(
      "https://random-data-api.com/api/v3/projects/fc7db5b8-8882-46d4-afde-11540fda316c?api_key=8X-cPSl2QnPgeEbk-a33-Q"
    )
      .then((response) => {
        setUsers(response.data.Data);
      })
      .catch((e) => {
        console.error("Error fetching data: ", e);
      });
  }, []);

  // Handle pull-to-refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    getUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    oneUser();
  }, [oneUser]);

  // Item renderer for FlatList
  const renderItem = ({ item }) => (
    <View
      style={
        Platform.OS === "android"
          ? {
              flex: 1,
              flexDirection: "row",
              padding: 14,
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "#fff",
            }
          : {
              flex: 1,
              flexDirection: "row-reverse",
              padding: 14,
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "grey",
            }
      }
    >
      
      <UserAvatar
        style={styles.avatar}
        size={50}
        name={item.first_name} 
        src={item.avatar} 
      />
      <View style={styles.content}>
        <Text style={styles.first_name}>{item.first_name}</Text>
        <Text style={styles.last_name}>{item.last_name}</Text>
      </View>
    </View>
  );

  // Key extractor for FlatList
  const keyExtractor = (item) => item.uuid.toString();

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshing={refreshing} // Refreshes prop
          onRefresh={handleRefresh} // Handles pull-to-refresh
        />
     
        <FAB icon={{ name: 'add', color: 'white' }} color="green" size="large" placement="right" onPress={oneUser} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingHorizontal: 16,
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#ffff",
  },
  first_name: {
    fontSize: 14,
  },
  last_name: {
    fontSize: 14,
    color: "#789",
  },
  users: {},
  avatar: {
    width: 50,
    height: 50,
  },
});
