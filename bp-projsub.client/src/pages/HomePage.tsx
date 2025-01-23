import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/UserContext";
import axios from "axios";
import { useState } from "react";
import { set } from "react-hook-form";
import { UnauthorizedPage } from "./errorPages/UnauthorizedPage";
import { AdminPage } from "./admin/AdminPage";
import { TeacherPage } from "./teacher/TeacherPage";


type Forecast = {
    date: string;
    temperatureC: number;
    summary: string;
}

const HomePage = () => {
    const [forecast, setForecast] = useState<Forecast[]>([]);
    const { user } = useAuth();


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

    if (user === null) {
        return (
            <UnauthorizedPage />
        );
    }

    if (user.roles.includes("Admin")) {
        return (
            <AdminPage />
        );
    }

    if (user.roles.includes("Teacher")) {
        return (
            <TeacherPage />
        );
    }

    if (user.roles.includes("Student")) {
        return (
            <AdminPage />
        );
    }

    return (
        <>
        <UnauthorizedPage />
            {/* <h1>Home Page</h1>
            <Button onClick={getForecast}>get forecast</Button>
            <Button onClick={getProtectedForecast}>get protected forecast</Button>

            <ul>
                {
                forecast.map((f, i) => (
                    <li key={i}>{f.date} - {f.summary}</li>
                ))}
            </ul> */}
        </>
    );
}

export default HomePage;