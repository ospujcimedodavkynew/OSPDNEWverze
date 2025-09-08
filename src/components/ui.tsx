import React from 'react';

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-6 rounded-lg shadow ${className}`}>
        {children}
    </div>
);

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}
export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
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

// IconButton
export const IconButton: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', ...props }) => (
    <button className={`p-2 rounded-full hover:bg-background transition-colors ${className}`} {...props}>
        {children}
    </button>
);


// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary ${className}`}
        {...props}
    />
));
Input.displayName = "Input";

// Label
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...props }) => (
    <label className={`block text-sm font-medium text-text-secondary mb-1 ${className}`} {...props}>
        {children}
    </label>
);

// Modal
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-lg shadow-xl w-full max-w-md m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};
