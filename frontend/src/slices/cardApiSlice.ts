import { apiSlice } from "./apiSlice";

const CARD_URL = '/cards';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createCard: builder.mutation({
            query: (data) => ({
                url: `${CARD_URL}`,
                method: 'POST',
                body: data,
            })
        }),
        getMyCards: builder.query({
        query: () => ({
            url: `${CARD_URL}/my`,
            method: 'GET'
        })
        })
    })
})

export const {useCreateCardMutation, useGetMyCardsQuery} = userApiSlice;