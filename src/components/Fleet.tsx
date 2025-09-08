import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Modal, Input, Label, IconButton } from './ui';
import { Vehicle } from '../types';
import { EditIcon, TrashIcon } from './Icons';

type VehicleFormData = Omit<Vehicle, 'id' | 'created_at'>;

const Fleet: React.FC = () => {
    const { vehicles, addVehicle, updateVehicle, deleteVehicle, addToast } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState: VehicleFormData = {
        brand: '',
        license_plate: '',
        vin: '',
        year: new Date().getFullYear(),
        pricing: {},
        stk_date: '',
        insurance_info: '',
        vignette_until: '',
    };
    const [formData, setFormData] = useState<VehicleFormData>(initialFormState);

    useEffect(() => {
        if (editingVehicle) {
            setFormData({
                brand: editingVehicle.brand,
                license_plate: editingVehicle.license_plate,
                vin: editingVehicle.vin,
                year: editingVehicle.year,
                pricing: editingVehicle.pricing || {},
                stk_date: editingVehicle.stk_date,
                insurance_info: editingVehicle.insurance_info,
                vignette_until: editingVehicle.vignette_until,
            });
            setIsModalOpen(true);
        } else {
            setFormData(initialFormState);
        }
    }, [editingVehicle]);

    const handleOpenModal = (vehicle: Vehicle | null = null) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            pricing: { ...prev.pricing, [name]: parseFloat(value) || undefined }
        }));
    };

    const handleSubmit = async () => {
        if (editingVehicle) {
            const updatedVehicle = await updateVehicle(editingVehicle.id, formData);
            if(updatedVehicle) addToast("Vozidlo úspěšně aktualizováno.", "success");
        } else {
            const newVehicle = await addVehicle(formData);
            if(newVehicle) addToast("Vozidlo úspěšně přidáno.", "success");
        }
        handleCloseModal();
    };
    
    // FIX: Changed id type from number to string to match Vehicle.id type.
    const handleDelete = (id: string) => {
        if (window.confirm("Opravdu chcete smazat toto vozidlo?")) {
            deleteVehicle(id);
            addToast("Vozidlo bylo smazáno.", "info");
        }
    };
    
    const filteredVehicles = vehicles.filter(v => 
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Vozový park</h1>
                 <div className="flex items-center space-x-4">
                    <Input 
                        placeholder="Hledat vozidlo..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Button onClick={() => handleOpenModal()}>Přidat nové vozidlo</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                    <Card key={vehicle.id} className="flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold">{vehicle.brand}</h2>
                                <span className="font-mono bg-background px-2 py-1 rounded text-sm">{vehicle.license_plate}</span>
                            </div>
                            <p className="text-text-secondary">{vehicle.year}</p>
                            <div className="mt-4 text-sm space-y-1">
                                {vehicle.pricing.day && <p><strong>Denní sazba:</strong> {vehicle.pricing.day} Kč</p>}
                                {vehicle.pricing.four_hour && <p><strong>4h sazba:</strong> {vehicle.pricing.four_hour} Kč</p>}
                                {vehicle.pricing.twelve_hour && <p><strong>12h sazba:</strong> {vehicle.pricing.twelve_hour} Kč</p>}
                                {vehicle.pricing.month && <p><strong>Měsíční sazba:</strong> {vehicle.pricing.month} Kč</p>}
                                <p><strong>STK do:</strong> {new Date(vehicle.stk_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                         <div className="border-t border-border mt-4 pt-4 flex justify-end space-x-2">
                            <IconButton onClick={() => handleOpenModal(vehicle)}><EditIcon /></IconButton>
                            <IconButton onClick={() => handleDelete(vehicle.id)}><TrashIcon /></IconButton>
                        </div>
                    </Card>
                ))}
            </div>
            {filteredVehicles.length === 0 && <p className="p-4 text-center">Nebyly nalezeny žádné vozidla.</p>}


            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVehicle ? "Upravit vozidlo" : "Přidat nové vozidlo"}>
                <div className="space-y-4">
                     <Input name="brand" placeholder="Značka a model" value={formData.brand} onChange={handleChange} />
                     <Input name="license_plate" placeholder="SPZ" value={formData.license_plate} onChange={handleChange} />
                     <Input name="vin" placeholder="VIN" value={formData.vin} onChange={handleChange} />
                     <Input name="year" type="number" placeholder="Rok výroby" value={formData.year} onChange={handleChange} />
                    <Label>Ceník</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input name="four_hour" type="number" placeholder="Cena za 4h" value={formData.pricing.four_hour || ''} onChange={handlePricingChange} />
                        <Input name="twelve_hour" type="number" placeholder="Cena za 12h" value={formData.pricing.twelve_hour || ''} onChange={handlePricingChange} />
                        <Input name="day" type="number" placeholder="Cena za den" value={formData.pricing.day || ''} onChange={handlePricingChange} />
                        <Input name="month" type="number" placeholder="Cena za měsíc" value={formData.pricing.month || ''} onChange={handlePricingChange} />
                    </div>
                     <Input name="stk_date" type="date" placeholder="Datum STK" value={formData.stk_date} onChange={handleChange} />
                     <Input name="insurance_info" placeholder="Informace o pojištění" value={formData.insurance_info} onChange={handleChange} />
                     <Input name="vignette_until" type="date" placeholder="Dálniční známka do" value={formData.vignette_until} onChange={handleChange} />
                    <div className="flex justify-end space-x-2">
                        <Button onClick={handleCloseModal} variant="secondary">Zrušit</Button>
                        <Button onClick={handleSubmit}>Uložit</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Fleet;