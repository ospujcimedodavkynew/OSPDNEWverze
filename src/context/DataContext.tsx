import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Vehicle, Rental, Customer, RentalRequest, ToastMessage, VehiclePricing } from '../types';

// Helper to convert app's camelCase to DB's snake_case
const toSnakeCase = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
        newObj[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = obj[key];
    }
    return newObj;
};

interface DataContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    vehicles: Vehicle[];
    rentals: Rental[];
    customers: Customer[];
    rentalRequests: RentalRequest[];
    toasts: ToastMessage[];
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => Promise<void>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<RentalRequest | null>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<boolean>;
    addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<Customer | null>;
    updateCustomer: (id: number, updates: Partial<Omit<Customer, 'id' | 'created_at'>>) => Promise<Customer | null>;
    deleteCustomer: (id: number) => Promise<boolean>;
    addRental: (rental: Omit<Rental, 'id'>) => Promise<Rental | null>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<boolean>;
    addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Promise<Vehicle | null>;
    updateVehicle: (id: number, updates: Partial<Omit<Vehicle, 'id' | 'created_at'>>) => Promise<Vehicle | null>;
    deleteVehicle: (id: number) => Promise<boolean>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    sendContractByEmail: (rentalId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchData = async () => {
        if (!session) return;
        setLoading(true);
        const [vehiclesRes, rentalsRes, customersRes, requestsRes] = await Promise.all([
            supabase.from('vehicles').select('*').order('brand'),
            supabase.from('rentals').select('*').order('start_date', { ascending: false }),
            supabase.from('customers').select('*').order('last_name'),
            supabase.from('rental_requests').select('*').order('created_at', { ascending: false }),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (rentalsRes.data) setRentals(rentalsRes.data);
        if (customersRes.data) setCustomers(customersRes.data);
        if (requestsRes.data) setRentalRequests(requestsRes.data);

        setLoading(false);
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        return !error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };
    
    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const newToast: ToastMessage = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 5000);
    };
    
    const sendContractByEmail = async (rentalId: number) => {
        try {
            const { error } = await supabase.functions.invoke('send-contract', {
                body: { rentalId },
            });
            if (error) throw error;
            addToast('E-mail se smlouvou byl odeslán.', 'success');
        } catch (error: any) {
            console.error('Error sending email:', error);
            addToast(`Odeslání e-mailu selhalo: ${error.message}`, 'error');
        }
    };

    // --- Data Mutation Functions ---

    const addRentalRequest = async (request: Omit<RentalRequest, 'id'>) => {
        const { data, error } = await supabase.from('rental_requests').insert([request]).select().single();
        if (error) {
            console.error('Error adding rental request:', error);
            addToast('Odeslání žádosti selhalo.', 'error');
            return null;
        }
        setRentalRequests(prev => [data, ...prev]);
        return data;
    };
    
    const updateRentalRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
        const { error } = await supabase.from('rental_requests').update({ status }).eq('id', id);
        if (!error) {
            setRentalRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            return true;
        }
        addToast('Aktualizace žádosti selhala.', 'error');
        return false;
    };

    const addCustomer = async (customer: Omit<Customer, 'id'| 'created_at'>) => {
        const { data: existing } = await supabase.from('customers').select('id').eq('email', customer.email).single();
        if (existing) {
            addToast('Zákazník s tímto e-mailem již existuje.', 'error');
            return null;
        }
        const { data, error } = await supabase.from('customers').insert([customer]).select().single();
        if (error) {
            console.error(error);
            addToast('Vytvoření zákazníka selhalo.', 'error');
            return null;
        }
        setCustomers(prev => [...prev, data]);
        return data;
    };

    const updateCustomer = async (id: number, updates: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<Customer | null> => {
        const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
        if (error) {
            console.error(error);
            addToast('Aktualizace zákazníka selhala.', 'error');
            return null;
        }
        setCustomers(prev => prev.map(c => c.id === id ? data : c));
        return data;
    };

    const deleteCustomer = async (id: number): Promise<boolean> => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) {
            console.error(error);
            addToast('Smazání zákazníka selhalo.', 'error');
            return false;
        }
        setCustomers(prev => prev.filter(c => c.id !== id));
        return true;
    };
    
    const addRental = async (rental: Omit<Rental, 'id'>): Promise<Rental | null> => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select().single();
        if (error) {
            console.error(error);
            addToast('Vytvoření zápůjčky selhalo.', 'error');
            return null;
        }
        setRentals(prev => [data, ...prev]);
        return data;
    };
    
    const updateRental = async (id: number, updates: Partial<Rental>): Promise<boolean> => {
        const { error } = await supabase.from('rentals').update(updates).eq('id', id);
        if (!error) {
            fetchData(); // Refetch all data to ensure consistency
            return true;
        }
        console.error(error);
        addToast('Aktualizace zápůjčky selhala.', 'error');
        return false;
    };

    const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle | null> => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select().single();
         if (error) {
            console.error(error);
            addToast('Vytvoření vozidla selhalo.', 'error');
            return null;
        }
        setVehicles(prev => [...prev, data]);
        return data;
    };

    const updateVehicle = async (id: number, updates: Partial<Omit<Vehicle, 'id' | 'created_at'>>): Promise<Vehicle | null> => {
        const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
        if (error) {
            console.error(error);
            addToast('Aktualizace vozidla selhala.', 'error');
            return null;
        }
        setVehicles(prev => prev.map(v => v.id === id ? data : v));
        return data;
    };

    const deleteVehicle = async (id: number): Promise<boolean> => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) {
            console.error(error);
            addToast('Smazání vozidla selhalo.', 'error');
            return false;
        }
        setVehicles(prev => prev.filter(v => v.id !== id));
        return true;
    };

    const value = {
        session, user, loading, vehicles, rentals, customers, rentalRequests, toasts,
        login, logout, addRentalRequest, updateRentalRequestStatus, addCustomer,
        updateCustomer, deleteCustomer, addRental, updateRental, addVehicle, updateVehicle, deleteVehicle, addToast, sendContractByEmail
    };

    return (
        <DataContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 w-full max-w-xs">
                {toasts.map(toast => (
                    <div key={toast.id} className={`px-4 py-3 rounded-md shadow-lg text-white font-semibold animate-fade-in-out ${
                        toast.type === 'success' ? 'bg-green-500' : 
                        toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
