import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function MapSearchBar({ map }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q || q.length < 3) return;
    setLoading(true);
    try {
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (mapboxToken) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxToken}&limit=6&autocomplete=true`;
        const res = await fetch(url);
        const json = await res.json();
        const items = (json.features || []).map(f => ({
          id: f.id,
          display_name: f.place_name,
          lat: f.center[1],
          lon: f.center[0]
        }));
        setResults(items);
      } else {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`;
        const res = await fetch(url, { headers: { 'User-Agent': 'City-Wide-AI-Demo/1.0' } });
        const json = await res.json();
        setResults(json || []);
      }
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (r) => {
    if (!map) return;
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    map.setView([lat, lon], 16);
    setResults([]);
    setQuery(r.display_name);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-command-card/70 px-3 py-2 rounded-lg border border-command-border text-xs gap-2">
        <Search className="w-4 h-4 text-command-cyan" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') search(query); }}
          placeholder="Search location or address (press Enter)"
          className="bg-transparent outline-none text-sm text-white w-64"
        />
        <button onClick={() => search(query)} className="text-command-muted hover:text-white px-2 py-1 rounded">Go</button>
      </div>

      {results.length > 0 && (
        <div className="absolute mt-2 w-80 max-h-56 overflow-auto bg-command-surface border border-command-border rounded shadow-lg p-1 z-50">
          {results.map(r => (
            <div key={r.place_id} onClick={() => handleSelect(r)} className="px-2 py-1 text-xs text-command-textDim hover:bg-command-cardHover hover:text-white cursor-pointer">{r.display_name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
