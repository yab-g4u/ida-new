'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useMemo, MutableRefObject } from 'react';
import L from 'leaflet';
import { useLanguage } from '@/hooks/use-language';
import { mockPharmacies, type Pharmacy } from '@/lib/data';

const createIcon = (url: string) => new L.Icon({
  iconUrl: url,
  iconRetinaUrl: url.replace('.png', '-2x.png'),
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = createIcon('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png');
const userIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png');


export { type Pharmacy };

type PharmacyMapProps = {
  initialView: [number, number] | null;
  setMapRef: MutableRefObject<{ flyTo: (coords: [number, number]) => void } | null>;
};

export function PharmacyMap({ initialView, setMapRef }: PharmacyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const { getTranslation } = useLanguage();

  const translations = useMemo(() => ({
      open24Hours: { en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha' },
      closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
  }), [getTranslation]);
  
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '7QM1kFuQqp5kD5Blg8oX';
    const tileLayerUrl = `https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=${mapTilerApiKey}`;
    const attribution = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://www.maptiler.com/">MapTiler</a>`;
    
    const map = L.map(mapContainerRef.current).setView(initialView || [9.0054, 38.7636], 13);
    mapInstanceRef.current = map;

    L.tileLayer(tileLayerUrl, { attribution }).addTo(map);

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
        L.marker(p.coordinates, { icon: defaultIcon })
         .addTo(map)
         .bindPopup(popupContent);
    });

    if (setMapRef) {
      setMapRef.current = {
        flyTo: (coords: [number, number]) => {
          map.flyTo(coords, 15);
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(coords);
          } else {
            userMarkerRef.current = L.marker(coords, { icon: userIcon }).addTo(map).bindPopup('Your Location');
          }
        },
      };
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [getTranslation, translations, initialView, setMapRef]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
    