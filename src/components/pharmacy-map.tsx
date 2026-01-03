'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useMemo, MutableRefObject } from 'react';
import type L from 'leaflet';
import { useLanguage } from '@/hooks/use-language';
import { mockPharmacies, type Pharmacy, type CommunityPharmacy } from '@/lib/data';

// This function needs to be outside the component to avoid being called on the server.
const getLeaflet = async () => {
  if (typeof window !== 'undefined') {
    const L = await import('leaflet');

    const createIcon = (url: string) => new L.Icon({
        iconUrl: url,
        iconRetinaUrl: url.includes('unpkg.com') ? url : url.replace('.png', '-2x.png'),
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    return {
        L,
        defaultIcon: createIcon('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'),
        userIcon: createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'),
        communityIcon: createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'),
    };
  }
  return null;
};


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

    let isMounted = true;
    
    getLeaflet().then(leaflet => {
        if (!leaflet || !isMounted || !mapContainerRef.current) return;

        const { L } = leaflet;

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
                userMarkerRef.current = L.marker(coords, { icon: leaflet.userIcon }).addTo(map).bindPopup('Your Location');
              }
            },
          };
        }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialView, setMapRef]);

  // Update markers when data changes
  useEffect(() => {
    const markersLayer = pharmacyMarkersRef.current;
    if (!markersLayer) return;

    let isMounted = true;
    
    getLeaflet().then(leaflet => {
        if (!leaflet || !isMounted) return;

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
            leaflet.L.marker(p.coordinates, { icon: leaflet.defaultIcon })
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
            leaflet.L.marker(p.coordinates, { icon: leaflet.communityIcon })
             .addTo(markersLayer)
             .bindPopup(popupContent);
        });
    });

    return () => { isMounted = false; }
  }, [communityPharmacies, getTranslation, translations]);


  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
    
