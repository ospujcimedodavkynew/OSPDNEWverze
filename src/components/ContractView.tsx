import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, Button } from './ui';
import SignaturePad from './SignaturePad';
import { Rental, Vehicle, Customer } from '../types';

interface ContractViewProps {
    previewRental?: Omit<Rental, 'id'|'created_at'>;
    vehicle?: Vehicle | null;
    customer?: Customer | null;
    onCustomerSign?: (signature: string) => void;
    onCompanySign?: (signature: string) => void;
}

const ContractView: React.FC<ContractViewProps> = ({ previewRental, vehicle: propVehicle, customer: propCustomer, onCustomerSign, onCompanySign }) => {
    const { id } = useParams<{ id: string }>();
    const { rentals, vehicles, customers, updateRentalSignatures, addToast } = useData();
    
    const [rental, setRental] = useState<Rental | Omit<Rental, 'id'|'created_at'> | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isSigningCustomer, setIsSigningCustomer] = useState(false);
    const [isSigningCompany, setIsSigningCompany] = useState(false);
    
    const isPreview = !!previewRental;

    useEffect(() => {
        if (isPreview) {
            setRental(previewRental);
            setVehicle(propVehicle || null);
            setCustomer(propCustomer || null);
        } else if (id) {
            const rentalId = parseInt(id, 10);
            const currentRental = rentals.find(r => r.id === rentalId);
            if (currentRental) {
                setRental(currentRental);
                setVehicle(vehicles.find(v => v.id === currentRental.vehicle_id) || null);
                setCustomer(customers.find(c => c.id === currentRental.customer_id) || null);
            }
        }
    }, [id, rentals, vehicles, customers, previewRental, propVehicle, propCustomer, isPreview]);

    const handleSaveSignature = async (signatureType: 'customer' | 'company', dataUrl: string) => {
        if (isPreview) {
            if (signatureType === 'customer' && onCustomerSign) onCustomerSign(dataUrl);
            if (signatureType === 'company' && onCompanySign) onCompanySign(dataUrl);
        } else if ('id' in rental!) {
            const currentRental = rental as Rental;
            const signatures = {
                customer_signature: signatureType === 'customer' ? dataUrl : currentRental.customer_signature,
                company_signature: signatureType === 'company' ? dataUrl : currentRental.company_signature,
            };
            const updatedRental = await updateRentalSignatures(currentRental.id, signatures);
            if (updatedRental) {
                setRental(updatedRental);
                addToast('Podpis byl uložen.', 'success');
            }
        }
        setIsSigningCustomer(false);
        setIsSigningCompany(false);
    };

    if (!rental || !vehicle || !customer) {
        return <div className="text-center p-8">Načítání smlouvy...</div>;
    }

    return (
        <Card className="prose max-w-none">
            <h2>Smlouva o pronájmu motorového vozidla č. {isPreview ? 'XXXX' : ('id' in rental && rental.id)}</h2>
            <hr/>
            <h3>I. Smluvní strany</h3>
            <div className="grid grid-cols-2 gap-4 not-prose">
                <div>
                    <strong>Pronajímatel:</strong>
                    <address className="not-italic">
                        Milan Gula<br/>
                        Ghegova 17, Brno nové sady<br/>
                        IČO: 07031653<br/>
                        Web: pujcimedodavky.cz
                    </address>
                </div>
                 <div>
                    <strong>Nájemce:</strong>
                     <address className="not-italic">
                        {customer.first_name} {customer.last_name}<br/>
                        Email: {customer.email}<br/>
                        Telefon: {customer.phone}<br/>
                        Číslo OP: {customer.id_card_number}
                    </address>
                </div>
            </div>

            <h3>II. Předmět nájmu</h3>
            <p>Pronajímatel přenechává nájemci do dočasného užívání následující motorové vozidlo:</p>
            <ul>
                <li><strong>Vozidlo:</strong> {vehicle.brand}</li>
                <li><strong>SPZ:</strong> {vehicle.license_plate}</li>
                <li><strong>VIN:</strong> {vehicle.vin}</li>
            </ul>

            <h3>III. Doba nájmu a nájemné</h3>
            <p>
                Nájem se sjednává na dobu určitou od <strong>{new Date(rental.start_date).toLocaleString()}</strong> do <strong>{new Date(rental.end_date).toLocaleString()}</strong>.
                Celkové nájemné činí <strong>{rental.total_price} Kč</strong>.
            </p>
            
            <h3>IV. Práva a povinnosti</h3>
             <ol>
                 <li>Nájemce je povinen užívat vozidlo řádně a v souladu s jeho technickým určením.</li>
                 <li>Veškeré náklady na pohonné hmoty hradí nájemce.</li>
                 <li>Nájemce není oprávněn přenechat vozidlo do užívání třetí osobě bez souhlasu pronajímatele.</li>
                 <li>V případě dopravní nehody je nájemce povinen neprodleně kontaktovat pronajímatele a Policii ČR.</li>
            </ol>
            
             <h3>V. Závěrečná ustanovení</h3>
            <p>Tato smlouva je vyhotovena ve dvou stejnopisech. Smluvní strany prohlašují, že si smlouvu přečetly, s jejím obsahem souhlasí a na důkaz toho připojují své podpisy.</p>

            <div className="grid grid-cols-2 gap-8 not-prose mt-8">
                <div>
                    <h4>Podpis nájemce (zákazníka)</h4>
                    {rental.customer_signature ? (
                        <img src={rental.customer_signature} alt="Podpis zákazníka" className="border rounded h-24 bg-white" />
                    ) : isSigningCustomer ? (
                        <SignaturePad onSave={(data) => handleSaveSignature('customer', data)} onCancel={() => setIsSigningCustomer(false)} />
                    ) : (
                        <Button onClick={() => setIsSigningCustomer(true)}>Podepsat</Button>
                    )}
                </div>
                 <div>
                    <h4>Podpis pronajímatele</h4>
                    {rental.company_signature ? (
                        <img src={rental.company_signature} alt="Podpis půjčovatele" className="border rounded h-24 bg-white" />
                    ) : isSigningCompany ? (
                        <SignaturePad onSave={(data) => handleSaveSignature('company', data)} onCancel={() => setIsSigningCompany(false)} />
                    ) : (
                        <Button onClick={() => setIsSigningCompany(true)}>Podepsat</Button>
                    )}
                </div>
            </div>
             {rental.digital_consent_at && <p className="text-xs text-gray-500 mt-4">Digitálně odsouhlaseno dne: {new Date(rental.digital_consent_at).toLocaleString()}</p>}
        </Card>
    );
};

export default ContractView;
