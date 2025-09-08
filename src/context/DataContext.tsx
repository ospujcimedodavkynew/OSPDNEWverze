
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Vehicle, Customer, Rental, RentalRequest, ToastMessage } from '../types';

// Define the shape of the context data
interface DataContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    vehicles: Vehicle[];
    customers: Customer[];
    rentals: Rental[];
    rentalRequests: RentalRequest[];
    toasts: ToastMessage[];
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Promise<Vehicle | null>;
    updateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<Vehicle | null>;
    deleteVehicle: (id: number) => Promise<void>;
    addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<Customer | null>;
    updateCustomer: (id: number, updates: Partial<Customer>) => Promise<Customer | null>;
    deleteCustomer: (id: number) => Promise<void>;
    addRental: (rental: Omit<Rental, 'id'>) => Promise<Rental | null>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<Rental | null>;
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<void>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<boolean>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
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
        try {
            const { data: vehiclesData, error: vehiclesError } = await supabase.from('vehicles').select('*');
            if (vehiclesError) throw vehiclesError;
            setVehicles(vehiclesData || []);

            const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
            if (customersError) throw customersError;
            setCustomers(customersData || []);

            const { data: rentalsData, error: rentalsError } = await supabase.from('rentals').select('*');
            if (rentalsError) throw rentalsError;
            setRentals(rentalsData || []);
            
            const { data: rentalRequestsData, error: rentalRequestsError } = await supabase.from('rental_requests').select('*');
            if (rentalRequestsError) throw rentalRequestsError;
            setRentalRequests(rentalRequestsData || []);

        } catch (error: any) {
            addToast(`Error fetching data: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const newToast = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 5000);
    };

    // Auth functions
    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        return !error;
    };

    const logout = () => {
        supabase.auth.signOut();
    };

    // Vehicle CRUD
    const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select().single();
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        if (data) setVehicles(prev => [...prev, data]);
        return data;
    };

    const updateVehicle = async (id: number, updates: Partial<Vehicle>) => {
        const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        if (data) setVehicles(prev => prev.map(v => v.id === id ? data : v));
        return data;
    };

    const deleteVehicle = async (id: number) => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) {
            addToast(error.message, 'error');
        } else {
            setVehicles(prev => prev.filter(v => v.id !== id));
        }
    };

    // Customer CRUD
    const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('customers').insert([customer]).select().single();
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        if (data) setCustomers(prev => [...prev, data]);
        return data;
    };
    
    const updateCustomer = async (id: number, updates: Partial<Customer>) => {
        const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        if (data) setCustomers(prev => prev.map(c => c.id === id ? data : c));
        return data;
    };

    const deleteCustomer = async (id: number) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) {
            addToast(error.message, 'error');
        } else {
            setCustomers(prev => prev.filter(c => c.id !== id));
        }
    };
    
    // Rental CRUD
    const addRental = async (rental: Omit<Rental, 'id'>) => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select().single();
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        if (data) setRentals(prev => [...prev, data]);
        return data;
    };

    const updateRental = async (id: number, updates: Partial<Rental>) => {
        const { data, error } = await supabase.from('rentals').update(updates).eq('id', id).select().single();
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        if (data) setRentals(prev => prev.map(r => r.id === id ? data : r));
        return data;
    };

    // Rental Request
    const addRentalRequest = async (request: Omit<RentalRequest, 'id'>) => {
        const { error } = await supabase.from('rental_requests').insert([request]);
        if (error) {
            addToast(error.message, 'error');
        } else {
            // No need to fetch here, public form doesn't need to see the result
        }
    };

    const updateRentalRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
        const { data, error } = await supabase.from('rental_requests').update({ status }).eq('id', id).select().single();
        if (error) {
            addToast(error.message, 'error');
            return false;
        }
        if (data) setRentalRequests(prev => prev.map(r => r.id === id ? data : r));
        return true;
    };

    const value = {
        session,
        user,
        loading,
        vehicles,
        customers,
        rentals,
        rentalRequests,
        toasts,
        login,
        logout,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addRental,
        updateRental,
        addRentalRequest,
        updateRentalRequestStatus,
        addToast,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Create a hook to use the context
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
