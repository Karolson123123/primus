import { Button } from "@/components/ui/button";
import { ListItemText } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import OutlinedInput from '@mui/material/OutlinedInput';
import Image from "next/image";
import { useState } from "react";

interface Station {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

interface SearchBoxProps {
    stations: Station[];
    width?: string;
    onStationSelect: (station: Station) => void;
}

export default function SearchBox({ stations, width = '300px', onStationSelect }: SearchBoxProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    const filteredStations = stations.filter(station => 
        station.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setShowResults(true);
    };

    const handleStationClick = (station: Station) => {
        onStationSelect(station);
        setShowResults(false);
        setSearchTerm(station.name);
    };

    return (
        <div className="flex flex-col ml-16 relative" style={{ width }}>
            <div className='flex mt-3 items-center z-[1000000] gap-1'> 
                <div style={{ width: '100%' }}>
                    <OutlinedInput 
                        className='z-[10000] bg-[var(--background)] w-full'
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search stations..."
                    />
                </div>
                <div>
                    <Button className="bg-[var(--background)] rounded-[1rem] h-[3.4rem]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </Button>
                </div>
            </div>
            {showResults && searchTerm && (
                <div className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto bg-[var(--background)] rounded-lg shadow-lg z-[100000]">
                    <List component="nav" aria-label="stations search results">
                        {filteredStations.map((station) => (
                            <ListItem 
                                key={station.id} 
                                className="hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleStationClick(station)}
                            >
                                <ListItemIcon>
                                    <Image 
                                        src="/basic-marker.png" 
                                        alt="marker" 
                                        width={32} 
                                        height={32}
                                    />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={station.name} 
                                    className="text-white"
                                />
                            </ListItem>
                        ))}
                        {filteredStations.length === 0 && (
                            <ListItem>
                                <ListItemText 
                                    primary="No stations found" 
                                    className="text-gray-400"
                                />
                            </ListItem>
                        )}
                    </List>
                </div>
            )}
        </div>
    );
}
