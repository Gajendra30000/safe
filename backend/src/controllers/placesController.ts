import {Request,Response} from 'express'
import axios from 'axios'
import Place from '../models/Place'

export async function nearby(req:Request,res:Response){
    try{
        const lat=parseFloat(req.query.lat as string);
        const lng=parseFloat(req.query.lng as string);
        const type=(req.query.type as string || 'hospital');
        const limit=parseInt((req.query.limit as string) || '8',10);

        if(!lat || !lng) return res.status(400).json({message:"Latitude and Longitude are required"});

        const cached=await Place.find({type,location:{$near:{$geometry:{type:"Point",coordinates: [lng,lat]} , $maxDistance:5000}}}).limit(limit);

        if(cached && cached.length>0){
            return res.json({places:cached});
        }

        // Use Overpass API (OpenStreetMap) - completely free
        const amenityMap: any = {
            'hospital': 'hospital',
            'police': 'police',
            'pharmacy': 'pharmacy'
        };
        const amenity = amenityMap[type] || type;
        const radius = 5000;
        const overpassQuery = `
            [out:json];
            (
                node["amenity"="${amenity}"](around:${radius},${lat},${lng});
                way["amenity"="${amenity}"](around:${radius},${lat},${lng});
            );
            out center ${limit};
        `;

        const {data} = await axios.post(
            'https://overpass-api.de/api/interpreter',
            overpassQuery,
            { headers: { 'Content-Type': 'text/plain' } }
        );

        const places = data.elements.map((element: any) => {
            const coords = element.center || element;
            return {
                name: element.tags?.name || `${element.tags?.amenity || type}`,
                address: element.tags?.['addr:street'] ? 
                    `${element.tags['addr:street']}, ${element.tags['addr:city'] || ''}` : 
                    'Address not available',
                coordinates: [coords.lon, coords.lat]
            };
        });

        for(const p of places){
            await Place.create({
                name:p.name,
                type,
                address:p.address,
                location:{ type:"Point", coordinates:p.coordinates},
                source:'openstreetmap'
            }).catch(()=>{});
        }
        res.json({places});
    } catch(err){
        console.error(err);
        res.status(500).json({message:"Server error fetching places"});
    }
}
