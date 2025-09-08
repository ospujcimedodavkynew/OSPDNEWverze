import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Label } from './ui';

const NewRentalForm: React.FC = () => {
    const { vehicles, customers, addRental, addToast } = useData();
    const navigate = useNavigate();

    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

    const calculatePrice = () => {
        const vehicle = vehicles.find(v => v.id === parseInt(selectedVehicleId, 10));
        if (!vehicle || !startDate || !endDate) {
            setTotalPrice(0);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            setTotalPrice(0);
            return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const pricePerDay = vehicle.pricing?.day ?? 0;
        setTotalPrice(diffDays * pricePerDay);
    };

    useEffect(() => {
        calculatePrice();
    }, [selectedVehicleId, startDate, endDate, vehicles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicleId || !selectedCustomerId || !startDate || !endDate || totalPrice <= 0) {
            addToast('Prosím vyplňte všechny pole správně.', 'error');
            return;
        }
        
        const newRental = {
            vehicle_id: parseInt(selectedVehicleId, 10),
            customer_id: parseInt(selectedCustomerId, 10),
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            total_price: totalPrice,
            status: 'pending' as const,
        };

        const result = await addRental(newRental);
        if (result) {
            addToast('Nová zápůjčka byla úspěšně vytvořena.', 'success');
            navigate('/rentals');
        } else {
            addToast('Vytvoření zápůjčky se nezdařilo.', 'error');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Nová zápůjčka</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="vehicle">Vozidlo</Label>
                        <select
                            id="vehicle"
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="" disabled>Vyberte vozidlo</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.brand} - {v.license_plate}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="customer">Zákazník</Label>
                        <select
                            id="customer"
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="" disabled>Vyberte zákazníka</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_date">Datum a čas od</Label>
                            <Input
                                id="start_date"
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date">Datum a čas do</Label>
                            <Input
                                id="end_date"
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Celková cena</Label>
                        <p className="text-2xl font-bold">{totalPrice} Kč</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => navigate('/rentals')}>Zrušit</Button>
                        <Button type="submit">Vytvořit zápůjčku</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default NewRentalForm;