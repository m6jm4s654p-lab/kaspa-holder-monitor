export function supabaseEnabled(){
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

function secretKey(){
  // Prefer Supabase's current server-side secret key format (sb_secret_...).
  // Legacy SERVICE_ROLE_KEY remains supported for existing projects.
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function supabaseRequest(path, options={}){
  const key=secretKey();
  if(!process.env.SUPABASE_URL || !key) throw new Error('Supabase server credentials are not configured');
  const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`,{
    ...options,
    headers:{
      apikey:key,
      Authorization:`Bearer ${key}`,
      'Content-Type':'application/json',
      Prefer:options.prefer||'',
      ...(options.headers||{})
    },
    cache:'no-store'
  });
  if(!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const txt=await r.text();
  return txt?JSON.parse(txt):null;
}
