import React, { useState, useEffect, useContext } from 'react';
import { db } from "../firebase/config";
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';

const Statistics = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div style={styles.container}>
            <h1>Welcome back, {currentUser.email}</h1>
            
        </div>
    );
};

export default Statistics;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '100vh',
    },
    
};
