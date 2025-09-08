import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Input, Label } from './ui';
import { Customer, Vehicle, Rental } from '../types';
import ContractView from './ContractView';
import { useNavigate } from 'react-router-dom';

const NewRentalForm: React.FC = () => {
    const { vehicles, customers, addRental, addToast } = useData();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

    const selectedVehicle = vehicles.find(v => v.id === Number(selectedVehicleId));
    const selectedCustomer = customers.find(c => c.id === Number(selectedCustomerId));

    useEffect(() => {
        if (selectedVehicle && startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            if (end > start) {
                const hours = (end - start) / (1000 * 60 * 60);
                const days = Math.ceil(hours / 24);
                const pricePerDay = selectedVehicle.pricing.day || 0;
                setTotalPrice(days * pricePerDay);
            } else {
                setTotalPrice(0);
            }
        }
    }, [selectedVehicle, startDate, endDate]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!selectedVehicle || !selectedCustomer || !startDate || !endDate || totalPrice <= 0) {
            addToast("Prosím, vyplňte všechny údaje.", "error");
            return;
        }
        
        const newRental: Omit<Rental, 'id'> = {
            vehicle_id: selectedVehicle.id,
            customer_id: selectedCustomer.id,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            total_price: totalPrice,
            status: 'pending',
        };

        const result = await addRental(newRental);
        if (result) {
            addToast("Zápůjčka úspěšně vytvořena.", "success");
            navigate(`/rentals/contract/${result.id}`);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Select Vehicle & Dates
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Krok 1: Výběr vozidla a termínu</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="vehicle-select">Vozidlo</Label>
                                <select 
                                    id="vehicle-select" 
                                    value={selectedVehicleId} 
                                    onChange={e => setSelectedVehicleId(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                                >
                                    <option value="" disabled>Vyberte vozidlo...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.brand} ({v.license_plate})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Začátek zápůjčky</Label>
                                    <Input id="start_date" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">Konec zápůjčky</Label>
                                    <Input id="end_date" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>
                            {totalPrice > 0 && <p className="font-bold text-lg">Odhadovaná cena: {totalPrice} Kč</p>}
                        </div>
                    </div>
                );
            case 2: // Select Customer
                return (
                     <div>
                        <h2 className="text-xl font-bold mb-4">Krok 2: Výběr zákazníka</h2>
                        <Label htmlFor="customer-select">Zákazník</Label>
                        <select 
                            id="customer-select"
                            value={selectedCustomerId}
                            onChange={e => setSelectedCustomerId(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                        >
                            <option value="" disabled>Vyberte zákazníka...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>
                            ))}
                        </select>
                        {/* Option to create new customer could be added here */}
                    </div>
                );
            case 3: // Preview & Confirm
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Krok 3: Kontrola a potvrzení</h2>
                        <ContractView
                            previewRental={{
                                start_date: startDate,
                                end_date: endDate,
                                total_price: totalPrice,
                                status: 'pending',
                            }}
                            vehicle={selectedVehicle || null}
                            customer={selectedCustomer || null}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Nová zápůjčka</h1>
            <Card>
                {renderStep()}
                <div className="flex justify-between mt-6">
                    {step > 1 && <Button onClick={handleBack} variant="secondary">Zpět</Button>}
                    <div /> {/* Spacer */}
                    {step < 3 && <Button onClick={handleNext} disabled={!selectedVehicleId || !startDate || !endDate || (step === 2 && !selectedCustomerId) }>Další</Button>}
                    {step === 3 && <Button onClick={handleSubmit}>Vytvořit zápůjčku</Button>}
                </div>
            </Card>
        </div>
    );
};

export default NewRentalForm;
