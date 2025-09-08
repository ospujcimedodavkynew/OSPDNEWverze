import React from 'react';
import { useData } from '../context/DataContext';
import { Card } from './ui';

const CalendarView: React.FC = () => {
    const { rentals, vehicles } = useData();

    // A simple list view grouped by date for demonstration
    const rentalsByDate: { [key: string]: typeof rentals } = rentals.reduce((acc, rental) => {
        // FIX: Property 'startDate' does not exist on type 'Rental'. Used 'start_date' instead.
        const date = new Date(rental.start_date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(rental);
        return acc;
    }, {} as { [key: string]: typeof rentals });

    // FIX: Changed vehicleId type from string to number to match Vehicle.id type and avoid comparison error.
    const getVehicleName = (vehicleId: number) => {
        return vehicles.find(v => v.id === vehicleId)?.brand ?? 'Neznámé';
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Kalendář zápůjček</h1>
            <Card>
                {Object.keys(rentalsByDate).sort((a,b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
                    <div key={date} className="mb-4">
                        <h2 className="text-xl font-semibold border-b border-border pb-2 mb-2">{date}</h2>
                        <ul>
                            {rentalsByDate[date].map(rental => (
                                <li key={rental.id} className="p-2 rounded hover:bg-background">
                                    {/* FIX: Property 'vehicleId' does not exist on type 'Rental'. Used 'vehicle_id' instead. */}
                                    <p className="font-bold">{getVehicleName(rental.vehicle_id)}</p>
                                    <p className="text-sm text-text-secondary">
                                        {/* FIX: Properties 'startDate' and 'endDate' do not exist on type 'Rental'. Used 'start_date' and 'end_date' instead. */}
                                        Od: {new Date(rental.start_date).toLocaleTimeString()} Do: {new Date(rental.end_date).toLocaleTimeString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default CalendarView;