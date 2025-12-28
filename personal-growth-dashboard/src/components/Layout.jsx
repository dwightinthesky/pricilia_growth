import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, className = '' }) => {
    return (
        <div className={`min-h-screen font-sans text-pricilia-text ${className}`}>
            <Navbar />

            {/* Main Content */}
            <main className="min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default Layout;
