import { BrowserRouter as Router } from 'react-router-dom';
import UserProvider from './firebase/useCurerntUser'
import AppRoutes from './routes/AppRoutes'
import './App.css'
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: { background: '#4CAF50', color: '#fff' },
          },
          error: {
            style: { background: '#F44336', color: '#fff' },
          },
        }}
      />
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </div>
  )
}

export default App
