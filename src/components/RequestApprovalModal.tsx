import React from 'react';
import { Modal, Button } from './ui';
import { RentalRequest } from '../types';

interface RequestApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalRequest: RentalRequest;
    onApprove: (req: RentalRequest) => void;
    onReject: (req: RentalRequest) => void;
}

const RequestApprovalModal: React.FC<RequestApprovalModalProps> = ({
    isOpen,
    onClose,
    rentalRequest,
    onApprove,
    onReject,
}) => {
    if (!isOpen || !rentalRequest) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schválit žádost">
            <div>
                <h3 className="text-lg font-bold mb-2">
                    {rentalRequest.first_name} {rentalRequest.last_name}
                </h3>
                <p><strong>Email:</strong> {rentalRequest.email}</p>
                <p><strong>Telefon:</strong> {rentalRequest.phone}</p>
                <p><strong>Číslo OP:</strong> {rentalRequest.id_card_number}</p>
                <p><strong>Číslo ŘP:</strong> {rentalRequest.drivers_license_number}</p>
                {rentalRequest.drivers_license_image_base64 && (
                    <div className="mt-4">
                        <strong>Snímek řidičského průkazu:</strong>
                        <img src={`data:image/jpeg;base64,${rentalRequest.drivers_license_image_base64}`} alt="Řidičský průkaz" className="mt-2 rounded" />
                    </div>
                )}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
                <Button onClick={() => onReject(rentalRequest)} className="bg-red-600 hover:bg-red-700">
                    Zamítnout
                </Button>
                <Button onClick={() => onApprove(rentalRequest)}>
                    Schválit
                </Button>
            </div>
        </Modal>
    );
};

export default RequestApprovalModal;