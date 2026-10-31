const $=s=>document.querySelector(s);const base=location.pathname.replace(/\/$/,'');
const STATIC=!!window.ESPIAO_STATIC;const _c={};
const sget=f=>(_c[f]=_c[f]||fetch(f+'?v='+(window.ESPIAO_V||Date.now())).then(r=>r.json()));
const _norm=u=>{try{const x=new URL(u);let h=x.hostname.toLowerCase();if(h.startsWith('www.'))h=h.slice(4);return h+(x.pathname.replace(/\/+$/,''))}catch(e){return u}};
async function sapi(p){
  const [path,qs]=p.split('?');const q=new URLSearchParams(qs||'');
  if(path==='status')return {running:false};
  if(path==='data')return sget(`data/${q.get('src')==='fb'?'fb':'google'}.json`);
  if(path==='advertiser')return sget(`data/adv/${q.get('id')}.json`);
  if(path==='link'){const src=q.get('src')==='fb'?'fb':'google';const all=await sget(`data/${src}_creatives.json`);
    const alvo=q.get('url')?_norm(q.get('url')):null,dm=(q.get('dominio')||'').toLowerCase().replace(/^www\./,'');
    const out=[],pa={},an={},va={},seen={};
    for(const c of all){const hits=(c.urls||[]).filter(u=>alvo?_norm(u)===alvo:_norm(u).split('/')[0]===dm);if(!hits.length)continue;
      if(seen[c.cid]){seen[c.cid].paises=[...new Set([...(seen[c.cid].paises||[]),...(c.paises||[])])];continue}
      seen[c.cid]=c;out.push(c);const w=c.n||1,at=c.ativo??!c.sumiu;an[c.anunciante]=(an[c.anunciante]||0)+w;
      if(at)for(const x of c.paises||[])pa[x]=(pa[x]||0)+w;for(const h of hits)va[h]=(va[h]||0)+1}
    out.sort((a,b)=>((b.ativo??!b.sumiu)-(a.ativo??!a.sumiu))||((b.n||1)-(a.n||1))||String(b.last).localeCompare(String(a.last)));
    const ent=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
    return {url:q.get('url'),dominio:q.get('dominio'),src,total:out.reduce((s,c)=>s+(c.n||1),0),criativos_n:out.length,ativos:out.filter(c=>c.ativo??!c.sumiu).reduce((s,c)=>s+(c.n||1),0),
      paises:ent(pa).map(([pais,n])=>({pais,n})),anunciantes:ent(an).slice(0,10).map(([nome,n])=>({nome,n})),variantes:ent(va).slice(0,15).map(x=>x[0]),creatives:out.slice(0,300)}}
  return {}}
const api=p=>STATIC?sapi(p):fetch(base+'/api/'+p).then(r=>r.json());
const post=(p,b)=>fetch(base+'/api/'+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(r=>r.json());
let G=null,SRC=location.hash==='#fb'?'fb':'google',VIEW='links',LIMIT=50,DR=null;
const FB=()=>SRC==='fb';
const esc=s=>(s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>n==null?'–':Number(n).toLocaleString('pt-BR');
const dom=u=>{try{return new URL(u).hostname}catch(e){return ''}};
const urlHtml=u=>{try{const x=new URL(u);const p=(x.pathname+x.search).replace(/\/$/,'');return `<b>${esc(x.hostname.replace(/^www\./,''))}</b><span>${esc(p)}</span>`}catch(e){return esc(u)}};
const fav=d=>`<img class="fav" loading="lazy" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=32" onerror="this.style.visibility='hidden'">`;
const initials=n=>{const w=(n||'?').replace(/^busca:\s*/,'').replace(/[^\p{L}\p{N} ]/gu,' ').trim().split(/\s+/);return ((w[0]||'?')[0]+((w[1]||'')[0]||'')).toUpperCase()};
const PLAT={FACEBOOK:'Facebook',INSTAGRAM:'Instagram',AUDIENCE_NETWORK:'Audience Network',MESSENGER:'Messenger',THREADS:'Threads',WHATSAPP:'WhatsApp'};
const PH={google:'Cole o link da biblioteca do Google  ·  adstransparency.google.com/advertiser/AR…',fb:'Cole o link da Biblioteca da Meta (view_all_page_id= ou q=), o ID da página, ou uma palavra/domínio'};
const FLAG=cc=>/^[A-Z]{2}$/.test(cc||'')?String.fromCodePoint(...[...cc].map(c=>127397+c.charCodeAt(0))):'🌐';
let _dn=null;try{_dn=new Intl.DisplayNames(['pt-BR'],{type:'region'})}catch(e){}
const PAIS=cc=>{try{return _dn?_dn.of(cc):cc}catch(e){return cc}};
const flags=(arr,max=6)=>{arr=arr||[];return arr.slice(0,max).map(cc=>`<span class="chip fl" title="${esc(PAIS(cc))}">${FLAG(cc)} ${esc(cc)}</span>`).join('')+(arr.length>max?`<span class="chip">+${arr.length-max}</span>`:'')};
function hbars(list,lab,lim=15){if(!list||!list.length)return '<div class="mut">sem dados de país ainda (sai no próximo scan)</div>';const mx=Math.max(...list.map(x=>x.n),1);
  const row=x=>`<div class="hb-r" title="${esc(PAIS(x.pais))}: ${fmt(x.n)} ${lab}"><span class="hb-l">${FLAG(x.pais)} ${esc(PAIS(x.pais))}</span><span class="hb-t"><i style="width:${Math.max(2,100*x.n/mx)}%"></i></span><b class="num">${fmt(x.n)}</b></div>`;
  const top=list.slice(0,lim),rest=list.slice(lim);
  return `<div class="hb">${top.map(row).join('')}${rest.length?`<details class="hb-more"><summary class="mut">+ ${rest.length} outros países (${rest.slice(0,6).map(x=>FLAG(x.pais)).join(' ')}…)</summary><div class="hb">${rest.map(row).join('')}</div></details>`:''}</div>`}
function hbarsOld(list,lab){const mx=Math.max(...list.map(x=>x.n),1);return `<div class="hb">${list.map(x=>`<div class="hb-r" title="${esc(PAIS(x.pais))}: ${fmt(x.n)} ${lab}"><span class="hb-l">${FLAG(x.pais)} ${esc(PAIS(x.pais))}</span><span class="hb-t"><i style="width:${Math.max(2,100*x.n/mx)}%"></i></span><b class="num">${fmt(x.n)}</b></div>`).join('')}</div>`}
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const ago=iso=>{if(!iso)return '';const m=(Date.now()-new Date(iso))/6e4;return m<60?`há ${Math.max(1,Math.round(m))} min`:m<1440?`há ${Math.round(m/60)} h`:`há ${Math.round(m/1440)} d`};
const extUrl=c=>FB()?`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${c.country||'ALL'}&${c.tipo==='page'?'view_all_page_id='+c.valor+'&search_type=page':'q='+encodeURIComponent(c.valor)+'&search_type=keyword_unordered'}`:`https://adstransparency.google.com/advertiser/${c.id}?region=anywhere`;
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}

async function load(){G=await api('data'+(FB()?'?src=fb':''));render()}
function setTab(s){SRC=s;LIMIT=50;history.replaceState(null,'',s==='fb'?'#fb':location.pathname);document.body.dataset.src=s;closeDr();load()}

function render(){
  document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.src===SRC));
  $('#cntG').textContent=G.contagem.google;$('#cntF').textContent=G.contagem.fb;$('#url').placeholder=PH[SRC];
  const st=G.refresh;$('#status').className='pill'+(st.running?' run':'');
  $('#status').lastElementChild.textContent=st.running?`escaneando ${st.alvo==='tudo'||st.alvo==='google'||st.alvo==='fb'?'a aba':st.alvo}…`:(G.atualizado?`atualizado ${ago(G.atualizado)}`:'sem scan ainda');
  const byId=Object.fromEntries(G.advertisers.map(a=>[a.id,a]));
  const libs=(G.config.itens||[]).map(c=>({c,a:byId[c.id]||{}}));
  // tiles
  const ativos=libs.reduce((s,x)=>s+(x.a.ativos||0),0),erros=libs.filter(x=>x.a.erro).length;
  const lAt=G.links.filter(l=>l.ativos>0).length,dAt=G.dominios.filter(d=>d.ativos>0).length;
  $('#tiles').innerHTML=[['Bibliotecas',fmt(libs.length),erros?`${erros} com erro no último scan`:'todas ok'],
    ['Anúncios ativos',fmt(ativos),FB()?'soma dos anúncios por criativo':'criativos vistos nos últimos 3 dias'],
    ['Links com anúncio ativo',fmt(lAt),`de ${fmt(G.links.length)} links encontrados`],
    ['Domínios ativos',fmt(dAt),`de ${fmt(G.dominios.length)} domínios`]].map(([l,v,d])=>`<div class="tile"><div class="l">${l}</div><div class="v num">${v}</div><div class="d">${d}</div></div>`).join('');
  renderLibs(libs);renderRank();
}
function renderLibs(libs){
  const q=($('#libBusca').value||'').toLowerCase();
  libs=libs.filter(x=>!q||((x.a.nome||x.c.nome||x.c.valor||'')+x.c.id+(x.c.nota||'')).toLowerCase().includes(q))
    .sort((x,y)=>(!!x.a.erro-!!y.a.erro)||((y.a.ativos||0)-(x.a.ativos||0)));
  $('#libCount').textContent=libs.length?`${libs.length}`:'';
  if(!(G.config.itens||[]).length){$('#libs').innerHTML=`<div class="empty">Nenhuma biblioteca ${FB()?'do Facebook':'do Google'} ainda.<br><span class="mut">Cole o link no campo acima e clique em Vigiar.</span></div>`;return}
  $('#libs').innerHTML='<div class="libs">'+libs.map(({c,a})=>{
    const nome=a.nome||c.nome||(c.tipo==='busca'?'busca: '+c.valor:'(sem nome ainda)');
    const tot=a.total||0,at=a.ativos||0,top=(a.top||[])[0];
    const chips=[FB()?`<span class="chip">${c.tipo==='page'?'página':'busca'}</span>`:'',a.erro?`<span class="chip err">erro no scan</span>`:'',a.capado?`<span class="chip warn">limite de coleta</span>`:'',a.novos_hoje>0?`<span class="chip ok">+${a.novos_hoje} hoje</span>`:''].join('');
    return `<div class="lib" data-id="${c.id}">
      <div class="lib-act"><button class="ib" data-act="refresh" title="Rodar scan desta biblioteca">↻</button><a class="ib" href="${extUrl(c)}" target="_blank" title="Abrir na ${FB()?'Meta':'Google'}">↗</a><button class="ib" data-act="remove" title="Parar de vigiar">✕</button></div>
      <div class="lib-h"><div class="av">${esc(initials(nome))}</div><div style="min-width:0"><div class="lib-n" title="${esc(nome)}">${esc(nome)}</div><div class="lib-id" title="${esc(c.id+(c.nota?' · '+c.nota:''))}">${esc(c.nota||c.id)}</div></div></div>
      ${a.erro?`<div class="tx2" style="font-size:12px">${esc(a.erro)}</div>`:`<div><div class="lib-m"><b class="num">${fmt(at)}</b><span>ativos de ${fmt(tot)} ${FB()?'anúncios':'criativos'}</span></div><div class="meter"><i style="width:${tot?Math.round(100*at/tot):0}%"></i></div></div>
      <div class="lib-s"><span><b>${fmt(a.com_url)}</b> c/ link</span><span><b>${fmt(a.dominios)}</b> domínios</span>${FB()?`<span><b>${fmt(a.criativos_unicos)}</b> criativos</span>`:''}</div>`}
      ${chips?`<div style="display:flex;gap:4px;flex-wrap:wrap">${chips}</div>`:''}
      ${FB()&&(a.paises||[]).length?`<div class="lk-c" title="países com anúncio ativo">${flags(a.paises.map(p=>p.pais),7)}</div>`:''}
      <div class="lib-top">${top?`<b>${fmt(top.ativos)}×</b> ${esc(top.url.replace(/^https?:\/\//,''))}`:'<span>sem links ainda</span>'}</div></div>`}).join('')+'</div>';
}
function chipsLink(l){const k=(l.keywords||[]).filter(x=>/^(keyword|utm_campaign)=/.test(x)&&!/[{}]/.test(x)).slice(0,2).map(x=>{try{return decodeURIComponent(x.split('=').slice(1).join('=')).replace(/\+/g,' ')}catch(e){return x}});const p=Object.keys(l.paises||{});
  return (k.length||p.length)?`<div class="lk-c">${flags(p,5)}${k.map(x=>`<span class="chip kw">${esc(x)}</span>`).join('')}</div>`:''}
function linkRow(l,i,max,compact){
  return `<div class="row click" data-url="${esc(l.url)}" title="ver os criativos que levam a este link">${compact?'':`<div class="rk">${i+1}</div>`}
   <div class="lk">${fav(l.dominio||dom(l.url))}<div class="lk-t"><span class="lk-u">${urlHtml(l.url)} <a class="ext" href="${esc(l.url)}" target="_blank" title="abrir o site">↗</a></span>
     <div class="lk-a">${esc(l.titulo||'')}${l.artigo?` → <a href="${esc(l.artigo)}" target="_blank">${esc(l.artigo.replace(/^https?:\/\/(www\.)?/,''))}</a>`:''}</div>${chipsLink(l)}</div></div>
   <div class="val"><div class="n"><b class="num">${fmt(l.ativos)}</b><span>${fmt(l.anuncios)} total</span></div><div class="meter"><i style="width:${max?100*l.ativos/max:0}%"></i></div></div>
   <div class="dt">${l.first||''}<div>${l.novo?'<span class="chip warn">novo</span>':(l.novos_hoje>0?`<span class="chip ok">+${l.novos_hoje}</span>`:`até ${l.last||''}`)}</div></div>
   ${compact?'':`<div class="who" title="${esc(l.anunciante)}">${esc(l.anunciante)}</div>`}</div>`}
function renderRank(){
  document.querySelectorAll('#view button').forEach(b=>b.classList.toggle('on',b.dataset.v===VIEW));
  const so=$('#soAtivos').checked,q=($('#busca').value||'').toLowerCase();
  if(VIEW==='doms'){
    const rows=G.dominios.filter(d=>(!so||d.ativos>0)&&(!q||(d.dominio+(d.anunciantes||[]).join(' ')).toLowerCase().includes(q)));const max=Math.max(1,...rows.map(r=>r.ativos));
    $('#rank').innerHTML=`<div class="panel doms"><div class="row h"><div>domínio</div><div>anúncios ativos</div><div>links</div><div>páginas no site</div><div>anunciantes</div></div>`+
      (rows.map(d=>`<div class="row click" data-dom="${esc(d.dominio)}" title="ver os criativos deste domínio"><div class="lk">${fav(d.dominio)}<span class="lk-u"><b>${esc(d.dominio)}</b> <a class="ext" href="https://${esc(d.dominio)}" target="_blank" title="abrir o site">↗</a></span></div><div class="val"><div class="n"><b class="num">${fmt(d.ativos)}</b><span>${fmt(d.anuncios)} total</span></div><div class="meter"><i style="width:${100*d.ativos/max}%"></i></div></div><div class="num tx2">${fmt(d.links)}</div><div class="num tx2">${fmt(d.paginas)}</div><div class="who">${esc((d.anunciantes||[]).join(', '))}</div></div>`).join('')||`<div class="row"><div class="mut">nada por aqui</div></div>`)+'</div>';return}
  const rows=G.links.filter(l=>(!so||l.ativos>0)&&(!q||(l.url+(l.titulo||'')+l.anunciante+(l.keywords||[]).join(' ')).toLowerCase().includes(q)));
  const max=Math.max(1,...rows.map(r=>r.ativos));
  $('#rank').innerHTML=`<div class="panel"><div class="row h"><div class="rk">#</div><div>link do anúncio → artigo</div><div>anúncios ativos</div><div class="dt">desde</div><div class="who">anunciante</div></div>`+
    (rows.slice(0,LIMIT).map((l,i)=>linkRow(l,i,max)).join('')||`<div class="row"><div></div><div class="mut">nenhum link ${so?'ativo ':''}${q?'com esse filtro':''}</div></div>`)+
    (rows.length>LIMIT?`<button class="more" id="more">mostrar mais ${Math.min(50,rows.length-LIMIT)} de ${fmt(rows.length-LIMIT)} restantes</button>`:'')+'</div>';
}

/* ---------- gaveta ---------- */
function closeDr(){$('#drawer').classList.remove('on');$('#scrim').classList.remove('on');DR=null;SITE=null}
function monthChart(pm){
  const ks=Object.keys(pm||{}).filter(k=>/^\d{4}-\d{2}$/.test(k)).sort();if(!ks.length)return '';
  const months=[];let [y,m]=ks[0].split('-').map(Number);const [ye,me]=ks[ks.length-1].split('-').map(Number);
  while(y<ye||(y===ye&&m<=me)){const k=`${y}-${String(m).padStart(2,'0')}`;months.push([k,pm[k]||0]);m++;if(m>12){m=1;y++}}
  const W=800,H=150,pl=34,pb=22,pt=8,iw=W-pl-6,ih=H-pb-pt,mx=Math.max(...months.map(x=>x[1]),1),bw=iw/months.length,gap=Math.min(2,bw*.15);
  const nice=Math.ceil(mx/Math.pow(10,Math.floor(Math.log10(mx))))*Math.pow(10,Math.floor(Math.log10(mx)));const top=Math.max(nice,1);
  const yv=v=>pt+ih-(v/top)*ih;const step=Math.ceil(months.length/12);
  let s=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="criativos por mês">`;
  [0,.5,1].forEach(f=>{const v=Math.round(top*f),yy=yv(v);s+=`<line x1="${pl}" x2="${W}" y1="${yy}" y2="${yy}" stroke="#2f2f2c" stroke-width="1"/><text x="${pl-6}" y="${yy+4}" text-anchor="end" fill="#8a8982" font-size="10">${v}</text>`});
  months.forEach(([k,v],i)=>{const x=pl+i*bw+gap/2,w=Math.max(1,bw-gap),yy=yv(v),h=pt+ih-yy,r=Math.min(4,w/2,h);
    if(v>0)s+=`<path d="M${x},${pt+ih} V${yy+r} Q${x},${yy} ${x+r},${yy} H${x+w-r} Q${x+w},${yy} ${x+w},${yy+r} V${pt+ih} Z" fill="var(--ac)"/>`;
    s+=`<rect class="hit" data-k="${k}" data-v="${v}" x="${pl+i*bw}" y="${pt}" width="${bw}" height="${ih}" fill="transparent"/>`;
    if(i%step===0){const [yy2,mm]=k.split('-');s+=`<text x="${pl+i*bw+bw/2}" y="${H-6}" text-anchor="middle" fill="#8a8982" font-size="10">${MES[+mm-1]}/${yy2.slice(2)}</text>`}});
  return s+'</svg><div class="tt" id="tt"></div>'}
async function openDr(id){
  const d=await api('advertiser?id='+encodeURIComponent(id));DR={d,tab:'links'};SITE=null;
  $('#drawer').classList.add('on');$('#scrim').classList.add('on');renderDr()}
function renderDr(){
  const {d,tab}=DR;const fb=d.id&&d.id.startsWith('FB-');const c=(G.config.itens||[]).find(x=>x.id===d.id)||{id:d.id};
  if(d.erro){$('#drawer').innerHTML=`<div class="dr-h"><div class="grow"><h3>${esc(d.id||'')}</h3><div class="mut">${esc(d.erro)}</div></div><button class="ib" data-act="close">✕</button></div>`;return}
  const kp=fb?[[d.ativos,'anúncios ativos'],[d.total,'anúncios no total'],[d.ativos_criativos,'criativos ativos'],[d.criativos_unicos,'criativos'],[d.com_url,'com link'],[d.links.length,'links']]
             :[[d.ativos,'criativos ativos'],[d.total,'criativos'],[d.com_url,'com link'],[d.links.length,'links'],[(d.dominios||[]).length,'domínios']];
  const fmts=Object.entries(d.formatos||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span class="chip">${esc(k)} ${fmt(v)}</span>`).join('');
  const plats=fb?Object.entries(d.plataformas||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span class="chip">${PLAT[k]||k} ${fmt(v)}</span>`).join(''):'';
  const sm=Object.values(d.sitemaps||{}).sort((a,b)=>b.paginas-a.paginas);
  const tabs=[['links',`Links (${d.links.length})`],['crs',`Criativos (${d.creatives.length})`],['sm',`Sitemaps (${sm.length})`]].concat(fb&&(d.paginas||[]).length>1?[['pg',`Páginas (${d.paginas.length})`]]:[]);
  let body='';
  if(tab==='links'){const mx=Math.max(1,...d.links.map(l=>l.ativos));body=`<div class="panel">${d.links.map((l,i)=>linkRow(l,i,mx,true)).join('')||'<div class="row"><div class="mut">sem links</div></div>'}</div>`}
  if(tab==='crs')body=`<div class="crs">${d.creatives.slice(0,200).map(x=>fb?crF(x):crG(x)).join('')}</div>`;
  if(tab==='sm')body=`<div class="sm">${sm.map(x=>`<details><summary>${fav(x.dominio)}<b>${esc(x.dominio)}</b><span class="mut">${fmt(x.paginas)} páginas</span>${Object.entries(x.tipos||{}).map(([k,v])=>`<span class="chip">${esc(k)} ${v}</span>`).join('')}<span class="mut" style="margin-left:auto;font-size:11px">lido em ${esc(x.em)}</span></summary><ul>${(x.recentes||[]).slice(0,30).map(p=>`<li><span>${esc(p.lastmod||'')}</span><a href="${esc(p.url)}" target="_blank">${esc(p.url.replace(/^https?:\/\/(www\.)?/,''))}</a></li>`).join('')}</ul></details>`).join('')||'<div class="mut">sem sitemap</div>'}</div>`;
  if(tab==='pg')body=`<div class="panel">${d.paginas.map(p=>`<div class="row" style="grid-template-columns:1fr 120px"><div>${esc(p.nome)}</div><div class="num tx2">${fmt(p.criativos)} criativos</div></div>`).join('')}</div>`;
  $('#drawer').innerHTML=`<div class="dr-h"><div class="av">${esc(initials(d.nome))}</div><div class="grow"><h3>${esc(d.nome)}</h3><div class="mut" style="font-size:12px">${esc(d.id)} · atualizado ${ago(d.atualizado)}${d.resultados_biblioteca?' · Meta mostra ~'+esc(d.resultados_biblioteca)+' resultados':''}</div></div>
     <a class="btn sm" href="${extUrl(c)}" target="_blank">abrir na ${fb?'Meta':'Google'} ↗</a><button class="ib" data-act="close" title="Fechar">✕</button></div>
   <div class="dr-b"><div class="kp">${kp.map(([v,l])=>`<div><b class="num">${fmt(v)}</b><span>${l}</span></div>`).join('')}</div>
     ${fmts||plats?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 16px">${fmts}${plats}</div>`:''}
     ${fb?`<div class="chart"><h4>Países com anúncio ativo <span class="mut" style="font-weight:400">· resultados da Biblioteca filtrada por país</span></h4>${hbars(d.paises,'anúncios ativos')}</div>`:''}
     <div class="chart"><h4>${fb?'Criativos que começaram a rodar':'Criativos novos'} por mês</h4>${monthChart(d.por_mes)||'<div class="mut">sem datas</div>'}</div>
     <div class="subtabs">${tabs.map(([k,l])=>`<button data-sub="${k}" class="${k===tab?'on':''}">${l}</button>`).join('')}</div>${body}</div>`;
}
const okTxt=t=>t&&!/(&&|this\.|function|=>|[{};])/.test(t)&&/[A-Za-zÀ-ú]{3}/.test(t);
function crG(c){const aid=c.aid||(DR&&DR.d&&DR.d.id)||'';const txt=(c.texto||[]).filter(okTxt);
  return `<div class="cr">${c.img?`<img loading="lazy" src="${esc(c.img)}" onerror="this.outerHTML='<div class=ph>sem imagem</div>'">`:`<div class="ph">anúncio ${esc(c.fmt)}<br><span style="font-size:11px">sem miniatura</span></div>`}<div class="b"><div class="m">${c.sumiu?'<span class="chip">saiu</span>':'<span class="chip ok">ativo</span>'}<span class="mut">${esc(c.first)} → ${esc(c.last)}</span></div>${SITE&&c.anunciante?`<div class="tx2" style="font-size:11px">📣 ${esc(c.anunciante)}</div>`:''}${txt.slice(0,2).map(t=>`<div class="t">${esc(t)}</div>`).join('')}${(c.urls||[]).slice(0,1).map(u=>`<a class="u" href="${esc(u)}" target="_blank">${esc(u.replace(/^https?:\/\//,''))}</a>`).join('')}${aid&&c.cid?`<a class="mut" style="font-size:11px" href="https://adstransparency.google.com/advertiser/${esc(aid)}/creative/${esc(c.cid)}?region=anywhere" target="_blank">ver anúncio no Google ↗</a>`:''}</div></div>`}
function crF(c){return `<div class="cr">${c.img?`<img loading="lazy" referrerpolicy="no-referrer" src="${esc(c.img)}" onerror="this.outerHTML='<div class=ph>sem imagem</div>'">`:`<div class="ph">${esc(c.fmt)}</div>`}<div class="b">
  <div class="m">${c.ativo?'<span class="chip ok">ativo</span>':'<span class="chip">parado</span>'}<span class="tx2"><b>${fmt(c.n)}</b> anúncio${c.n>1?'s':''} · ${esc(c.fmt)}</span></div>
  <div class="mut">${esc(c.first)} → ${esc(c.last)}</div>
  ${(c.paises||[]).length?`<div class="m">${flags(c.paises,6)}</div>`:''}
  ${c.anunciante&&SITE?`<div class="tx2" style="font-size:11px">📣 ${esc((c.nome||c.anunciante).trim())}</div>`:''}
  ${(c.texto||[]).slice(0,2).map(t=>`<div class="t">${esc(t)}</div>`).join('')}
  ${(c.urls||[]).slice(0,1).map(u=>`<a class="u" href="${esc(u)}" target="_blank">${esc(u.replace(/^https?:\/\//,''))}</a>`).join('')}
  <a class="mut" style="font-size:11px" href="https://www.facebook.com/ads/library/?id=${esc(c.cid)}" target="_blank">ver anúncio na Meta ↗</a></div></div>`}

/* ---------- gaveta do site (criativos que levam a um link/domínio) ---------- */
let SITE=null;
async function openSite(o){
  $('#drawer').innerHTML='<div class="dr-b"><div class="mut">carregando criativos…</div></div>';$('#drawer').classList.add('on');$('#scrim').classList.add('on');
  const q=o.url?'url='+encodeURIComponent(o.url):'dominio='+encodeURIComponent(o.dominio);
  const d=await api(`link?src=${SRC}&${q}`);SITE=d;DR=null;renderSite()}
function renderSite(){const d=SITE;const fb=SRC==='fb';const host=d.dominio||dom(d.url);
  const kp=[[d.ativos,fb?'anúncios ativos':'criativos ativos'],[d.criativos_n,'criativos'],[d.anunciantes.length,'anunciantes'],[d.paises.length,'países']].filter(x=>fb||x[1]!=='países');
  $('#drawer').innerHTML=`<div class="dr-h">${fav(host).replace('class="fav"','class="fav big"')}<div class="grow"><h3 style="word-break:break-all">${d.url?urlHtml(d.url):'<b>'+esc(d.dominio)+'</b>'}</h3><div class="mut" style="font-size:12px">${d.url?'criativos que levam a este link':'todos os criativos que levam a este domínio'} · ${fb?'Facebook/Instagram':'Google Ads'}</div></div>
    <a class="btn sm" href="${esc(d.url||'https://'+d.dominio)}" target="_blank">abrir site ↗</a><button class="ib" data-act="close" title="Fechar">✕</button></div>
   <div class="dr-b"><div class="kp">${kp.map(([v,l])=>`<div><b class="num">${fmt(v)}</b><span>${l}</span></div>`).join('')}</div>
    ${fb?`<div class="chart"><h4>Onde rodam <span class="mut" style="font-weight:400">· anúncios ativos por país</span></h4>${hbars(d.paises,'anúncios ativos')}</div>`:''}
    ${d.anunciantes.length>1?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${d.anunciantes.map(a=>`<span class="chip">📣 ${esc(a.nome)} · ${fmt(a.n)}</span>`).join('')}</div>`:''}
    ${d.variantes.length>1?`<details class="var"><summary class="mut">${d.variantes.length} variações de URL (parâmetros)</summary>${d.variantes.map(u=>`<div><a href="${esc(u)}" target="_blank">${esc(u.replace(/^https?:\/\//,''))}</a></div>`).join('')}</details>`:''}
    <h4 style="margin:16px 0 10px">Criativos (${fmt(d.creatives.length)}${d.criativos_n>d.creatives.length?' de '+fmt(d.criativos_n):''})</h4>
    <div class="crs">${d.creatives.map(x=>fb?crF(x):crG(x)).join('')||'<div class="mut">nenhum criativo com esse destino</div>'}</div></div>`}

/* ---------- eventos ---------- */
document.addEventListener('click',async e=>{
  const sg=e.target.closest('#seg button');if(sg){setTab(sg.dataset.src);return}
  const vw=e.target.closest('#view button');if(vw){VIEW=vw.dataset.v;renderRank();return}
  if(e.target.id==='more'){LIMIT+=50;renderRank();return}
  if(e.target.id==='scrim'||e.target.closest('[data-act=close]')){closeDr();return}
  const sb=e.target.closest('[data-sub]');if(sb&&DR){DR.tab=sb.dataset.sub;renderDr();return}
  const b=e.target.closest('button[data-act]');const card=e.target.closest('.lib');
  if(b&&card){e.stopPropagation();const id=card.dataset.id;
    if(b.dataset.act==='remove'){if(!confirm('Parar de vigiar '+id+'?'))return;await post('remove',{id});toast('Biblioteca removida')}
    else{const r=await post('refresh',{id});toast(r.ok?'Scan iniciado':'Já tem um scan rodando, tente em seguida')}
    load();return}
  if(card&&!e.target.closest('a')){openDr(card.dataset.id);return}
  const row=e.target.closest('.row.click');if(row&&!e.target.closest('a')){openSite(row.dataset.url?{url:row.dataset.url}:{dominio:row.dataset.dom});return}
});
document.addEventListener('mousemove',e=>{const h=e.target.closest&&e.target.closest('rect.hit');const tt=$('#tt');if(!tt)return;
  if(!h){tt.style.opacity=0;return}const [y,m]=h.dataset.k.split('-');const box=tt.parentElement.getBoundingClientRect();
  tt.innerHTML=`<b>${MES[+m-1]}/${y}</b> · ${fmt(+h.dataset.v)} criativo${+h.dataset.v===1?'':'s'}`;tt.style.left=(e.clientX-box.left)+'px';tt.style.top=(e.clientY-box.top)+'px';tt.style.opacity=1});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDr()});
$('#btnAdd').onclick=async()=>{const v=$('#url').value.trim();if(!v)return;const isFb=FB()||v.includes('facebook.com');
  const r=await post('add',{url:v,nota:$('#nota').value,src:isFb?'fb':'google'});if(r.erro)return alert(r.erro);
  $('#url').value='';$('#nota').value='';toast(r.ja_existia?'Já estava na lista, scan iniciado':'Adicionada, scan iniciado');if(isFb&&!FB())setTab('fb');else load()};
$('#url').addEventListener('keydown',e=>{if(e.key==='Enter')$('#btnAdd').click()});
$('#btnAll').onclick=async()=>{const r=await post('refresh',{src:SRC});toast(r.ok?'Scan da aba iniciado':'Já tem um scan rodando');load()};
$('#soAtivos').onchange=()=>{LIMIT=50;renderRank()};$('#busca').oninput=()=>{LIMIT=50;renderRank()};$('#libBusca').oninput=()=>renderLibs((G.config.itens||[]).map(c=>({c,a:(G.advertisers.find(a=>a.id===c.id)||{})})));
document.body.dataset.src=SRC;if(STATIC)document.body.classList.add('static');load();
if(!STATIC)setInterval(async()=>{const st=await api('status');if(st.running!==G?.refresh?.running)load()},8000);
