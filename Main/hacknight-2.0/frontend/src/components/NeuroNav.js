import React, { useState } from 'react';
import axios from 'axios';

function NeuroNav() {
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);

    const startEyeTracking = async () => {
        try {
            const response = await axios.post('http://localhost:5000/start-eye-tracking');
            if (response.data.status === 'started') {
                setIsTracking(true);
                setError(null);
            }
        } catch (err) {
            setError('Failed to start eye tracking');
            console.error(err);
        }
    };

    const stopEyeTracking = async () => {
        try {
            const response = await axios.post('http://localhost:5000/stop-eye-tracking');
            if (response.data.status === 'stopped') {
                setIsTracking(false);
            }
        } catch (err) {
            setError('Failed to stop eye tracking');
            console.error(err);
        }
    };

    const handleLogin = () => {
        // Redirect to face authentication page
        window.location.href = 'http://localhost:6004/';
    };

    return (
        <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            backgroundColor: '#19212E',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{
                fontSize: '3rem',
                marginBottom: '2rem',
                background: 'linear-gradient(to right, #8454EE, #ffffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                NeuroNav
            </h1>

            {error && <p style={{color: '#F44336', marginBottom: '1rem'}}>{error}</p>}

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <button 
                    onClick={startEyeTracking}
                    disabled={isTracking}
                    style={{
                        width: '300px',
                        padding: '15px 30px',
                        fontSize: '1.2rem',
                        backgroundColor: isTracking ? '#131928' : '#8454EE',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: isTracking ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    Start Eye Tracking
                </button>

                <button 
                    onClick={stopEyeTracking}
                    disabled={!isTracking}
                    style={{
                        width: '300px',
                        padding: '15px 30px',
                        fontSize: '1.2rem',
                        backgroundColor: !isTracking ? '#131928' : '#8454EE',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: !isTracking ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    Stop Eye Tracking
                </button>

                <button 
                    onClick={handleLogin}
                    style={{
                        width: '400px',
                        padding: '20px 40px',
                        fontSize: '1.5rem',
                        backgroundColor: '#8454EE',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
                        marginTop: '1rem'
                    }}
                >
                    Login with Face Authentication
                </button>
            </div>

            <p style={{
                marginTop: '2rem',
                color: '#8454EE',
                opacity: 0.7
            }}>
                Ensure you have a webcam and Python dependencies installed
            </p>
        </div>
    );
}

export default NeuroNav;