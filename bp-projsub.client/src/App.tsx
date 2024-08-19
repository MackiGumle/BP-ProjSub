import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
    return (
        <div className="w-full">
            <div className="bg-zinc-800 text-white p-4 mb-4 w-full">Navbar</div>
            <Outlet />
        </div>
    );
}

export default App;