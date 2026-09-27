export default async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({success:false,error:"Method not allowed"}), {status:405});
  try {
    const body = await req.json();
    if (!body?.messages?.length) return new Response(JSON.stringify({success:false,error:"Nedostaju poruke"}), {status:400});
    const key = process.env.GEMINI_API_KEY;
    if (!key) return new Response(JSON.stringify({success:false,error:"GEMINI_API_KEY nije podešen na serveru"}), {status:500});
    const prompt = body.messages.map((m:any)=>`${m.role}: ${m.text}`).join("\n");
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key="+encodeURIComponent(key), {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({contents:[{parts:[{text:"Odgovaraj na srpskom latinicom. Pomaži učeniku da razume gradivo, ne samo da dobije odgovor.\\n"+prompt}]}]})
    });
    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({success:false,error:data?.error?.message || "Gemini greška"}), {status:response.status});
    return new Response(JSON.stringify({success:true,text:data?.candidates?.[0]?.content?.parts?.[0]?.text || ""}), {headers:{"Content-Type":"application/json"}});
  } catch {
    return new Response(JSON.stringify({success:false,error:"Greška pri obradi zahteva"}), {status:500});
  }
};
