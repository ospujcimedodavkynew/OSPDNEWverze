import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, Button } from './ui';
import SignaturePad from './SignaturePad';
import { Rental, Vehicle, Customer } from '../types';

interface ContractViewProps {
    // FIX: Changed totalPrice to total_price to match the Rental type.
    previewRental?: Partial<Rental> & {total_price: number}; // totalPrice is calculated in wizard
    vehicle?: Vehicle | null;
    customer?: Customer | null;
}

const ContractView: React.FC<ContractViewProps> = ({ previewRental, vehicle: previewVehicle, customer: previewCustomer }) => {
    const { id: paramId } = useParams<{ id: string }>();
    const { rentals, vehicles, customers, updateRental, addToast } = useData();
    const [showCustomerSignaturePad, setShowCustomerSignaturePad] = useState(false);
    const [showCompanySignaturePad, setShowCompanySignaturePad] = useState(false);

    const isPreview = !!previewRental;
    const rental = isPreview 
        ? (previewRental as Rental) 
        : rentals.find(r => r.id === Number(paramId));
    
    if (!rental) {
        return <div>Smlouva nenalezena.</div>;
    }

    const vehicle = isPreview ? previewVehicle : vehicles.find(v => v.id === rental.vehicle_id);
    const customer = isPreview ? previewCustomer : customers.find(c => c.id === rental.customer_id);

    if (!vehicle || !customer) {
        return <div>Chybí údaje o vozidle nebo zákazníkovi.</div>;
    }
    
    const handleSaveSignature = async (type: 'customer' | 'company', dataUrl: string) => {
        if (isPreview || !rental.id) return;

        const updates: Partial<Rental> = {};
        if (type === 'customer') {
            updates.customer_signature = dataUrl;
            if(!rental.digital_consent_at) {
                 updates.digital_consent_at = new Date().toISOString();
            }
        } else {
            updates.company_signature = dataUrl;
        }
        
        const success = await updateRental(rental.id, updates);
        if(success) {
            addToast("Podpis byl uložen.", "success");
        } else {
            addToast("Podpis se nepodařilo uložit.", "error");
        }
        setShowCustomerSignaturePad(false);
        setShowCompanySignaturePad(false);
    };

    return (
        <div>
            {!isPreview && <h1 className="text-3xl font-bold mb-6">Smlouva o pronájmu vozidla #{rental.id}</h1>}
            <Card className={isPreview ? 'border-none shadow-none p-0' : ''}>
                <div className="prose max-w-none">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl !my-0">Smlouva o pronájmu vozidla</h2>
                        {!isPreview && <span className="font-mono">#{rental.id}</span>}
                    </div>

                    <hr className="!my-4" />

                    <h3>I. Smluvní strany</h3>
                    <div className="grid grid-cols-2 gap-4 not-prose text-sm">
                        <div className="border p-3 rounded-md">
                            <h4 className="font-bold text-base">Pronajímatel</h4>
                            <p className="!my-0">
                                Milan Gula<br/>
                                Ghegova 17, Brno, Nové Sady<br/>
                                IČO: 07031653<br/>
                                Web: pujcimedodavky.cz
                            </p>
                        </div>
                        <div className="border p-3 rounded-md">
                            <h4 className="font-bold text-base">Nájemce</h4>
                            <p className="!my-0">
                                {customer.first_name} {customer.last_name}<br/>
                                Email: {customer.email}<br/>
                                Telefon: {customer.phone}<br/>
                                Číslo OP: {customer.id_card_number}
                            </p>
                        </div>
                    </div>

                    <h3 className="!mt-6">II. Předmět nájmu</h3>
                    <p>
                        Pronajímatel přenechává nájemci do dočasného užívání následující motorové vozidlo:
                    </p>
                    <ul className="text-sm">
                        <li><strong>Vozidlo:</strong> {vehicle.brand}</li>
                        <li><strong>SPZ:</strong> {vehicle.license_plate}</li>
                        <li><strong>VIN:</strong> {vehicle.vin}</li>
                        <li><strong>Rok výroby:</strong> {vehicle.year}</li>
                    </ul>

                     <h3 className="!mt-6">III. Doba nájmu a nájemné</h3>
                     <p>
                        Nájem se sjednává na dobu určitou:
                     </p>
                     <ul className="text-sm">
                        <li><strong>Od:</strong> {new Date(rental.start_date).toLocaleString('cs-CZ')}</li>
                        <li><strong>Do:</strong> {new Date(rental.end_date).toLocaleString('cs-CZ')}</li>
                        <li><strong>Celková cena nájemného:</strong> {rental.total_price} Kč</li>
                     </ul>

                     <h3 className="!mt-6">IV. Práva a povinnosti</h3>
                     <p className="text-sm">Nájemce je povinen užívat vozidlo řádně a v souladu s účelem smlouvy, chránit ho před poškozením a dodržovat dopravní předpisy. Náklady na pohonné hmoty hradí nájemce. V případě nehody je nájemce povinen neprodleně kontaktovat pronajímatele a policii.</p>
                     
                     <h3 className="!mt-6">V. Závěrečná ustanovení</h3>
                     <p className="text-sm">Tato smlouva je vyhotovena ve dvou stejnopisech a nabývá platnosti a účinnosti dnem podpisu oběma smluvními stranami. Smluvní strany prohlašují, že si smlouvu přečetly, s jejím obsahem souhlasí a na důkaz toho připojují své podpisy.</p>

                    {!isPreview && (
                        <>
                             <hr className="!my-6" />
                            <h2>Podpisy</h2>
                            <div className="grid grid-cols-2 gap-8 not-prose">
                                <div>
                                    <h4 className="font-bold text-base">Podpis nájemce</h4>
                                    {rental.customer_signature ? (
                                        <img src={rental.customer_signature} alt="Podpis zákazníka" className="border p-2 rounded-md"/>
                                    ) : (
                                        <>
                                            {showCustomerSignaturePad ? (
                                                <SignaturePad 
                                                    onSave={(data) => handleSaveSignature('customer', data)} 
                                                    onCancel={() => setShowCustomerSignaturePad(false)} 
                                                />
                                            ) : (
                                                <Button onClick={() => setShowCustomerSignaturePad(true)}>Podepsat</Button>
                                            )}
                                        </>
                                    )}
                                    {rental.digital_consent_at && <p className="text-xs mt-2 text-gray-500">Digitálně podepsáno {new Date(rental.digital_consent_at).toLocaleString('cs-CZ')}</p>}
                                </div>
                                <div>
                                     <h4 className="font-bold text-base">Podpis pronajímatele</h4>
                                    {rental.company_signature ? (
                                        <img src={rental.company_signature} alt="Podpis pronajímatele" className="border p-2 rounded-md"/>
                                    ) : (
                                        <>
                                            {showCompanySignaturePad ? (
                                                <SignaturePad 
                                                    onSave={(data) => handleSaveSignature('company', data)} 
                                                    onCancel={() => setShowCompanySignaturePad(false)} 
                                                />
                                            ) : (
                                                <Button onClick={() => setShowCompanySignaturePad(true)}>Podepsat</Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ContractView;