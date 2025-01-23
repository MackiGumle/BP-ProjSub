import { Outlet } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';
import NavBar from './components/custom-ui/NavBar';
import { Toaster } from './components/ui/toaster';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


function App() {
    return (
        <UserProvider>
            <div className="w-full h-full">
                <NavBar />
                ---App---
                {/* <div className="bg-zinc-800 text-white p-4 mb-4 w-full">Navbar</div> */}
                <Outlet />
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
                ---/App---
                
            </div>
        </UserProvider>
    );
}

export default App;