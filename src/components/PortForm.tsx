'use client';

import { useState } from 'react';
import { createStation } from '@/data/stations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createPort } from '@/data/ports';

/**
 * Interfejsy dla danych formularzy
 */
interface CreateStationData {
    name: string;
    latitude: number;
    longitude: number;
}

interface CreatePortData {
    station_id: number;
    power_kw: number;
    status: 'wolny' | 'zajety' | 'nieczynny';
}

interface StationFormProps {
    onSuccess?: () => void;
}

interface PortFormProps {
    stationId: number;
    onSuccess?: () => void;
    onClose: () => void;
}

/**
 * Komponent formularza dodawania stacji ładowania
 */
export function StationForm({ onSuccess }: StationFormProps) {
    const [formData, setFormData] = useState<CreateStationData>({
        name: '',
        latitude: 0,
        longitude: 0
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);
        
        try {
            if (!formData.name.trim()) {
                setError('Nazwa stacji jest wymagana');
                return;
            }
            if (formData.latitude === 0) {
                setError('Szerokość geograficzna jest wymagana');
                return;
            }
            if (formData.longitude === 0) {
                setError('Długość geograficzna jest wymagana');
                return;
            }

            const result = await createStation({
                name: formData.name.trim(),
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            });
            
            if (result) {
                setSuccess(true);
                onSuccess?.();
                setFormData({ name: '', latitude: 0, longitude: 0 });
            }
        } catch (error) {
            setError(error instanceof Error 
                ? error.message 
                : 'Wystąpił błąd serwera. Spróbuj ponownie.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">
            <div className="bg-[var(--cardblack)] border border-gray-200 p-4 rounded-lg w-full max-lg:w-[95%] lg:w-[30%] text-white relative">
                <h2 className="text-xl max-lg:text-2xl font-semibold mb-4">
                    Dodaj nową stację
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Nazwa stacji *
                        </label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Wprowadź nazwę stacji"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Szerokość geograficzna *
                        </label>
                        <Input
                            type="number"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                            required
                            step="any"
                            placeholder="Wprowadź szerokość geograficzną"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Długość geograficzna *
                        </label>
                        <Input
                            type="number"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                            required
                            step="any"
                            placeholder="Wprowadź długość geograficzną"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 max-lg:text-base text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-500 max-lg:text-base text-sm">
                            Stacja została utworzona pomyślnie!
                        </div>
                    )}
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full max-lg:text-lg max-lg:p-3"
                    >
                        {isSubmitting ? 'Tworzenie...' : 'Utwórz stację'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

/**
 * Komponent formularza dodawania portu ładowania
 */
export function PortForm({ stationId, onSuccess, onClose }: PortFormProps) {
    const [formData, setFormData] = useState<CreatePortData>({
        station_id: stationId,
        power_kw: 0,
        status: 'wolny'
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createPort({
                station_id: stationId,
                power_kw: formData.power_kw,
                status: formData.status
            });
            setSuccess(true);
            onSuccess?.();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Nie udało się utworzyć portu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-[var(--cardblack)] border border-gray-200 p-4 rounded-lg w-full max-lg:w-[95%] lg:w-[30%] text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <h2 className="text-xl max-lg:text-2xl font-semibold mb-4">
                        Dodaj nowy port
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">
                                Moc (kW) *
                            </label>
                            <Input
                                type="number"
                                value={formData.power_kw}
                                onChange={(e) => setFormData({ ...formData, power_kw: parseFloat(e.target.value) })}
                                required
                                min="0"
                                step="0.1"
                                placeholder="Wprowadź moc w kW"
                                className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">
                                Status
                            </label>
                            <Select
                                defaultValue={formData.status}
                                onValueChange={(value) => setFormData({ 
                                    ...formData, 
                                    status: value as 'wolny' | 'zajety' | 'nieczynny' 
                                })}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="w-full max-lg:text-lg max-lg:p-3">
                                    <SelectValue placeholder="Wybierz status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wolny">Wolny</SelectItem>
                                    <SelectItem value="zajety">Zajęty</SelectItem>
                                    <SelectItem value="nieczynny">Nieczynny</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && (
                            <div className="text-red-500 max-lg:text-base text-sm">{error}</div>
                        )}
                        {success && (
                            <div className="text-green-500 max-lg:text-base text-sm">
                                Port został utworzony pomyślnie!
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full max-lg:text-lg max-lg:p-3"
                        >
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz port'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}