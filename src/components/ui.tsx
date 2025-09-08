import React from 'react';

// Card component
// FIX: Updated Card to accept all HTML div attributes to allow for onClick handlers.
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`bg-surface p-6 rounded-lg shadow ${className}`} {...props}>
        {children}
    </div>
);

// Button component
// FIX: Exported ButtonProps to be used by SecondaryButton.
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

// FIX: Added missing SecondaryButton component.
export const SecondaryButton: React.FC<ButtonProps> = (props) => (
    <Button variant="secondary" {...props} />
);

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

// FIX: Added missing Stepper component.
interface StepperProps {
    steps: string[];
    currentStep: number;
}
export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center w-full">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center w-32">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            currentStep > index + 1 ? 'bg-primary text-white' : currentStep === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary'
                        }`}>
                           {currentStep > index + 1 ? (
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : index + 1}
                        </div>
                        <p className={`mt-2 text-sm ${currentStep >= index + 1 ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-auto border-t-2 transition-colors duration-500 ease-in-out ${currentStep > index + 1 ? 'border-primary' : 'border-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

// FIX: Added missing Tabs component.
interface TabsProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}
export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                            tab.id === activeTab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

// FIX: Added missing Select component.
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => (
    <select
        ref={ref}
        className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white ${className}`}
        {...props}
    />
));
