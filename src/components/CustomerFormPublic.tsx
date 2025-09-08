import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button, Card, Input, Label } from './ui';
import { RentalRequest } from '../types';

const CustomerFormPublic: React.FC = () => {
    const { addRentalRequest } = useData();
    const [customerDetails, setCustomerDetails] = useState<Omit<RentalRequest, 'id' | 'drivers_license_image_base64' | 'digital_consent_at' | 'status'>>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_card_number: '',
        drivers_license_number: '',
    });
    const [driversLicenseImage, setDriversLicenseImage] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setDriversLicenseImage(event.target?.result?.toString().split(',')[1] || null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert('Musíte souhlasit se zpracováním osobních údajů.');
            return;
        }
        addRentalRequest({
            ...customerDetails,
            drivers_license_image_base64: driversLicenseImage,
            digital_consent_at: new Date().toISOString(),
            status: 'pending',
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-full max-w-lg text-center">
                    <h1 className="text-2xl font-bold mb-4">Děkujeme!</h1>
                    <p>Vaše žádost byla odeslána. Brzy se vám ozveme.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
            <Card className="w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-6">Žádost o zapůjčení vozidla</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="first_name">Jméno</Label>
                            <Input id="first_name" name="first_name" value={customerDetails.first_name} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <Label htmlFor="last_name">Příjmení</Label>
                            <Input id="last_name" name="last_name" value={customerDetails.last_name} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={customerDetails.email} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" name="phone" value={customerDetails.phone} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="id_card_number">Číslo OP</Label>
                        <Input id="id_card_number" name="id_card_number" value={customerDetails.id_card_number} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="drivers_license_number">Číslo ŘP</Label>
                        <Input id="drivers_license_number" name="drivers_license_number" value={customerDetails.drivers_license_number} onChange={handleInputChange} required />
                    </div>
                     <div>
                        <Label htmlFor="drivers_license_image">Snímek řidičského průkazu (přední strana)</Label>
                        <Input id="drivers_license_image" type="file" onChange={handleImageChange} accept="image/*" />
                    </div>
                    <div className="flex items-start">
                         <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary-focus border-gray-300 rounded mt-1" />
                        <div className="ml-2 text-sm">
                            <Label htmlFor="consent">
                                Souhlasím se zpracováním osobních údajů.
                            </Label>
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Odeslat žádost</Button>
                </form>
            </Card>
        </div>
    );
};

export default CustomerFormPublic;