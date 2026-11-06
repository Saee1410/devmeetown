import './App.css';
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import { Landing } from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './context/AuthContext';
import VideoMeet from './pages/VideoMeet';
import Home from './pages/Home';
import History from './pages/History';
import CreateContest from './pages/CreateContest';
import Dashboard from './pages/Dashboard';
import JoinContest from './pages/JoinContest';
import ContestRoom from "./pages/ContestRoom";
import ContestPage from './pages/ContestPage';

function App() {
  

  return (
    <>
    <AuthProvider>
      <Router>
       
       <Routes>

            <Route path='/' element={<Landing />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/:url' element={<VideoMeet />} />
            {/* <Route path='/vm' element={<VideoMeet />} /> */}
            <Route path='/home' element={<Home />} />
            <Route path='/history' element={<History />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/contest' element={<CreateContest />} />  
            <Route path='/contest/join' element={<JoinContest />} />
            <Route path='/contest/:contestCode' element={<ContestRoom />} />
            <Route path='/contestcode' element={<ContestPage />} />
       </Routes>

      </Router>
    </AuthProvider>
    </>
  )
}

export default App
