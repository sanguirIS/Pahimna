/*
Pahimna - personal website and creative hub.
Copyright (C) 2026 DJKAM & DEVKLENN

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


/**
 * Weather proxy — keeps the OpenWeatherMap API key off the client.
 *
 * The weather page (hytemala/welder.html) used to embed the API key in
 * JavaScript; it now talks to this function instead, which forwards the
 * request to OpenWeatherMap with the key read from the server environment:
 *
 *   GET /api/weather?city=NAME      -> geocoding (returns [{ name, lat, lon }])
 *   GET /api/weather?lat=X&lon=Y    -> 5-day forecast (returns forecast JSON)
 *
 * The key is read from process.env.WEATHER_API_KEY:
 *   - locally:   "Values" in local.settings.json (git-ignored)
 *   - production: an Application Setting on the Function App
 *
 * CORS is open (Access-Control-Allow-Origin: *) so the page works both when
 * served by the Functions host (same origin) and from a separate static host.
 * Trade-off: the endpoint is anonymous and quota-consuming, so anyone could
 * burn the OpenWeatherMap quota by hammering it. Same abuse surface as the old
 * client-embedded key — acceptable for a personal site.
 */
const { app } = require('@azure/functions');

const OWM_BASE = 'https://api.openweathermap.org';

function json(status, body) {
    return {
        status,
        jsonBody: body,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
        },
    };
}

app.http('weather', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            context.log.error('WEATHER_API_KEY is not set (local.settings.json / Function App settings).');
            return json(500, { error: 'Weather service is not configured on the server (missing WEATHER_API_KEY).' });
        }

        const city = (request.query.get('city') || '').trim();
        const lat = request.query.get('lat');
        const lon = request.query.get('lon');

        let upstreamUrl;
        if (city) {
            if (city.length > 100) {
                return json(400, { error: 'City name is too long.' });
            }
            upstreamUrl = `${OWM_BASE}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
        } else if (lat && lon && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) {
            upstreamUrl = `${OWM_BASE}/data/2.5/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}`;
        } else {
            return json(400, { error: 'Provide ?city=NAME or ?lat=..&lon=..' });
        }

        try {
            const upstream = await fetch(upstreamUrl, { headers: { 'Accept': 'application/json' } });
            const body = await upstream.json().catch(() => null);
            if (!upstream.ok) {
                return json(upstream.status, {
                    error: `OpenWeatherMap responded with HTTP ${upstream.status}.`,
                    detail: body,
                });
            }
            return json(200, body);
        } catch (err) {
            context.log.error('OpenWeatherMap proxy failed:', err);
            return json(502, { error: 'Could not reach the weather provider.' });
        }
    },
});
