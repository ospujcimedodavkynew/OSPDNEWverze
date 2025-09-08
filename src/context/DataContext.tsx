import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Vehicle, Rental, Customer, RentalRequest, ToastMessage } from '../types';
import { Session, User } from '@supabase/supabase-js';

// Define the shape of the context data
interface DataContextProps {
    session: Session | null;
    user: User | null;
    vehicles: Vehicle[];
    rentals: Rental[];
    customers: Customer[];
    rentalRequests: RentalRequest[];
    loading: boolean;
    toasts: ToastMessage[];
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Promise<Vehicle | null>;
    updateVehicle: (id: number, updates: Partial<Omit<Vehicle, 'id' | 'created_at'>>) => Promise<Vehicle | null>;
    deleteVehicle: (id: number) => Promise<boolean>;
    addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<Customer | null>;
    updateCustomer: (id: number, updates: Partial<Omit<Customer, 'id' | 'created_at'>>) => Promise<Customer | null>;
    deleteCustomer: (id: number) => Promise<boolean>;
    addRental: (rental: Omit<Rental, 'id' | 'created_at'>) => Promise<Rental | null>;
    updateRentalSignatures: (id: number, signatures: { customer_signature?: string, company_signature?: string }) => Promise<Rental | null>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<RentalRequest | null>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<boolean>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Create the context with a default undefined value
const DataContext = createContext<DataContextProps | undefined>(undefined);

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        setLoading(true);
        const [
            { data: vehiclesData, error: vehiclesError },
            { data: rentalsData, error: rentalsError },
            { data: customersData, error: customersError },
            { data: rentalRequestsData, error: rentalRequestsError },
        ] = await Promise.all([
            supabase.from('vehicles').select('*'),
            supabase.from('rentals').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('rental_requests').select('*'),
        ]);

        if (vehiclesError) console.error('Error fetching vehicles:', vehiclesError); else setVehicles(vehiclesData as any || []);
        if (rentalsError) console.error('Error fetching rentals:', rentalsError); else setRentals(rentalsData as any || []);
        if (customersError) console.error('Error fetching customers:', customersError); else setCustomers(customersData as any || []);
        if (rentalRequestsError) console.error('Error fetching rental requests:', rentalRequestsError); else setRentalRequests(rentalRequestsData as any || []);
        
        setLoading(false);
    };

    // --- Auth ---
    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        return !error;
    };
    const logout = () => supabase.auth.signOut();

    // --- Toasts ---
    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // --- CRUD Functions ---
    // Vehicles
    const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if (data) setVehicles(prev => [...prev, data as any]);
        return data as any;
    };
    const updateVehicle = async (id: number, updates: Partial<Omit<Vehicle, 'id' | 'created_at'>>) => {
        const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if (data) setVehicles(prev => prev.map(v => v.id === id ? data as any : v));
        return data as any;
    };
    const deleteVehicle = async (id: number) => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) { addToast(error.message, 'error'); return false; }
        setVehicles(prev => prev.filter(v => v.id !== id));
        return true;
    };

    // Customers
    const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('customers').insert([customer]).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if (data) setCustomers(prev => [...prev, data as any]);
        return data as any;
    };
    const updateCustomer = async (id: number, updates: Partial<Omit<Customer, 'id' | 'created_at'>>) => {
        const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if (data) setCustomers(prev => prev.map(c => c.id === id ? data as any : c));
        return data as any;
    };
    const deleteCustomer = async (id: number) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) { addToast(error.message, 'error'); return false; }
        setCustomers(prev => prev.filter(c => c.id !== id));
        return true;
    };

    // Rentals
    const addRental = async (rental: Omit<Rental, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if (data) setRentals(prev => [...prev, data as any]);
        return data as any;
    };
    const updateRentalSignatures = async (id: number, signatures: { customer_signature?: string, company_signature?: string }) => {
        const { data, error } = await supabase.from('rentals').update({ ...signatures, digital_consent_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if (data) setRentals(prev => prev.map(r => r.id === id ? data as any : r));
        return data as any;
    };

    // Rental Requests
    const addRentalRequest = async (request: Omit<RentalRequest, 'id'>) => {
        const { data, error } = await supabase.from('rental_requests').insert([request]).select().single();
        if (error) { addToast(error.message, 'error'); return null; }
        if(data) setRentalRequests(prev => [...prev, data as any]);
        return data as any;
    };
    const updateRentalRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
        const { error } = await supabase.from('rental_requests').update({ status }).eq('id', id);
        if (error) { addToast(error.message, 'error'); return false; }
        setRentalRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        return true;
    };

    const value = {
        session, user, vehicles, rentals, customers, rentalRequests, loading, toasts,
        login, logout, addVehicle, updateVehicle, deleteVehicle,
        addCustomer, updateCustomer, deleteCustomer, addRental, updateRentalSignatures,
        addRentalRequest, updateRentalRequestStatus, addToast,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

// Create a custom hook to use the context
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};