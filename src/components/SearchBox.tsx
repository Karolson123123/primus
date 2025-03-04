
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
