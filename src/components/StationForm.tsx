'use client';

import { useState } from 'react';
import { createStation } from '@/data/stations';
import { Button } from './ui/button';
import { Input } from './ui/input';

// Define the form data type
interface CreateStationData {
    name: string;
    latitude: number;
    longitude: number;
}

interface StationFormProps {
  onSuccess?: () => void;
}

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
            // Validation
            if (!formData.name.trim()) {
                setError('Station name is required');
                return;
            }
            if (formData.latitude === 0) {
                setError('Latitude is required');
                return;
            }
            if (formData.longitude === 0) {
                setError('Longitude is required');
                return;
            }

            const stationData = {
                name: formData.name.trim(),
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            };

            console.log('Submitting station data:', stationData);
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
            console.error('Station creation error:', error);
            // Show more specific error message to user
            setError(
                error instanceof Error 
                    ? error.message 
                    : 'Server error occurred. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">
            <div className="bg-[var(--cardblack)] border border-gray-200 p-4 rounded-lg w-[30%] text-white">
                <h2 className="text-xl font-semibold mb-4">Create a New Station</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Station Name *
                        </label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Enter station name"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Latitude *
                        </label>
                        <Input
                            type="number"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                            required
                            step="any"
                            placeholder="Enter latitude"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Longitude *
                        </label>
                        <Input
                            type="number"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                            required
                            step="any"
                            placeholder="Enter longitude"
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-500 text-sm">Station created successfully!</div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Station'}
                    </Button>
                </form>
            </div>
        </div>
    );
}