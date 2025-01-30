import { Outlet } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';
import { Toaster } from './components/ui/toaster';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './components/theme-components/theme-provider';


function App() {
    return (
        <UserProvider>
            <ThemeProvider defaultTheme='dark' storageKey='bp-projsub-theme'>
            <div className="w-full h-full">
                <Outlet />
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
                 
            </div>
            </ThemeProvider>
        </UserProvider>
    );
}

export default App;