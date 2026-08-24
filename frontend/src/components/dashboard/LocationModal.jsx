import React, { useState, useEffect } from 'react';
import {
  MapPin, Search, Navigation, Globe, Check,
  X, Loader2, Compass, Radio
} from 'lucide-react';
import {
  PRESET_SOLAR_NODES,
  searchGlobalLocations,
  reverseGeocodeGPS
} from '../../api/energyEngine';

export default function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Debounced search for global locations
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchGlobalLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle GPS location acquisition
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = await reverseGeocodeGPS(latitude, longitude);
        setIsGpsLoading(false);
        onSelectLocation(loc);
        onClose();
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError(err.message || 'Unable to retrieve GPS coordinates.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Compass size={18} className="text-sky-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Select Solar Telemetry Node</h2>
              <p className="text-2xs text-slate-400">Live satellite weather & solar irradiance tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Bar & GPS Button */}
        <div className="p-4 space-y-3 border-b border-slate-800/80 bg-slate-900/30">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search any global city, state, or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all font-sans"
              autoFocus
            />
            {isSearching && (
              <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-400 animate-spin" />
            )}
          </div>

          {/* GPS Button */}
          <button
            onClick={handleUseGPS}
            disabled={isGpsLoading}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {isGpsLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Acquiring GPS Satellite Signal...</span>
              </>
            ) : (
              <>
                <Navigation size={14} />
                <span>Use My Live GPS Location</span>
              </>
            )}
          </button>

          {gpsError && (
            <div className="text-2xs text-rose-400 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              {gpsError}
            </div>
          )}
        </div>

        {/* Content Body: Search Results or Preset Nodes */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {searchResults.length > 0 ? (
            <div>
              <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Search Results ({searchResults.length})
              </div>
              <div className="space-y-1.5">
                {searchResults.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${idx}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-sky-500/40 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin size={14} className="text-sky-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-white group-hover:text-sky-300 transition-colors">
                          {loc.name}, <span className="text-slate-400 font-normal">{loc.region || loc.country}</span>
                        </div>
                        <div className="text-2xs text-slate-500 font-display">
                          {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E · {loc.country}
                        </div>
                      </div>
                    </div>
                    <Radio size={14} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Featured Global Solar Telemetry Hubs</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open-Meteo Synced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_SOLAR_NODES.map((node) => {
                  const isSelected = currentLocation?.name === node.name;
                  return (
                    <button
                      key={node.name}
                      onClick={() => {
                        onSelectLocation(node);
                        onClose();
                      }}
                      className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-500/50 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={13} className={isSelected ? 'text-sky-400' : 'text-slate-400'} />
                        <div>
                          <div className={`font-semibold text-xs ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                            {node.name}
                          </div>
                          <div className="text-2xs text-slate-400">
                            {node.country} · {node.latitude.toFixed(1)}°N
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-2xs text-slate-400">
          <span>Active Node: <b className="text-white">{currentLocation?.name || 'Chennai'}, {currentLocation?.country || 'India'}</b></span>
          <span className="font-display text-sky-400">{currentLocation?.latitude?.toFixed(2)}°N, {currentLocation?.longitude?.toFixed(2)}°E</span>
        </div>

      </div>
    </div>
  );
}
