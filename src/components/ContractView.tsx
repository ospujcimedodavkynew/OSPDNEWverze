import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, Button } from './ui';
import SignaturePad from './SignaturePad';
import { Rental, Vehicle, Customer } from '../types';

const ContractView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { rentals, vehicles, customers, updateRentalSignatures, addToast } = useData();
    
    const [rental, setRental] = useState<Rental | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isSigningCustomer, setIsSigningCustomer] = useState(false);
    const [isSigningCompany, setIsSigningCompany] = useState(false);

    useEffect(() => {
        const currentRental = rentals.find(r => r.id === id);
        if (currentRental) {
            setRental(currentRental);
            setVehicle(vehicles.find(v => v.id === currentRental.vehicle_id) || null);
            setCustomer(customers.find(c => c.id === currentRental.customer_id) || null);
        }
    }, [id, rentals, vehicles, customers]);

    const handleSaveSignature = async (signatureType: 'customer' | 'company', dataUrl: string) => {
        if (!rental) return;

        const signatures = {
            customer_signature: signatureType === 'customer' ? dataUrl : rental.customer_signature,
            company_signature: signatureType === 'company' ? dataUrl : rental.company_signature,
        };

        const updatedRental = await updateRentalSignatures(rental.id, signatures);
        if (updatedRental) {
            setRental(updatedRental);
            addToast('Podpis byl uložen.', 'success');
        } else {
            addToast('Uložení podpisu se nezdařilo.', 'error');
        }

        setIsSigningCustomer(false);
        setIsSigningCompany(false);
    };

    if (!rental || !vehicle || !customer) {
        return <div className="text-center p-8">Načítání smlouvy...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Smlouva o zápůjčce #{rental.id.substring(0, 8)}</h1>
                <Button onClick={() => window.print()} variant="secondary">Tisk</Button>
            </div>
            
            <Card className="prose max-w-none">
                <h2>Smluvní strany</h2>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3>Půjčovatel</h3>
                        <p>
                            <strong>RentalAdmin s.r.o.</strong><br />
                            Náměstí Svobody 1<br />
                            602 00 Brno<br />
                            IČO: 12345678
                        </p>
                    </div>
                    <div>
                        <h3>Zákazník</h3>
                        <p>
                            <strong>{customer.first_name} {customer.last_name}</strong><br />
                            Email: {customer.email}<br />
                            Telefon: {customer.phone}<br />
                            Číslo OP: {customer.id_card_number}
                        </p>
                    </div>
                </div>

                <h2>Předmět zápůjčky</h2>
                <p>
                    <strong>Vozidlo:</strong> {vehicle.brand}<br />
                    <strong>SPZ:</strong> {vehicle.license_plate}<br />
                    <strong>VIN:</strong> {vehicle.vin}
                </p>

                <h2>Doba zápůjčky</h2>
                <p>
                    <strong>Od:</strong> {new Date(rental.start_date).toLocaleString()}<br />
                    <strong>Do:</strong> {new Date(rental.end_date).toLocaleString()}
                </p>

                <h2>Cena</h2>
                <p>Celková cena za zápůjčku je <strong>{rental.total_price} Kč</strong>.</p>
                
                <h2>Podpisy</h2>
                <div className="grid grid-cols-2 gap-8 not-prose">
                    <div>
                        <h4>Podpis zákazníka</h4>
                        {rental.customer_signature ? (
                            <img src={rental.customer_signature} alt="Podpis zákazníka" className="border rounded" />
                        ) : isSigningCustomer ? (
                            <SignaturePad onSave={(data) => handleSaveSignature('customer', data)} onCancel={() => setIsSigningCustomer(false)} />
                        ) : (
                            <Button onClick={() => setIsSigningCustomer(true)}>Podepsat</Button>
                        )}
                    </div>
                     <div>
                        <h4>Podpis půjčovatele</h4>
                        {rental.company_signature ? (
                            <img src={rental.company_signature} alt="Podpis půjčovatele" className="border rounded" />
                        ) : isSigningCompany ? (
                            <SignaturePad onSave={(data) => handleSaveSignature('company', data)} onCancel={() => setIsSigningCompany(false)} />
                        ) : (
                            <Button onClick={() => setIsSigningCompany(true)}>Podepsat</Button>
                        )}
                    </div>
                </div>
                 {rental.digital_consent_at && <p className="text-xs text-gray-500 mt-4">Digitálně odsouhlaseno dne: {new Date(rental.digital_consent_at).toLocaleString()}</p>}
            </Card>
            <div className="mt-4">
                 <Button onClick={() => navigate('/rentals')} variant="secondary">Zpět na seznam</Button>
            </div>
        </div>
    );
};

export default ContractView;
