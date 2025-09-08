import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label } from './ui';

const Login: React.FC = () => {
    const { login } = useData();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) {
            navigate('/');
        } else {
            setError('Přihlášení se nezdařilo. Zkontrolujte své údaje.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Card className="w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">Přihlášení do administrace</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Heslo</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Přihlašování...' : 'Přihlásit se'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;
