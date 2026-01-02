'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';

// Custom icon for markers
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});


const mockPharmacies = [
  { id: 1, name: 'Bole Pharmacy', area: 'Bole', coordinates: [9.005, 38.791] as [number, number], distance: '4.1', hours: '10PM', phone: '+251 11 456 7890' },
  { id: 2, name: 'Medhanealem Pharmacy', area: 'Bole', coordinates: [9.0085, 38.7901] as [number, number], distance: '3.8', hours: '9PM', phone: '+251 11 661 1234' },
  { id: 4, name: 'CityMed Pharmacy', area: 'Kirkos', coordinates: [8.9806, 38.7578] as [number, number], distance: '3.4', hours: '24 Hours', phone: '+251 11 345 6789' },
  { id: 6, name: 'Arada Pharmacy', area: 'Arada', coordinates: [9.0355, 38.7525] as [number, number], distance: '0.8', hours: '8PM', phone: '+251 11 567 8901' },
  { id: 8, name: 'Lideta Pharmacy', area: 'Lideta', coordinates: [9.015, 38.74] as [number, number], distance: '1.5', hours: '24 Hours', phone: '+251 11 275 4455' },
  { id: 11, name: 'Megenagna Pharmacy', area: 'Yeka', coordinates: [9.018, 38.805] as [number, number], distance: '4.8', hours: '24 Hours', phone: '+251 11 660 9988' },
];

export type Pharmacy = typeof mockPharmacies[0];

const MapPlaceholder = () => {
    return (
      <p>
        A map is loading...
      </p>
    )
  }

const MapTilerComponent = () => {
  const { getTranslation } = useLanguage();
  const map = useMap();

  const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '7QM1kFuQqp5kD5Blg8oX';
  const tileLayerUrl = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.jpg?key=${mapTilerApiKey}`;
  const attribution = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://www.maptiler.com/">MapTiler</a>`;
  
  const translations = {
      open24Hours: { en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha' },
      closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
  };

  const markers = useMemo(() => mockPharmacies.map(p => (
      <Marker
        key={p.id}
        position={p.coordinates}
        icon={markerIcon}
      >
        <Popup>
            <div className="font-sans">
                <h3 className="font-bold text-lg m-0 mb-1">{p.name}</h3>
                <p className="m-0 text-gray-600">{p.area}</p>
                <p className="m-0 mt-2 text-sm">
                    {p.hours === '24 Hours' 
                        ? getTranslation(translations.open24Hours)
                        : `${getTranslation(translations.closesAt)} ${p.hours}`
                    }
                </p>
                {p.phone && <p className="m-0 text-sm"><a href={`tel:${p.phone}`} className="text-blue-600 hover:underline">{p.phone}</a></p>}
            </div>
        </Popup>
      </Marker>
  )), [getTranslation, translations]);

  return (
    <>
        <TileLayer url={tileLayerUrl} attribution={attribution} />
        {markers}
    </>
  );
};


export function PharmacyMap() {
    if (typeof window === 'undefined') {
        return null;
    }
  
    return (
        <MapContainer 
            center={[9.0054, 38.7636]} // Centered on Addis Ababa
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            placeholder={<MapPlaceholder />}
        >
          <MapTilerComponent />
        </MapContainer>
    );
}
