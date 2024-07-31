import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from 'react-query'
import './index.css'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </React.Fragment>,
)
