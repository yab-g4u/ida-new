'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Marker, GeolocateControl, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

// Mock data for pharmacies in Addis Ababa
const mockPharmacies = [
  // Bole Sub-city
  { id: 1, name: 'Bole Pharmacy', area: 'Bole', coordinates: [8.9949, 38.7925] as [number, number], distance: '4.1', hours: '10PM', phone: '+251 11 456 7890' },
  { id: 2, name: 'Medhanealem Pharmacy', area: 'Bole', coordinates: [9.0085, 38.7901] as [number, number], distance: '3.8', hours: '9PM', phone: '+251 11 661 1234' },
  { id: 3, name: 'Edna Mall Pharmacy', area: 'Bole', coordinates: [9.006, 38.788] as [number, number], distance: '3.5', hours: '11PM', phone: '+251 11 663 5678' },

  // Kirkos Sub-city
  { id: 4, name: 'CityMed Pharmacy', area: 'Kirkos', coordinates: [8.9806, 38.7578] as [number, number], distance: '3.4', hours: '24 Hours', phone: '+251 11 345 6789' },
  { id: 5, name: 'Meskel Flower Pharmacy', area: 'Kirkos', coordinates: [8.991, 38.765] as [number, number], distance: '2.5', hours: '10PM', phone: '+251 11 551 9876' },

  // Arada Sub-city
  { id: 6, name: 'Arada Pharmacy', area: 'Arada', coordinates: [9.0355, 38.7525] as [number, number], distance: '0.8', hours: '8PM', phone: '+251 11 567 8901' },
  { id: 7, name: 'Piassa Pharmacy', area: 'Arada', coordinates: [9.033, 38.755] as [number, number], distance: '1.0', hours: '9PM', phone: '+251 11 111 2233' },

  // Lideta Sub-city
  { id: 8, name: 'Lideta Pharmacy', area: 'Lideta', coordinates: [9.015, 38.74] as [number, number], distance: '1.5', hours: '24 Hours', phone: '+251 11 275 4455' },

  // Gulele Sub-city
  { id: 9, name: 'Gulele Pharmacy', area: 'Gulele', coordinates: [9.045, 38.74] as [number, number], distance: '2.1', hours: '8PM', phone: '+251 11 876 5432' },

  // Yeka Sub-city
  { id: 10, name: 'Yeka Pharmacy', area: 'Yeka', coordinates: [9.02, 38.81] as [number, number], distance: '5.0', hours: '9PM', phone: '+251 11 654 3210' },
  { id: 11, name: 'Megenagna Pharmacy', area: 'Yeka', coordinates: [9.018, 38.805] as [number, number], distance: '4.8', hours: '24 Hours', phone: '+251 11 660 9988' },

  // Nifas Silk-Lafto Sub-city
  { id: 12, name: 'Lafto Pharmacy', area: 'Nifas Silk-Lafto', coordinates: [8.95, 38.72] as [number, number], distance: '6.2', hours: '10PM', phone: '+251 11 321 6549' },
  { id: 13, name: 'Saris Pharmacy', area: 'Nifas Silk-Lafto', coordinates: [8.96, 38.745] as [number, number], distance: '5.5', hours: '9PM', phone: '+251 11 371 8899' },
  
  // Akaky Kaliti Sub-city
  { id: 14, name: 'Akaki Pharmacy', area: 'Akaky Kaliti', coordinates: [8.88, 38.8] as [number, number], distance: '12.0', hours: '8PM', phone: '+251 11 434 1122' },

  // Kolfe Keranio Sub-city
  { id: 15, name: 'Ayer Tena Pharmacy', area: 'Kolfe Keranio', coordinates: [9.00, 38.68] as [number, number], distance: '7.5', hours: '9PM', phone: '+251 11 279 3344' },

  // Add more pharmacies here
];

export type Pharmacy = typeof mockPharmacies[0];

interface PharmacyMapProps {
    onMarkerClick: (pharmacy: Pharmacy) => void;
}

export function PharmacyMap({ onMarkerClick }: PharmacyMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 38.7578, // Addis Ababa
    latitude: 8.9806,
    zoom: 11,
  });

  const mapStyleUrl = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;
  
  const markers = useMemo(() => mockPharmacies.map(p => (
      <Marker
        key={p.id}
        longitude={p.coordinates[1]}
        latitude={p.coordinates[0]}
        anchor="bottom"
        onClick={(e) => {
            e.originalEvent.stopPropagation();
            onMarkerClick(p);
        }}
      >
        <MapPin className="h-8 w-8 text-primary cursor-pointer" fill="currentColor" />
      </Marker>
  )), [onMarkerClick]);

  return (
    <Map
      {...viewState}
      mapLib={maplibregl}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyleUrl}
    >
      <GeolocateControl position="top-right" />
      <NavigationControl position="top-right" />
      {markers}
    </Map>
  );
}
