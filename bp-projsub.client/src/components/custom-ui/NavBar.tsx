import { useAuth, UserProfile } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import axios from "axios";

export default function NavBar() {
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <div className="bg-zinc-800 text-white p-4 mb-4 w-full">
            <div className="flex justify-between">
                <Link to="/">Navbar</Link>
                <Link to="/home">Home</Link>
                <div>
                    {isLoggedIn() ? (
                        <>
                            <Button onClick={logout} className="mr-4">Logout</Button>
                            <span className="ml-2 text-sm text-gray-400">({user?.roles?.join(', ')})</span>
                            <span className="ml-2">{user?.username}</span>
                        </>
                    ) : (
                        <div className="flex justify-between">
                            <Link className="mr-4" to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}