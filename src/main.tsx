import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {Home, MessageCircle, Layers3, BookOpen, Settings, Plus, Send, Camera, Image as ImageIcon, Mic, Sparkles, Trash2, Moon, Sun, Monitor, ChevronRight, X} from "lucide-react";
import "./styles.css";

type Page="home"|"chat"|"cards"|"learning"|"settings";
type Message={id:string;role:"user"|"ai";text:string;image?:string};
type Chat={id:string;title:string;updated:number;messages:Message[]};
type Card={q:string;a:string};
type Deck={id:string;name:string;subject:string;cards:Card[]};

const uid=()=>crypto.randomUUID();
const load=<T,>(k:string,d:T):T=>{try{return JSON.parse(localStorage.getItem(k)||"null")??d}catch{return d}};
const save=(k:string,v:any)=>localStorage.setItem(k,JSON.stringify(v));

function App(){
 const [page,setPage]=useState<Page>("home");
 const [dark,setDark]=useState<boolean>(load<string>("theme","dark")!=="light");
 const [apiKey,setApiKey]=useState(load("geminiKey",""));
 const [draft,setDraft]=useState("");
 const [messages,setMessages]=useState<Message[]>(load("activeMessages",[]));
 const [chats,setChats]=useState<Chat[]>(load("chats",[]));
 const [decks,setDecks]=useState<Deck[]>(load("decks",[
   {id:uid(),name:"Biologija",subject:"Biologija",cards:[{q:"Šta je ćelija?",a:"Osnovna strukturna i funkcionalna jedinica živih bića."}]},
   {id:uid(),name:"Matematika",subject:"Matematika",cards:[{q:"Koliko je 7 × 8?",a:"56"}]}
 ]));
 const [install,setInstall]=useState(false);
 useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";save("theme",dark?"dark":"light")},[dark]);
 useEffect(()=>save("activeMessages",messages),[messages]);
 useEffect(()=>save("chats",chats),[chats]);
 useEffect(()=>save("decks",decks),[decks]);

 async function send(text=draft){
   if(!text.trim())return;
   const user={id:uid(),role:"user" as const,text:text.trim()};
   const next=[...messages,user]; setMessages(next); setDraft("");
   try{
     let result:any;
     if(apiKey){
       const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`,{
         method:"POST",headers:{"Content-Type":"application/json"},
         body:JSON.stringify({contents:[{parts:[{text:"Odgovaraj na srpskom latinicom. Ti si školski AI asistent. Objasni učeniku jasno i korak po korak.\\n"+next.map(m=>m.role+": "+m.text).join("\\n")}]}]})
       }); result=await r.json();
       if(!r.ok) throw new Error(result?.error?.message||"Gemini greška");
     }else{
       const r=await fetch("/.netlify/functions/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});
       result=await r.json(); if(!r.ok||!result.success) throw new Error(result.error||"AI servis nije dostupan");
     }
     setMessages(m=>[...m,{id:uid(),role:"ai",text:result.text||result?.candidates?.[0]?.content?.parts?.[0]?.text||"Nisam dobio odgovor."}]);
   }catch(e:any){setMessages(m=>[...m,{id:uid(),role:"ai",text:"Ne mogu trenutno da povežem AI. Proveri internet ili Gemini API ključ.\\n\\n"+(e.message||"Greška")}])}
 }
 function newChat(){ if(messages.length){setChats(c=>[{id:uid(),title:messages.find(x=>x.role==="user")?.text.slice(0,35)||"Novi razgovor",updated:Date.now(),messages},...c])};setMessages([]);setPage("chat") }

 return <div className="app">
   <main className="content">
    {page==="home"&&<HomePage onChat={()=>setPage("chat")} onSend={send} draft={draft} setDraft={setDraft} onInstall={()=>setInstall(true)}/>}
    {page==="chat"&&<ChatPage messages={messages} draft={draft} setDraft={setDraft} send={send} newChat={newChat}/>}
    {page==="cards"&&<CardsPage decks={decks} setDecks={setDecks}/>}
    {page==="learning"&&<LearningPage onSend={(t: string)=>{setPage("chat");send(t)}}/>}
    {page==="settings"&&<SettingsPage apiKey={apiKey} setApiKey={setApiKey} dark={dark} setDark={setDark} chats={chats} decks={decks}/>}
   </main>
   <nav className="tabbar">{([["home",Home,"Početna"],["chat",MessageCircle,"Chat"],["cards",Layers3,"Kartice"],["learning",BookOpen,"Učenje"],["settings",Settings,"Podešavanja"]] as any[]).map(([p,I,label])=><button className={page===p?"active":""} onClick={()=>setPage(p)} key={p}><I size={21}/><span>{label}</span></button>)}</nav>
   {install&&<div className="sheetBackdrop" onClick={()=>setInstall(false)}><div className="sheet" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setInstall(false)}><X/></button><Sparkles/><h2>Instaliraj UČI AI</h2><p>Dodaj aplikaciju na početni ekran za brži pristup.</p><ol><li>Otvori Safari Share dugme</li><li>Izaberi „Add to Home Screen“</li><li>Pritisni „Add“</li></ol></div></div>}
 </div>
}

function HomePage({onChat,onSend,draft,setDraft,onInstall}:any){
 const actions=["Objasni lekciju","Napravi fleš kartice","Testiraj me","Pomozi mi sa domaćim","Sažmi tekst","Analiziraj sliku"];
 return <div className="page home"><div className="hero"><div><span className="eyebrow">UČI AI</span><h1>Zdravo 👋</h1><p>Šta danas želiš da naučiš?</p></div><button className="installMini" onClick={onInstall}>Instaliraj</button></div>
 <div className="ask"><div className="asktop"><Sparkles size={20}/><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSend()} placeholder="Postavi pitanje..."/></div><div className="askbottom"><button><Camera size={18}/> Slika</button><button><Mic size={18}/> Glas</button><button className="send" onClick={()=>{onSend();onChat()}}><Send size={18}/></button></div></div>
 <h3>Brze akcije</h3><div className="grid">{actions.map((x,i)=><button key={x} className="action" onClick={()=>{setDraft(x+" – ");onChat()}}><span>{["📘","🎴","🧠","📝","📄","📷"][i]}</span>{x}<ChevronRight size={16}/></button>)}</div>
 <h3>Danas učiš</h3><div className="stats"><div>🔥<b>0</b><small>Streak</small></div><div>📚<b>0</b><small>Lekcije</small></div><div>🎴<b>0</b><small>Kartice</small></div><div>🧠<b>0</b><small>Testovi</small></div></div></div>
}

function ChatPage({messages,draft,setDraft,send,newChat}:any){
 return <div className="page chatPage"><header className="pageHead"><div><span className="eyebrow">AI ASISTENT</span><h2>AI Chat</h2></div><button className="iconBtn" onClick={newChat}><Plus/></button></header>
 <div className="messages">{!messages.length?<div className="empty"><Sparkles size={42}/><h2>Kako mogu da ti pomognem?</h2><p>Postavi pitanje iz bilo kog predmeta.</p></div>:messages.map((m:Message)=><div className={"bubble "+m.role} key={m.id}>{m.text}</div>)}</div>
 <div className="composer"><button className="round"><Plus/></button><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Napiši poruku..."/><button className="round"><Mic/></button><button className="send round" onClick={()=>send()}><Send/></button></div>
 </div>
}

function CardsPage({decks,setDecks}:any){
 const [active,setActive]=useState<Deck|null>(null); const [index,setIndex]=useState(0); const [flip,setFlip]=useState(false);
 if(active)return <div className="page"><header className="pageHead"><button className="back" onClick={()=>setActive(null)}>‹</button><div><span className="eyebrow">{active.subject}</span><h2>{active.name}</h2></div></header><div className={"flash "+(flip?"flipped":"")} onClick={()=>setFlip(!flip)}><span>{flip?active.cards[index]?.a:active.cards[index]?.q}</span></div><div className="cardActions"><button onClick={()=>{setIndex(Math.max(0,index-1));setFlip(false)}}>✕ Ne znam</button><button onClick={()=>{setIndex((index+1)%active.cards.length);setFlip(false)}}>✓ Znam</button></div></div>;
 return <div className="page"><header className="pageHead"><div><span className="eyebrow">PONAVLJANJE</span><h2>Fleš kartice</h2></div><button className="iconBtn" onClick={()=>setDecks((d:any)=>[...d,{id:uid(),name:"Novi set",subject:"Opšte",cards:[{q:"Novo pitanje",a:"Novi odgovor"}]}])}><Plus/></button></header><div className="deckList">{decks.map((d:Deck)=><button className="deck" key={d.id} onClick={()=>{setActive(d);setIndex(0);setFlip(false)}}><span className="deckIcon">🎴</span><span><b>{d.name}</b><small>{d.cards.length} kartica</small></span><ChevronRight/></button>)}</div><button className="primary" onClick={()=>setDecks((d:any)=>[...d,{id:uid(),name:"Novi set",subject:"Opšte",cards:[{q:"Novo pitanje",a:"Novi odgovor"}]}])}>+ Novi set</button></div>
}

function LearningPage({onSend}:any){
 const subjects=["📐 Matematika","🧪 Hemija","⚛️ Fizika","🧬 Biologija","🌍 Geografija","📖 Istorija","🇷🇸 Srpski","🇬🇧 Engleski","💻 Informatika"];
 return <div className="page"><span className="eyebrow">AI UČENJE</span><h2>Učenje</h2><p className="muted">Izaberi predmet i započni personalizovanu sesiju.</p><h3>Predmeti</h3><div className="grid">{subjects.map(s=><button className="subject" key={s} onClick={()=>onSend(`Napravi mi lekciju za predmet ${s}. Uključi: Ukratko, Objašnjenje, Primeri, Pitanja, fleš kartice i mini test.`)}>{s}<ChevronRight size={16}/></button>)}</div></div>
}

function SettingsPage({apiKey,setApiKey,dark,setDark,chats,decks}:any){
 const [draft,setDraft]=useState(apiKey);
 return <div className="page settings"><span className="eyebrow">APLIKACIJA</span><h2>Podešavanja</h2><section><h4>AI</h4><div className="setting"><label>Gemini API ključ</label><input type="password" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="••••••••••••"/><button className="primary small" onClick={()=>{setApiKey(draft);save("geminiKey",draft)}}>Sačuvaj ključ</button><small>Ključ pripada tebi i koristi tvoj Gemini limit. Ne šaljemo ga u analitiku.</small></div></section>
 <section><h4>Izgled</h4><div className="seg"><button className={!dark?"selected":""} onClick={()=>setDark(false)}><Sun/> Svetla</button><button className={dark?"selected":""} onClick={()=>setDark(true)}><Moon/> Tamna</button></div></section>
 <section><h4>Podaci</h4><div className="settingRow">Razgovori <b>{chats.length}</b></div><div className="settingRow">Setovi kartica <b>{decks.length}</b></div><button className="danger" onClick={()=>{localStorage.clear();location.reload()}}><Trash2/> Obriši lokalne podatke</button></section>
 <section><h4>O UČI AI</h4><p className="muted">Verzija 1.0.0 · PWA · Netlify</p></section></div>
}

createRoot(document.getElementById("root")!).render(<App/>);
