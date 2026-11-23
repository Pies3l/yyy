// Shared Supabase access for the public pages: board data and anonymous page views.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const LIB = 'https://esm.sh/@supabase/supabase-js@2';
let clientPromise = null;

export const backendReady = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

export function getClient() {
  if (!backendReady()) return Promise.resolve(null);
  clientPromise ??= import(LIB).then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
  return clientPromise;
}

// A random id per browser tab (sessionStorage, not a cookie) so visits can be counted without identifying anyone.
function sessionId() {
  try {
    let sid = sessionStorage.getItem('pw_sid');
    const isNew = !sid;
    if (!sid) { sid = crypto.randomUUID().replace(/-/g, '').slice(0, 20); sessionStorage.setItem('pw_sid', sid); }
    return { sid, isNew };
  } catch { return { sid: 'nostorage', isNew: true }; }
}

// How many people are on the site now, or null when there's nothing to show (under 25, or unavailable).
export async function getLiveViewers() {
  if (!backendReady()) return null;
  try {
    const { data, error } = await (await getClient()).rpc('live_viewers');
    return !error && Number.isInteger(data) ? data : null;
  } catch { return null; }
}

// Counts the view. The dashboard's "people on the site right now" is worked out from these views
// (sessions seen in the last few minutes), so visitors don't hold a realtime connection open:
// that hit the realtime plan's connection limit under heavy traffic.
export async function trackView(page) {
  if (!backendReady() || navigator.doNotTrack === '1') return;
  try {
    const client = await getClient();
    const { sid, isNew } = sessionId();
    let ref = '';
    try { if (document.referrer) { const r = new URL(document.referrer); if (r.host !== location.host) ref = r.host.replace(/^www\./, ''); } } catch {}
    await client.rpc('track_view', { p_page: page, p_ref: ref, p_sid: sid, p_new: isNew });
  } catch { /* analytics must never break the page */ }
}
