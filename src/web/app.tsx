import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { Provider } from 'react-redux';

import { RouterApp } from './router';
import { theme } from '../ui';

export const App = ({ store }: { store: any }) => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <ChakraProvider theme={theme}>
          <RouterApp />
        </ChakraProvider>
      </Provider>
    </React.StrictMode>
  );
};
