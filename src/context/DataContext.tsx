import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Vehicle, Customer, Rental, RentalRequest, ToastMessage } from '../types';

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
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    
    // Vehicle operations
    addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Promise<Vehicle | null>;
    updateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<Vehicle | null>;
    deleteVehicle: (id: number) => Promise<void>;

    // Customer operations
    addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'drivers_license_image_path'>) => Promise<Customer | null>;
    updateCustomer: (id: number, updates: Partial<Customer>) => Promise<Customer | null>;
    deleteCustomer: (id: number) => Promise<void>;

    // Rental operations
    addRental: (rental: Omit<Rental, 'id'>) => Promise<Rental | null>;
    updateRental: (id: number, updates: Partial<Rental>) => Promise<boolean>;

    // Rental Request operations
    addRentalRequest: (request: Omit<RentalRequest, 'id'>) => Promise<void>;
    updateRentalRequestStatus: (id: number, status: 'approved' | 'rejected') => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

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
        
        const [vehiclesRes, customersRes, rentalsRes, rentalRequestsRes] = await Promise.all([
            supabase.from('vehicles').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('rentals').select('*'),
            supabase.from('rental_requests').select('*'),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data as Vehicle[]);
        if (customersRes.data) setCustomers(customersRes.data as Customer[]);
        if (rentalsRes.data) setRentals(rentalsRes.data as Rental[]);
        if (rentalRequestsRes.data) setRentalRequests(rentalRequestsRes.data as RentalRequest[]);
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

    const logout = () => {
        supabase.auth.signOut();
    };

    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
        }, 5000);
    };

    // Vehicle operations
    const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('vehicles').insert([vehicle]).select();
        if (error) {
            addToast(`Chyba při přidávání vozidla: ${error.message}`, 'error');
            return null;
        }
        if (data) {
            setVehicles(prev => [...prev, data[0]]);
            return data[0];
        }
        return null;
    };

    const updateVehicle = async (id: number, updates: Partial<Vehicle>) => {
        const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select();
        if (error) {
            addToast(`Chyba při aktualizaci vozidla: ${error.message}`, 'error');
            return null;
        }
        if (data) {
            setVehicles(prev => prev.map(v => (v.id === id ? data[0] : v)));
            return data[0];
        }
        return null;
    };

    const deleteVehicle = async (id: number) => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) {
            addToast(`Chyba při mazání vozidla: ${error.message}`, 'error');
        } else {
            setVehicles(prev => prev.filter(v => v.id !== id));
        }
    };
    
    // Customer operations
    const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'drivers_license_image_path'>) => {
        const { data, error } = await supabase.from('customers').insert([customer]).select();
        if (error) {
            addToast(`Chyba při přidávání zákazníka: ${error.message}`, 'error');
            return null;
        }
        if(data) {
            setCustomers(prev => [...prev, data[0]]);
            return data[0];
        }
        return null;
    };

    const updateCustomer = async (id: number, updates: Partial<Customer>) => {
        const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
        if (error) {
            addToast(`Chyba při aktualizaci zákazníka: ${error.message}`, 'error');
            return null;
        }
        if (data) {
            setCustomers(prev => prev.map(c => c.id === id ? data[0] : c));
            return data[0];
        }
        return null;
    };

    const deleteCustomer = async (id: number) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) {
            addToast(`Chyba při mazání zákazníka: ${error.message}`, 'error');
        } else {
            setCustomers(prev => prev.filter(c => c.id !== id));
        }
    };

    // Rental operations
    const addRental = async (rental: Omit<Rental, 'id'>) => {
        const { data, error } = await supabase.from('rentals').insert([rental]).select();
        if (error) {
            addToast(`Chyba při vytváření zápůjčky: ${error.message}`, 'error');
            return null;
        }
        if (data) {
            setRentals(prev => [...prev, data[0]]);
            return data[0];
        }
        return null;
    };

    const updateRental = async (id: number, updates: Partial<Rental>) => {
        const { data, error } = await supabase.from('rentals').update(updates).eq('id', id).select();
        if (error) {
            addToast(`Chyba při aktualizaci zápůjčky: ${error.message}`, 'error');
            return false;
        }
        if (data) {
            setRentals(prev => prev.map(r => r.id === id ? data[0] : r));
            return true;
        }
        return false;
    };

    // Rental Request operations
    const addRentalRequest = async (request: Omit<RentalRequest, 'id'>) => {
        const { error } = await supabase.from('rental_requests').insert([request]);
        if (error) {
            addToast(`Chyba při odeslání žádosti: ${error.message}`, 'error');
        } else {
            // No need to update state, it's a public form
        }
    };
    
    const updateRentalRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
        const { data, error } = await supabase.from('rental_requests').update({ status }).eq('id', id).select();
        if (error) {
            addToast(`Chyba při aktualizaci žádosti: ${error.message}`, 'error');
            return false;
        }
        if (data) {
            setRentalRequests(prev => prev.map(req => (req.id === id ? data[0] : req)));
            return true;
        }
        return false;
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
        addToast,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addRental,
        updateRental,
        addRentalRequest,
        updateRentalRequestStatus
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
