

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Customer } from '../types';
import { Card, Button, Input, Label, Select, Stepper, Tabs } from './ui';
import ContractView from './ContractView';

type NewCustomerData = Omit<Customer, 'id' | 'created_at'>;

const NewRentalForm: React.FC = () => {
    const { vehicles, customers, addCustomer, addRental, addToast } = useData();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [customerTab, setCustomerTab] = useState('existing'); // 'existing' or 'new'
    
    const initialNewCustomerState: NewCustomerData = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_card_number: '',
        drivers_license_number: '',
    };
    const [newCustomer, setNewCustomer] = useState<NewCustomerData>(initialNewCustomerState);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    
    const selectedVehicle = useMemo(() => vehicles.find(v => v.id === Number(selectedVehicleId)), [vehicles, selectedVehicleId]);
    const selectedCustomer = useMemo(() => customers.find(c => c.id === Number(selectedCustomerId)), [customers, selectedCustomerId]);
    
    const steps = ['Vozidlo', 'Zákazník', 'Termín & Cena', 'Shrnutí'];

    const handleNext = () => {
        // Validation for each step
        if (currentStep === 0 && !selectedVehicle) {
            addToast('Prosím, vyberte vozidlo.', 'error');
            return;
        }
        if (currentStep === 1) {
            if (customerTab === 'existing' && !selectedCustomer) {
                 addToast('Prosím, vyberte zákazníka.', 'error');
                 return;
            }
            if (customerTab === 'new' && (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.email)) {
                 addToast('Prosím, vyplňte jméno, příjmení a email nového zákazníka.', 'error');
                 return;
            }
        }
        if (currentStep === 2) {
            if (!startDate || !endDate) {
                 addToast('Prosím, vyberte datum a čas začátku i konce.', 'error');
                 return;
            }
            if (new Date(startDate) >= new Date(endDate)) {
                 addToast('Datum konce musí být po datu začátku.', 'error');
                 return;
            }
             calculatePrice();
        }
        setCurrentStep(s => s + 1);
    };
    
    const handleBack = () => setCurrentStep(s => s - 1);

    const calculatePrice = () => {
        if (!selectedVehicle || !startDate || !endDate) {
            setTotalPrice(0);
            return;
        }
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
        
        let price = 0;
        const dailyRate = selectedVehicle.pricing?.day;

        if (dailyRate) {
             const days = Math.ceil(hours / 24);
             price = days * dailyRate;
        } else {
            // Fallback or more complex logic can be added here
            price = hours * (selectedVehicle.pricing?.four_hour || 50); // a sample fallback
        }
        setTotalPrice(price);
    };
    
    const handleSubmit = async () => {
        let finalCustomerId: number | undefined = selectedCustomer?.id;

        if (customerTab === 'new') {
            const createdCustomer = await addCustomer(newCustomer);
            if (!createdCustomer) {
                addToast('Nepodařilo se vytvořit nového zákazníka.', 'error');
                return;
            }
            finalCustomerId = createdCustomer.id;
        }
        
        if (!selectedVehicle || !finalCustomerId || !startDate || !endDate || totalPrice <= 0) {
            addToast('Chybí potřebné údaje pro vytvoření zápůjčky.', 'error');
            return;
        }
        
        const newRentalData = {
            vehicle_id: selectedVehicle.id,
            customer_id: finalCustomerId,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            total_price: totalPrice,
            status: 'pending' as const,
        };

        const result = await addRental(newRentalData);

        if (result) {
            addToast('Nová zápůjčka byla úspěšně vytvořena.', 'success');
            navigate(`/rentals/contract/${result.id}`);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Nová zápůjčka</h1>
            <Card className="mb-6">
                <Stepper steps={steps} currentStep={currentStep} />
            </Card>

            {/* Step 1: Vehicle Selection */}
            {currentStep === 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Krok 1: Vyberte vozidlo</h2>
                    <Label htmlFor="vehicle">Vozidlo</Label>
                    <Select id="vehicle" value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                        <option value="">-- Vyberte vozidlo --</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} - {v.license_plate}</option>)}
                    </Select>
                </Card>
            )}
            
            {/* Step 2: Customer Selection */}
            {currentStep === 1 && (
                <Card>
                     <h2 className="text-xl font-bold mb-4">Krok 2: Vyberte zákazníka</h2>
                     <Tabs 
                        tabs={[{id: 'existing', label: 'Existující zákazník'}, {id: 'new', label: 'Nový zákazník'}]}
                        activeTab={customerTab}
                        setActiveTab={setCustomerTab}
                     />
                     <div className="mt-4">
                        {customerTab === 'existing' && (
                            <div>
                                <Label htmlFor="customer">Zákazník</Label>
                                <Select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                                     <option value="">-- Vyberte zákazníka --</option>
                                     {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
                                </Select>
                            </div>
                        )}
                        {customerTab === 'new' && (
                            <div className="space-y-4">
                                <Input name="first_name" placeholder="Jméno" value={newCustomer.first_name} onChange={e => setNewCustomer(p => ({...p, first_name: e.target.value}))} />
                                <Input name="last_name" placeholder="Příjmení" value={newCustomer.last_name} onChange={e => setNewCustomer(p => ({...p, last_name: e.target.value}))} />
                                <Input name="email" type="email" placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer(p => ({...p, email: e.target.value}))} />
                                <Input name="phone" placeholder="Telefon" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))} />
                                <Input name="id_card_number" placeholder="Číslo OP" value={newCustomer.id_card_number} onChange={e => setNewCustomer(p => ({...p, id_card_number: e.target.value}))} />
                                <Input name="drivers_license_number" placeholder="Číslo ŘP" value={newCustomer.drivers_license_number} onChange={e => setNewCustomer(p => ({...p, drivers_license_number: e.target.value}))} />
                            </div>
                        )}
                     </div>
                </Card>
            )}

            {/* Step 3: Date & Price */}
            {currentStep === 2 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Krok 3: Zvolte termín a spočítejte cenu</h2>
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
                    <div className="mt-4">
                         <Button onClick={calculatePrice}>Spočítat cenu</Button>
                         {totalPrice > 0 && <p className="mt-4 text-lg font-bold">Celková cena: {totalPrice} Kč</p>}
                    </div>
                </Card>
            )}

            {/* Step 4: Summary */}
            {currentStep === 3 && (
                <Card>
                     <h2 className="text-xl font-bold mb-4">Krok 4: Shrnutí a vytvoření smlouvy</h2>
                     <ContractView 
                        previewRental={{
                            start_date: startDate,
                            end_date: endDate,
                            total_price: totalPrice,
                            status: 'pending'
                        }}
                        vehicle={selectedVehicle}
                        customer={customerTab === 'new' ? { ...newCustomer, id: 0, created_at: '' } : selectedCustomer}
                     />
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
                {currentStep > 0 && <Button onClick={handleBack} variant="secondary">Zpět</Button>}
                <div />
                {currentStep < steps.length - 1 && <Button onClick={handleNext}>Další</Button>}
                {currentStep === steps.length - 1 && <Button onClick={handleSubmit}>Vytvořit zápůjčku</Button>}
            </div>
        </div>
    );
};

export default NewRentalForm;