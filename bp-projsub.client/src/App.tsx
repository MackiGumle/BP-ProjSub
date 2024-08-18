import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
    return (
        <>
            <div className="bg-zinc-800 text-white p-4 mb-4">Navbar</div>
            <Outlet />
        </>
    );
}

export default App;