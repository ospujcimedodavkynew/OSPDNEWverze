import React from 'react';
import { Card, Button } from './ui';
import { useData } from '../context/DataContext';

const Settings: React.FC = () => {
    const { user, logout } = useData();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Nastavení</h1>
            <Card>
                <h2 className="text-xl font-bold mb-4">Uživatelský účet</h2>
                {user && <p className="mb-4">Jste přihlášeni jako: {user.email}</p>}
                <Button onClick={logout} className="bg-red-600 hover:bg-red-700">
                    Odhlásit se
                </Button>
            </Card>
        </div>
    );
};

export default Settings;
