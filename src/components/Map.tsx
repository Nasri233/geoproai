import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents } from 'react-leaflet';
import { Share2, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { Location } from '../types';

// Fix for default marker icon in react-leaflet
if (L && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_0_4px_rgba(37,99,235,0.3)] animate-pulse"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (loc: Location) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export default function Map({ location, onLocationSelect, dict }: { location: Location, onLocationSelect: (loc: Location) => void, dict: any }) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const shareData = {
      title: 'Shared Location - GeoPro',
      text: 'Check out this location on the map!',
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !err.message?.toLowerCase().includes('cancel')) {
        try {
          await navigator.clipboard.writeText(url);
          setIsShared(true);
          setTimeout(() => setIsShared(false), 2000);
        } catch (clipboardErr) {
          console.error('Clipboard fallback failed:', clipboardErr);
        }
      }
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <ZoomControl position="topright" />
        <ChangeView center={[location.lat, location.lng]} zoom={14} />
        <MapEvents onLocationSelect={onLocationSelect} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        <Marker position={[location.lat, location.lng]} icon={userIcon}>
          <Popup className="font-sans font-medium">
            <div className="text-center flex flex-col items-center gap-3 min-w-[140px] p-1">
              <div>
                <p className="font-bold text-zinc-900 mb-1">Selected Location</p>
                <p className="text-xs text-zinc-500">Lat: {location.lat.toFixed(4)}</p>
                <p className="text-xs text-zinc-500">Lng: {location.lng.toFixed(4)}</p>
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full shadow-sm"
              >
                {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {isShared ? dict.copied : dict.share}
              </button>
            </div>
          </Popup>
        </Marker>

      </MapContainer>
    </div>
  );
}
