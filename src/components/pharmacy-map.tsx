'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useMemo, MutableRefObject } from 'react';
import L from 'leaflet';
import { useLanguage } from '@/hooks/use-language';
import { mockPharmacies, type Pharmacy, type CommunityPharmacy } from '@/lib/data';

const createIcon = (url: string) => new L.Icon({
  iconUrl: url,
  // The default Leaflet marker icon URL doesn't have a '-2x' version.
  // This check avoids trying to load a non-existent high-res icon.
  iconRetinaUrl: url.includes('unpkg.com') ? url : url.replace('.png', '-2x.png'),
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = createIcon('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png');
const userIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png');
const communityIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png');

export { type Pharmacy };

type PharmacyMapProps = {
  initialView: [number, number] | null;
  setMapRef: MutableRefObject<{ flyTo: (coords: [number, number]) => void } | null>;
  communityPharmacies: CommunityPharmacy[];
};

export function PharmacyMap({ initialView, setMapRef, communityPharmacies }: PharmacyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const pharmacyMarkersRef = useRef<L.LayerGroup | null>(null);

  const { getTranslation } = useLanguage();

  const translations = useMemo(() => ({
      open24Hours: { en: 'Open 24 hours', am: '24 ሰዓት ክፍት', om: 'Sa\'aatii 24 Banaadha' },
      closesAt: { en: 'Closes at', am: 'የሚዘጋበት ሰዓት', om: 'Yoom Cufama' },
      addedByCommunity: {en: 'Added by community', am: 'በማህበረሰብ የተጨመረ', om: 'Hawaasaan Dabalame'},
  }), [getTranslation]);
  
  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '7QM1kFuQqp5kD5Blg8oX';
    const tileLayerUrl = `https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=${mapTilerApiKey}`;
    const attribution = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://www.maptiler.com/">MapTiler</a>`;
    
    const map = L.map(mapContainerRef.current).setView(initialView || [9.0054, 38.7636], 13);
    mapInstanceRef.current = map;
    pharmacyMarkersRef.current = L.layerGroup().addTo(map);

    L.tileLayer(tileLayerUrl, { attribution }).addTo(map);

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
  }, [initialView, setMapRef]);

  // Update markers when data changes
  useEffect(() => {
    const markersLayer = pharmacyMarkersRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

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
         .addTo(markersLayer)
         .bindPopup(popupContent);
    });

    communityPharmacies.forEach(p => {
        const popupContent = `
            <div class="font-sans">
                <h3 class="font-bold text-lg m-0 mb-1">${p.name}</h3>
                ${p.comment ? `<p class="m-0 text-gray-600 italic">"${p.comment}"</p>` : ''}
                <p class="m-0 mt-2 text-xs text-green-600 font-semibold">${getTranslation(translations.addedByCommunity)}</p>
            </div>
        `;
        L.marker(p.coordinates, { icon: communityIcon })
         .addTo(markersLayer)
         .bindPopup(popupContent);
    })

  }, [communityPharmacies, getTranslation, translations]);


  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
    