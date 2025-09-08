import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Input } from './ui';
import { useNavigate } from 'react-router-dom';

const Rentals: React.FC = () => {
    const { rentals, vehicles, customers } = useData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const getVehicleName = (id: number) => vehicles.find(v => v.id === id)?.brand ?? 'Neznámé';
    const getCustomerName = (id: number) => {
        const customer = customers.find(c => c.id === id);
        return customer ? `${customer.first_name} ${customer.last_name}` : 'Neznámý';
    };

    const statusStyles: { [key: string]: string } = {
        active: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
    };
    
    const statusText: { [key: string]: string } = {
        active: 'Aktivní',
        completed: 'Dokončená',
        pending: 'Čekající',
    };
    
    const filteredRentals = rentals.filter(rental => {
        const customerName = getCustomerName(rental.customer_id).toLowerCase();
        const vehicleName = getVehicleName(rental.vehicle_id).toLowerCase();
        const term = searchTerm.toLowerCase();
        return customerName.includes(term) || vehicleName.includes(term);
    }).sort((a,b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Zápůjčky</h1>
                <div className="flex items-center space-x-4">
                     <Input 
                        placeholder="Hledat půjčovné..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Button onClick={() => navigate('/rentals/new')}>
                        Vytvořit novou zápůjčku
                    </Button>
                </div>
            </div>
            
            <Card>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-4">Vozidlo</th>
                                <th className="p-4">Zákazník</th>
                                <th className="p-4">Od</th>
                                <th className="p-4">Do</th>
                                <th className="p-4">Cena</th>
                                <th className="p-4">Stav</th>
                                <th className="p-4">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRentals.map(rental => (
                                <tr key={rental.id} className="border-b border-border last:border-b-0 hover:bg-background">
                                    <td className="p-4">{getVehicleName(rental.vehicle_id)}</td>
                                    <td className="p-4">{getCustomerName(rental.customer_id)}</td>
                                    <td className="p-4">{new Date(rental.start_date).toLocaleString()}</td>
                                    <td className="p-4">{new Date(rental.end_date).toLocaleString()}</td>
                                    <td className="p-4">{rental.total_price} Kč</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[rental.status]}`}>
                                            {statusText[rental.status]}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Button onClick={() => navigate(`/rentals/contract/${rental.id}`)} variant="secondary">
                                            Zobrazit smlouvu
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredRentals.length === 0 && <p className="p-4 text-center">Nebyly nalezeny žádné zápůjčky.</p>}
                </div>
            </Card>
        </div>
    );
};

export default Rentals;
