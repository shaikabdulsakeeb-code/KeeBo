import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './store';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
        <Toaster position="top-center" />
      </BrowserRouter>
    </Provider>
  );
}
