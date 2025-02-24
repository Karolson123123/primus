'use client';

import { useState } from 'react';
import { createVehicle } from '@/data/vehicles';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function VehicleForm() {
    const [formData, setFormData] = useState({
        license_plate: '',
        brand: '',
        battery_capacity_kWh: 0,
        battery_condition: 100,
        max_charging_powerkWh: 0
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
            // Validate form data
            if (!formData.license_plate.trim() || !formData.brand.trim()) {
                setError('Please fill in all required fields');
                return;
            }

            if (formData.battery_capacity_kWh <= 0) {
                setError('Battery capacity must be greater than 0');
                return;
            }

            const result = await createVehicle({
                ...formData,
                battery_capacity_kWh: Number(formData.battery_capacity_kWh),
                battery_condition: Number(formData.battery_condition),
                max_charging_powerkWh: Number(formData.max_charging_powerkWh)
            });

            if (result) {
                setSuccess(true);
                setFormData({
                    license_plate: '',
                    brand: '',
                    battery_capacity_kWh: 0,
                    battery_condition: 100,
                    max_charging_powerkWh: 0
                });
                // Optional: Add a callback to refresh the vehicles list
                // onVehicleCreated?.();
            } else {
                setError('Failed to create vehicle. Please try again.');
            }
        } catch (error) {
            console.error('Vehicle creation error:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">
            <div className="bg-[var(--cardblack)] border border-gray-200 p-4 rounded-lg w-[30%] text-white">
            <h2 className="text-xl font-semibold mb-4">Create a New Vehicle</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            License Plate *
                        </label>
                        <Input
                            type="text"
                            value={formData.license_plate}
                            onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                            required
                            placeholder="Enter license plate"
                            className="mt-1 block  rounded-er-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Brand *
                        </label>
                        <Input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            required
                            placeholder="Enter brand"
                            className="mt-1 block  rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Battery Capacity (kWh) *
                        </label>
                        <Input
                            type="number"
                            value={formData.battery_capacity_kWh}
                            onChange={(e) =>
                                setFormData({ 
                                    ...formData, 
                                    battery_capacity_kWh: parseFloat(e.target.value) 
                                })
                            }
                            required
                            min="0"
                            step="0.1"
                            placeholder="Enter battery capacity"
                            className="mt-1 block  rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-500 text-sm">Vehicle created successfully!</div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Vehicle'}
                    </Button>
                </form>
            </div>
        </div>
    );
}