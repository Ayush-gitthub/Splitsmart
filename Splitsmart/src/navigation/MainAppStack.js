// src/navigation/MainAppStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
// --- THE FIX IS HERE ---
// Let's ensure this path is exactly right.
import GroupsListScreen from '../screens/GroupsListScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen'
import AddExpenseScreen from '../screens/AddExpenseScreen';

const Stack = createNativeStackNavigator();

const MainAppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Set GroupsListScreen as the initial screen for the main app */}
      <Stack.Screen name="GroupsListScreen" component={GroupsListScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      {/* We will add these screens later */}
      {/* <Stack.Screen name="CreateGroup" component={CreateGroupScreen} /> */}
      {/* <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} /> */}
    </Stack.Navigator>
  );
};

export default MainAppStack;