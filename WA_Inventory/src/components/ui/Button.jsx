import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    return (
        <button 
            className={`custom-btn btn-${variant} btn-${size} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
