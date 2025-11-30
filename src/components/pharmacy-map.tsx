'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Marker, GeolocateControl, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { MapPin, LocateFixed } from 'lucide-react';
import { useMemo, useState } from 'react';

// Mock data for pharmacies in Addis Ababa
const mockPharmacies = [
  { id: 1, name: 'Green Pharmacy', coordinates: [9.0226, 38.7465] as [number, number], distance: '1.2', hours: '9PM', phone: '+251 11 123 4567' },
  { id: 2, name: 'Liya Pharmacy', coordinates: [9.0054, 38.7636] as [number, number], distance: '2.0', hours: '9PM', phone: '+251 11 234 5678' },
  { id: 3, name: 'CityMed Pharmacy', coordinates: [8.9806, 38.7578] as [number, number], distance: '3.4', hours: '24 Hours', phone: '+251 11 345 6789' },
  { id: 4, name: 'Bole Pharmacy', coordinates: [8.9949, 38.7925] as [number, number], distance: '4.1', hours: '10PM', phone: '+251 11 456 7890' },
  { id: 5, name: 'Arada Pharmacy', coordinates: [9.0355, 38.7525] as [number, number], distance: '0.8', hours: '8PM', phone: '+251 11 567 8901' },
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
