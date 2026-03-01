import { apiSlice } from "./apiSlice";

const USER_URL = '/user';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/google`,
                method: 'POST',
                body: data,
            })
        }),
        getUserInfo: builder.query({
            query: () => ({
                url: `${USER_URL}/me`,
                method: 'GET'
            })
        }),
        updatePackage: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/package`,
                method: 'PUT',
                body: data,
            })
        }),
        uploadReceipt: builder.mutation({
            query: (formData) => ({
                url:`${USER_URL}/receipt`,
                method: 'PUT',
                body: formData, 
            })
        })
    })
})

export const {useLoginMutation, useGetUserInfoQuery, useUpdatePackageMutation, useUploadReceiptMutation} = userApiSlice;