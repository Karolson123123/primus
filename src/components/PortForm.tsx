'use client';

import { useState } from 'react';
import { createStation } from '@/data/stations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createPort } from '@/data/ports';
import { auth } from "@/auth";

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
        <div 
            className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50"
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div 
                className="bg-[var(--cardblack)] border border-gray-200 p-4 rounded-lg w-full max-lg:w-[95%] lg:w-[30%] text-white relative"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <h2 className="text-xl max-lg:text-2xl font-semibold mb-4">Create a New Station</h2>
                <form 
                    onSubmit={handleSubmit} 
                    className="space-y-4"
                    onClick={(e) => e.stopPropagation()}
                >
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
                            className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
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
                            className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
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
                            className="mt-1 block rounded-md border-gray-300 shadow-sm max-lg:text-lg max-lg:p-3"
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 max-lg:text-base text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-500 max-lg:text-base text-sm">Station created successfully!</div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full max-lg:text-lg max-lg:p-3"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Station'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

interface CreatePortData {
    station_id: number;
    power_kw: number;
    status: 'wolny' | 'zajety' | 'nieczynny';
}

// Add onClose to the PortFormProps interface
interface PortFormProps {
    stationId: number;
    onSuccess?: () => void;
    onClose: () => void;  // Add this line
}

// Update the PortForm component to accept onClose
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
        try {
            await createPort({
                station_id: stationId,
                power_kw: formData.power_kw,
                status: formData.status || 'wolny'
            });
            onSuccess?.();
        } catch (error) {
            console.error('Error creating port:', error);
            setError(error instanceof Error ? error.message : 'Failed to create port');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />
            {/* Modal */}
            <div 
                className="fixed inset-0 flex items-center justify-center z-50"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <div 
                    className="bg-[var(--cardblack)] border border-gray-200 p-4 rounded-lg w-full max-lg:w-[95%] lg:w-[30%] text-white relative"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {/* Add close button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
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
                    <h2 className="text-xl max-lg:text-2xl font-semibold mb-4">Create a New Port</h2>
                    <form 
                        onSubmit={handleSubmit} 
                        className="space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <label className="block text-sm font-medium">
                                Power (kW) *
                            </label>
                            <Input
                                type="number"
                                value={formData.power_kw}
                                onChange={(e) => setFormData({ ...formData, power_kw: parseFloat(e.target.value) })}
                                required
                                min="0"
                                step="0.1"
                                placeholder="Enter power in kW"
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
                                onValueChange={(value) => setFormData({ ...formData, status: value as 'wolny' | 'zajety' | 'nieczynny' })}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="w-full max-lg:text-lg max-lg:p-3">
                                    <SelectValue placeholder="Select status" />
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
                            <div className="text-green-500 max-lg:text-base text-sm">Port created successfully!</div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full max-lg:text-lg max-lg:p-3"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Port'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}