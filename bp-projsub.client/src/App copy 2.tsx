import { Outlet } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';
import { Toaster } from './components/ui/toaster';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './components/theme-components/theme-provider';


function App() {
    return (
        <ThemeProvider defaultTheme='dark' storageKey='bp-projsub-theme'>
            <UserProvider>
                <div className="w-full h-full">
                    {/* <NavBar /> */}
                    {/* <div className="bg-zinc-800 text-white p-4 mb-4 w-full">Navbar</div> */}
                    <Outlet />
                    <Toaster />
                    <ReactQueryDevtools initialIsOpen={false} />

                </div>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;