import React from 'react';

function Layout({ children, messages = [] }) {
    return (
        <div className="bg-light min-vh-100">
            <div className="container mt-4">
                {messages.length > 0 && messages.map((msg, index) => (
                    <div key={index} className={`alert alert-${msg.category}`}>
                        {msg.message}
                    </div>
                ))}
                {children}
            </div>
        </div>
    );
}

export default Layout;
