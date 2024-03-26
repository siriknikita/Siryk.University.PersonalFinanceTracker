import { Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
    const [user, setUser] = useState(null);

    const getUser = async () => {
        try {
            const url = `${process.env.REACT_APP_API_URL}/auth/login/success`;
            const { data } = await axios.get(url, { withCredentials: true });
            setUser(data.user._json);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <div className="container">
            <Routes>
                <Route
                    exact
                    path="/"
                    element={user ? <Home user={user} /> : <Navigate to="/login" />}
                />
                <Route
                    exact
                    path="/login"
                    element={user ? <Navigate to="/dashboard" /> : <Login />}
                />
                <Route
                    path="/signup"
                    element={user ? <Navigate to="/" /> : <Signup />}
                />
                <Route
                    path="/dashboard"
                    element={user ? <Dashboard user={user} /> : <Dashboard />}
                />
            </Routes>
        </div>
    );
}

export default App;
