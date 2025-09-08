import React from 'react';

// Card Component
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`bg-surface shadow-md rounded-lg p-6 border border-border ${className}`} {...props}>
        {children}
    </div>
);

// Button Component
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = "font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors";
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-focus focus:ring-primary-focus',
        secondary: 'bg-gray-200 text-text-primary hover:bg-gray-300 focus:ring-gray-400'
    };
    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
    <Button variant="secondary" className={className} {...props}>{children}</Button>
);


export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
    <button
        className={`p-2 rounded-full hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary text-text-secondary hover:text-primary disabled:opacity-50 transition-colors ${className}`}
        {...props}
    >
        {children}
    </button>
);


// Input Component
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
    <input
        className={`mt-1 block w-full px-3 py-2 bg-white border border-border rounded-md text-sm shadow-sm placeholder-gray-400
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none
            ${className}`}
        {...props}
    />
);

// Select Component
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className = '', ...props }) => (
    <select
        className={`mt-1 block w-full px-3 py-2 bg-white border border-border rounded-md text-sm shadow-sm placeholder-gray-400
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            ${className}`}
        {...props}
    >
        {children}
    </select>
);


// Label Component
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
    <label className={`block text-sm font-medium text-text-secondary ${className}`} {...props}>
        {children}
    </label>
);

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg">
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

// Stepper
export const Stepper: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => (
    <div className="flex justify-between items-center">
        {steps.map((step, index) => (
            <React.Fragment key={step}>
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${index <= currentStep ? 'bg-primary text-white' : 'bg-border text-text-secondary'}`}>
                        {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className={`ml-2 font-medium ${index <= currentStep ? 'text-text-primary' : 'text-text-secondary'}`}>{step}</span>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded ${index < currentStep ? 'bg-primary' : 'bg-border'}`} />}
            </React.Fragment>
        ))}
    </div>
);

// Tabs
export const Tabs: React.FC<{ tabs: { id: string, label: string }[], activeTab: string, setActiveTab: (id: string) => void }> = ({ tabs, activeTab, setActiveTab }) => (
    <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    </div>
);
