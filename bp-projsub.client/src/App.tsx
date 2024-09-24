import { Outlet } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';
import NavBar from './components/custom-ui/NavBar';


function App() {
    return (
        <UserProvider>
            <div className="w-full h-full">
                <NavBar />
                APP 
                {/* <div className="bg-zinc-800 text-white p-4 mb-4 w-full">Navbar</div> */}
                <Outlet />
                
            </div>
        </UserProvider>
    );
}

export default App;