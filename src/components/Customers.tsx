import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Modal, Input, IconButton } from './ui';
import { Customer } from '../types';
import { EditIcon, TrashIcon } from './Icons';

type CustomerFormData = Omit<Customer, 'id' | 'created_at'>;

const Customers: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, addToast } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState: CustomerFormData = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_card_number: '',
        drivers_license_number: '',
    };
    const [formData, setFormData] = useState<CustomerFormData>(initialFormState);

    useEffect(() => {
        if (editingCustomer) {
            setFormData({
                first_name: editingCustomer.first_name,
                last_name: editingCustomer.last_name,
                email: editingCustomer.email,
                phone: editingCustomer.phone,
                id_card_number: editingCustomer.id_card_number,
                drivers_license_number: editingCustomer.drivers_license_number,
            });
            setIsModalOpen(true);
        } else {
            setFormData(initialFormState);
        }
    }, [editingCustomer]);

    const handleOpenModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (editingCustomer) {
            const updated = await updateCustomer(editingCustomer.id, formData);
            if (updated) addToast("Zákazník úspěšně aktualizován.", "success");
        } else {
            const newCustomer = await addCustomer(formData);
            if (newCustomer) addToast("Zákazník úspěšně přidán.", "success");
        }
        handleCloseModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Opravdu chcete smazat tohoto zákazníka? Všechny jeho zápůjčky zůstanou v systému.")) {
            deleteCustomer(id);
            addToast("Zákazník byl smazán.", "info");
        }
    };
    
    const filteredCustomers = customers.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Zákazníci</h1>
                <div className="flex items-center space-x-4">
                     <Input 
                        placeholder="Hledat zákazníka..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Button onClick={() => handleOpenModal()}>Přidat nového zákazníka</Button>
                </div>
            </div>
            
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-4">Jméno</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Telefon</th>
                                <th className="p-4">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="border-b border-border last:border-b-0 hover:bg-background">
                                    <td className="p-4">{customer.first_name} {customer.last_name}</td>
                                    <td className="p-4">{customer.email}</td>
                                    <td className="p-4">{customer.phone}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <IconButton onClick={() => handleOpenModal(customer)}><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(customer.id)}><TrashIcon /></IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCustomers.length === 0 && <p className="p-4 text-center">Nebyli nalezeni žádní zákazníci.</p>}
                </div>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? "Upravit zákazníka" : "Přidat nového zákazníka"}>
                <div className="space-y-4">
                    <Input name="first_name" placeholder="Jméno" value={formData.first_name} onChange={handleChange} />
                    <Input name="last_name" placeholder="Příjmení" value={formData.last_name} onChange={handleChange} />
                    <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                    <Input name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} />
                    <Input name="id_card_number" placeholder="Číslo OP" value={formData.id_card_number} onChange={handleChange} />
                    <Input name="drivers_license_number" placeholder="Číslo ŘP" value={formData.drivers_license_number} onChange={handleChange} />
                    <div className="flex justify-end space-x-2">
                        <Button onClick={handleCloseModal} variant="secondary">Zrušit</Button>
                        <Button onClick={handleSubmit}>Uložit</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Customers;
