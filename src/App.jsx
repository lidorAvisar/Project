import { BrowserRouter as Router } from 'react-router-dom';
import UserProvider from './firebase/useCurerntUser'
import AppRoutes from './routes/AppRoutes'
import './App.css'


function App() {

  return (
    //use font Assistant
    <div className=''>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </div>
  )
}

export default App
