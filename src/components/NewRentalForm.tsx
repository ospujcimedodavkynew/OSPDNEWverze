import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button, Card, Input, Label, Stepper, Tabs, SecondaryButton } from './ui';
import { Customer, Rental, Vehicle } from '../types';
import SignaturePad from './SignaturePad';
import ContractView from './ContractView';

type Step = 'date' | 'vehicle' | 'customer' | 'contract' | 'confirm';

const CreateRentalWizard: React.FC = () => {
    const navigate = useNavigate();
    const { vehicles, customers, rentals, addRental, addCustomer, addToast, sendContractByEmail } = useData();

    const [currentStep, setCurrentStep] = useState<Step>('date');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
    const [endDate, setEndDate] = useState('');
    const [duration, setDuration] = useState<{ type: string; value: number }>({ type: 'day', value: 1 });

    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    
    const [customerSignature, setCustomerSignature] = useState<string | null>(null);
    const [companySignature, setCompanySignature] = useState<string | null>(null);

    const [newRental, setNewRental] = useState<Rental | null>(null);

    const availableVehicles = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return vehicles.filter(vehicle => {
            return !rentals.some(rental => {
                if (rental.vehicle_id !== vehicle.id) return false;
                const rentalStart = new Date(rental.start_date).getTime();
                const rentalEnd = new Date(rental.end_date).getTime();
                return Math.max(start, rentalStart) < Math.min(end, rentalEnd);
            });
        });
    }, [startDate, endDate, vehicles, rentals]);

     const totalPrice = useMemo(() => {
        if (!selectedVehicle || !duration.value) return 0;
        const pricing = selectedVehicle.pricing;
        if (duration.type === 'hour_4' && pricing.four_hour) return pricing.four_hour;
        if (duration.type === 'hour_12' && pricing.twelve_hour) return pricing.twelve_hour;
        if (duration.type === 'day' && pricing.day) return duration.value * pricing.day;
        if (duration.type === 'month' && pricing.month) return pricing.month;
        return 0;
    }, [selectedVehicle, duration]);

    const handleDateSubmit = (sDate: string, eDate: string) => {
        setStartDate(sDate);
        setEndDate(eDate);
        setCurrentStep('vehicle');
    };
    
    const handleVehicleSelect = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setCurrentStep('customer');
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCurrentStep('contract');
    }

    const handleContractSubmit = async () => {
        if (!selectedVehicle || !selectedCustomer || !startDate || !endDate || !customerSignature) {
            addToast("Chybí povinné údaje nebo podpis nájemce.", "error");
            return;
        }

        const rentalData: Omit<Rental, 'id'> = {
            vehicle_id: selectedVehicle.id,
            customer_id: selectedCustomer.id,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            total_price: totalPrice,
            status: 'active',
            customer_signature: customerSignature,
            company_signature: companySignature,
            digital_consent_at: new Date().toISOString(),
        };

        const createdRental = await addRental(rentalData);
        if (createdRental) {
            setNewRental(createdRental);
            addToast("Zápůjčka byla úspěšně vytvořena.", "success");
            await sendContractByEmail(createdRental.id);
            setCurrentStep('confirm');
        } else {
             addToast("Nepodařilo se vytvořit zápůjčku.", "error");
        }
    };


    const renderStep = () => {
        switch (currentStep) {
            case 'date':
                return <DateStep onSubmit={handleDateSubmit} setDuration={setDuration} duration={duration} startDate={startDate} setStartDate={setStartDate} />;
            case 'vehicle':
                return <VehicleStep 
                            availableVehicles={availableVehicles} 
                            allVehicles={vehicles} 
                            onSelect={handleVehicleSelect} 
                            onBack={() => setCurrentStep('date')} 
                        />;
            case 'customer':
                return <CustomerStep 
                            customers={customers} 
                            onSelect={handleCustomerSelect} 
                            addCustomer={addCustomer}
                            onBack={() => setCurrentStep('vehicle')}
                            addToast={addToast}
                        />;
            case 'contract':
                // FIX: Corrected type to use snake_case 'total_price' to match the Rental type and object literal.
                const previewRental: Partial<Rental> & {total_price: number} = {
                    start_date: startDate, end_date: endDate, total_price: totalPrice,
                }
                return <ContractStep 
                            rental={previewRental}
                            vehicle={selectedVehicle}
                            customer={selectedCustomer}
                            onBack={() => setCurrentStep('customer')}
                            onSubmit={handleContractSubmit}
                            setCustomerSignature={setCustomerSignature}
                            setCompanySignature={setCompanySignature}
                        />;
            case 'confirm':
                return <ConfirmationStep rentalId={newRental?.id} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Nová zápůjčka</h1>
            <Stepper
                currentStep={['date', 'vehicle', 'customer', 'contract', 'confirm'].indexOf(currentStep)}
                steps={['Termín', 'Vozidlo', 'Zákazník', 'Smlouva', 'Hotovo']}
            />
            <div className="mt-8">{renderStep()}</div>
        </div>
    );
};

// --- Child Components for Steps ---

const DateStep = ({ onSubmit, setDuration, duration, startDate, setStartDate }: { onSubmit: (start: string, end: string) => void, setDuration: any, duration: any, startDate: string, setStartDate: (date: string) => void }) => {
    const [numDays, setNumDays] = useState(1);

    const calculateEnd = () => {
        const sDate = new Date(startDate);
        if(!sDate.getTime()) return '';
        if (duration.type === 'hour_4') return new Date(sDate.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0,16);
        if (duration.type === 'hour_12') return new Date(sDate.getTime() + 12 * 60 * 60 * 1000).toISOString().slice(0,16);
        if (duration.type === 'day') return new Date(sDate.getTime() + numDays * 24 * 60 * 60 * 1000).toISOString().slice(0,16);
        if (duration.type === 'month') return new Date(sDate.setMonth(sDate.getMonth() + 1)).toISOString().slice(0,16);
        return '';
    };

    const handleDurationChange = (type: string) => {
        const value = type === 'day' ? numDays : 1;
        setDuration({ type, value });
    }

    const isFormValid = startDate && calculateEnd();

    return (
        <Card>
            <div className="space-y-4">
                <div>
                    <Label>Začátek pronájmu</Label>
                    <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                    <Label>Délka pronájmu</Label>
                    <div className="flex space-x-2 mt-1">
                        <Button onClick={() => handleDurationChange('hour_4')} variant={duration.type === 'hour_4' ? 'primary' : 'secondary'}>4 hodiny</Button>
                        <Button onClick={() => handleDurationChange('hour_12')} variant={duration.type === 'hour_12' ? 'primary' : 'secondary'}>12 hodin</Button>
                        <Button onClick={() => handleDurationChange('day')} variant={duration.type === 'day' ? 'primary' : 'secondary'}>Na dny</Button>
                        <Button onClick={() => handleDurationChange('month')} variant={duration.type === 'month' ? 'primary' : 'secondary'}>Měsíc</Button>
                    </div>
                </div>
                {duration.type === 'day' && (
                    <div>
                        <Label>Počet dní (1-29)</Label>
                        <Input type="number" min="1" max="29" value={numDays} onChange={e => setNumDays(parseInt(e.target.value) || 1)} />
                    </div>
                )}
                <div className="pt-4 text-lg font-semibold">
                    <p>Konec pronájmu: {isFormValid ? new Date(calculateEnd()).toLocaleString() : '...'}</p>
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => onSubmit(startDate, calculateEnd())} disabled={!isFormValid}>Vyhledat vozidla</Button>
                </div>
            </div>
        </Card>
    );
};

const VehicleStep = ({ availableVehicles, allVehicles, onSelect, onBack }: { availableVehicles: Vehicle[], allVehicles: Vehicle[], onSelect: (v: Vehicle) => void, onBack: () => void }) => {
    return (
         <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allVehicles.map(vehicle => {
                    const isAvailable = availableVehicles.some(av => av.id === vehicle.id);
                    return (
                        <Card 
                            key={vehicle.id}
                            onClick={isAvailable ? () => onSelect(vehicle) : undefined}
                            className={`transition-all ${isAvailable ? 'cursor-pointer hover:shadow-xl hover:border-primary' : 'opacity-50 bg-background'}`}
                        >
                            <h3 className="font-bold text-lg">{vehicle.brand}</h3>
                            <p className="text-text-secondary">{vehicle.license_plate}</p>
                            {!isAvailable && <p className="text-red-500 font-bold mt-2">V tomto termínu obsazeno</p>}
                        </Card>
                    );
                })}
            </div>
            <div className="flex justify-start">
                 <SecondaryButton onClick={onBack}>Zpět</SecondaryButton>
            </div>
        </div>
    );
};

const CustomerStep = ({ customers, onSelect, addCustomer, onBack, addToast }: { customers: Customer[], onSelect: (c: Customer) => void, addCustomer: (c: Omit<Customer, 'id'|'created_at'>) => Promise<Customer|null>, onBack: () => void, addToast: (message: string, type: 'success' | 'error' | 'info') => void }) => {
    const [activeTab, setActiveTab] = useState('existing');
    const [searchTerm, setSearchTerm] = useState('');
    const [formState, setFormState] = useState({ first_name: '', last_name: '', email: '', phone: '', id_card_number: '', drivers_license_number: '' });

    const filteredCustomers = customers.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleCreateCustomer = async () => {
        const newCustomer = await addCustomer(formState);
        if (newCustomer) {
            addToast("Zákazník úspěšně vytvořen", "success");
            onSelect(newCustomer);
        }
    };

    return (
        <Card>
            <Tabs tabs={[{id: 'existing', label: 'Existující zákazník'}, {id: 'new', label: 'Nový zákazník'}]} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {activeTab === 'existing' ? (
                    <div>
                        <Input placeholder="Hledat zákazníka (jméno, email)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <ul className="mt-4 max-h-64 overflow-y-auto divide-y divide-border border rounded-md">
                            {filteredCustomers.map(c => <li key={c.id} onClick={() => onSelect(c)} className="p-3 hover:bg-background cursor-pointer">{c.first_name} {c.last_name} ({c.email})</li>)}
                             {filteredCustomers.length === 0 && <li className="p-3 text-center text-text-secondary">Žádný zákazník nenalezen.</li>}
                        </ul>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="first_name" placeholder="Jméno" value={formState.first_name} onChange={handleInputChange} />
                            <Input name="last_name" placeholder="Příjmení" value={formState.last_name} onChange={handleInputChange} />
                        </div>
                        <Input name="email" type="email" placeholder="Email" value={formState.email} onChange={handleInputChange} />
                        <Input name="phone" placeholder="Telefon" value={formState.phone} onChange={handleInputChange} />
                        <Input name="id_card_number" placeholder="Číslo OP" value={formState.id_card_number} onChange={handleInputChange} />
                        <Input name="drivers_license_number" placeholder="Číslo ŘP" value={formState.drivers_license_number} onChange={handleInputChange} />
                        <Button onClick={handleCreateCustomer}>Vytvořit a vybrat zákazníka</Button>
                    </div>
                )}
            </div>
             <div className="flex justify-start mt-4">
                 <SecondaryButton onClick={onBack}>Zpět</SecondaryButton>
            </div>
        </Card>
    );
};

const ContractStep = ({ rental, vehicle, customer, onBack, onSubmit, setCustomerSignature, setCompanySignature }: any) => {
    const [showCustomerSign, setShowCustomerSign] = useState(false);
    const [showCompanySign, setShowCompanySign] = useState(false);
    const [customerSignData, setCustomerSignData] = useState<string|null>(null);
    const [companySignData, setCompanySignData] = useState<string|null>(null);

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Souhrn a podpis smlouvy</h2>
            <div className="max-h-[50vh] overflow-y-auto border rounded-md p-4">
                <ContractView previewRental={rental} vehicle={vehicle} customer={customer} />
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="font-bold">Podpis nájemce</h3>
                    {customerSignData ? <img src={customerSignData} className="border rounded-md" /> : (showCustomerSign ? <SignaturePad onSave={(data) => {setCustomerSignature(data); setCustomerSignData(data); setShowCustomerSign(false);}} onCancel={() => setShowCustomerSign(false)} /> : <Button onClick={() => setShowCustomerSign(true)}>Podepsat</Button>)}
                </div>
                 <div>
                    <h3 className="font-bold">Podpis pronajímatele</h3>
                    {companySignData ? <img src={companySignData} className="border rounded-md" /> : (showCompanySign ? <SignaturePad onSave={(data) => {setCompanySignature(data); setCompanySignData(data); setShowCompanySign(false);}} onCancel={() => setShowCompanySign(false)} /> : <Button onClick={() => setShowCompanySign(true)}>Podepsat</Button>)}
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <SecondaryButton onClick={onBack}>Zpět</SecondaryButton>
                <Button onClick={onSubmit} disabled={!customerSignData}>Vytvořit zápůjčku a odeslat smlouvu</Button>
            </div>
        </Card>
    );
}

const ConfirmationStep = ({ rentalId }: { rentalId?: number }) => {
    const navigate = useNavigate();
    return (
        <Card className="text-center">
            <h2 className="text-2xl font-bold text-green-600">Hotovo!</h2>
            <p className="mt-2">Zápůjčka byla úspěšně vytvořena v systému a e-mail se smlouvou byl odeslán.</p>
            <div className="mt-6 space-x-2">
                <Button onClick={() => navigate('/rentals')}>Zpět na přehled</Button>
                {rentalId && <SecondaryButton onClick={() => navigate(`/rentals/contract/${rentalId}`)}>Zobrazit vytvořenou smlouvu</SecondaryButton>}
            </div>
        </Card>
    );
};

export default CreateRentalWizard;