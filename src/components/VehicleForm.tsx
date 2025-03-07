'use client';

import { useState } from 'react';
import { createVehicle } from '@/data/vehicles';
import { Button } from './ui/button';
import { Input } from './ui/input';

/**
 * Interfejs danych formularza pojazdu
 */
interface VehicleFormData {
    license_plate: string;           // Numer rejestracyjny
    brand: string;                   // Marka pojazdu
    battery_capacity_kwh: number;    // Pojemność baterii w kWh
    battery_condition: number;       // Stan baterii w procentach
    max_charging_powerkwh: number;   // Maksymalna moc ładowania w kWh
    current_battery_capacity_kw: number; // Aktualny poziom baterii w kW
}

/**
 * Interfejs właściwości formularza
 */
interface VehicleFormProps {
    onSuccess?: () => void;
}

/**
 * Komponent formularza dodawania nowego pojazdu
 */
export function VehicleForm({ onSuccess }: VehicleFormProps) {
    const [formData, setFormData] = useState<VehicleFormData>({
        license_plate: '',
        brand: '',
        battery_capacity_kwh: 0,
        battery_condition: 100,
        max_charging_powerkwh: 0,
        current_battery_capacity_kw: 0
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
            // Walidacja pól formularza
            if (!formData.license_plate.trim()) {
                setError('Numer rejestracyjny jest wymagany');
                return;
            }
            if (!formData.brand.trim()) {
                setError('Marka pojazdu jest wymagana');
                return;
            }
            if (!formData.battery_capacity_kwh || formData.battery_capacity_kwh <= 0) {
                setError('Pojemność baterii musi być liczbą dodatnią');
                return;
            }
            if (!formData.max_charging_powerkwh || formData.max_charging_powerkwh <= 0) {
                setError('Maksymalna moc ładowania musi być liczbą dodatnią');
                return;
            }
            if (formData.current_battery_capacity_kw > formData.battery_capacity_kwh) {
                setError('Aktualny poziom baterii nie może przekraczać pojemności baterii');
                return;
            }
            if (formData.current_battery_capacity_kw < 0) {
                setError('Aktualny poziom baterii nie może być ujemny');
                return;
            }

            // Formatowanie danych do wysyłki
            const vehicleData = {
                ...formData,
                license_plate: formData.license_plate.trim(),
                brand: formData.brand.trim(),
                battery_capacity_kwh: Math.round(Math.max(0, Number(formData.battery_capacity_kwh))),
                battery_condition: Number((formData.battery_condition / 100).toFixed(2)),
                max_charging_powerkwh: Math.round(Math.max(0, Number(formData.max_charging_powerkwh))),
                current_battery_capacity_kw: Number(
                    Math.min(
                        Number(formData.current_battery_capacity_kw),
                        Number(formData.battery_capacity_kwh)
                    ).toFixed(2)
                )
            };

            const result = await createVehicle(vehicleData);
            
            if (result) {
                setSuccess(true);
                onSuccess?.();
                setFormData({
                    license_plate: '',
                    brand: '',
                    battery_capacity_kwh: 0,
                    battery_condition: 100,
                    max_charging_powerkwh: 0,
                    current_battery_capacity_kw: 0
                });
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50 p-4">
            <div className="bg-[var(--cardblack)] border border-[var(--yellow)] p-4 sm:p-6 rounded-lg w-full max-lg:w-[95%] lg:w-[30%] text-white relative">
                <h2 className="text-xl max-lg:text-2xl font-semibold mb-4 pr-8">
                    Dodaj nowy pojazd
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Numer rejestracyjny *
                        </label>
                        <Input
                            type="text"
                            value={formData.license_plate}
                            onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                            required
                            placeholder="Wprowadź numer rejestracyjny"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Marka *
                        </label>
                        <Input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            required
                            placeholder="Wprowadź markę pojazdu"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Pojemność baterii (kW) *
                        </label>
                        <Input
                            type="number"
                            value={formData.battery_capacity_kwh}
                            onChange={(e) =>
                                setFormData({ 
                                    ...formData, 
                                    battery_capacity_kwh: Math.max(0, Number(e.target.value))
                                })
                            }
                            required
                            min="1"
                            step="1"
                            placeholder="Wprowadź pojemność baterii"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Maksymalna moc ładowania (kWh) *
                        </label>
                        <Input
                            type="number"
                            value={formData.max_charging_powerkwh}
                            onChange={(e) =>
                                setFormData({ 
                                    ...formData, 
                                    max_charging_powerkwh: parseFloat(e.target.value) 
                                })
                            }
                            required
                            min="1"
                            step="1"
                            placeholder="Wprowadź maksymalną moc ładowania"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Stan baterii (%) *
                        </label>
                        <Input
                            type="number"
                            value={formData.battery_condition}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setFormData({ 
                                    ...formData, 
                                    battery_condition: Math.min(100, Math.max(0, value))
                                });
                            }}
                            required
                            min="0"
                            max="100"
                            step="1"
                            placeholder="Wprowadź stan baterii (0-100%)"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Aktualny poziom baterii (kW) *
                        </label>
                        <Input
                            type="number"
                            value={formData.current_battery_capacity_kw}
                            onChange={(e) =>
                                setFormData({ 
                                    ...formData, 
                                    current_battery_capacity_kw: Math.min(
                                        Math.max(0, Number(e.target.value)),
                                        formData.battery_capacity_kwh
                                    )
                                })
                            }
                            required
                            min="0"
                            max={formData.battery_capacity_kwh}
                            step="0.1"
                            placeholder="Wprowadź aktualny poziom baterii"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 max-lg:text-base text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-500 max-lg:text-base text-sm">
                            Pojazd został dodany pomyślnie!
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full max-lg:text-lg max-lg:p-3"
                    >
                        {isSubmitting ? 'Tworzenie...' : 'Dodaj pojazd'}
                    </Button>
                </form>
            </div>
        </div>
    );
}