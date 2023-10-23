import './App.css';

//router
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

//pages
import Home from "./pages/Home/Home"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import EditProfile from "./pages/EditProfile/EditProfile"
import GameRegister from "./pages/Game/GameRegister"

//components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

//hooks
import {useAuth} from './hooks/useAuth'
import GamePage from './pages/Game/GamePage';
import Chat from './components/Chat';

function App() {
  const {auth, loading} = useAuth();

  if(loading) {
    return <p>Carregando...</p>
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Chat/>
        <Navbar/>
        <div className='container'>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/profile' element={auth ? <EditProfile/> : <Navigate to="/login"/>}/>
            <Route path='/gameRegister/:game' element={auth ? <GameRegister/> : <Navigate to="/register"/>}/>
            <Route path='/gamePage/:game' element={auth ? <GamePage/> : <Navigate to="/register"/>}/>
            <Route path='/login' element={!auth ? <Login/> : <Navigate to="/"/>}/>
            <Route path='/register' element={!auth ? <Register/> : <Navigate to="/"/>}/>
          </Routes>
        </div>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
