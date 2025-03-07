'use client';

import { useState } from 'react';
import { createStation } from '@/data/stations';
import { Button } from './ui/button';
import { Input } from './ui/input';

/**
 * Interfejs danych formularza stacji
 */
interface CreateStationData {
    name: string;
    latitude: number;
    longitude: number;
}

/**
 * Interfejs właściwości formularza
 */
interface StationFormProps {
    onSuccess?: () => void;
}

/**
 * Komponent formularza tworzenia nowej stacji ładowania
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

    /**
     * Obsługa wysłania formularza
     */
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

            const stationData = {
                name: formData.name.trim(),
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            };

            const result = await createStation(stationData);
            
            if (result) {
                setSuccess(true);
                onSuccess?.();
                setFormData({
                    name: '',
                    latitude: 0,
                    longitude: 0
                });
            }
        } catch (error) {
            setError(
                error instanceof Error 
                    ? error.message 
                    : 'Wystąpił błąd serwera. Spróbuj ponownie.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50 p-4">
            <div className="bg-[var(--cardblack)] border border-gray-200 p-4 sm:p-6 rounded-lg w-full max-lg:w-[95%] lg:w-[30%] text-[--text-color] relative">
                <h2 className="text-xl max-lg:text-2xl font-semibold mb-4 pr-8">
                    Dodaj nową stację
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
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
                        <label className="block text-sm font-medium mb-1">
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
                        <label className="block text-sm font-medium mb-1">
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