(async()=>{
const fmt=n=>Math.round(n).toLocaleString('en-US');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{
const response=await fetch('data/dubai-real-estate.json');if(!response.ok)throw Error('Data unavailable');const d=await response.json();
const months=['Jan','Feb','Mar','Apr','May','Jun'];
const monthly=d.monthly;
const x=i=>86+i*132,y=v=>260-(v-1500000)/200000*210;
const chart=document.getElementById('trend-chart');
chart.innerHTML=`<svg viewBox="0 0 830 315" role="img" aria-labelledby="trend-title trend-desc"><title id="trend-title">Monthly average property sale price</title><desc id="trend-desc">Average prices fall from January to April, then recover in May and June. Values in AED. Vertical axis runs from 1.50 to 1.70 million.</desc>${[1500000,1550000,1600000,1650000,1700000].map(v=>`<line x1="86" y1="${y(v)}" x2="746" y2="${y(v)}" stroke="#dfe6df"/><text x="75" y="${y(v)+4}" text-anchor="end" font-size="12" fill="#526c65">${(v/1000000).toFixed(2)}M</text>`).join('')}<polyline points="${monthly.map((r,i)=>`${x(i)},${y(r.mean)}`).join(' ')}" fill="none" stroke="#b58c38" stroke-width="3"/>${monthly.map((r,i)=>`<circle cx="${x(i)}" cy="${y(r.mean)}" r="5" fill="#173f3a"><title>${months[i]}: AED ${fmt(r.mean)}; ${fmt(r.count)} sales</title></circle><text x="${x(i)}" y="${y(r.mean)-15}" text-anchor="middle" font-size="12" fill="#173f3a">${fmt(r.mean)}</text><text x="${x(i)}" y="290" text-anchor="middle" font-size="13" fill="#526c65">${months[i]}</text>`).join('')}</svg>`;
const buttons=document.getElementById('trend-months');
buttons.innerHTML=months.map((m,i)=>`<button type="button" data-month="${i}" aria-pressed="false">${m}</button>`).join('');
function selectMonth(i){const r=monthly[i];buttons.querySelectorAll('button').forEach((b,k)=>b.setAttribute('aria-pressed',String(i===k)));document.getElementById('trend-detail').textContent=`${months[i]} 2023: AED ${fmt(r.mean)} average sale price across ${fmt(r.count)} sales.`;}
buttons.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>selectMonth(i)));selectMonth(3);
document.getElementById('trend-table').innerHTML='<table><caption>Monthly averages and filtered sale counts</caption><thead><tr><th scope="col">Month (2023)</th><th scope="col">Average price (AED)</th><th scope="col">Sales</th></tr></thead><tbody>'+monthly.map((r,i)=>`<tr><th scope="row">${months[i]}</th><td>${fmt(r.mean)}</td><td>${fmt(r.count)}</td></tr>`).join('')+'</tbody></table>';
function draw(id){
const metric=document.getElementById(id+'-metric').value;let rows;
if(id==='types')rows=d.types.slice(0,8);
if(id==='areas')rows=d.areas.filter(r=>r.count>=Number(document.getElementById('areas-min').value));
if(id==='amenities'){const group=document.getElementById('amenities-group').value;rows=group==='metro'?d.metro.slice(0,20):d[group].filter(r=>r.count>=10);}
rows=[...rows].sort((a,b)=>b[metric]-a[metric]);if(id==='areas')rows=rows.slice(0,10);
const max=Math.max(...rows.map(r=>r[metric]));const value=r=>(metric==='count'?'':'AED ')+fmt(r[metric]);
document.getElementById(id+'-chart').innerHTML=rows.map(r=>`<div class="barrow" tabindex="0" aria-label="${esc(r.name)}: ${value(r)}; ${fmt(r.count)} sales" title="${esc(r.name)}: ${value(r)} · ${fmt(r.count)} sales"><span>${esc(r.name)}<small>${fmt(r.count)} sales</small></span><div class="bartrack" aria-hidden="true"><div class="barfill" style="width:${r[metric]/max*100}%"></div></div><b>${value(r)}</b></div>`).join('');
document.getElementById(id+'-table').innerHTML='<table><caption>Displayed groups: sales and prices in AED</caption><thead><tr><th scope="col">Group</th><th scope="col">Sales</th><th scope="col">Median (AED)</th><th scope="col">Mean (AED)</th></tr></thead><tbody>'+rows.map(r=>`<tr><th scope="row">${esc(r.name)}</th><td>${fmt(r.count)}</td><td>${fmt(r.median)}</td><td>${fmt(r.mean)}</td></tr>`).join('')+'</tbody></table>';
}
for(const id of ['types','areas','amenities']){draw(id);document.getElementById(id+'-metric').addEventListener('change',()=>draw(id));}
document.getElementById('areas-min').addEventListener('change',()=>draw('areas'));
document.getElementById('amenities-group').addEventListener('change',()=>draw('amenities'));
}catch(e){document.querySelectorAll('.bars').forEach(el=>el.textContent='The interactive data could not load. Please refresh the page.');}
})();
