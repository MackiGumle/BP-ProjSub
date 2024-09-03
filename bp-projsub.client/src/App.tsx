import { Outlet } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserContext';
import NavBar from './components/custom-ui/NavBar';
import { useEffect, useState } from 'react';
import axios from 'axios';


interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

function App() {
    const [forecasts, setForecasts] = useState<Forecast[] | null>(null);

    useEffect(() => {
        // populateWeatherData();
    }, []);

    return (
        <UserProvider>
            <div className="w-full">
                <NavBar />
                {/* <div className="bg-zinc-800 text-white p-4 mb-4 w-full">Navbar</div> */}
                <Outlet />
            </div>
        </UserProvider>
    );

    async function populateWeatherData() {
        const response = await axios.get('weatherforecast');
        const data = await response.data;
        setForecasts(data);
        console.log(response);
    }
}

export default App;