import {configureStore} from '@reduxjs/toolkit';

import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';
import skillsReducer from '../features/skills/skillsSlice';
import contactsReducer from '../features/contacts/contactsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import paymentsReducer from '../features/payments/paymentsSlice';
import usersReducer from '../features/users/usersSlice';
import eventsReducer from '../features/events/eventsSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer,
        skills: skillsReducer,
        contacts: contactsReducer,
        messages: messagesReducer,
        payments: paymentsReducer,
        users: usersReducer,
        events: eventsReducer,
    },
});