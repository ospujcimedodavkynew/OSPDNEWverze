import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Label, Stepper, Tabs, SecondaryButton, Select } from './ui';
import ContractView from './ContractView';
import { Rental, Customer } from '../types';

// Step 1: Date and Vehicle Selection
const DateTimeStep = ({ onNext }: { onNext: (vehicleId: number, startDate: Date, endDate: Date, duration: string, price: number) => void }) => {
    const { vehicles, rentals } = useData();
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [duration, setDuration] = useState('day');
    const [days, setDays] = useState(1);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

    const { startDateTime, endDateTime, totalPrice } = useMemo(() => {
        if (!startDate || !startTime || !selectedVehicleId) return { startDateTime: null, endDateTime: null, totalPrice: 0 };

        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        if (!vehicle) return { startDateTime: null, endDateTime: null, totalPrice: 0 };
        
        const start = new Date(`${startDate}T${startTime}`);
        let end = new Date(start);
        let price = 0;

        switch (duration) {
            case 'four_hour':
                end.setHours(start.getHours() + 4);
                price = vehicle.pricing.four_hour || 0;
                break;
            case 'twelve_hour':
                end.setHours(start.getHours() + 12);
                price = vehicle.pricing.twelve_hour || 0;
                break;
            case 'month':
                 end.setMonth(start.getMonth() + 1);
                 price = vehicle.pricing.month || 0;
                 break;
            case 'day':
                end.setDate(start.getDate() + days);
                price = (vehicle.pricing.day || 0) * days;
                break;
        }
        return { startDateTime: start, endDateTime: end, totalPrice: price };
    }, [startDate, startTime, duration, days, selectedVehicleId, vehicles]);

    const isVehicleAvailable = (vehicleId: number) => {
        if (!startDateTime || !endDateTime) return true; // Can't check without a date
        return !rentals.some(rental =>
            rental.vehicle_id === vehicleId &&
            new Date(rental.start_date) < endDateTime &&
            new Date(rental.end_date) > startDateTime
        );
    };
    
    const handleNext = () => {
        if (selectedVehicleId && startDateTime && endDateTime && totalPrice > 0) {
            onNext(selectedVehicleId, startDateTime, endDateTime, duration, totalPrice);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Krok 1: Termín a výběr vozidla</h2>
            <div className="grid grid-cols-2 gap-4">
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Select value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="four_hour">4 hodiny</option>
                    <option value="twelve_hour">12 hodin</option>
                    <option value="day">Na dny</option>
                    <option value="month">Na měsíc</option>
                </Select>
                {duration === 'day' && <Input type="number" min="1" max="29" value={days} onChange={e => setDays(parseInt(e.target.value, 10))} />}
            </div>
            
            {startDate && startTime && (
                 <div>
                    <h3 className="font-bold mt-4 mb-2">Dostupná vozidla</h3>
                    <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                        {vehicles.map(v => {
                             const available = isVehicleAvailable(v.id);
                             return (
                                <Card key={v.id} onClick={() => available && setSelectedVehicleId(v.id)} 
                                      className={`cursor-pointer transition-all ${selectedVehicleId === v.id ? 'ring-2 ring-primary' : ''} ${!available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background'}`}>
                                    <p className="font-bold">{v.brand}</p>
                                    {!available && <p className="text-sm text-red-500">V tomto termínu obsazeno</p>}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
            
            {totalPrice > 0 && <p className="text-lg font-bold">Vypočtená cena: {totalPrice} Kč</p>}

            <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!selectedVehicleId || !startDateTime || !endDateTime || totalPrice <= 0}>Další krok</Button>
            </div>
        </div>
    );
};


// Step 2: Customer Selection
const CustomerStep = ({ onNext, onBack }: { onNext: (customer: Customer) => void; onBack: () => void; }) => {
    const { customers, addCustomer, addToast } = useData();
    const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [newCustomerData, setNewCustomerData] = useState({
        first_name: '', last_name: '', email: '', phone: '', id_card_number: '', drivers_license_number: ''
    });

    const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCustomerData({ ...newCustomerData, [e.target.name]: e.target.value });
    };

    const handleCreateCustomer = async () => {
        const created = await addCustomer(newCustomerData);
        if (created) {
            addToast("Zákazník úspěšně vytvořen.", "success");
            onNext(created);
        }
    };
    
    const filteredCustomers = customers.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Krok 2: Zákazník</h2>
            <Tabs tabs={[{ id: 'existing', label: 'Existující' }, { id: 'new', label: 'Nový' }]} activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'existing' && (
                <div>
                    <Input placeholder="Hledat zákazníka..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-2"/>
                    <div className="max-h-64 overflow-y-auto border border-border rounded-md">
                        {filteredCustomers.map(c => (
                            <div key={c.id} onClick={() => setSelectedCustomerId(c.id)} className={`p-3 cursor-pointer ${selectedCustomerId === c.id ? 'bg-primary text-white' : 'hover:bg-background'}`}>
                                <p className="font-bold">{c.first_name} {c.last_name}</p>
                                <p className="text-sm">{c.email}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'new' && (
                <div className="space-y-2">
                    <Input name="first_name" placeholder="Jméno" value={newCustomerData.first_name} onChange={handleNewCustomerChange} />
                    <Input name="last_name" placeholder="Příjmení" value={newCustomerData.last_name} onChange={handleNewCustomerChange} />
                    <Input name="email" type="email" placeholder="Email" value={newCustomerData.email} onChange={handleNewCustomerChange} />
                    <Input name="phone" placeholder="Telefon" value={newCustomerData.phone} onChange={handleNewCustomerChange} />
                    <Input name="id_card_number" placeholder="Číslo OP" value={newCustomerData.id_card_number} onChange={handleNewCustomerChange} />
                    <Input name="drivers_license_number" placeholder="Číslo ŘP" value={newCustomerData.drivers_license_number} onChange={handleNewCustomerChange} />
                </div>
            )}

            <div className="flex justify-between">
                <SecondaryButton onClick={onBack}>Zpět</SecondaryButton>
                {activeTab === 'existing' && <Button onClick={() => onNext(customers.find(c=> c.id === selectedCustomerId)!)} disabled={!selectedCustomerId}>Další krok</Button>}
                {activeTab === 'new' && <Button onClick={handleCreateCustomer}>Vytvořit a pokračovat</Button>}
            </div>
        </div>
    );
};


// Step 3: Contract and Signing
const ContractStep = ({ rentalData, onBack, onSubmit }: { rentalData: Omit<Rental, 'id' | 'created_at'>, onBack: () => void; onSubmit: (signatures: { customer: string, company: string }) => void; }) => {
    const { vehicles, customers } = useData();
    const [customerSignature, setCustomerSignature] = useState<string | null>(null);
    const [companySignature, setCompanySignature] = useState<string | null>(null);
    
    const vehicle = vehicles.find(v => v.id === rentalData.vehicle_id);
    const customer = customers.find(c => c.id === rentalData.customer_id);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Krok 3: Souhrn a podpis</h2>
            <ContractView 
                previewRental={rentalData}
                vehicle={vehicle}
                customer={customer}
                onCustomerSign={setCustomerSignature}
                onCompanySign={setCompanySignature}
            />
            <div className="flex justify-between mt-4">
                <SecondaryButton onClick={onBack}>Zpět</SecondaryButton>
                <Button onClick={() => onSubmit({ customer: customerSignature!, company: companySignature!})} disabled={!customerSignature || !companySignature}>
                    Vytvořit zápůjčku a odeslat
                </Button>
            </div>
        </div>
    );
};

// Main Wizard Component
const CreateRentalWizard: React.FC = () => {
    const { addRental } = useData();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [rentalData, setRentalData] = useState<Partial<Omit<Rental, 'id' | 'created_at'>>>({});

    const handleDateTimeNext = (vehicleId: number, startDate: Date, endDate: Date, duration: string, price: number) => {
        setRentalData({
            vehicle_id: vehicleId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            total_price: price,
            status: 'pending',
        });
        setStep(2);
    };

    const handleCustomerNext = (customer: Customer) => {
        setRentalData(prev => ({ ...prev, customer_id: customer.id }));
        setStep(3);
    };

    const handleSubmit = async (signatures: { customer: string, company: string }) => {
        const finalRentalData = {
            ...rentalData,
            customer_signature: signatures.customer,
            company_signature: signatures.company,
            digital_consent_at: new Date().toISOString(),
            status: 'active' as const
        };
        
        const result = await addRental(finalRentalData as Omit<Rental, 'id'|'created_at'>);
        if (result) {
            navigate(`/rentals/contract/${result.id}`);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Nová zápůjčka</h1>
            <Stepper steps={['Termín a vozidlo', 'Zákazník', 'Smlouva']} currentStep={step} />
            <Card className="mt-6">
                {step === 1 && <DateTimeStep onNext={handleDateTimeNext} />}
                {step === 2 && <CustomerStep onNext={handleCustomerNext} onBack={() => setStep(1)} />}
                {step === 3 && <ContractStep rentalData={rentalData as Omit<Rental, 'id'|'created_at'>} onBack={() => setStep(2)} onSubmit={handleSubmit}/>}
            </Card>
        </div>
    );
};

export default CreateRentalWizard;
