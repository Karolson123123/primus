import { Button } from "@/components/ui/button";
import { getStationsInfo } from "@/data/payments";
import { ListItemText } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import OutlinedInput from '@mui/material/OutlinedInput';
import Image from "next/image";
import { useEffect, useState } from "react";

// interface Station {
//     id: number;
//     name: string;
//     latitude: number;
//     longitude: number;
//     created_at: string;
// }

export default function SearchBox({ stations }) {
    // const [stations, setStations] = useState<Station[]>([]);

    // useEffect(() => {
    //     const fetchStations = async () => {
    //         try {
    //             const stationsData = await getStationsInfo();
    //             console.log('Fetched stations data:', stationsData);
    //             if (stationsData) {
    //                 setStations(stationsData);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching stations:', error);
    //         }
    //     };
    //     fetchStations();
    // }, []);

    return(
        <div className="flex flex-col ml-16">
            <div className=' flex mt-3 items-center  z-[1000000]  gap-1'> 
                <div>
                    
                    <OutlinedInput className=' z-[10000] bg-[var(--background)]   '/>
                    
                </div>
                <div>
                    <Button className="bg-[var(--background)] rounded-[1rem]  h-[3.4rem]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </Button>

                </div>
            </div>
            <div className="z-[100000] ">
        <List components="nav" aria-label="main mailbox folders">
          {stations.map((station) => (
            <ListItem button key={station.id}>
              <ListItemIcon>
                <Image src={"/basic-marker.png"} alt="marker" width={32} height={32}></Image>
              </ListItemIcon>
              <ListItemText primary={station.name} />
            </ListItem>
          ))}
        </List>
      </div>
        </div>


    );
};
