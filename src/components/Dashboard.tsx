import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui';
import { Link } from 'react-router-dom';
import RequestApprovalModal from './RequestApprovalModal';
import { RentalRequest, Customer } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; linkTo?: string }> = ({ title, value, linkTo }) => (
    <Card>
        <div className="text-sm font-medium text-text-secondary">{title}</div>
        <div className="mt-1 text-3xl font-semibold text-text-primary">{value}</div>
        {linkTo && <Link to={linkTo} className="text-sm font-medium text-primary hover:underline mt-2 inline-block">Zobrazit</Link>}
    </Card>
);

const Dashboard: React.FC = () => {
    const { vehicles, rentals, customers, rentalRequests, updateRentalRequestStatus, addCustomer, addToast } = useData();
    const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);

    const activeRentals = rentals.filter(r => r.status === 'active');
    const pendingRequests = rentalRequests.filter(r => r.status === 'pending');
    
    const upcomingReturns = activeRentals.filter(r => {
        const endDate = new Date(r.end_date);
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return endDate >= today && endDate <= nextWeek;
    }).sort((a,b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

    const handleApprove = async (request: RentalRequest) => {
        const newCustomer: Omit<Customer, 'id' | 'created_at'> = {
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            phone: request.phone,
            id_card_number: request.id_card_number,
            drivers_license_number: request.drivers_license_number,
        };
        const createdCustomer = await addCustomer(newCustomer);

        if (createdCustomer) {
            const success = await updateRentalRequestStatus(request.id, 'approved');
            if (success) {
                addToast("Žádost schválena a zákazník vytvořen.", "success");
            }
        } else {
            addToast("Nepodařilo se vytvořit zákazníka.", "error");
        }
        setSelectedRequest(null);
    };

    const handleReject = async (request: RentalRequest) => {
        const success = await updateRentalRequestStatus(request.id, 'rejected');
        if (success) {
            addToast("Žádost byla zamítnuta.", "info");
        }
        setSelectedRequest(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Přehled</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Aktivní zápůjčky" value={activeRentals.length} linkTo="/rentals" />
                <StatCard title="Vozidel v parku" value={vehicles.length} linkTo="/fleet" />
                <StatCard title="Zákazníci" value={customers.length} linkTo="/customers" />
                <StatCard title="Nové žádosti" value={pendingRequests.length} />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Čekající žádosti</h2>
                    {pendingRequests.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {pendingRequests.map(req => (
                                <li key={req.id} className="p-4 flex justify-between items-center hover:bg-background">
                                    <div>
                                        <p className="font-semibold">{req.first_name} {req.last_name}</p>
                                        <p className="text-sm text-text-secondary">{req.email}</p>
                                    </div>
                                    <button onClick={() => setSelectedRequest(req)} className="text-primary hover:underline">
                                        Zobrazit detail
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nejsou zde žádné nové žádosti.</p>
                    )}
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold mb-4">Vozidla k vrácení brzy</h2>
                     {upcomingReturns.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {upcomingReturns.map(r => (
                                <li key={r.id} className="p-4 hover:bg-background">
                                    <p className="font-semibold">{vehicles.find(v => v.id === r.vehicle_id)?.brand}</p>
                                    <p className="text-sm text-text-secondary">
                                        Zákazník: {customers.find(c => c.id === r.customer_id)?.first_name} {customers.find(c => c.id === r.customer_id)?.last_name}
                                    </p>
                                     <p className="text-sm font-medium">Vrátit do: {new Date(r.end_date).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>V příštích 7 dnech se nevrací žádné vozidlo.</p>
                    )}
                </Card>
            </div>
            {selectedRequest && (
                <RequestApprovalModal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    rentalRequest={selectedRequest}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default Dashboard;