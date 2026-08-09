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
 * A lightweight per-IP rate limit (see RATE_LIMIT_MAX below) stops a single
 * client from burning the OpenWeatherMap quota. Note the counter is in-memory
 * and per instance, so it is a deterrent rather than a hard global cap.
 */
const { app } = require('@azure/functions');

const OWM_BASE = 'https://api.openweathermap.org';

function json(status, body, extraHeaders) {
    return {
        status,
        jsonBody: body,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
            ...(extraHeaders || {}),
        },
    };
}

// --- Lightweight in-memory rate limiter (per instance) ---
// Sliding window keyed by client IP. Tune these two constants as needed.
const RATE_LIMIT_MAX = 30;          // requests allowed per window
const RATE_LIMIT_WINDOW_MS = 60000; // one minute
const RATE_LIMIT_MAX_IPS = 10000;   // prune idle entries once the map grows this large

const rateBuckets = new Map(); // ip -> [timestamps]

function clientIp(request) {
    // Azure App Service / the Functions host set X-Forwarded-For to the real
    // client address; locally there may be none, so fall back to a shared key.
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return 'unknown';
}

function isRateLimited(ip, now) {
    const hits = (rateBuckets.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (hits.length >= RATE_LIMIT_MAX) {
        rateBuckets.set(ip, hits);
        return true;
    }
    hits.push(now);
    rateBuckets.set(ip, hits);
    // Keep memory bounded: drop IPs whose windows have fully expired.
    if (rateBuckets.size > RATE_LIMIT_MAX_IPS) {
        for (const [key, times] of rateBuckets) {
            if (!times.some(t => now - t < RATE_LIMIT_WINDOW_MS)) {
                rateBuckets.delete(key);
            }
        }
    }
    return false;
}

app.http('weather', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        if (isRateLimited(clientIp(request), Date.now())) {
            return json(429, { error: 'Too many requests — please wait a minute and try again.' }, {
                'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
            });
        }

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
