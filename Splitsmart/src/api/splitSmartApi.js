// src/api/splitSmartApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // YOUR BACKEND BASE URL

export const splitSmartApi = createApi({
  reducerPath: 'splitSmartApi',
  tagTypes: ['Groups', 'User', 'Expenses', 'GroupDetails', 'GroupBalances' , 'GroupExpenses'],
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },

  }),
  endpoints: (builder) => ({
    // Authentication Endpoints
    register: builder.mutation({
      query: (body) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
    }),
    // --- NEW & IMPROVED CODE ---
    login: builder.mutation({
      query: (credentials) => {
        // Manually construct the form-urlencoded string
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        return {
          url: '/login',
          method: 'POST',
          body: formData.toString(), // Send the body as a string
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      },
    }),
    getGroups: builder.query({
      query: () => '/groups/',
      providesTags: ['Groups'], // For caching and invalidation
    }),
    createGroup: builder.mutation({
          query: (newGroup) => ({
            url: '/groups/',
            method: 'POST',
            body: newGroup, // e.g., { name: 'New Group', description: 'A new adventure' }
          }),
          // This is the magic part! After this mutation is successful,
          // it will automatically refetch any query that has the 'Groups' tag.
          // This means our GroupsListScreen will update automatically.
          invalidatesTags: ['Groups'],
    }),
    // User Endpoints (example)
    getMe: builder.query({
      query: () => '/users/me',
    }),
    getGroupById: builder.query({
          query: (groupId) => `/groups/${groupId}`,
          providesTags: (result, error, id) => [{ type: 'GroupDetails', id }],
    }),

    // Fetches the calculated balances for a single group
    getGroupBalances: builder.query({
      query: (groupId) => `/groups/${groupId}/balances`,
      providesTags: (result, error, id) => [{ type: 'GroupBalances', id }],
    }),

        // Fetches all expenses for a single group
    getGroupExpenses: builder.query({
      query: (groupId) => `/groups/${groupId}/expenses`,
      providesTags: (result, error, id) => [{ type: 'GroupExpenses', id }],
    }),
//    getGroupExpenses: builder.query({ /* ... */ }),

    // --- ADD THIS NEW MUTATION ---
    addExpense: builder.mutation({
      query: ({ groupId, expenseData }) => ({
        url: `/groups/${groupId}/expenses`,
        method: 'POST',
        body: expenseData,
      }),
      // When an expense is added, the balances and expense list for that group are no longer valid.
      // Invalidate them to trigger an automatic refetch on the GroupDetailsScreen.
      invalidatesTags: (result, error, { groupId }) => [
        { type: 'GroupBalances', id: groupId },
        { type: 'GroupExpenses', id: groupId },
      ],
    }),
    // Send a friend request by email
    sendFriendRequest: builder.mutation({
      query: (body) => ({
        url: '/friends/requests',
        method: 'POST',
        body, // { email: 'someone@example.com' }
      }),
      // no automatic invalidation (we'll refetch lists manually)
    }),

    // Get pending friend requests received by current user
    getPendingFriendRequests: builder.query({
      query: () => '/friends/requests/pending',
      providesTags: (result) =>
        result
          ? result.map((r) => ({ type: 'User', id: r.id })) // optional
          : [{ type: 'User', id: 'PENDING' }],
    }),

    // Accept a friend request (requester_id in URL)
    acceptFriendRequest: builder.mutation({
      query: (requesterId) => ({
        url: `/friends/requests/${requesterId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'User', id: 'PENDING' }, { type: 'User', id: 'FRIENDS' }],
    }),

    // Get the current user's friends list
    getFriends: builder.query({
      query: () => '/friends/',
      providesTags: (result) =>
        result
          ? result.map((f) => ({ type: 'User', id: f.id }))
          : [{ type: 'User', id: 'FRIENDS' }],
    }),
    // ... other endpoints will go here later
  }),
});

// Export hooks for usage in functional components, which are auto-generated based on the defined endpoints
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useCreateGroupMutation,
  useGetGroupsQuery,// Example for authenticated requests
  useGetGroupByIdQuery,
  useGetGroupBalancesQuery,
  useGetGroupExpensesQuery,
  useAddExpenseMutation,
  useSendFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useGetFriendsQuery
} = splitSmartApi;