// ===== SHARED DATA LAYER =====
// Usado por index.html e admin.html

const DB = {
  get(key, def) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
  },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },

  getConfig() {
    return this.get('lc_config', {
      nome: 'Lanchonete da Comunidade',
      slogan: 'Sabor de verdade, perto de você',
      logoData: '',
      coverData: '',
      endereco: 'Rua Principal, 123',
      whatsapp: '(88) 99999-9999',
      horarios: { semana: '10h às 22h', sabado: '10h às 23h', domingo: 'Fechado' },
      scheduleOpen:  { seg:'10:00', ter:'10:00', qua:'10:00', qui:'10:00', sex:'10:00', sab:'10:00', dom:null },
      scheduleClose: { seg:'22:00', ter:'22:00', qua:'22:00', qui:'22:00', sex:'22:00', sab:'23:00', dom:null },
      delivery: true,
      adminPass: 'admin123',
      pagamentos: ['dinheiro','pix','cartao']
    });
  },
  saveConfig(c) { this.set('lc_config', c); },

  getProducts() {
    return this.get('lc_products', [
      { id:'prod1', name:'X-Burguer Clássico', desc:'Pão brioche, blend de carne 180g, queijo, alface, tomate e molho especial da casa', price:18.00, category:'Lanches', img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', ativo:true },
      { id:'prod2', name:'X-Bacon Duplo', desc:'Dois hambúrgueres, bacon crocante, queijo cheddar e maionese defumada', price:26.00, category:'Lanches', img:'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', ativo:true },
      { id:'prod3', name:'Frango Crocante', desc:'Filé de frango empanado, alface americana, tomate e molho ranch', price:19.00, category:'Lanches', img:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80', ativo:true },
      { id:'prod4', name:'Batata Frita Grande', desc:'Porção crocante de batata palito com sal e temperos', price:14.00, category:'Acompanhamentos', img:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', ativo:true },
      { id:'prod5', name:'Onion Rings', desc:'Anéis de cebola empanados e fritos, crocantes por fora e macios por dentro', price:13.00, category:'Acompanhamentos', img:'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80', ativo:true },
      { id:'prod6', name:'Refrigerante Lata', desc:'Lata gelada 350ml — Coca-Cola, Guaraná ou Sprite', price:6.00, category:'Bebidas', img:'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80', ativo:true },
      { id:'prod7', name:'Suco Natural', desc:'Suco de fruta natural 300ml — Laranja, Acerola ou Maracujá', price:9.00, category:'Bebidas', img:'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', ativo:true },
      { id:'prod8', name:'Milk-Shake', desc:'Batido cremoso 400ml — Chocolate, Morango ou Baunilha', price:16.00, category:'Bebidas', img:'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', ativo:true },
    ]);
  },
  saveProducts(p) { this.set('lc_products', p); },

  getRegions() {
    return this.get('lc_regions', [
      { id:'r1', name:'Centro', frete:0,    ativo:true },
      { id:'r2', name:'Bairro Novo',  frete:3.00, ativo:true },
      { id:'r3', name:'Conjunto Habitacional', frete:5.00, ativo:true },
      { id:'r4', name:'Sítio São João', frete:8.00, ativo:true },
    ]);
  },
  saveRegions(r) { this.set('lc_regions', r); },

  getOrders() { return this.get('lc_orders', []); },
  saveOrders(o) { this.set('lc_orders', o); },

  getUsers() { return this.get('lc_users', []); },
  saveUsers(u) { this.set('lc_users', u); },

  getCurrentUser() { return this.get('lc_session', null); },
  setCurrentUser(u) { this.set('lc_session', u); },
  clearSession() { localStorage.removeItem('lc_session'); },
};

// ===== SHARED UTILS =====
const Utils = {
  money(v) { return 'R$ ' + parseFloat(v||0).toFixed(2).replace('.',','); },
  date(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  },
  timeAgo(ts) {
    const diff = Math.floor((Date.now()-ts)/60000);
    if (diff < 1) return 'agora mesmo';
    if (diff < 60) return diff + ' min atrás';
    if (diff < 1440) return Math.floor(diff/60) + 'h atrás';
    return Math.floor(diff/1440) + 'd atrás';
  },
  maskPhone(el) {
    let v = el.value.replace(/\D/g,'');
    if (v.length > 11) v = v.slice(0,11);
    if (v.length > 6) v = '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);
    else if (v.length > 2) v = '('+v.slice(0,2)+') '+v.slice(2);
    el.value = v;
  },
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); },
  isOpen() {
    const cfg = DB.getConfig();
    const now = new Date();
    const days = ['dom','seg','ter','qua','qui','sex','sab'];
    const d = days[now.getDay()];
    const ab = (cfg.scheduleOpen||{})[d];
    const fe = (cfg.scheduleClose||{})[d];
    if (!ab || !fe) return false;
    const cur = now.getHours()*60 + now.getMinutes();
    const [ah,am] = ab.split(':').map(Number);
    const [fh,fm] = fe.split(':').map(Number);
    return cur >= ah*60+am && cur < fh*60+fm;
  },
  statusLabel(s) {
    return {pendente:'Pendente',confirmado:'Confirmado',preparando:'Preparando',pronto:'Pronto p/ retirada',saiu:'Saiu p/ entrega',entregue:'Entregue',cancelado:'Cancelado'}[s]||s;
  },
  statusColor(s) {
    return {pendente:'#E65100',confirmado:'#1565C0',preparando:'#F57F17',pronto:'#2E7D32',saiu:'#6A1B9A',entregue:'#37474F',cancelado:'#B71C1C'}[s]||'#555';
  },
  statusBg(s) {
    return {pendente:'#FFF3E0',confirmado:'#E3F2FD',preparando:'#FFFDE7',pronto:'#E8F5E9',saiu:'#F3E5F5',entregue:'#ECEFF1',cancelado:'#FFEBEE'}[s]||'#f5f5f5';
  },
  payLabel(p) { return {dinheiro:'Dinheiro',pix:'PIX',cartao:'Cartão'}[p]||p; },
  typeLabel(t) { return t==='entrega'?'Entrega':'Retirada'; },
  fileToBase64(file) {
    return new Promise((res,rej)=>{
      const r = new FileReader();
      r.onload = ()=>res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  },
};