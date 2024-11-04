import { QueryClient, QueryClientProvider } from 'react-query'

const client = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: true,
            refetchInterval: false,
            refetchIntervalInBackground: false,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            retry: 1,
        }
    }
})

export const QueryProvider = ({ children }) => {
    return <QueryClientProvider client={client}>{ children }</QueryClientProvider>
}