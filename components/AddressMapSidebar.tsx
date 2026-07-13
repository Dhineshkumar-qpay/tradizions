import React, { useState, useRef, useCallback } from 'react';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { X, Search, MapPin } from 'lucide-react';

const libraries: ("places")[] = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 20.5937, lng: 78.9629 }; // India center

export default function AddressMapSidebar({ isOpen, onClose, onSelectAddress }: { isOpen: boolean, onClose: () => void, onSelectAddress: (data: any) => void }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCoALxlSdarOigVPgFjfO2zrhFZEZSIxyM',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPos, setMarkerPos] = useState(center);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPos({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        extractAddress(place);
      }
    }
  };

  const extractAddress = (place: google.maps.places.PlaceResult) => {
    let addressLine = '';
    let city = '';
    let state = '';
    let pincode = '';
    let district = '';

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('street_number') || types.includes('route')) {
          addressLine += component.long_name + ' ';
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_3') || types.includes('administrative_area_level_2')) {
          if (!district) district = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('postal_code')) {
          pincode = component.long_name;
        }
      }
    }

    if (!addressLine) addressLine = place.name || place.formatted_address || '';

    // If city is empty but district exists
    if (!city && district) city = district;

    // Remove the " District" suffix if present
    if (district.toLowerCase().endsWith(' district')) {
      district = district.substring(0, district.length - 9);
    }

    onSelectAddress({ addressLine: addressLine.trim(), city, state, district, pincode, lat: place.geometry?.location?.lat(), lng: place.geometry?.location?.lng() });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          extractAddress(results[0]);
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Address</h2>
            <p className="text-xs text-gray-500 mt-1">Search or click on the map</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoaded ? (
          <div className="flex-1 flex flex-col relative">
            <div className="absolute top-4 left-4 right-4 z-10">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                  autocomplete.setFields(['address_components', 'geometry', 'icon', 'name', 'formatted_address']);
                }}
                onPlaceChanged={handlePlaceChanged}
              >
                <div className="relative shadow-lg rounded-xl overflow-hidden border border-gray-100">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search your location..."
                    className="w-full h-12 pl-10 pr-4 outline-none text-sm font-medium text-gray-700 bg-white"
                  />
                </div>
              </Autocomplete>
            </div>

            <div className="flex-1 w-full bg-gray-50 relative">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPos}
                zoom={5}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                <Marker position={markerPos} />
              </GoogleMap>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 pointer-events-none">
                <MapPin className="w-4 h-4 text-[var(--olive)]" />
                <span className="text-xs font-bold text-gray-700">Click anywhere on the map to drop a pin</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            {loadError ? (
              <p className="text-red-500 text-sm font-medium">Error loading maps</p>
            ) : (
              <div className="w-8 h-8 border-4 border-[var(--olive)] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>
    </>
  );
}
