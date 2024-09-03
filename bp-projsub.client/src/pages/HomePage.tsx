import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { set } from "react-hook-form";


type Forecast = {
    date: string;
    temperatureC: number;
    summary: string;
}

const HomePage = () => {
    const [forecast, setForecast] = useState<Forecast[]>([]);

    function getForecast() {
        axios.get('api/weatherforecast')
            .then(response => {
                console.log(response);
                setForecast(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function getProtectedForecast() {
        axios.get('api/protectedweatherforecast')
            .then(response => {
                console.log(response);
                setForecast(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }
    return (
        <>
            <h1>Home Page</h1>
            <Button onClick={getForecast}>get forecast</Button>
            <Button onClick={getProtectedForecast}>get protected forecast</Button>
            {/* <ul>
                {
                forecast.map((f, i) => (
                    <li key={i}>{f.date} - {f.summary}</li>
                ))}
            </ul> */}
        </>
    );
}

export default HomePage;