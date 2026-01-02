'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useLanguage } from '@/hooks/use-language';
import { mockPharmacies, type Pharmacy } from '@/lib/data';

// Fix for default icon issues in Leaflet with bundlers like Webpack
const createIcon = () => new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export { type Pharmacy };

export function PharmacyMap() {
  const mapRef = useRef<L.Map | null>(null);
  const { getTranslation } = useLanguage();

  const translations = useMemo(() => ({
      open24Hours: { en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha' },
      closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
  }), [getTranslation]);
  
  useEffect(() => {
    // Prevent map from re-initializing
    if (mapRef.current) return;

    const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '7QM1kFuQqp5kD5Blg8oX';
    const tileLayerUrl = `https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=${mapTilerApiKey}`;
    const attribution = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://www.maptiler.com/">MapTiler</a>`;
    
    // Initialize map
    const map = L.map('map-container').setView([9.0054, 38.7636], 12);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer(tileLayerUrl, { attribution }).addTo(map);

    // Add markers
    mockPharmacies.forEach(p => {
        const popupContent = `
            <div class="font-sans">
                <h3 class="font-bold text-lg m-0 mb-1">${p.name}</h3>
                <p class="m-0 text-gray-600">${p.area}</p>
                <p class="m-0 mt-2 text-sm">
                    ${p.hours === '24 Hours' 
                        ? getTranslation(translations.open24Hours)
                        : `${getTranslation(translations.closesAt)} ${p.hours}`
                    }
                </p>
                ${p.phone ? `<p class="m-0 text-sm"><a href="tel:${p.phone}" class="text-blue-600 hover:underline">${p.phone}</a></p>` : ''}
            </div>
        `;
        L.marker(p.coordinates, { icon: createIcon() })
         .addTo(map)
         .bindPopup(popupContent);
    });

    // Cleanup function to run when component unmounts
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [getTranslation, translations]); // Re-run if language changes to update popups (though map won't re-init)

  return <div id="map-container" style={{ height: '100%', width: '100%' }} />;
}
