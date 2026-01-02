'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { mockPharmacies, type Pharmacy } from '@/lib/data';

// Custom icon for markers to fix default icon issues
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export { type Pharmacy };

const MapContent = () => {
  const { getTranslation } = useLanguage();

  const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '7QM1kFuQqp5kD5Blg8oX';
  const tileLayerUrl = `https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=${mapTilerApiKey}`;
  const attribution = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://www.maptiler.com/">MapTiler</a>`;
  
  const translations = useMemo(() => ({
      open24Hours: { en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha' },
      closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
  }), [getTranslation]);

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
    return (
        <MapContainer 
            center={[9.0054, 38.7636]} // Centered on Addis Ababa
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
        >
          <MapContent />
        </MapContainer>
    );
}
