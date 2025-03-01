'use client';

import { useState } from 'react';
import { createVehicle } from '@/data/vehicles';
import { Button } from './ui/button';
import { Input } from './ui/input';

// Define the form data type
interface VehicleFormData {
    license_plate: string;
    brand: string;
    battery_capacity_kwh: number;    // This matches backend schema
    battery_condition: number;
    max_charging_powerkwh: number;   // This matches backend schema
    current_battery_capacity_kw: number; // Add this field
}

interface VehicleFormProps {
  onSuccess?: () => void;
}

export function VehicleForm({ onSuccess }: VehicleFormProps) {
    const [formData, setFormData] = useState<VehicleFormData>({
        license_plate: '',
        brand: '',
        battery_capacity_kwh: 0,
        battery_condition: 100,
        max_charging_powerkwh: 0,
        current_battery_capacity_kw: 0 // Add this field
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Change the form data handling to ensure proper types
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);
        
        try {
            // Validation first
            if (!formData.license_plate.trim()) {
                setError('License plate is required');
                return;
            }
            if (!formData.brand.trim()) {
                setError('Brand is required');
                return;
            }
            if (!formData.battery_capacity_kwh || formData.battery_capacity_kwh <= 0) {
                setError('Battery capacity must be a positive number');
                return;
            }
            if (!formData.max_charging_powerkwh || formData.max_charging_powerkwh <= 0) {
                setError('Maximum charging power must be a positive number');
                return;
            }

            // Format data to match backend types
            const vehicleData = {
                license_plate: formData.license_plate.trim(),
                brand: formData.brand.trim(),
                battery_capacity_kWh: Math.round(formData.battery_capacity_kwh), // Ensure integer
                battery_condition: Number((formData.battery_condition / 100).toFixed(2)), // Convert to 0-1 float with 2 decimal places
                max_charging_powerkWh: Math.round(formData.max_charging_powerkwh), // Ensure integer
                current_battery_capacity_kw: Math.round(formData.battery_capacity_kwh) // Copy battery capacity as integer
            };

            console.log('Submitting vehicle data:', vehicleData);
            const result = await createVehicle(vehicleData);
            
            if (result) {
                setSuccess(true);
                onSuccess?.(); // Call the refresh function
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
                            value={formData.battery_capacity_kwh}
                            onChange={(e) =>
                                setFormData({ 
                                    ...formData, 
                                    battery_capacity_kwh: parseFloat(e.target.value) 
                                })
                            }
                            required
                            min="1"
                            step="1" // Change to enforce integers
                            placeholder="Enter battery capacity"
                            className="mt-1 block  rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Maximum Charging Power (kW) *
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
                            step="1" // Change to enforce integers
                            placeholder="Enter maximum charging power"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Battery Condition (%)
                        </label>
                        <Input
                            type="number"
                            value={formData.battery_condition}
                            min="0"
                            max="100"
                            step="1"
                            onChange={(e) =>
                                setFormData({ 
                                    ...formData, 
                                    battery_condition: parseFloat(e.target.value) 
                                })
                            }
                            placeholder="Enter battery condition"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
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