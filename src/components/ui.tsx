import React from 'react';

// Card component
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-6 rounded-lg shadow ${className}`}>
        {children}
    </div>
);

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}
export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-focus focus:ring-primary',
        secondary: 'bg-gray-200 text-text-primary hover:bg-gray-300 focus:ring-gray-400'
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// IconButton component
export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
    <button className={`p-2 rounded-full hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`} {...props}>
        {children}
    </button>
);


// Modal component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">&times;</button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Input component
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
    <input
        ref={ref}
        className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        {...props}
    />
));

// Label component
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
    <label className={`block text-sm font-medium text-text-secondary mb-1 ${className}`} {...props}>
        {children}
    </label>
);
