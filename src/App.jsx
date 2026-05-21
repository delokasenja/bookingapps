import React, { useState, useEffect, useMemo, useRef, useReducer, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import { getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, STATE_DOC, storage } from './firebase';
import {
  Calendar as CalendarIcon, MapPin, Wifi, Wind, Car, Utensils, Tv,
  CheckCircle, XCircle, Home, Settings, CreditCard, Clock,
  Image as ImageIcon, LayoutDashboard, Trash2, Plus, ArrowLeft,
  CalendarDays, BookOpen, User, Phone, List, ShieldAlert,
  ChevronRight, ChevronLeft, Moon, Sun, Eye, EyeOff, Search,
  ChevronUp, Bell, ShieldCheck, Shield, Printer, FileEdit,
  Receipt, Hash, AlertCircle, Info, X, IdCard,
  Download, MessageSquare, Upload, Navigation, Map as MapIcon, TrendingUp,
  Sparkles, ClipboardList, Camera, Users, ChevronDown, Send
} from 'lucide-react';

const BRAND_FONT = { fontFamily: "'Pacifico', cursive", letterSpacing: '0.01em' };

const FontSetup = () => (
  <style dangerouslySetInnerHTML={{__html: `
    html, body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    div, p, span, h1, h2, h3, h4, h5, h6, a, li, td, th,
    input, select, textarea, button, label {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    }
    .brand-font, .brand-font * {
      font-family: 'Pacifico', cursive !important;
      letter-spacing: 0.01em !important;
      font-style: normal !important;
    }
    html { scroll-behavior: smooth; }
    body { background-color: #FAF7F2; color: #111827; transition: background-color 0.3s, color 0.3s; overflow-x: clip; -webkit-tap-highlight-color: transparent; }
    .bali-gradient { background: linear-gradient(135deg, #f59e0b22 0%, #10b98122 50%, #0891b222 100%); }
    .bali-badge { background: linear-gradient(90deg, #d97706, #b45309); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .price-glow { background: linear-gradient(135deg, #d97706, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .bali-card-border { border-image: linear-gradient(135deg, #d97706, #10b981) 1; }
    .app-shadow { box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
    .booking-shadow { box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    .bottom-bar-shadow { box-shadow: 0 -4px 24px rgba(0,0,0,0.06); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    html.dark body { background-color: #0F172A; color: #FAF7F2; }
    html.dark .bg-white { background-color: #1E293B !important; border-color: #334155 !important; }
    html.dark .bg-gray-50, html.dark .bg-gray-100 { background-color: #0F172A !important; border-color: #334155 !important; }
    html.dark .text-gray-900, html.dark .text-gray-800 { color: #F8FAFC !important; }
    html.dark .text-gray-700, html.dark .text-gray-600, html.dark .text-gray-500 { color: #94A3B8 !important; }
    html.dark .text-gray-400 { color: #64748B !important; }
    html.dark .border-gray-100, html.dark .border-gray-200, html.dark .border-gray-300 { border-color: #334155 !important; }
    html.dark .app-shadow { box-shadow: 0 4px 25px rgba(0,0,0,0.4) !important; }
    html.dark .booking-shadow { box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important; }
    html.dark input, html.dark select, html.dark textarea { color: #F8FAFC; }
    html.dark .bottom-bar-shadow { box-shadow: 0 -4px 30px rgba(0,0,0,0.5) !important; }
    @media print {
      body * { visibility: hidden; }
      #printable-receipt, #printable-receipt * { visibility: visible; }
      #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 20px; display: block !important; }
      .no-print { display: none !important; }
    }
  `}} />
);

const INITIAL_STATE = {
  homepage: {
    homestay_name: 'Deloka Senja',
    tagline: 'Konsep Moden Bali • Sungai Petani, Kedah',
    short_description: 'Homestay Deloka Senja berkonsepkan Moden Bali terletak di Darulaman Perdana, Sungai Petani, Kedah. Sesuai untuk keluarga dan kumpulan sehingga 10 orang. Dilengkapi 3 bilik tidur berhawa dingin, 2 bilik air lengkap, dapur lengkap dengan set BBQ, WiFi berkelajuan tinggi, Netflix, gazebo dan ruang aktiviti yang selesa. Rehat dengan tenang, nikmati suasana ala Bali bersama orang tersayang. 🏡',
    whatsapp_number: '60145346542',
    address: 'Darulaman Perdana, Sungai Petani, Kedah',
    check_in_time: '15:00',
    check_out_time: '12:00',
    maps_url: 'https://maps.app.goo.gl/LGdGHKHbvG5VUfCV9',
    waze_url: '',
    facebook_url: '',
    instagram_url: '',
    bank_name: 'Maybank',
    bank_account: '',
    bank_holder: '',
    bank_qr: '',
    logo_url: '',
    key_door_pin: '',
    key_wifi_name: '',
    key_wifi_pw: '',
    key_note: 'Pengambilan dan pemulangan kunci adalah melalui mailbox yang disediakan. PIN kunci akan dimaklumkan setelah pembayaran penuh selesai. Sila kunci semula selepas mengambil kunci rumah.',
  },
  pricing: { weekday: 250, weekend: 280, public_holiday: 300, school_holiday: 300, peak_season: 300, deposit: 150, extra_guest_fee: 30, max_guests: 10, min_nights: 1 },
  special_dates: [
    { id: 1, start: '2026-06-01', end: '2026-06-03', type: 'public_holiday', price: 400, status: 'available', note: 'Cuti Umum Keputeraan' }
  ],
  gallery: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  ],
  facilities: [
    { id: 1,  name: 'WiFi Berkelajuan Tinggi',  icon: 'Wifi'       },
    { id: 2,  name: '4 Unit Aircond',            icon: 'Wind'       },
    { id: 3,  name: 'Parking Luas',              icon: 'Car'        },
    { id: 4,  name: 'Dapur Lengkap',             icon: 'Utensils'   },
    { id: 5,  name: 'Netflix & Smart TV',        icon: 'Tv'         },
    { id: 6,  name: '3 Bilik Tidur',             icon: 'Moon'       },
    { id: 7,  name: '2 Bilik Air Lengkap',       icon: 'ShieldCheck'},
    { id: 8,  name: 'Set BBQ',                   icon: 'Sparkles'   },
    { id: 9,  name: 'Gazebo & Ruang Lepak',      icon: 'Home'       },
    { id: 10, name: 'Mesin Basuh & Laundry',     icon: 'CheckCircle'},
    { id: 11, name: 'Penapis Air',               icon: 'CheckCircle'},
    { id: 12, name: 'Muat 8–10 Orang',           icon: 'Users'      },
  ],
  rules: [
    { id: 1,  title: '⏰ Waktu Check-in & Check-out',  desc: 'Check-in: 3.00 PM | Check-out: 12.00 PM. Late check-out dikenakan caj RM50 bagi setiap 30 minit melebihi 12.10 tgh hari.' },
    { id: 2,  title: '🚭 Larangan Merokok',             desc: 'Dilarang merokok di dalam rumah.' },
    { id: 3,  title: '🍻 Makanan & Minuman',            desc: 'Dilarang membawa makanan tidak halal dan minuman beralkohol.' },
    { id: 4,  title: '👥 Had Tetamu',                   desc: 'Maksimum 10 orang sahaja termasuk kanak-kanak.' },
    { id: 5,  title: '🔇 Kebisingan',                   desc: 'Dilarang membuat bising selepas 10.00 malam untuk menghormati kejiranan.' },
    { id: 6,  title: '🧹 Kebersihan & Perabot',         desc: 'Dilarang mengalihkan perabot. Jaga kebersihan sepanjang penginapan.' },
    { id: 7,  title: '🔌 Elektrik & Aircond',           desc: 'Tutup semua suis elektrik dan aircond apabila tidak digunakan atau keluar.' },
    { id: 8,  title: '🚪 Keselamatan',                  desc: 'Kunci pintu dan pagar selepas keluar atau semasa checkout.' },
    { id: 9,  title: '🔑 Pengambilan Kunci',             desc: 'Pengambilan dan pemulangan kunci adalah melalui mailbox yang disediakan.' },
    { id: 10, title: '🔥 BBQ Grill',                    desc: 'BBQ grill perlu dibersihkan selepas digunakan. Caj pembersihan RM20 akan dikenakan jika tidak dicuci.' },
    { id: 11, title: '⚠️ Kerosakan',                    desc: 'Jika ada kerosakan atau masalah, sila maklumkan kepada pihak homestay dengan segera.' },
  ],
  bookings: [],
  admins: [{ id: 1, username: 'admin', password: 'admin123', role: 'Superadmin' }],
  wa_templates: {
    new_booking: '*Tempahan {homestay_name}*\n\nNama: {nama}\nNo. Tel: {telefon}\nTempahan: {inv}\nIn: {masuk}\nOut: {keluar}\nMalam: {malam}\nTetamu: {tetamu}\nJumlah: RM {jumlah}\nDeposit: RM {deposit}\n\n_Sila sahkan tempahan dan hantar butiran pembayaran deposit._',
    to_guest: 'Hai {nama}, berkenaan tempahan *{inv}*\nTarikh: {masuk} - {keluar}\nJumlah: RM {jumlah}\n\nSemak status tempahan anda:\n{link}',
    deposit_confirmed: 'Terima kasih {nama}! 🎉\n\nDeposit bagi tempahan *{inv}* telah kami terima dan disahkan.\n\nTarikh: *{masuk}* hingga *{keluar}*\nJumlah: RM {jumlah}\n\nJumpa anda tidak lama lagi! 🏡',
    check_in_reminder: 'Salam {nama}! 👋\n\nSekadar mengingatkan, tempahan anda *{inv}* adalah esok.\n\n📅 Check-in: *{masuk}* ({masa_masuk})\n📍 Alamat: {alamat}\n\nSelamat datang dan selamat berehat!',
    check_out_reminder: 'Salam {nama}! 😊\n\nPeringatan mesra — tempahan *{inv}* tamat hari ini.\n\n🕐 Check-out: *{keluar}* sebelum {masa_keluar}\n\nTerima kasih kerana menginap! Harap berpuas hati.',
    booking_cancelled: 'Salam {nama},\n\nMaaf dimaklumkan, tempahan *{inv}* (In: {masuk} | Out: {keluar}) telah dibatalkan.\n\nSila hubungi kami untuk sebarang pertanyaan. Maaf atas kesulitan. 🙏',
    payment_reminder: 'Salam {nama},\n\nSekadar peringatan, deposit sebanyak *RM {deposit}* bagi tempahan *{inv}* belum diterima.\n\nSila transfer ke:\n🏦 {bank}\n💳 {akaun}\n👤 {pemegang}\n\nHantar resit selepas transfer. Terima kasih!',
    review_request: 'Salam {nama}! 🌟\n\nTerima kasih kerana menginap di homestay kami untuk tempahan *{inv}*.\n\nKami amat menghargai sekiranya anda boleh berkongsi ulasan anda. Pengalaman anda sangat bermakna kepada kami!\n\nSekian, terima kasih. 🙏',
  },
  emailjs_config: {
    service_id: '',
    admin_template_id: '',
    customer_template_id: '',
    public_key: '',
    admin_email: '',
  },
  cleaners: [
    { id: 1, name: 'Siti Aminah', phone: '0123456789', username: 'cleaner1', password: 'clean123', active: true },
    { id: 2, name: 'Rohani Bt Karim', phone: '0167891234', username: 'cleaner2', password: 'clean456', active: true },
  ],
  cleaner_sections: [
    {
      id: 1, name: 'Ruang Tamu',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      tasks: [
        { id: 101, task: 'Sapu dan mop lantai' },
        { id: 102, task: 'Lap meja, TV dan rak' },
        { id: 103, task: 'Susun kusyen dan hiasan' },
        { id: 104, task: 'Bersihkan cermin dan tingkap' },
        { id: 105, task: 'Kosongkan tong sampah' },
      ]
    },
    {
      id: 2, name: 'Bilik 1',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      tasks: [
        { id: 201, task: 'Tukar cadar dan sarung bantal' },
        { id: 202, task: 'Kemaskini bantal dan selimut' },
        { id: 203, task: 'Lap almari dan meja sisi' },
        { id: 204, task: 'Sapu dan mop lantai' },
        { id: 205, task: 'Kosongkan tong sampah' },
      ]
    },
    {
      id: 3, name: 'Bilik 2',
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      tasks: [
        { id: 301, task: 'Tukar cadar dan sarung bantal' },
        { id: 302, task: 'Kemaskini bantal dan selimut' },
        { id: 303, task: 'Lap almari dan meja sisi' },
        { id: 304, task: 'Sapu dan mop lantai' },
        { id: 305, task: 'Kosongkan tong sampah' },
      ]
    },
    {
      id: 4, name: 'Bilik Air',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
      tasks: [
        { id: 401, task: 'Gosok tandas dalam dan luar' },
        { id: 402, task: 'Bersihkan sinki dan paip' },
        { id: 403, task: 'Bersihkan shower dan dinding' },
        { id: 404, task: 'Lap cermin bilik air' },
        { id: 405, task: 'Tukar tuala bersih' },
        { id: 406, task: 'Tambah stok (sabun, syampu, tisu)' },
        { id: 407, task: 'Mop lantai bilik air' },
      ]
    },
    {
      id: 5, name: 'Dapur',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      tasks: [
        { id: 501, task: 'Basuh dan susun pinggan/periuk' },
        { id: 502, task: 'Lap counter dan meja dapur' },
        { id: 503, task: 'Bersihkan dapur gas/elektrik' },
        { id: 504, task: 'Lap peti sejuk luar' },
        { id: 505, task: 'Kosongkan tong sampah dapur' },
        { id: 506, task: 'Sapu dan mop lantai dapur' },
      ]
    },
    {
      id: 6, name: 'Kawasan Luar',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      tasks: [
        { id: 601, task: 'Sapu teras dan parkir' },
        { id: 602, task: 'Bersihkan kolam renang (jika ada)' },
        { id: 603, task: 'Periksa lampu dan suis' },
        { id: 604, task: 'Ambil gambar keseluruhan selepas siap' },
      ]
    },
  ],
  cleaner_reports: [],
  cleaner_payment_notes: {},
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'HYDRATE': return {
      ...INITIAL_STATE,
      ...action.payload,
      // Deep-merge these objects so new fields added to INITIAL_STATE
      // are always present even when loading from existing Firestore data
      homepage:       { ...INITIAL_STATE.homepage,       ...(action.payload.homepage       || {}) },
      pricing:        { ...INITIAL_STATE.pricing,        ...(action.payload.pricing        || {}) },
      wa_templates:   { ...INITIAL_STATE.wa_templates,   ...(action.payload.wa_templates   || {}) },
      emailjs_config: { ...INITIAL_STATE.emailjs_config, ...(action.payload.emailjs_config || {}) },
    };
    case 'ADD_BOOKING': {
      // Guard: prevent duplicate if Firestore snapshot + local dispatch fire for same booking
      if (state.bookings.some(b => b.id === action.payload.id)) return state;
      return {...state, bookings: [...state.bookings, action.payload]};
    }
    case 'UPDATE_BOOK': return {...state, bookings: state.bookings.map(b=>b.id===action.id ? {...b, status:action.val} : b)};
    case 'DEL_BOOK': return {...state, bookings: state.bookings.filter(b=>b.id !== action.id)};
    case 'UPDATE_BOOK_DETAIL': return {...state, bookings: state.bookings.map(b=>b.id===action.id ? {...b, ...action.payload} : b)};
    case 'UPDATE_CUSTOMER_DETAIL': return {...state, bookings: state.bookings.map(b=>b.id===action.id ? {...b, guest_ic: action.ic, agreed_terms: action.agreed, ...(action.email!==undefined?{guest_email:action.email}:{})} : b)};
    case 'EXPIRE_HOLDS': return {...state, bookings: state.bookings.map(b=> b.status==='hold' && b.hold_until && new Date(b.hold_until)<new Date() ? {...b, status:'expired'} : b)};
    case 'UPDATE_PRICING': return {...state, pricing: action.payload};
    case 'UPDATE_HOMEPAGE': return {...state, homepage: action.payload};
    case 'ADD_SPECIAL': return {...state, special_dates: [...state.special_dates, action.payload]};
    case 'DEL_SPECIAL': return {...state, special_dates: state.special_dates.filter(s=>s.id !== action.id)};
    case 'ADD_GALLERY_IMAGE': return {...state, gallery: [...state.gallery, action.payload]};
    case 'DEL_GALLERY_IMAGE': return {...state, gallery: state.gallery.filter((_,i) => i !== action.index)};
    case 'REORDER_GALLERY': return {...state, gallery: action.gallery};
    case 'ADD_ADMIN': return {...state, admins: [...state.admins, action.payload]};
    case 'DEL_ADMIN': return {...state, admins: state.admins.filter(a=>a.id !== action.id)};
    case 'UPDATE_WA_TEMPLATES': return {...state, wa_templates: action.payload};
    case 'UPDATE_EMAILJS_CONFIG': return {...state, emailjs_config: action.payload};
    case 'ADD_RULE': return {...state, rules: [...state.rules, action.payload]};
    case 'UPDATE_RULE': return {...state, rules: state.rules.map(r=>r.id===action.id?{...r,...action.payload}:r)};
    case 'DEL_RULE': return {...state, rules: state.rules.filter(r=>r.id!==action.id)};
    case 'ADD_FACILITY': return {...state, facilities: [...state.facilities, action.payload]};
    case 'UPDATE_FACILITY': return {...state, facilities: state.facilities.map(f=>f.id===action.id?{...f,...action.payload}:f)};
    case 'DEL_FACILITY': return {...state, facilities: state.facilities.filter(f=>f.id!==action.id)};
    case 'ADD_CLEANER': return {...state, cleaners: [...(state.cleaners||[]), action.payload]};
    case 'DEL_CLEANER': return {...state, cleaners: (state.cleaners||[]).filter(c=>c.id !== action.id)};
    case 'ADD_CLEANER_SECTION': return {...state, cleaner_sections: [...(state.cleaner_sections||[]), action.payload]};
    case 'DEL_CLEANER_SECTION': return {...state, cleaner_sections: (state.cleaner_sections||[]).filter(s=>s.id!==action.id)};
    case 'UPDATE_SECTION_IMAGE': return {...state, cleaner_sections: (state.cleaner_sections||[]).map(s=>s.id===action.id?{...s,image:action.image}:s)};
    case 'ADD_SECTION_TASK': return {...state, cleaner_sections: (state.cleaner_sections||[]).map(s=>s.id===action.sectionId?{...s,tasks:[...(s.tasks||[]),action.payload]}:s)};
    case 'DEL_SECTION_TASK': return {...state, cleaner_sections: (state.cleaner_sections||[]).map(s=>s.id===action.sectionId?{...s,tasks:(s.tasks||[]).filter(t=>t.id!==action.taskId)}:s)};
    case 'ADD_CLEANER_REPORT': {
      const exists = (state.cleaner_reports||[]).find(r=>r.id===action.payload.id);
      if (exists) return state;
      return {...state, cleaner_reports: [...(state.cleaner_reports||[]), action.payload]};
    }
    case 'MARK_REPORT_SEEN': return {...state, cleaner_reports: (state.cleaner_reports||[]).map(r=>r.id===action.id?{...r,admin_seen:true}:r)};
    case 'ACK_CLEANER_REPORT': return {...state, cleaner_reports: (state.cleaner_reports||[]).map(r=>r.id===action.id?{...r,status:'acknowledged',admin_seen:true,upah:action.upah||0,ack_at:new Date().toISOString()}:r)};
    case 'REJECT_CLEANER_REPORT': return {...state, cleaner_reports: (state.cleaner_reports||[]).map(r=>r.id===action.id?{...r,status:'rejected',admin_seen:true}:r)};
    case 'DEL_CLEANER_REPORT': return {...state, cleaner_reports: (state.cleaner_reports||[]).filter(r=>r.id!==action.id)};
    case 'UPDATE_CLEANER_NOTE': return {...state, cleaner_payment_notes: {...(state.cleaner_payment_notes||{}), [action.cleanerId]: action.payload}};
    default: return state;
  }
};

// ================= UTILS =================
const formatCurrency = (amount) => `RM ${parseFloat(amount||0).toFixed(2)}`;
const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString + (dateString.length === 10 ? 'T00:00:00' : ''));
  const pad = n => n < 10 ? '0' + n : n;
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
};
const formatCountdown = (holdUntil) => {
  if (!holdUntil) return null;
  const diff = new Date(holdUntil) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h} jam ${m} minit`;
};

const checkOverlap = (newIn, newOut, bookings, specialDates, ignoreId = null) => {
  const nIn = new Date(newIn).setHours(0,0,0,0);
  const nOut = new Date(newOut).setHours(0,0,0,0);
  const isBooked = bookings.some(b => {
    if (b.id === ignoreId || b.status === 'cancelled' || b.status === 'expired') return false;
    const eIn = new Date(b.check_in).setHours(0,0,0,0);
    const eOut = new Date(b.check_out).setHours(0,0,0,0);
    return nIn < eOut && nOut > eIn;
  });
  const isBlocked = specialDates.some(sd => {
    if (sd.status !== 'blocked') return false;
    const sIn = new Date(sd.start).setHours(0,0,0,0);
    const sOut = new Date(sd.end).setHours(0,0,0,0);
    return nIn < sOut && nOut > sIn;
  });
  return isBooked || isBlocked;
};

const calculatePrice = (checkIn, checkOut, pricing, specialDates, guests) => {
  let start = new Date(checkIn);
  const end = new Date(checkOut);
  let totalNights = 0, subtotal = 0;
  const breakdown = [];
  const numGuests = Number(guests);
  while (start < end) {
    const currentDate = new Date(start);
    const dateStr = currentDate.toISOString().split('T')[0];
    const day = currentDate.getDay();
    const isWeekend = day === 5 || day === 6 || day === 0;
    let nightPrice = isWeekend ? pricing.weekend : pricing.weekday;
    let nightType = isWeekend ? 'Hujung Minggu' : 'Hari Biasa';
    let priority = 6;
    specialDates.forEach(sd => {
      const sStart = new Date(sd.start).setHours(0,0,0,0);
      const sEnd = new Date(sd.end).setHours(0,0,0,0);
      const curr = new Date(currentDate).setHours(0,0,0,0);
      if (curr >= sStart && curr < sEnd && sd.status !== 'blocked') {
        const tp = { custom_price:1, peak_season:2, public_holiday:3, school_holiday:4 };
        const cp = tp[sd.type] || 5;
        if (cp < priority) { priority=cp; nightPrice=sd.price||pricing[sd.type]||nightPrice; nightType=sd.type.replace('_',' ').toUpperCase(); }
      }
    });
    breakdown.push({ date: dateStr, type: nightType, price: nightPrice });
    subtotal += parseFloat(nightPrice);
    start.setDate(start.getDate() + 1);
    totalNights++;
  }
  const extraGuests = Math.max(0, numGuests - 6);
  const extraGuestTotal = extraGuests * pricing.extra_guest_fee * totalNights;
  const grandTotal = subtotal + extraGuestTotal;
  return { totalNights, breakdown, subtotal, extraGuestFee: extraGuestTotal, grandTotal, deposit: pricing.deposit };
};

const IconMap = { Wifi, Wind, Car, Utensils, Tv, CheckCircle, Users, Moon, MapPin, CreditCard, Camera, Sparkles, Home, ShieldCheck };

const renderWATemplate = (template, vars) =>
  Object.entries(vars).reduce((t,[k,v]) => t.replace(new RegExp(`{${k}}`,'g'), v??''), template||'');

const isReturningGuest = (phone, bookings, currentId) => {
  const n = (phone||'').replace(/\s/g,'');
  return n.length > 0 && bookings.filter(b => b.id!==currentId && (b.guest_phone||'').replace(/\s/g,'')===n).length > 0;
};

// ================= SHARED COMPONENTS =================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const isErr = type === 'error';
  return (
    <div className="fixed top-24 md:top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in w-[90%] max-w-sm">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-[20px] shadow-xl ${isErr ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-900 text-white border border-gray-800'}`}>
        {isErr ? <XCircle className="w-5 h-5 shrink-0"/> : <CheckCircle className="w-5 h-5 shrink-0"/>}
        <span className="font-medium text-sm leading-tight">{message}</span>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = () => setVisible(window.scrollY > 300); window.addEventListener('scroll',t); return ()=>window.removeEventListener('scroll',t); }, []);
  if (!visible) return null;
  return <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-emerald-600 text-white p-3 rounded-full z-[60] shadow-lg hover:bg-emerald-700 transition-colors"><ChevronUp className="w-6 h-6"/></button>;
};

const Footer = () => (
  <footer className="text-center py-8 mt-10 text-xs font-medium text-gray-400 border-t border-gray-200">
    <div className="flex justify-center items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-emerald-600"/> Sistem Tempahan Selamat</div>
    Deloka Senja Booking System © {new Date().getFullYear()} Hak Cipta Terpelihara
  </footer>
);

// ================= RULES MODAL =================
const RulesModal = ({ rules, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-lg shadow-2xl animate-fade-in flex flex-col"
      style={{maxHeight:'85vh'}}
      onClick={e=>e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 shrink-0">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden"/>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-[12px] flex items-center justify-center shrink-0"><ShieldAlert className="w-5 h-5 text-red-500"/></div>
            <h3 className="text-lg font-bold text-gray-900">Peraturan Rumah</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"><X className="w-4 h-4 text-gray-500"/></button>
        </div>
      </div>
      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 px-6 pb-2 space-y-3">
        {rules.map((r,i) => (
          <div key={r.id} className="flex gap-3 items-start bg-gray-50 p-4 rounded-[16px] border border-gray-100">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
            <div><p className="font-bold text-sm text-gray-900">{r.title}</p><p className="text-sm text-gray-500 mt-0.5">{r.desc}</p></div>
          </div>
        ))}
      </div>
      {/* Sticky footer button */}
      <div className="px-6 py-4 shrink-0 border-t border-gray-100 bg-white rounded-b-[32px]">
        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-4 rounded-[16px] hover:bg-black transition-colors">✓ Saya Faham</button>
      </div>
    </div>
  </div>
);

// ================= MONTH CALENDAR (with date selection) =================
const MonthCalendar = ({ bookings, specialDates, selectable=false, selectedIn='', selectedOut='', onDateClick }) => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (selectedIn) {
      const sel = new Date(selectedIn + 'T00:00:00');
      const now = new Date();
      const diff = (sel.getFullYear() - now.getFullYear()) * 12 + (sel.getMonth() - now.getMonth());
      setOffset(diff);
    }
  }, [selectedIn]);
  const d = new Date(); d.setMonth(d.getMonth()+offset);
  const year = d.getFullYear(), month = d.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const days = Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>new Date(year,month,i+1)));
  const monthNames = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"];

  const getStatus = (date) => {
    if (!date) return null;
    const time = date.getTime();
    const today = new Date().setHours(0,0,0,0);
    if (time < today) return 'past';
    let isBlocked=false, isSpecial=false;
    specialDates.forEach(sd=>{
      const s=new Date(sd.start).setHours(0,0,0,0), e=new Date(sd.end).setHours(0,0,0,0);
      if(time>=s&&time<e){ if(sd.status==='blocked') isBlocked=true; else isSpecial=true; }
    });
    if (isBlocked) return 'blocked';
    const isConfirmed = bookings.some(b=> b.status==='confirmed' && time>=new Date(b.check_in).setHours(0,0,0,0) && time<new Date(b.check_out).setHours(0,0,0,0));
    const isHold = bookings.some(b=> b.status==='hold' && time>=new Date(b.check_in).setHours(0,0,0,0) && time<new Date(b.check_out).setHours(0,0,0,0));
    if (isConfirmed) return 'booked';
    if (isHold) return 'hold';
    if (isSpecial) return 'special';
    return 'available';
  };

  const isInRange = (date) => {
    if (!date || !selectedIn || !selectedOut) return false;
    const t = date.setHours(0,0,0,0);
    const inT = new Date(selectedIn).setHours(0,0,0,0);
    const outT = new Date(selectedOut).setHours(0,0,0,0);
    return t > inT && t < outT;
  };
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={e=>{e.preventDefault();setOffset(o=>o-1)}} className="p-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-[12px] transition-colors"><ChevronLeft className="w-5 h-5"/></button>
        <h4 className="font-bold text-gray-900">{monthNames[month]} {year}</h4>
        <button onClick={e=>{e.preventDefault();setOffset(o=>o+1)}} className="p-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-[12px] transition-colors"><ChevronRight className="w-5 h-5"/></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
        <div>Ah</div><div>Is</div><div>Se</div><div>Ra</div><div>Kh</div><div>Ju</div><div>Sa</div>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((date,i) => {
          if (!date) return <div key={i}/>;
          const status = getStatus(new Date(date));
          const ds = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
          const isStart = ds === selectedIn;
          const isEnd = ds === selectedOut;
          const inRng = isInRange(new Date(date));
          const clickable = selectable && (status==='available'||status==='special');

          let outerCls = 'h-10 flex items-center justify-center ';
          if (isStart && selectedOut) outerCls += 'bg-emerald-100 rounded-l-full';
          else if (isEnd && selectedIn) outerCls += 'bg-emerald-100 rounded-r-full';
          else if (inRng) outerCls += 'bg-emerald-100';

          let innerCls = 'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all ';
          if (status==='past') innerCls += 'text-gray-300 opacity-40';
          else if (status==='blocked'||status==='booked') innerCls += 'bg-red-50 text-red-400 line-through text-xs';
          else if (status==='hold') innerCls += 'bg-blue-50 text-blue-400 font-semibold cursor-default';
          else if (isStart||isEnd) innerCls += 'bg-emerald-600 text-white font-bold shadow-md ' + (clickable?'cursor-pointer':'');
          else if (inRng) innerCls += 'text-emerald-800 font-semibold ' + (clickable?'cursor-pointer':'');
          else if (status==='special') innerCls += 'bg-amber-100 text-amber-800 font-bold ring-1 ring-amber-300 ' + (clickable?'cursor-pointer':'');
          else innerCls += 'text-gray-700 font-bold hover:bg-emerald-50 hover:text-emerald-700 ' + (clickable?'cursor-pointer':'');

          return (
            <div key={i} className={outerCls} onClick={()=>{ if(clickable) onDateClick(ds); }}>
              <div className={innerCls}>{date.getDate()}</div>
            </div>
          );
        })}
      </div>
      {selectable && (
        <p className="text-center text-[11px] text-emerald-600 font-bold mt-3">
          {!selectedIn ? '👆 Klik tarikh masuk' : !selectedOut ? '👆 Klik tarikh keluar' : `✓ ${formatDate(selectedIn)} — ${formatDate(selectedOut)}`}
        </p>
      )}
    </div>
  );
};

// ================= PAYMENT INFO CARD =================
const PaymentInfoCard = ({ homepage, label, amount, headerColor = 'bg-blue-600', tip }) => {
  const [qrFull, setQrFull] = useState(false);
  return (
    <>
      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden app-shadow">
        {/* Header */}
        <div className={`${headerColor} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white/90"/>
            <span className="text-xs font-black text-white">{label}</span>
          </div>
          <span className="text-base font-black text-white tracking-wide">{amount}</span>
        </div>
        <div className="p-4 space-y-3">
          {/* 2-col: left = bank info + account, right = QR */}
          <div className={`grid gap-3 items-start ${homepage?.bank_qr ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Left column */}
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-[12px] px-3 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{homepage?.bank_name || 'Bank'}</p>
                  <p className="text-[10px] text-gray-600 font-bold mt-0.5">{homepage?.bank_holder || '—'}</p>
                </div>
                <Receipt className="w-3.5 h-3.5 text-gray-300 shrink-0"/>
              </div>
              {homepage?.bank_account && (
                <div className="border-2 border-dashed border-gray-200 rounded-[12px] px-3 py-3">
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest mb-1">No. Akaun</p>
                  <p className="text-sm font-black text-gray-900 tracking-[0.1em] select-all leading-snug break-all">{homepage.bank_account}</p>
                </div>
              )}
            </div>
            {/* Right column — QR */}
            {homepage?.bank_qr && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-between w-full">
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest">QR Bayar</p>
                  <button onClick={()=>setQrFull(true)} className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors">
                    <Eye className="w-2.5 h-2.5"/> Full
                  </button>
                </div>
                <div className="border border-gray-200 rounded-[12px] overflow-hidden p-1.5 bg-white w-full cursor-pointer hover:border-blue-300 transition-colors" onClick={()=>setQrFull(true)}>
                  <img src={homepage.bank_qr} alt="QR Bayaran" className="w-full h-auto object-contain max-h-28"/>
                </div>
              </div>
            )}
          </div>
          {/* Tip — full width */}
          {tip && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-[12px] px-3 py-2">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5"/>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">{tip}</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Full-screen lightbox */}
      {qrFull && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm" onClick={()=>setQrFull(false)}>
          <div className="relative flex flex-col items-center gap-4" onClick={e=>e.stopPropagation()}>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Imbas QR untuk Bayar</p>
            <div className="bg-white rounded-[24px] p-5 shadow-2xl">
              <img src={homepage.bank_qr} alt="QR Bayaran" className="w-[72vw] max-w-xs h-auto object-contain"/>
            </div>
            {homepage.bank_account && (
              <div className="bg-white/10 rounded-[14px] px-6 py-3 text-center">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{homepage.bank_name} • {homepage.bank_holder}</p>
                <p className="text-white text-xl font-black tracking-widest select-all">{homepage.bank_account}</p>
              </div>
            )}
            <button onClick={()=>setQrFull(false)} className="mt-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-sm transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ================= BOOKING STATUS MODAL =================
const BookingStatusModal = ({ bookings, dispatch, homepage, pricing, onClose, initialQuery = '' }) => {
  const [step, setStep] = useState('login');
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [ic, setIc] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Baki receipt upload
  const [uploadingBaki, setUploadingBaki] = useState(false);
  const [uploadMsgBaki, setUploadMsgBaki] = useState(null);
  const [pendingFileBaki, setPendingFileBaki] = useState(null);
  const [previewUrlBaki, setPreviewUrlBaki] = useState(null);
  const [fullViewImg, setFullViewImg] = useState(null); // lightbox for uploaded receipt
  const [email, setEmail] = useState('');

  const doSearch = (raw) => {
    const q = (raw !== undefined ? raw : query).trim().toLowerCase();
    if (!q) return;
    const numPart = q.replace(/\D/g,'');
    const found = bookings.find(b =>
      b.id.toLowerCase()===q ||
      (b.invoice_id||'').toLowerCase()===q ||
      (numPart.length >= 4 && (b.invoice_id?.replace(/\D/g,'')===numPart || b.id.replace(/\D/g,'')===numPart)) ||
      b.guest_phone.replace(/\s/g,'')===q.replace(/\s/g,'') ||
      (b.guest_ic && b.guest_ic.replace(/-/g,'')===q.replace(/-/g,''))
    );
    setResult(found||null);
    setNotFound(!found);
    if (found) { setIc(found.guest_ic||''); setEmail(found.guest_email||''); setAgreed(found.agreed_terms||false); setSaved(false); setStep('result'); }
  };

  useEffect(() => {
    if (initialQuery && bookings.length > 0) doSearch(initialQuery);
    // Also catch ?semak= URL param
    const params = new URLSearchParams(window.location.search);
    const semak = params.get('semak');
    if (semak && bookings.length > 0) {
      setQuery(semak); doSearch(semak);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [bookings.length]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key==='Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const statusColor = (s) => ({
    hold:'bg-orange-100 text-orange-700 border-orange-200',
    confirmed:'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled:'bg-red-100 text-red-600 border-red-200',
    expired:'bg-gray-100 text-gray-500 border-gray-200',
    pending:'bg-blue-100 text-blue-700 border-blue-200'
  }[s]||'bg-gray-100 text-gray-600 border-gray-200');

  const statusLabel = (s) => ({
    hold:'⏳ Menunggu Deposit',
    confirmed:'✅ Disahkan',
    cancelled:'✗ Dibatalkan',
    expired:'⚠ Tamat Tempoh',
    pending:'• Pending'
  }[s]||s);

  const countdown = result?.status==='hold' ? formatCountdown(result.hold_until) : null;

  const shareText = result
    ? `🏡 *Status Tempahan ${homepage?.homestay_name||'Homestay'}*\n\n` +
      `📋 No. Tempahan: ${result.invoice_id}\n` +
      `👤 Nama: ${result.guest_name}\n` +
      `📅 Check-in: ${formatDate(result.check_in)}\n` +
      `📅 Check-out: ${formatDate(result.check_out)}\n` +
      `🌙 ${result.total_nights} Malam · ${result.guests} Tetamu\n` +
      `💰 Jumlah: ${formatCurrency(result.total_price)}\n` +
      `📊 Status: ${statusLabel(result.status)}`
    : '';

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden">

      {/* ══════════ LOGIN / SEARCH STEP ══════════ */}
      {step==='login' && (
        <div className="flex flex-col h-full">

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              {homepage?.logo_url
                ? <img src={homepage.logo_url} alt="logo" className="w-8 h-8 rounded-[10px] object-cover"/>
                : <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[10px] flex items-center justify-center"><span className="text-white font-black text-sm brand-font" style={BRAND_FONT}>D</span></div>
              }
              <span className="text-sm font-bold text-gray-500">{homepage?.homestay_name||'Homestay'}</span>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-gray-600"/>
            </button>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
            {/* Icon */}
            <div className="w-20 h-20 bg-purple-50 border-2 border-purple-100 rounded-[28px] flex items-center justify-center mb-6 shadow-sm">
              <Receipt className="w-9 h-9 text-purple-500"/>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1 text-center">Semak Status Tempahan</h1>
            <p className="text-sm text-gray-400 font-medium text-center mb-8">Masukkan no. tempahan, telefon atau IC anda</p>

            {/* Input group */}
            <div className="w-full max-w-sm space-y-3">
              <div className={`flex items-center gap-3 bg-gray-50 border-2 rounded-[18px] px-4 py-1 transition-colors ${notFound?'border-red-300 bg-red-50':'border-gray-200 focus-within:border-purple-400'}`}>
                <Search className={`w-5 h-5 shrink-0 ${notFound?'text-red-400':'text-gray-400'}`}/>
                <input
                  type="text"
                  placeholder="DELOKA-INV-1001 · Tel · IC"
                  value={query}
                  onChange={e=>{ setQuery(e.target.value); setNotFound(false); }}
                  onKeyDown={e=>e.key==='Enter' && doSearch()}
                  autoFocus
                  className="flex-1 py-3.5 bg-transparent outline-none font-bold text-gray-900 text-base placeholder-gray-300"
                />
                {query && <button onClick={()=>{ setQuery(''); setNotFound(false); }} className="text-gray-300 hover:text-gray-500"><X className="w-4 h-4"/></button>}
              </div>

              {notFound && (
                <p className="text-xs font-bold text-red-500 text-center">❌ Tiada tempahan dijumpai — semak semula no. tempahan, telefon atau IC</p>
              )}

              <button
                onClick={()=>doSearch()}
                disabled={!query.trim()}
                className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 text-white font-black rounded-[16px] transition-colors text-base shadow-sm">
                Semak Sekarang →
              </button>

              <div className="bg-amber-50 border border-amber-100 rounded-[14px] p-3.5 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>
                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                  No. Tempahan (cth: <strong>DELOKA-INV-12345</strong>) boleh dijumpai dalam mesej WhatsApp yang diterima semasa tempahan dibuat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ RESULT STEP ══════════ */}
      {step==='result' && result && (
        <div className="flex flex-col h-full">

          {/* ── Compact header ── */}
          <div className="px-4 pt-3 pb-3 bg-white border-b border-gray-100 shrink-0 flex items-center gap-2">
            <button onClick={()=>{ setStep('login'); setNotFound(false); setResult(null); }}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shrink-0 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-700"/>
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-sm leading-none truncate">{result.guest_name}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{result.invoice_id}</p>
            </div>
            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border shrink-0 ${statusColor(result.status)}`}>{statusLabel(result.status)}</span>
            {/* Share icons */}
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shrink-0 transition-colors" title="Kongsi via WhatsApp">
              <MessageSquare className="w-3.5 h-3.5"/>
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-[#229ED9] hover:bg-[#1a8fc5] text-white rounded-full flex items-center justify-center shrink-0 transition-colors" title="Kongsi via Telegram">
              <Send className="w-3.5 h-3.5"/>
            </a>
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shrink-0 transition-colors">
              <X className="w-4 h-4 text-gray-500"/>
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

            {/* ── Booking summary (compact) ── */}
            <div className={`rounded-[20px] border p-4 ${result.status==='confirmed'?'bg-emerald-50 border-emerald-100':result.status==='hold'?'bg-orange-50 border-orange-100':result.status==='cancelled'?'bg-red-50 border-red-100':'bg-gray-50 border-gray-100'}`}>
              {/* Top row: homestay name + location icons */}
              <div className="flex items-start gap-2 mb-3">
                <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center text-base shrink-0 shadow-sm border border-white">🏡</div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-gray-900 text-sm leading-none">{homepage?.homestay_name||'Homestay'}</p>
                  {homepage?.address && <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{homepage.address}</p>}
                  {(homepage?.maps_url||homepage?.waze_url) && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {homepage.maps_url && (
                        <a href={homepage.maps_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-[8px] text-[9px] font-bold transition-colors border border-blue-100">
                          <MapIcon className="w-3 h-3"/> Maps
                        </a>
                      )}
                      {homepage.waze_url && (
                        <a href={homepage.waze_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-[8px] text-[9px] font-bold transition-colors border border-cyan-100">
                          <Navigation className="w-3 h-3"/> Waze
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 4-grid: check-in / check-out / tempoh / tetamu */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-white/70 rounded-[12px] p-2.5 col-span-2">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Check-in</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{formatDate(result.check_in)}</p>
                  {homepage?.check_in_time && <p className="text-[9px] text-gray-400">Selepas {homepage.check_in_time}</p>}
                </div>
                <div className="bg-white/70 rounded-[12px] p-2.5 col-span-2">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Check-out</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{formatDate(result.check_out)}</p>
                  {homepage?.check_out_time && <p className="text-[9px] text-gray-400">Sebelum {homepage.check_out_time}</p>}
                </div>
                <div className="bg-white/70 rounded-[12px] p-2.5 col-span-2">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Tempoh</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{result.total_nights} Malam</p>
                  <p className="text-[9px] text-gray-400">{result.guests} Tetamu</p>
                </div>
                <div className="bg-white/70 rounded-[12px] p-2.5 col-span-2">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Jumlah Penuh</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{formatCurrency(result.total_price)}</p>
                </div>
              </div>

              {/* Payment breakdown */}
              {(() => {
                const paid = Number(result.payment_received||0);
                const total = Number(result.total_price||0);
                const balance = total - paid;
                const fullPaid = total > 0 && paid >= total;
                return (
                  <div className="bg-white/70 rounded-[12px] p-3 space-y-1.5 mb-3">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-2">💰 Pembayaran</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium text-gray-500">Jumlah Penuh</span>
                      <span className="text-[10px] font-black text-gray-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium text-gray-500">Telah Dibayar (Deposit)</span>
                      <span className={`text-[10px] font-black ${paid>0?'text-emerald-600':'text-gray-400'}`}>{paid>0?formatCurrency(paid):'—'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                      <span className="text-[10px] font-black text-gray-700">Baki Perlu Dibayar</span>
                      <span className={`text-xs font-black ${fullPaid?'text-emerald-600':balance>0?'text-red-500':'text-gray-400'}`}>
                        {fullPaid ? '✅ Selesai' : balance>0 ? formatCurrency(balance) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Status notice */}
              {countdown && <div className="flex items-center gap-1.5 bg-orange-100 rounded-[10px] px-3 py-2"><Clock className="w-3.5 h-3.5 text-orange-500 shrink-0"/><p className="text-[10px] font-bold text-orange-700">Bayar deposit dalam <span className="font-black">{countdown}</span> atau tempahan dibatalkan.</p></div>}
              {result.status==='confirmed' && Number(result.payment_received||0) < Number(result.total_price||0) && Number(result.payment_received||0) > 0 && <div className="bg-blue-50 rounded-[10px] px-3 py-2 text-[10px] font-bold text-blue-700">💳 Deposit diterima. Sila lengkapkan bayaran penuh untuk dapatkan Info Kunci.</div>}
              {result.status==='confirmed' && Number(result.payment_received||0) >= Number(result.total_price||0) && Number(result.total_price||0) > 0 && <div className="bg-emerald-100 rounded-[10px] px-3 py-2 text-[10px] font-bold text-emerald-800">✅ Bayaran penuh disahkan! Info kunci telah dikongsi di bawah.</div>}
              {result.status==='confirmed' && !result.payment_received && <div className="bg-emerald-50 rounded-[10px] px-3 py-2 text-[10px] font-bold text-emerald-700">✅ Tempahan disahkan! Selamat datang ke {homepage?.homestay_name||'homestay kami'}.</div>}
              {result.status==='cancelled' && <div className="bg-red-100 rounded-[10px] px-3 py-2 text-[10px] font-bold text-red-700">✗ Tempahan ini telah dibatalkan.</div>}
              {result.status==='expired' && <div className="bg-gray-100 rounded-[10px] px-3 py-2 text-[10px] font-bold text-gray-600">⚠ Tempahan tamat tempoh — tiada deposit diterima.</div>}
            </div>

            {/* ── 🔑 Info Kunci (only when full payment received) ── */}
            {result.total_price > 0 && Number(result.payment_received||0) >= result.total_price && (homepage?.key_door_pin||homepage?.key_wifi_name||homepage?.key_note) && (
              <div className="bg-gray-900 rounded-[20px] p-4 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">🔑 Info Kunci & Akses</p>
                <div className="space-y-2">
                  {homepage.key_door_pin && (
                    <div className="bg-white/10 rounded-[12px] px-4 py-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">PIN Pintu / Lockbox</p>
                        <p className="font-black text-white text-xl mt-0.5 tracking-[0.15em]">{homepage.key_door_pin}</p>
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-[10px] flex items-center justify-center text-lg">🔐</div>
                    </div>
                  )}
                  {(homepage.key_wifi_name||homepage.key_wifi_pw) && (
                    <div className="bg-white/10 rounded-[12px] px-4 py-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">WiFi</p>
                        {homepage.key_wifi_name && <p className="font-bold text-white text-sm mt-0.5">{homepage.key_wifi_name}</p>}
                        {homepage.key_wifi_pw && <p className="font-black text-emerald-400 text-base tracking-widest">{homepage.key_wifi_pw}</p>}
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-[10px] flex items-center justify-center text-lg">📶</div>
                    </div>
                  )}
                  {homepage.key_note && (
                    <div className="bg-amber-500/20 rounded-[12px] px-4 py-3">
                      <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider mb-1">📝 Arahan</p>
                      <p className="text-xs text-amber-100 font-medium leading-relaxed">{homepage.key_note}</p>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-gray-500 text-center">Maklumat ini hanya untuk tetamu yang disahkan.</p>
              </div>
            )}

            {/* ── 💳 Bayaran Deposit (hold status) ── */}
            {result.status==='hold' && (homepage?.bank_qr||homepage?.bank_account||homepage?.bank_name) && (
              <PaymentInfoCard
                homepage={homepage}
                label="Bayaran Deposit"
                amount={formatCurrency(result.deposit || pricing?.deposit || 0)}
                headerColor="bg-blue-600"
                tip="Bayar dalam 6 jam • Upload resit di bawah selepas bayar"
              />
            )}

            {/* ── 💳 Bayaran Baki (confirmed + balance remaining) ── */}
            {(() => {
              const paid = Number(result.payment_received||0);
              const total = Number(result.total_price||0);
              const balance = total - paid;
              if (result.status==='confirmed' && balance > 0 && paid > 0 && (homepage?.bank_qr||homepage?.bank_account||homepage?.bank_name)) {
                return (
                  <PaymentInfoCard
                    homepage={homepage}
                    label="Bayaran Baki (Penuh)"
                    amount={`RM ${balance.toFixed(2)}`}
                    headerColor="bg-emerald-600"
                    tip="Sila transfer baki dan upload resit di bawah untuk sahkan bayaran penuh"
                  />
                );
              }
              return null;
            })()}

            {/* ── Upload Resit (Deposit + Baki side by side) ── */}
            {(result.status==='confirmed'||result.status==='hold') && (
              <div className="bg-white border border-gray-100 rounded-[20px] p-4 space-y-3 app-shadow">
                <p className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-500"/> Resit Pembayaran
                </p>

                {/* Side-by-side columns */}
                <div className={`grid gap-3 ${result.status==='confirmed'?'grid-cols-2':'grid-cols-1'}`}>

                  {/* ── Deposit column ── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide">Deposit</p>
                      {(result.receipt_url || previewUrl) && (
                        <button onClick={()=>setFullViewImg(previewUrl||result.receipt_url)} className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                          <Eye className="w-2.5 h-2.5"/> Full
                        </button>
                      )}
                    </div>
                    {/* Preview */}
                    {(previewUrl || result.receipt_url) ? (
                      <div className="rounded-[12px] overflow-hidden border border-blue-100 bg-gray-50 aspect-[4/3] max-h-[90px] cursor-pointer" onClick={()=>setFullViewImg(previewUrl||result.receipt_url)}>
                        <img src={previewUrl||result.receipt_url} alt="Resit Deposit" className="w-full h-full object-cover hover:opacity-90 transition-opacity"/>
                      </div>
                    ) : (
                      <div className="rounded-[12px] border-2 border-dashed border-gray-200 bg-gray-50 aspect-[4/3] max-h-[90px] flex flex-col items-center justify-center gap-1 text-gray-300">
                        <ImageIcon className="w-6 h-6"/>
                        <span className="text-[9px] font-bold">Belum ada</span>
                      </div>
                    )}
                    {uploadMsg && <p className={`text-[9px] font-bold ${uploadMsg.type==='ok'?'text-emerald-600':'text-red-500'}`}>{uploadMsg.text}</p>}
                    {uploading ? (
                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-400 py-1.5">
                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"/>Menghantar...
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-[10px] text-[9px] font-black transition-colors">
                          <ImageIcon className="w-3 h-3"/>
                          {result.receipt_url ? 'Tukar' : 'Pilih'}
                          <input type="file" accept="image/*" className="hidden" onChange={e=>{
                            const file=e.target.files?.[0]; if(!file) return;
                            setPendingFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                            setUploadMsg(null);
                          }}/>
                        </label>
                        {pendingFile && (
                          <button onClick={async()=>{
                            setUploading(true); setUploadMsg(null);
                            try {
                              const sRef = storageRef(storage, `receipts/deposit_${result.id}_${Date.now()}`);
                              await uploadBytes(sRef, pendingFile);
                              const url = await getDownloadURL(sRef);
                              dispatch({type:'UPDATE_BOOK_DETAIL',id:result.id,payload:{receipt_url:url}});
                              setResult({...result,receipt_url:url});
                              setUploadMsg({type:'ok',text:'✓ Disimpan!'});
                              setPendingFile(null);
                            } catch { setUploadMsg({type:'err',text:'Gagal.'}); }
                            finally { setUploading(false); }
                          }} className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-[9px] font-black transition-colors flex items-center gap-1">
                            <CheckCircle className="w-3 h-3"/> Hantar
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Baki column (only for confirmed bookings) ── */}
                  {result.status==='confirmed' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Baki</p>
                        {(result.receipt_baki_url || previewUrlBaki) && (
                          <button onClick={()=>setFullViewImg(previewUrlBaki||result.receipt_baki_url)} className="text-[9px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                            <Eye className="w-2.5 h-2.5"/> Full
                          </button>
                        )}
                      </div>
                      {/* Preview */}
                      {(previewUrlBaki || result.receipt_baki_url) ? (
                        <div className="rounded-[12px] overflow-hidden border border-emerald-100 bg-gray-50 aspect-[4/3] cursor-pointer" onClick={()=>setFullViewImg(previewUrlBaki||result.receipt_baki_url)}>
                          <img src={previewUrlBaki||result.receipt_baki_url} alt="Resit Baki" className="w-full h-full object-cover hover:opacity-90 transition-opacity"/>
                        </div>
                      ) : (
                        <div className="rounded-[12px] border-2 border-dashed border-gray-200 bg-gray-50 aspect-[4/3] max-h-[90px] flex flex-col items-center justify-center gap-1 text-gray-300">
                          <ImageIcon className="w-6 h-6"/>
                          <span className="text-[9px] font-bold">Belum ada</span>
                        </div>
                      )}
                      {uploadMsgBaki && <p className={`text-[9px] font-bold ${uploadMsgBaki.type==='ok'?'text-emerald-600':'text-red-500'}`}>{uploadMsgBaki.text}</p>}
                      {uploadingBaki ? (
                        <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-400 py-1.5">
                          <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"/>Menghantar...
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <label className="flex-1 cursor-pointer flex items-center justify-center gap-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 rounded-[10px] text-[9px] font-black transition-colors">
                            <ImageIcon className="w-3 h-3"/>
                            {result.receipt_baki_url ? 'Tukar' : 'Pilih'}
                            <input type="file" accept="image/*" className="hidden" onChange={e=>{
                              const file=e.target.files?.[0]; if(!file) return;
                              setPendingFileBaki(file);
                              setPreviewUrlBaki(URL.createObjectURL(file));
                              setUploadMsgBaki(null);
                            }}/>
                          </label>
                          {pendingFileBaki && (
                            <button onClick={async()=>{
                              setUploadingBaki(true); setUploadMsgBaki(null);
                              try {
                                const sRef = storageRef(storage, `receipts/baki_${result.id}_${Date.now()}`);
                                await uploadBytes(sRef, pendingFileBaki);
                                const url = await getDownloadURL(sRef);
                                dispatch({type:'UPDATE_BOOK_DETAIL',id:result.id,payload:{receipt_baki_url:url}});
                                setResult({...result,receipt_baki_url:url});
                                setUploadMsgBaki({type:'ok',text:'✓ Disimpan!'});
                                setPendingFileBaki(null);
                              } catch { setUploadMsgBaki({type:'err',text:'Gagal.'}); }
                              finally { setUploadingBaki(false); }
                            }} className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-[9px] font-black transition-colors flex items-center gap-1">
                              <CheckCircle className="w-3 h-3"/> Hantar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* WA notify button */}
                {(result.receipt_url || result.receipt_baki_url || uploadMsg?.type==='ok' || uploadMsgBaki?.type==='ok') && homepage?.whatsapp_number && (
                  <a href={`https://wa.me/${homepage.whatsapp_number}?text=${encodeURIComponent(`Assalamualaikum, saya ${result.guest_name} (${result.invoice_id}) telah upload resit pembayaran. Sila semak. Terima kasih.`)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 justify-center py-2.5 bg-green-50 hover:bg-green-100 border border-green-100 text-green-700 rounded-[12px] text-[10px] font-bold transition-colors w-full">
                    <Phone className="w-3.5 h-3.5"/> Notifikasi Admin — Resit Dihantar
                  </a>
                )}
              </div>
            )}

            {/* Receipt full-view lightbox */}
            {fullViewImg && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={()=>setFullViewImg(null)}>
                <button onClick={()=>setFullViewImg(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"><X className="w-5 h-5 text-white"/></button>
                <img src={fullViewImg} alt="Resit" className="max-w-[92vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl" onClick={e=>e.stopPropagation()}/>
              </div>
            )}

            {/* ── IC + Terms (with validation) ── */}
            {(result.status==='confirmed'||result.status==='hold') && (
              <div className={`bg-white border rounded-[20px] p-4 space-y-3 app-shadow transition-colors ${!agreed && saved===false ? 'border-gray-100' : 'border-gray-100'}`}>
                <p className="text-xs font-black text-gray-700 flex items-center gap-1.5"><IdCard className="w-3.5 h-3.5 text-emerald-500"/> Maklumat Sebelum Check-in</p>
                <input type="text" placeholder="No. Kad Pengenalan (cth: 991231-08-1234)" value={ic} onChange={e=>setIc(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none font-bold text-gray-900 focus:border-emerald-500 text-sm"/>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
                  <input type="email" placeholder="Alamat emel (untuk penerimaan notifikasi)" value={email} onChange={e=>setEmail(e.target.value)}
                    className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-gray-900 focus:border-emerald-500 text-sm"/>
                </div>
                <label className={`flex items-start gap-2.5 cursor-pointer p-3 rounded-[12px] transition-colors ${agreed?'bg-emerald-50 border border-emerald-100':'bg-gray-50 border border-gray-200'}`}>
                  <input type="checkbox" checked={agreed} onChange={e=>{ setAgreed(e.target.checked); setSaved(false); }} className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"/>
                  <span className={`text-[10px] font-medium leading-relaxed ${agreed?'text-emerald-800':'text-gray-600'}`}>
                    Saya bersetuju dengan semua <strong>peraturan rumah</strong> dan bertanggungjawab ke atas sebarang kerosakan harta benda.
                  </span>
                </label>
                {/* Validation error */}
                {saved==='error' && <div className="bg-red-50 border border-red-200 rounded-[12px] px-3 py-2.5 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0"/><p className="text-[10px] font-bold text-red-600">Sila tandakan persetujuan peraturan rumah sebelum menyimpan.</p></div>}
                {saved===true && <div className="bg-emerald-50 border border-emerald-100 rounded-[12px] px-3 py-2 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0"/><p className="text-[10px] font-bold text-emerald-700">✓ Maklumat berjaya disimpan</p></div>}
                <button
                  onClick={()=>{
                    if (!agreed) { setSaved('error'); return; }
                    dispatch({type:'UPDATE_CUSTOMER_DETAIL',id:result.id,ic,agreed,email});
                    setSaved(true);
                  }}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-[12px] text-xs transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5"/> Simpan Maklumat
                </button>
              </div>
            )}

            <div className="h-2"/>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= BOOKING HISTORY MODAL =================
const BookingHistoryModal = ({ bookings, homepage, onViewBooking, onClose }) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('search'); // 'search' | 'list'
  const [results, setResults] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const doSearch = (raw) => {
    const q = (raw !== undefined ? raw : phone).trim().replace(/\s/g, '');
    if (!q) return;
    const found = bookings
      .filter(b => b.guest_phone.replace(/\s/g,'') === q || b.guest_phone.replace(/\D/g,'') === q.replace(/\D/g,''))
      .sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0));
    setResults(found);
    setNotFound(found.length === 0);
    if (found.length > 0) setStep('list');
  };

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const statusColor = (s) => ({
    hold:      'bg-orange-100 text-orange-700 border-orange-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
    expired:   'bg-gray-100 text-gray-500 border-gray-200',
    pending:   'bg-blue-100 text-blue-700 border-blue-200'
  }[s] || 'bg-gray-100 text-gray-600 border-gray-200');

  const statusLabel = (s) => ({
    hold:      '⏳ Menunggu Deposit',
    confirmed: '✅ Disahkan',
    cancelled: '✗ Dibatalkan',
    expired:   '⚠ Tamat Tempoh',
    pending:   '• Pending'
  }[s] || s);

  const statusDot = (s) => ({
    hold:      'bg-orange-400',
    confirmed: 'bg-emerald-500',
    cancelled: 'bg-red-400',
    expired:   'bg-gray-400',
    pending:   'bg-blue-400'
  }[s] || 'bg-gray-400');

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full md:max-w-md bg-white rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'list' && (
              <button onClick={() => { setStep('search'); setResults([]); setNotFound(false); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600"/>
              </button>
            )}
            <div>
              <h2 className="text-base font-black text-gray-900">Sejarah Tempahan</h2>
              <p className="text-[10px] text-gray-400 font-medium">
                {step === 'list' ? `${results.length} tempahan dijumpai` : 'Semak semua tempahan anda'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600"/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* ── Step: Search ── */}
          {step === 'search' && (
            <div className="space-y-4">
              {/* Illustration */}
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-[20px] flex items-center justify-center mb-3">
                  <ClipboardList className="w-8 h-8 text-amber-600"/>
                </div>
                <p className="text-sm font-bold text-gray-800 text-center">Cari semua tempahan anda</p>
                <p className="text-xs text-gray-400 text-center mt-1">Masukkan no. telefon yang digunakan semasa tempahan</p>
              </div>

              {/* Phone input */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">No. Telefon</label>
                <div className="flex gap-2">
                  <input
                    type="tel" value={phone}
                    onChange={e => { setPhone(e.target.value); setNotFound(false); }}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                    placeholder="cth: 0123456789"
                    className="flex-1 border border-gray-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                  <button
                    onClick={() => doSearch()}
                    className="px-5 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-[12px] text-sm flex items-center gap-2 transition-colors"
                  >
                    <Search className="w-4 h-4"/>
                  </button>
                </div>
              </div>

              {/* Not found */}
              {notFound && (
                <div className="bg-red-50 border border-red-100 rounded-[14px] px-4 py-3 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-xs font-bold text-red-700">Tiada tempahan dijumpai</p>
                    <p className="text-[10px] text-red-500 mt-0.5">Pastikan no. telefon sama seperti semasa membuat tempahan.</p>
                  </div>
                </div>
              )}

              {/* Hint */}
              <div className="bg-amber-50 border border-amber-100 rounded-[14px] px-4 py-3 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Semua tempahan yang pernah dibuat menggunakan no. telefon ini akan dipaparkan, termasuk yang aktif, selesai dan dibatalkan.
                </p>
              </div>
            </div>
          )}

          {/* ── Step: List ── */}
          {step === 'list' && (
            <div className="space-y-3">
              {/* Phone badge */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-[12px] px-3 py-2">
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0"/>
                <p className="text-xs font-bold text-amber-700">{phone}</p>
              </div>

              {/* Booking cards */}
              {results.map(b => (
                <button
                  key={b.id}
                  onClick={() => onViewBooking(b.id)}
                  className="w-full text-left bg-white border border-gray-100 rounded-[18px] p-4 hover:border-amber-200 hover:shadow-md transition-all app-shadow group"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(b.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(b.status)}`}/>
                          {statusLabel(b.status)}
                        </span>
                      </div>
                      <p className="text-xs font-black text-gray-900 truncate">{b.invoice_id || b.id}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CalendarDays className="w-3 h-3 text-gray-400 shrink-0"/>
                        <p className="text-[10px] text-gray-500">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">{b.total_nights} malam · {b.guests} tetamu</span>
                        {(b.receipt_url || b.receipt_baki_url) && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3"/> Resit
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-gray-900">{formatCurrency(b.total_price)}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString('ms-MY', {day:'2-digit',month:'short',year:'numeric'}) : ''}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-400 transition-colors mt-1 ml-auto"/>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-50 shrink-0">
          <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 font-bold text-center transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= UNIFIED LOGIN PAGE =================
const LoginPage = ({ state, dispatch, setRoute, setCleanerUser, defaultTab = 'admin' }) => {
  const [tab, setTab] = useState(defaultTab);
  const [aUn, setAUn] = useState(''); const [aPw, setAPw] = useState('');
  const [showAPw, setShowAPw] = useState(false); const [remember, setRemember] = useState(false);
  const [cUn, setCUn] = useState(''); const [cPw, setCPw] = useState('');
  const [showCPw, setShowCPw] = useState(false); const [rememberC, setRememberC] = useState(false);
  const [err, setErr] = useState(''); const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('delokaAdminAuth');
    if (saved) { try { const d=JSON.parse(saved); setAUn(d.un); setAPw(d.pw); setRemember(true); } catch {} }
    const savedC = localStorage.getItem('delokaCleanerAuth');
    if (savedC) { try { const d=JSON.parse(savedC); setCUn(d.un); setCPw(d.pw); setRememberC(true); } catch {} }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    let admins = state.admins;
    const valid = admins.find(a=>a.username===aUn&&a.password===aPw);
    if (valid) {
      if(remember) localStorage.setItem('delokaAdminAuth',JSON.stringify({un:aUn,pw:aPw})); else localStorage.removeItem('delokaAdminAuth');
      setRoute('admin-panel');
    } else {
      // Fresh fetch from Firestore in case account was added from another device
      try {
        const snap = await getDoc(STATE_DOC);
        if (snap.exists()) {
          const fresh = snap.data();
          dispatch({ type:'HYDRATE', payload: fresh });
          const v2 = (fresh.admins||[]).find(a=>a.username===aUn&&a.password===aPw);
          if (v2) { if(remember) localStorage.setItem('delokaAdminAuth',JSON.stringify({un:aUn,pw:aPw})); setRoute('admin-panel'); return; }
        }
      } catch {}
      setToast({type:'error',message:'ID atau Kata Laluan Salah!'});
    }
  };

  const handleCleanerLogin = async (e) => {
    e.preventDefault();
    const found = (state.cleaners||[]).find(c=>c.username===cUn&&c.password===cPw&&c.active!==false);
    if (found) {
      if (rememberC) localStorage.setItem('delokaCleanerAuth',JSON.stringify({un:cUn,pw:cPw})); else localStorage.removeItem('delokaCleanerAuth');
      setCleanerUser(found); setRoute('cleaner-panel');
    } else {
      // Fresh fetch from Firestore
      try {
        const snap = await getDoc(STATE_DOC);
        if (snap.exists()) {
          const fresh = snap.data();
          dispatch({ type:'HYDRATE', payload: fresh });
          const f2 = (fresh.cleaners||[]).find(c=>c.username===cUn&&c.password===cPw&&c.active!==false);
          if (f2) { if(rememberC) localStorage.setItem('delokaCleanerAuth',JSON.stringify({un:cUn,pw:cPw})); setCleanerUser(f2); setRoute('cleaner-panel'); return; }
        }
      } catch {}
      setErr('ID atau kata laluan salah.');
    }
  };

  const inputCls = "w-full p-4 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-sm focus:border-emerald-500 focus:bg-white transition-colors text-gray-900";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-lg transition-all ${tab==='admin'?'bg-gradient-to-br from-gray-800 to-gray-900 shadow-gray-200':'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-100'}`}>
            {tab==='admin' ? <Settings className="w-8 h-8 text-white"/> : <Sparkles className="w-8 h-8 text-white"/>}
          </div>
          <h1 className="brand-font text-3xl text-[#3D1C02]" style={BRAND_FONT}>Deloka Senja</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">Sistem Pengurusan Homestay</p>
        </div>

        <div className="bg-white rounded-[28px] app-shadow border border-gray-100 overflow-hidden">
          {/* Tab switcher */}
          <div className="p-4 pb-0">
            <div className="flex bg-gray-100 rounded-[14px] p-1">
              <button onClick={()=>{setTab('admin');setErr('');}} className={`flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab==='admin'?'bg-white text-gray-900 shadow-sm':'text-gray-500'}`}>
                <Settings className="w-4 h-4"/> Admin
              </button>
              <button onClick={()=>{setTab('cleaner');setErr('');}} className={`flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab==='cleaner'?'bg-white text-emerald-700 shadow-sm':'text-gray-500'}`}>
                <Sparkles className="w-4 h-4"/> Cleaner
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-5 pt-4">
            {tab==='admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <input type="text" placeholder="ID Pengguna" value={aUn} onChange={e=>setAUn(e.target.value)} className={inputCls} required autoComplete="username"/>
                <div className="relative">
                  <input type={showAPw?'text':'password'} placeholder="Kata Laluan" value={aPw} onChange={e=>setAPw(e.target.value)} className={inputCls} required autoComplete="current-password"/>
                  <button type="button" onClick={()=>setShowAPw(!showAPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showAPw?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer px-1">
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="w-4 h-4 accent-emerald-600 cursor-pointer"/>
                  <span className="text-sm font-bold text-gray-600">Ingat Kata Laluan</span>
                </label>
                <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-[12px] transition-colors shadow-sm">Log Masuk</button>
              </form>
            ) : (
              <form onSubmit={handleCleanerLogin} className="space-y-3">
                <input type="text" placeholder="ID Pengguna" value={cUn} onChange={e=>{setCUn(e.target.value);setErr('');}} className={inputCls} required autoComplete="username"/>
                <div className="relative">
                  <input type={showCPw?'text':'password'} placeholder="Kata Laluan" value={cPw} onChange={e=>{setCPw(e.target.value);setErr('');}} className={inputCls} required autoComplete="current-password"/>
                  <button type="button" onClick={()=>setShowCPw(!showCPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showCPw?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer px-1">
                  <input type="checkbox" checked={rememberC} onChange={e=>setRememberC(e.target.checked)} className="w-4 h-4 accent-emerald-600 cursor-pointer"/>
                  <span className="text-sm font-bold text-gray-600">Ingat Kata Laluan</span>
                </label>
                {err && <p className="text-xs font-bold text-red-500 text-center bg-red-50 py-2 rounded-[10px]">{err}</p>}
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-[12px] transition-colors shadow-sm shadow-emerald-100">Log Masuk</button>
                <div className="bg-gray-50 rounded-[12px] p-3 mt-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Akaun Demo</p>
                  <p className="text-xs font-bold text-gray-600">cleaner1 / clean123</p>
                  <p className="text-xs font-bold text-gray-600">cleaner2 / clean456</p>
                </div>
              </form>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-50">
            <button onClick={()=>setRoute('customer')} className="w-full text-sm text-gray-400 hover:text-gray-600 font-bold text-center flex justify-center items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> Kembali ke Laman Utama</button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
};

// ================= CLEANER VIEW =================
const CleanerView = ({ state, dispatch, setRoute, cleanerUser, setCleanerUser }) => {
  const { cleaner_sections, bookings, homepage } = state;
  const today = new Date().toISOString().split('T')[0];

  const initSections = () => (cleaner_sections||[]).map(s=>({
    ...s,
    tasks: (s.tasks||[]).map(t=>({...t, done:false, taskPhotos:[]})), // taskPhotos must be [] or spread will crash
    notes: '',
    sectionPhotos: [],
    expanded: false,
  }));

  const [sections, setSections] = useState(initSections);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [fullscreenImg, setFullscreenImg] = useState(null);
  const [fullscreenPhotos, setFullscreenPhotos] = useState(null); // {photos, index}
  const [viewReport, setViewReport] = useState(null); // past report modal

  const activeBookings = bookings.filter(b=>(b.status==='confirmed'||b.status==='hold')&&b.check_out>=today);
  const pastBookings = bookings.filter(b=>b.status==='completed'||(b.check_out<today&&(b.status==='confirmed'||b.status==='hold'||b.status==='checked_out')));
  const cleanerReports = state.cleaner_reports||[];
  const totalDone = sections.reduce((a,s)=>a+s.tasks.filter(t=>t.done).length, 0);
  const totalTasks = sections.reduce((a,s)=>a+s.tasks.length, 0);
  const pct = totalTasks ? Math.round((totalDone/totalTasks)*100) : 0;

  const toggleTask   = (sid, tid) => setSections(p=>p.map(s=>s.id===sid?{...s,tasks:s.tasks.map(t=>t.id===tid?{...t,done:!t.done}:t)}:s));
  const toggleSection= (sid)      => setSections(p=>p.map(s=>s.id===sid?{...s,expanded:!s.expanded}:s));
  const updateNotes  = (sid, v)   => setSections(p=>p.map(s=>s.id===sid?{...s,notes:v}:s));

  const addTaskPhoto = (sid, tid, files) => {
    const items = Array.from(files||[]).map(f=>({file:f, previewUrl:URL.createObjectURL(f), uid:Date.now()+Math.random()}));
    setSections(p=>p.map(s=>s.id===sid?{...s,tasks:s.tasks.map(t=>t.id===tid?{...t,taskPhotos:[...t.taskPhotos,...items]}:t)}:s));
  };
  const removeTaskPhoto = (sid, tid, uid) => setSections(p=>p.map(s=>s.id===sid?{...s,tasks:s.tasks.map(t=>t.id===tid?{...t,taskPhotos:t.taskPhotos.filter(ph=>ph.uid!==uid)}:t)}:s));

  const addSectionPhoto = (sid, files) => {
    const items = Array.from(files||[]).map(f=>({file:f, previewUrl:URL.createObjectURL(f), uid:Date.now()+Math.random()}));
    setSections(p=>p.map(s=>s.id===sid?{...s,sectionPhotos:[...s.sectionPhotos,...items]}:s));
  };
  const removeSectionPhoto = (sid, uid) => setSections(p=>p.map(s=>s.id===sid?{...s,sectionPhotos:s.sectionPhotos.filter(ph=>ph.uid!==uid)}:s));

  const uploadPhotoItems = async (items, pathPrefix) => {
    const urls = [];
    for (const p of items) {
      const sRef = storageRef(storage, `${pathPrefix}_${Date.now()}_${p.file.name}`);
      await uploadBytes(sRef, p.file);
      urls.push(await getDownloadURL(sRef));
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (totalDone === 0) { setUploadMsg({type:'err',text:'Tandakan sekurang-kurangnya satu tugasan dahulu.'}); return; }
    setSubmitting(true); setUploadMsg(null);

    // Step 1: upload section photos (non-fatal — if fails, continue without photos)
    let builtSections;
    try {
      builtSections = await Promise.all(sections.map(async s=>{
        let sectionPhotoUrls = [];
        if (s.sectionPhotos?.length) {
          try {
            sectionPhotoUrls = await uploadPhotoItems(s.sectionPhotos, `cleaner/${cleanerUser.id}_s${s.id}_sec`);
          } catch(photoErr) {
            console.warn('Photo upload skipped:', photoErr?.message);
          }
        }
        return { id:s.id, name:s.name, tasks:s.tasks.map(t=>({id:t.id,task:t.task,done:t.done})), notes:s.notes, photoUrls:sectionPhotoUrls };
      }));
    } catch(err) {
      setUploadMsg({type:'err',text:`Ralat semasa proses: ${err?.message||'Unknown error'}`});
      setSubmitting(false); return;
    }

    // Step 2: save report (must succeed)
    try {
      const report = {
        id: `CLN-${Date.now()}`,
        cleaner_id: cleanerUser.id, cleaner_name: cleanerUser.name,
        booking_ref: selectedBooking, date: today,
        submitted_at: new Date().toISOString(),
        sections: builtSections,
        total_done: totalDone, total_tasks: totalTasks,
        status: 'submitted', admin_seen: false,
      };
      dispatch({type:'ADD_CLEANER_REPORT', payload:report});
    } catch(err) {
      setUploadMsg({type:'err',text:`Gagal simpan laporan: ${err?.message||'Unknown error'}`});
      setSubmitting(false); return;
    }

    // Step 3: open WhatsApp (non-fatal — blocked popup is fine)
    try {
      const sectionLines = builtSections.map(s=>{
        const done = s.tasks.filter(t=>t.done).length;
        const items = s.tasks.filter(t=>t.done).map(t=>`  ✓ ${t.task}`).join('\n');
        const notDone = s.tasks.filter(t=>!t.done).map(t=>`  ✗ ${t.task}`).join('\n');
        return `*${s.name}* (${done}/${s.tasks.length}):\n${items}${notDone?'\n'+notDone:''}${s.notes?`\n  📝 ${s.notes}`:''}${s.photoUrls?.length?`\n  📸 ${s.photoUrls.length} gambar`:''}`;
      }).join('\n\n');
      const msg = `🧹 *Laporan Pembersihan ${homepage.homestay_name}*\n\nCleaner: ${cleanerUser.name}\nTarikh: ${new Date().toLocaleDateString('ms-MY')}\n${selectedBooking?`Tempahan: ${selectedBooking}\n`:''}\nSelesai: ${totalDone}/${totalTasks} tugasan\n\n${sectionLines}`;
      window.open(`https://wa.me/${homepage.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch(waErr) {
      console.warn('WA open blocked:', waErr?.message);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  // ---- SUCCESS SCREEN ----
  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-white">
      <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-xl border border-emerald-100">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="w-12 h-12 text-emerald-600"/>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Laporan Dihantar!</h2>
        <p className="text-gray-500 text-sm mb-2">Bagus, <strong>{cleanerUser.name}</strong>. Semua telah direkodkan.</p>
        <div className="bg-emerald-50 rounded-[16px] p-4 mb-6">
          <p className="text-2xl font-black text-emerald-600">{totalDone}<span className="text-base font-bold text-emerald-400">/{totalTasks}</span></p>
          <p className="text-xs text-emerald-700 font-bold">Tugasan selesai hari ini</p>
        </div>
        <button onClick={()=>{setSubmitted(false);setSections(initSections());setSelectedBooking('');setUploadMsg(null);}}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-[18px] transition-colors mb-3 shadow-md shadow-emerald-100">
          + Laporan Baru
        </button>
        <button onClick={()=>setRoute('customer')} className="w-full text-sm text-gray-400 hover:text-gray-600 font-bold py-2">Ke Laman Utama</button>
      </div>
    </div>
  );

  const sectionStatus = (sec) => {
    const done = sec.tasks.filter(t=>t.done).length;
    const total = sec.tasks.length;
    if (done === 0) return {label:'Belum Mula', cls:'bg-gray-100 text-gray-500'};
    if (done === total) return {label:'Selesai ✓', cls:'bg-emerald-100 text-emerald-700'};
    return {label:`${done}/${total} Selesai`, cls:'bg-amber-100 text-amber-700'};
  };

  // ---- MAIN VIEW ----
  return (
    <div className="min-h-screen bg-[#F4F7F5]" style={{fontFamily:'Poppins,sans-serif'}}>

      {/* ---- FULLSCREEN IMAGE MODAL ---- */}
      {fullscreenImg && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={()=>setFullscreenImg(null)}>
          <img src={fullscreenImg} className="w-full h-full object-contain" alt="fullscreen"/>
          <button className="absolute top-5 right-5 w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center" onClick={()=>setFullscreenImg(null)}>
            <X className="w-6 h-6 text-white"/>
          </button>
        </div>
      )}

      {/* ---- PHOTO GALLERY MODAL ---- */}
      {fullscreenPhotos && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={()=>setFullscreenPhotos(null)}>
          <div className="flex items-center justify-between px-5 pt-safe pt-5 pb-3">
            <p className="text-white font-bold text-sm">{fullscreenPhotos.index+1} / {fullscreenPhotos.photos.length}</p>
            <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center" onClick={()=>setFullscreenPhotos(null)}><X className="w-5 h-5 text-white"/></button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <img src={fullscreenPhotos.photos[fullscreenPhotos.index]?.previewUrl||fullscreenPhotos.photos[fullscreenPhotos.index]} className="max-w-full max-h-full object-contain rounded-[16px]" alt=""/>
          </div>
          <div className="flex gap-2 px-5 pb-8 justify-center overflow-x-auto">
            {fullscreenPhotos.photos.map((p,i)=>(
              <button key={i} onClick={e=>{e.stopPropagation();setFullscreenPhotos(f=>({...f,index:i}));}}
                className={`shrink-0 w-14 h-14 rounded-[10px] overflow-hidden border-2 transition-all ${i===fullscreenPhotos.index?'border-white scale-110':'border-white/20'}`}>
                <img src={p.previewUrl||p} className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- PAST REPORT VIEW MODAL ---- */}
      {viewReport && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={()=>setViewReport(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-[32px] max-h-[90vh] flex flex-col shadow-2xl" onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Laporan Cleaner</p>
                <p className="font-black text-gray-900 text-base leading-tight">{viewReport.booking_ref||'(Tiada Tempahan)'}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{viewReport.date} · {viewReport.cleaner_name} · {viewReport.total_done}/{viewReport.total_tasks} selesai</p>
              </div>
              <button onClick={()=>setViewReport(null)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500"/>
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {(viewReport.sections||[]).map(sec=>(
                <div key={sec.id} className="bg-gray-50 rounded-[18px] overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <p className="font-black text-gray-800 text-sm">{sec.name}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${sec.tasks.filter(t=>t.done).length===sec.tasks.length&&sec.tasks.length>0?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>
                      {sec.tasks.filter(t=>t.done).length}/{sec.tasks.length}
                    </span>
                  </div>
                  <div className="px-4 pb-3 space-y-1.5">
                    {sec.tasks.map(t=>(
                      <div key={t.id} className={`flex items-center gap-2.5 py-1.5 px-3 rounded-[10px] ${t.done?'bg-emerald-50':'bg-white border border-gray-100'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${t.done?'bg-emerald-500':'bg-gray-200'}`}>
                          {t.done && <CheckCircle className="w-2.5 h-2.5 text-white"/>}
                        </div>
                        <span className={`text-xs font-medium ${t.done?'text-emerald-700':'text-gray-500'}`}>{t.task}</span>
                      </div>
                    ))}
                  </div>
                  {sec.notes && (
                    <div className="mx-4 mb-3 bg-amber-50 border border-amber-100 rounded-[10px] px-3 py-2">
                      <p className="text-[10px] font-bold text-amber-600 mb-0.5">Catatan</p>
                      <p className="text-xs text-gray-700">{sec.notes}</p>
                    </div>
                  )}
                  {(sec.photoUrls||[]).length > 0 && (
                    <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                      {sec.photoUrls.map((url,i)=>(
                        <button key={i} onClick={()=>setFullscreenImg(url)} className="aspect-square rounded-[10px] overflow-hidden border border-white shadow-sm">
                          <img src={url} className="w-full h-full object-cover" alt=""/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* If old format */}
              {!viewReport.sections && (viewReport.checklist||[]).length > 0 && (
                <div className="bg-gray-50 rounded-[18px] px-4 py-3 space-y-1.5">
                  {viewReport.checklist.map((t,i)=>(
                    <div key={i} className={`flex items-center gap-2 py-1 ${t.done?'text-emerald-700':'text-gray-400'}`}>
                      <span>{t.done?'✓':'✗'}</span>
                      <span className="text-xs font-medium">{t.task}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer action */}
            <div className="px-5 py-4 border-t border-gray-100">
              <button onClick={()=>{ setSelectedBooking(viewReport.booking_ref||''); setViewReport(null); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-[16px] text-sm transition-colors shadow-md shadow-emerald-100">
                Hantar Laporan Baru untuk Tempahan Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- STICKY HEADER ---- */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[14px] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Portal Cleaner</p>
              <p className="font-bold text-gray-900 text-sm leading-tight">{cleanerUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setRoute('customer')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-600 flex items-center gap-1 transition-colors">
              <Home className="w-3 h-3"/> Utama
            </button>
            <button onClick={()=>{ localStorage.removeItem('delokaCleanerAuth'); setCleanerUser?.(null); setRoute('customer'); }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-full text-xs font-bold text-red-500 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3"/> Keluar
            </button>
          </div>
        </div>

        {/* Progress strip */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
            </div>
            <span className={`text-xs font-black shrink-0 ${pct===100?'text-emerald-600':'text-gray-500'}`}>{totalDone}/{totalTasks}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-36">

        {/* ---- BOOKING PICKER ---- */}
        {activeBookings.length > 0 && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-[10px] flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-blue-600"/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pilih Tempahan</p>
                <p className="text-xs text-gray-600 font-medium">Kaitkan laporan ini dengan tempahan aktif</p>
              </div>
            </div>
            <select value={selectedBooking} onChange={e=>setSelectedBooking(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 text-sm focus:border-emerald-500 appearance-none cursor-pointer">
              <option value="">— Tiada (bebas) —</option>
              {activeBookings.map(b=>(
                <option key={b.id} value={b.invoice_id}>{b.invoice_id} · {b.guest_name} (Keluar: {formatDate(b.check_out)})</option>
              ))}
            </select>
            {selectedBooking && (
              <div className="mt-3 bg-blue-50 rounded-[12px] px-4 py-2.5 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0"/>
                <p className="text-xs font-bold text-blue-700">{selectedBooking} dipilih</p>
              </div>
            )}
          </div>
        )}

        {/* ---- PAST BOOKINGS SECTION ---- */}
        {pastBookings.length > 0 && (
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <div className="px-5 pt-4 pb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-[10px] flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-gray-500"/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tempahan Lalu / Selesai</p>
                <p className="text-[11px] text-gray-400 font-medium">{pastBookings.length} rekod — boleh lihat atau hantar laporan baru</p>
              </div>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {pastBookings.slice().reverse().map(b=>{
                const existingReport = cleanerReports.find(r=>r.booking_ref===b.invoice_id&&r.cleaner_id===cleanerUser.id);
                const isPicked = selectedBooking === b.invoice_id;
                return (
                  <div key={b.id} className={`flex items-center justify-between p-3.5 rounded-[16px] transition-colors ${isPicked?'bg-emerald-50 border border-emerald-200':'bg-gray-50 border border-transparent'}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{b.invoice_id} · {b.guest_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-medium">Keluar: {formatDate(b.check_out)}</span>
                        {existingReport && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Laporan Ada</span>}
                        {!existingReport && <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full">Tiada Laporan</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 shrink-0">
                      {existingReport && (
                        <button onClick={()=>setViewReport(existingReport)}
                          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-[10px] text-[11px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3"/> Lihat
                        </button>
                      )}
                      <button onClick={()=>setSelectedBooking(isPicked?'':b.invoice_id)}
                        className={`px-3 py-2 rounded-[10px] text-[11px] font-bold transition-colors ${isPicked?'bg-emerald-500 text-white shadow-sm':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {isPicked?'✓ Dipilih':'Pilih'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- SECTION CARDS ---- */}
        {sections.map(section=>{
          const sDone = section.tasks.filter(t=>t.done).length;
          const sTotal = section.tasks.length;
          const status = sectionStatus(section);
          const allDone = sDone === sTotal && sTotal > 0;
          const totalSectionPhotos = section.sectionPhotos.length;

          return (
            <div key={section.id} className={`bg-white rounded-[28px] overflow-hidden shadow-sm transition-all duration-200 border-2 ${allDone?'border-emerald-300':'border-transparent'}`}>

              {/* Section image header */}
              <div className="relative" style={{height: section.image?'200px':'0px', overflow:'hidden'}}>
                {section.image && <>
                  <img src={section.image} className="w-full h-full object-cover" alt={section.name}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                  {/* Full-screen button */}
                  <button onClick={()=>setFullscreenImg(section.image)}
                    className="absolute top-3 right-3 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <Eye className="w-4 h-4 text-white"/>
                  </button>
                  {/* Section name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white font-black text-xl leading-tight drop-shadow-md">{section.name}</p>
                        <p className="text-white/80 text-xs font-bold mt-0.5">{sTotal} tugasan disenaraikan</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg ${allDone?'bg-emerald-500 text-white':sDone>0?'bg-amber-400 text-white':'bg-white/90 text-gray-700'}`}
                        style={{background:allDone?'#10b981':sDone>0?'#f59e0b':'rgba(255,255,255,0.9)',color:allDone||sDone>0?'white':'#374151'}}>
                        {sDone}/{sTotal}
                      </div>
                    </div>
                  </div>
                </>}
              </div>

              {/* Section header bar (when no image OR always for non-image sections) */}
              <button onClick={()=>toggleSection(section.id)}
                className={`w-full px-5 py-4 flex items-center gap-3 text-left transition-colors hover:bg-gray-50 ${section.image?'':'border-b border-gray-50'}`}>
                {!section.image && (
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-[14px] flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-emerald-600"/>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {!section.image && <p className="font-bold text-gray-900 text-base">{section.name}</p>}
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                    {section.notes && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold border border-amber-100">📝 Nota</span>}
                    {totalSectionPhotos > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">📸 {totalSectionPhotos}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Mini progress ring */}
                  <div className="relative w-9 h-9 shrink-0">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke={allDone?'#10b981':'#34d399'} strokeWidth="4"
                        strokeDasharray={`${sTotal?((sDone/sTotal)*87.96).toFixed(1):0} 87.96`} strokeLinecap="round"/>
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-black ${allDone?'text-emerald-600':'text-gray-600'}`}>{sTotal?Math.round((sDone/sTotal)*100):0}%</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${section.expanded?'rotate-180':''}`}/>
                </div>
              </button>

              {/* ---- EXPANDED CONTENT ---- */}
              {section.expanded && (
                <div className="border-t border-gray-100">

                  {/* CHECKLIST */}
                  <div className="px-4 pt-4 pb-2 space-y-2">
                    {section.tasks.map((task, ti)=>(
                      <div key={task.id} className={`rounded-[18px] border-2 overflow-hidden transition-all duration-200 ${task.done?'border-emerald-300 bg-emerald-50/50':'border-gray-100 bg-white'}`}>
                        {/* Task row */}
                        <button onClick={()=>toggleTask(section.id, task.id)}
                          className="w-full flex items-center gap-4 px-4 py-4 text-left active:scale-[0.99] transition-transform">
                          {/* Checkbox */}
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.done?'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200':'border-gray-300 bg-white'}`}>
                            {task.done && <CheckCircle className="w-4 h-4 text-white"/>}
                          </div>
                          <span className={`flex-1 text-sm font-bold leading-snug ${task.done?'text-emerald-700':'text-gray-800'}`}>{task.task}</span>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">{ti+1}</span>
                        </button>

                      </div>
                    ))}
                  </div>

                  {/* CATATAN */}
                  <div className="px-4 pb-4">
                    <div className="bg-amber-50 rounded-[18px] p-4 border border-amber-100">
                      <label className="flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">
                        <AlertCircle className="w-3.5 h-3.5"/> Catatan / Masalah Ditemui
                      </label>
                      <textarea
                        value={section.notes} onChange={e=>updateNotes(section.id, e.target.value)}
                        placeholder={`Cth: Lampu rosak, cadar perlu ganti, stok sabun habis...`}
                        rows={3}
                        className="w-full bg-white border border-amber-200 rounded-[12px] p-3 text-sm font-medium text-gray-800 outline-none resize-none focus:border-amber-400 placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* SECTION PHOTOS */}
                  <div className="px-4 pb-5">
                    <div className="bg-blue-50 rounded-[18px] p-4 border border-blue-100">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5"/> Gambar Keseluruhan — {section.name}
                      </p>
                      {section.sectionPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {section.sectionPhotos.map((ph,pi)=>(
                            <button key={ph.uid} onClick={()=>setFullscreenPhotos({photos:section.sectionPhotos,index:pi})}
                              className="relative aspect-square rounded-[12px] overflow-hidden border-2 border-white shadow-sm group">
                              <img src={ph.previewUrl} className="w-full h-full object-cover" alt=""/>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"/>
                              </div>
                              <button onClick={e=>{e.stopPropagation();removeSectionPhoto(section.id,ph.uid);}}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow">
                                <X className="w-2.5 h-2.5 text-white"/>
                              </button>
                            </button>
                          ))}
                          <label className="aspect-square rounded-[12px] border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors gap-1">
                            <Plus className="w-5 h-5 text-blue-400"/>
                            <span className="text-[9px] font-bold text-blue-400">Tambah</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e=>{ addSectionPhoto(section.id,e.target.files); e.target.value=''; }}/>
                          </label>
                        </div>
                      )}
                      {section.sectionPhotos.length === 0 && (
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-[12px] text-xs font-bold cursor-pointer hover:bg-black transition-colors">
                            <Camera className="w-4 h-4"/> Ambil Gambar
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>{ addSectionPhoto(section.id,e.target.files); e.target.value=''; }}/>
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-blue-700 border border-blue-200 rounded-[12px] text-xs font-bold cursor-pointer hover:bg-blue-50 transition-colors">
                            <ImageIcon className="w-4 h-4"/> Pilih Galeri
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e=>{ addSectionPhoto(section.id,e.target.files); e.target.value=''; }}/>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {uploadMsg && (
          <div className={`p-4 rounded-[16px] font-bold text-sm text-center ${uploadMsg.type==='err'?'bg-red-50 text-red-600 border border-red-100':'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{uploadMsg.text}</div>
        )}
      </div>

      {/* ---- STICKY FOOTER SUBMIT ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 pt-3 pb-8 shadow-2xl">
          <div className="max-w-lg mx-auto">
            {/* Mini summary row */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {sections.map(s=>{
                    const d=s.tasks.filter(t=>t.done).length; const tot=s.tasks.length;
                    return <div key={s.id} className={`h-2 rounded-full transition-all ${d===tot&&tot>0?'bg-emerald-500 w-5':d>0?'bg-amber-400 w-3':'bg-gray-200 w-2'}`}/>;
                  })}
                </div>
                <span className="text-xs font-bold text-gray-500">{sections.filter(s=>s.tasks.length&&s.tasks.every(t=>t.done)).length}/{sections.length} ruang selesai</span>
              </div>
              <span className={`text-sm font-black ${pct===100?'text-emerald-600':'text-gray-400'}`}>{pct}%</span>
            </div>
            <button onClick={handleSubmit} disabled={submitting||totalDone===0}
              className={`w-full font-bold py-4 rounded-[18px] text-base transition-all flex items-center justify-center gap-3 ${totalDone>0&&!submitting?'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200 active:scale-[0.98]':'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              {submitting
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Menghantar Laporan...</>
                : <><CheckCircle className="w-5 h-5"/> Hantar Laporan &nbsp;·&nbsp; {totalDone}/{totalTasks} Selesai</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= CUSTOMER VIEW =================
const CustomerView = ({ state, dispatch, setRoute, isDark, toggleDark }) => {
  const { homepage, pricing, special_dates, facilities, gallery, rules, bookings } = state;
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guests, setGuests] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showWaNotice, setShowWaNotice] = useState(false);
  const [lastBookingId, setLastBookingId] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInitialId, setHistoryInitialId] = useState('');
  const [pendingBooking, setPendingBooking] = useState(null); // booking summary before confirm
  const [activeStep, setActiveStep] = useState(null);
  const bookingRef = useRef(null);
  const formRef = useRef(null);
  const galleryScrollRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime()+86400000).toISOString().split('T')[0] : today;
  const formReady = checkIn && checkOut && guestName && guestPhone;

  const priceCalc = useMemo(() => {
    if (checkIn && checkOut && new Date(checkIn)<new Date(checkOut))
      return calculatePrice(checkIn, checkOut, pricing, special_dates, guests);
    return null;
  }, [checkIn, checkOut, pricing, special_dates, guests]);

  const handleCalendarDate = (dateStr) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr); setCheckOut('');
    } else {
      if (dateStr > checkIn) setCheckOut(dateStr);
      else { setCheckIn(dateStr); setCheckOut(''); }
    }
  };

  // Scroll spy for mobile gallery dots
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const onScroll = () => setGalleryIndex(Math.round(el.scrollLeft / el.offsetWidth));
    el.addEventListener('scroll', onScroll, {passive:true});
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-slide mobile gallery every 4s
  useEffect(() => {
    if (!gallery.length) return;
    const t = setInterval(() => {
      const el = galleryScrollRef.current;
      if (!el) return;
      const next = (galleryIndex + 1) % gallery.length;
      el.scrollTo({ left: next * el.offsetWidth, behavior: 'smooth' });
      setGalleryIndex(next);
    }, 4000);
    return () => clearInterval(t);
  }, [galleryIndex, gallery.length]);

  // Step 1 — validate & show summary
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn||!checkOut||!guestName||!guestPhone) return setToast({type:'error',message:'Sila lengkapkan borang.'});
    if (checkIn >= checkOut) return setToast({type:'error',message:'Tarikh keluar mesti selepas tarikh masuk.'});
    if (!priceCalc) return setToast({type:'error',message:'Ralat pengiraan harga. Sila pilih tarikh semula.'});
    const maxG = pricing.max_guests||10;
    if (guests > maxG) return setToast({type:'error',message:`Maksimum ${maxG} tetamu sahaja.`});
    if (checkOverlap(checkIn,checkOut,bookings,special_dates)) return setToast({type:'error',message:'Tarikh telah ditempah atau ditutup.'});
    setPendingBooking({ checkIn, checkOut, guestName, guestPhone, guestEmail, guests, priceCalc });
  };

  // Step 2 — actually create booking after user confirms
  const handleConfirmBooking = () => {
    if (!pendingBooking) return;
    const { checkIn:ci, checkOut:co, guestName:gn, guestPhone:gp, guestEmail:ge, guests:g, priceCalc:pc } = pendingBooking;
    // Re-check overlap in case someone else booked between summary and confirm
    if (checkOverlap(ci, co, bookings, special_dates)) {
      setPendingBooking(null);
      setToast({type:'error',message:'Maaf, tarikh ini baru sahaja ditempah. Sila pilih tarikh lain.'});
      return;
    }
    const bkNum = Math.floor(Math.random()*90000)+10000;
    const bkId = `BK${bkNum}`;
    const holdUntil = new Date(Date.now()+6*3600000).toISOString();
    const newBk = {
      id: bkId, invoice_id: `DELOKA-INV-${bkNum}`,
      guest_name: gn, guest_phone: gp, guest_email: ge, guest_ic: '',
      check_in: ci, check_out: co,
      guests: Number(g), total_nights: pc.totalNights,
      total_price: pc.grandTotal, deposit: pc.deposit, payment_received: 0,
      admin_notes: '', status: 'hold',
      hold_until: holdUntil, agreed_terms: false,
      created_at: new Date().toISOString()
    };
    dispatch({type:'ADD_BOOKING', payload:newBk});
    const waMsg = renderWATemplate(state.wa_templates?.new_booking, {
      homestay_name: homepage.homestay_name, nama: gn, telefon: gp,
      inv: `DELOKA-INV-${bkNum}`, masuk: formatDate(ci), keluar: formatDate(co),
      malam: pc.totalNights, tetamu: g,
      jumlah: pc.grandTotal.toFixed(0), deposit: pc.deposit.toFixed(0),
    });
    window.open(`https://wa.me/${homepage.whatsapp_number}?text=${encodeURIComponent(waMsg)}`, '_blank');
    // Email notifications via EmailJS
    const ej = state.emailjs_config;
    if (ej?.public_key && ej?.service_id) {
      const commonParams = {
        homestay_name: homepage.homestay_name, invoice_id: `DELOKA-INV-${bkNum}`,
        guest_name: gn, guest_phone: gp,
        check_in: formatDate(ci), check_out: formatDate(co),
        total_nights: String(pc.totalNights), guests: String(g),
        total_price: formatCurrency(pc.grandTotal), deposit: formatCurrency(pc.deposit),
        hold_until: new Date(holdUntil).toLocaleString('ms-MY'), status: 'Menunggu Deposit',
      };
      if (ej.admin_template_id && ej.admin_email)
        emailjs.send(ej.service_id, ej.admin_template_id, { ...commonParams, to_email: ej.admin_email }, { publicKey: ej.public_key }).catch(()=>{});
      if (ej.customer_template_id && ge)
        emailjs.send(ej.service_id, ej.customer_template_id, { ...commonParams, to_email: ge, to_name: gn }, { publicKey: ej.public_key }).catch(()=>{});
    }
    setPendingBooking(null);
    setLastBookingId(bkId);
    setCheckIn(''); setCheckOut(''); setGuestName(''); setGuestPhone(''); setGuestEmail(''); setGuests(1);
    setShowWaNotice(true);
  };

  return (
    <div className="min-h-screen pb-40 md:pb-8" id="home">
      {showStatusModal && <BookingStatusModal bookings={bookings} dispatch={dispatch} homepage={homepage} pricing={pricing} onClose={()=>{setShowStatusModal(false);setHistoryInitialId('');}} initialQuery={historyInitialId}/>}
      {showHistoryModal && <BookingHistoryModal bookings={bookings} homepage={homepage} onClose={()=>setShowHistoryModal(false)} onViewBooking={(id)=>{ setShowHistoryModal(false); setHistoryInitialId(id); setShowStatusModal(true); }}/>}
      {showRules && <RulesModal rules={rules} onClose={()=>setShowRules(false)}/>}

      {/* ── Booking Summary Modal (step before confirm) ── */}
      {pendingBooking && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full md:max-w-sm bg-white rounded-t-[28px] md:rounded-[28px] overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gray-900 px-5 pt-5 pb-4">
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Semak Sebelum Hantar</p>
              <h3 className="text-xl font-black text-white">Ringkasan Tempahan</h3>
            </div>
            {/* Details */}
            <div className="px-5 py-4 space-y-2.5">
              {[
                { icon:'👤', label:'Nama',     value: pendingBooking.guestName },
                { icon:'📱', label:'Telefon',  value: pendingBooking.guestPhone },
                { icon:'✉️', label:'Emel',     value: pendingBooking.guestEmail || <span className="text-gray-400 italic text-xs">Tiada — notifikasi emel tidak akan dihantar</span> },
                { icon:'📅', label:'Check-in', value: formatDate(pendingBooking.checkIn) },
                { icon:'📅', label:'Check-out',value: formatDate(pendingBooking.checkOut) },
                { icon:'🌙', label:'Tempoh',   value: `${pendingBooking.priceCalc.totalNights} malam · ${pendingBooking.guests} tetamu` },
              ].map(({icon,label,value})=>(
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5 shrink-0"><span>{icon}</span>{label}</span>
                  <span className="text-xs font-bold text-gray-900 text-right">{value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">💰 Jumlah</span>
                <span className="text-lg font-black text-emerald-600">{formatCurrency(pendingBooking.priceCalc.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">💳 Deposit kini</span>
                <span className="text-sm font-black text-amber-600">{formatCurrency(pendingBooking.priceCalc.deposit)}</span>
              </div>
              {/* Email warning */}
              {!pendingBooking.guestEmail && state.emailjs_config?.public_key && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-[10px] px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5"/>
                  <p className="text-[10px] text-amber-700 font-medium">Tiada emel diisi — pengesahan emel tidak akan dihantar. Kembali untuk tambah emel jika perlu.</p>
                </div>
              )}
            </div>
            {/* Actions */}
            <div className="px-5 pb-6 grid grid-cols-2 gap-3">
              <button onClick={()=>setPendingBooking(null)}
                className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[14px] transition-colors text-sm flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4"/> Edit
              </button>
              <button onClick={handleConfirmBooking}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[14px] transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                <Send className="w-4 h-4"/> Hantar Tempahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WhatsApp Notice Modal (after booking confirmed) ── */}
      {showWaNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-fade-in text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-600"/>
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-1">Tempahan Direkodkan!</h3>
            <p className="text-sm text-gray-500 mb-4">No. Tempahan: <strong className="text-gray-900">{bookings.find(b=>b.id===lastBookingId)?.invoice_id || lastBookingId}</strong></p>

            {/* Tips bubbles */}
            <div className="space-y-2 mb-5 text-left">
              {[
                { icon:'💬', color:'bg-green-50 border-green-100 text-green-800', text:'Notifikasi WhatsApp telah dihantar ke admin.' },
                { icon:'💳', color:'bg-amber-50 border-amber-100 text-amber-800', text:'Bayar deposit dalam 6 jam atau tempahan akan dibatalkan.' },
                { icon:'📤', color:'bg-blue-50 border-blue-100 text-blue-800',   text:'Upload resit selepas bayar — tekan "Semak Status Tempahan".' },
              ].map(({icon,color,text})=>(
                <div key={text} className={`flex items-start gap-2.5 border rounded-[12px] px-3 py-2.5 ${color}`}>
                  <span className="text-base shrink-0">{icon}</span>
                  <p className="text-xs font-semibold leading-snug">{text}</p>
                </div>
              ))}
            </div>

            <button onClick={()=>setShowWaNotice(false)} className="w-full bg-gray-900 text-white font-bold py-4 rounded-[16px] hover:bg-black transition-colors">
              Saya Faham
            </button>
            <button onClick={()=>{ setShowWaNotice(false); setShowStatusModal(true); }}
              className="w-full mt-2 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
              Semak Status Tempahan →
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex bg-white/90 backdrop-blur-xl px-8 py-3.5 justify-between items-center sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="font-bold text-lg text-stone-800 flex items-center gap-3">
          {homepage.logo_url
            ? <img src={homepage.logo_url} alt="logo" className="w-9 h-9 rounded-[10px] object-cover shadow-md"/>
            : <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[10px] text-white flex items-center justify-center font-black text-base shadow-md">D</div>
          }
          <span className="brand-font text-2xl text-[#3D1C02]" style={BRAND_FONT}>{homepage.homestay_name}</span>
        </div>
        <div className="flex items-center gap-0.5 bg-gray-100/80 border border-gray-200/60 px-1.5 py-1.5 rounded-full">
          {[
            { href:'#home', icon: Home, label:'Utama' },
            { href:'#facilities', icon: List, label:'Kemudahan' },
            { onClick:()=>setShowRules(true), icon: ShieldAlert, label:'Peraturan' },
            { href:'#booking', icon: CreditCard, label:'Tempahan' },
            { onClick:()=>setShowStatusModal(true), icon: Search, label:'Semak' },
          ].map((item,i) => {
            const cls = 'flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-gray-600 hover:text-emerald-700 hover:bg-white hover:shadow-sm rounded-full transition-all';
            return item.href
              ? <a key={i} href={item.href} className={cls}><item.icon className="w-3.5 h-3.5"/>{item.label}</a>
              : <button key={i} onClick={item.onClick} className={cls}><item.icon className="w-3.5 h-3.5"/>{item.label}</button>;
          })}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500">{isDark?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
          <button onClick={()=>setRoute('admin-login')} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-full text-[13px] font-semibold transition-colors shadow-sm"><Settings className="w-3.5 h-3.5"/> Panel</button>
        </div>
      </nav>

      {/* Mobile Top Controls */}
      <div className="md:hidden absolute top-0 w-full p-4 flex justify-end z-20 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={()=>setRoute('admin-login')} className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-sm"><Settings className="w-4 h-4"/></button>
          <button onClick={toggleDark} className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-sm">{isDark?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto md:pt-8 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 md:items-start">
        <div className="md:col-span-7 space-y-6 md:space-y-8">

          {/* Mobile Gallery with dots */}
          <div className="md:hidden relative">
            <div ref={galleryScrollRef} className="h-[52vh] w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-stone-900">
              {gallery.map((img,i) => (
                <div key={i} className="w-full h-full shrink-0 snap-center relative">
                  {/* shimmer placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 animate-pulse"/>
                  <img src={img} onClick={()=>setLightboxIdx(i)}
                    className="w-full h-full object-cover cursor-zoom-in relative z-10"
                    alt={`Gambar ${i+1}`}
                    onLoad={e=>e.currentTarget.previousSibling.style.display='none'}/>
                </div>
              ))}
            </div>
            {/* Top gradient + brand name */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"/>
            <div className="absolute bottom-10 left-5 z-10">
              <span className="brand-font text-4xl text-white drop-shadow-lg" style={BRAND_FONT}>{homepage.homestay_name}</span>
              <p className="text-white/70 text-xs font-medium mt-0.5 drop-shadow">{homepage.tagline}</p>
            </div>
            {/* Camera hint */}
            <button onClick={()=>setLightboxIdx(galleryIndex)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors">
              <Camera className="w-4 h-4 text-white/80"/>
            </button>
            {/* Bottom gradient */}
            <div className="absolute bottom-0 w-full h-28 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"/>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {gallery.map((_,i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i===galleryIndex?'w-5 bg-white':'w-1.5 bg-white/50'}`}/>)}
            </div>
          </div>

          {/* Desktop Gallery */}
          <div className="hidden md:block">
            <div className="w-full h-[400px] xl:h-[450px] rounded-[32px] overflow-hidden mb-4 bg-stone-200 shadow-sm border border-gray-100 relative group cursor-zoom-in"
              onClick={()=>setLightboxIdx(selectedGalleryImg)}>
              {/* shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse rounded-[32px]"/>
              <img src={gallery[selectedGalleryImg]||gallery[0]}
                className="w-full h-full object-cover transition-opacity duration-500 relative z-10"
                alt="Main"
                onLoad={e=>{e.currentTarget.style.opacity='1'; e.currentTarget.previousSibling.style.display='none';}}
                style={{opacity:0}}
                key={selectedGalleryImg}/>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 bg-black/0 group-hover:bg-black/40 rounded-full flex items-center justify-center transition-all scale-0 group-hover:scale-100">
                  <Camera className="w-5 h-5 text-white"/>
                </div>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {gallery.map((img,i) => (
                <button key={i} onClick={()=>setSelectedGalleryImg(i)} onDoubleClick={()=>setLightboxIdx(i)} className={`shrink-0 w-32 h-[84px] rounded-[20px] overflow-hidden transition-all duration-300 relative bg-stone-200 ${selectedGalleryImg===i?'border-[3px] border-emerald-500 shadow-md scale-105':'border-[3px] border-transparent opacity-60 hover:opacity-100'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse"/>
                  <img src={img} className="w-full h-full object-cover relative z-10" alt={`Thumb ${i+1}`}
                    onLoad={e=>{e.currentTarget.previousSibling.style.display='none';}}/>
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-t-[32px] md:rounded-[32px] -mt-10 md:mt-0 relative z-10 p-6 md:p-8 app-shadow border border-amber-100/60 md:border-amber-100/60">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">🌴 Konsep Moden Bali</span>
                </div>
                <h1 className="brand-font text-5xl leading-tight text-[#3D1C02]" style={BRAND_FONT}>{homepage.homestay_name}</h1>
                <p className="text-sm text-amber-700/80 font-semibold mt-1 italic">{homepage.tagline}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/60 p-4 rounded-[20px] w-full md:w-auto text-left md:text-right shadow-sm">
                <p className="text-3xl font-black price-glow">{formatCurrency(pricing.weekday)}</p>
                <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mt-1">Bermula / Malam</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <p className="flex items-center gap-2 text-gray-600 text-sm font-medium bg-gray-50 px-4 py-2 rounded-full border border-gray-100"><MapPin className="w-4 h-4 text-emerald-600 shrink-0"/> {homepage.address}</p>
              {homepage.maps_url && <a href={homepage.maps_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold transition-colors"><MapIcon className="w-3.5 h-3.5"/> Google Maps</a>}
              {homepage.waze_url && <a href={homepage.waze_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold transition-colors"><Navigation className="w-3.5 h-3.5"/> Waze</a>}
            </div>

            {/* SHORTCUT ICONS BAR */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { icon: CreditCard, label: 'Tempah', action: ()=>{ bookingRef.current?.scrollIntoView({behavior:'smooth'}); }, color: 'bg-emerald-50 text-emerald-600' },
                { icon: ShieldAlert, label: 'Peraturan', action: ()=>setShowRules(true), color: 'bg-red-50 text-red-500' },
                { icon: Search, label: 'Semak', action: ()=>setShowStatusModal(true), color: 'bg-purple-50 text-purple-600' },
                { icon: Phone, label: 'Hubungi', action: ()=>window.open(`https://wa.me/${homepage.whatsapp_number}`,'_blank'), color: 'bg-green-50 text-green-600' },
              ].map((s,i) => (
                <button key={i} onClick={s.action} className={`flex flex-col items-center gap-2 p-3 rounded-[20px] ${s.color} hover:opacity-80 transition-opacity`}>
                  <s.icon className="w-5 h-5"/>
                  <span className="text-[10px] font-bold">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-200 to-transparent my-4"/>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-emerald-50 border border-emerald-200 rounded-[10px] flex items-center justify-center text-sm">🌿</span>
              Pengenalan
            </h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">{homepage.short_description}</p>
          </div>

          {/* Facilities */}
          <div id="facilities" className="bg-white rounded-[32px] p-6 md:p-8 app-shadow border border-amber-100/50 scroll-mt-24">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-amber-50 border border-amber-200 rounded-[10px] flex items-center justify-center text-sm">🏡</span>
              Kemudahan Disediakan
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {facilities.map(f => {
                const IconC = IconMap[f.icon]||CheckCircle;
                return (
                  <div key={f.id} className="group bg-stone-50 rounded-[20px] p-4 flex flex-col items-center gap-3 text-center border border-stone-100 hover:bg-amber-50 hover:border-amber-200 transition-all duration-200">
                    <IconC className="w-6 h-6 text-emerald-700 group-hover:text-amber-700 transition-colors"/>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight">{f.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rules popout trigger */}
          <button onClick={()=>setShowRules(true)} className="bg-white rounded-[32px] p-5 app-shadow border border-amber-100/60 w-full flex items-center justify-between hover:border-red-200 hover:bg-red-50/30 transition-all group text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-50 rounded-[16px] flex items-center justify-center shrink-0"><ShieldAlert className="w-6 h-6 text-red-500"/></div>
              <div>
                <p className="font-bold text-gray-900">Peraturan Rumah</p>
                <p className="text-xs text-gray-500 mt-0.5">{rules.length} peraturan • Wajib baca sebelum check-in</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors shrink-0"/>
          </button>

          {/* CARA TEMPAHAN */}
          {(() => {
            const steps = [
              { num: '1', title: 'Pilih Tarikh', icon: CalendarDays, desc: 'Klik pada tarikh masuk di kalendar, kemudian klik tarikh keluar. Tarikh merah = sudah ditempah, biru = dalam proses.' },
              { num: '2', title: 'Isi Maklumat', icon: User, desc: 'Masukkan nama penuh dan nombor telefon WhatsApp anda yang aktif untuk pengesahan tempahan.' },
              { num: '3', title: 'Klik TEMPAH SEKARANG', icon: CheckCircle, desc: 'Selepas mengisi semua maklumat, klik butang hijau "TEMPAH SEKARANG". WhatsApp akan terbuka — tekan Hantar.' },
              { num: '4', title: 'Bayar Deposit', icon: CreditCard, desc: `Bayar deposit RM ${pricing.deposit} dalam masa 6 jam ke akaun yang diberikan. Tempahan akan dibatalkan jika tiada bayaran.` },
              { num: '5', title: 'Upload Resit', icon: Upload, desc: 'Klik "Semak Status Tempahan" di bawah, masukkan No. Tempahan anda dan upload gambar resit bayaran deposit.' },
            ];
            return (
              <div className="bg-white rounded-[32px] p-6 app-shadow border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500"/> Cara Buat Tempahan</h3>
                <div className="space-y-2">
                  {steps.map(step => {
                    const StepIcon = step.icon;
                    const isOpen = activeStep === step.num;
                    return (
                      <div key={step.num} className={`rounded-[16px] border transition-all overflow-hidden ${isOpen?'border-emerald-200 bg-emerald-50':'border-gray-100 bg-gray-50'}`}>
                        <button type="button" onClick={()=>setActiveStep(isOpen?null:step.num)} className="w-full flex items-center gap-3 p-3.5 text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-colors ${isOpen?'bg-emerald-600 text-white':'bg-white text-emerald-600 border-2 border-emerald-200'}`}>{step.num}</div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <StepIcon className={`w-4 h-4 shrink-0 ${isOpen?'text-emerald-600':'text-gray-400'}`}/>
                            <p className={`font-bold text-sm ${isOpen?'text-emerald-800':'text-gray-800'}`}>{step.title}</p>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen?'rotate-180 text-emerald-500':''}`}/>
                        </button>
                        {isOpen && <div className="px-4 pb-4 pt-1"><p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p></div>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-[16px] p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"/>
                  <p className="text-xs font-bold text-emerald-800">Sebarang pertanyaan? Hubungi kami terus melalui WhatsApp. Kami sedia membantu!</p>
                </div>
              </div>
            );
          })()}

        </div>

        {/* RIGHT BOOKING CARD — sticky on desktop */}
        <div className="md:col-span-5 md:sticky md:top-24">
          <div id="booking" ref={bookingRef} className="bg-white rounded-[32px] p-5 md:p-8 booking-shadow border border-amber-200/60 mx-3 md:mx-0 scroll-mt-28">
            <h3 className="text-2xl font-bold mb-5 flex items-center gap-2 text-gray-900"><CreditCard className="w-6 h-6 text-emerald-600"/> Tempah Disini</h3>
            <form ref={formRef} onSubmit={handleSubmit}>
              {/* INLINE CALENDAR */}
              <div className="mb-4 bg-gray-50 rounded-[20px] p-4 border border-gray-100">
                <MonthCalendar
                  bookings={bookings} specialDates={special_dates}
                  selectable={true} selectedIn={checkIn} selectedOut={checkOut}
                  onDateClick={handleCalendarDate}
                />
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] font-bold text-gray-500 mt-3 pt-3 border-t border-gray-200">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block"/>Tersedia</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"/>Dipilih</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-200 inline-block"/>Ditempah</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-200 inline-block"/>Hold</span>
                </div>
              </div>

              {/* DATE DISPLAY CARDS */}
              <div className="mb-5">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {/* Check-in */}
                  <div className={`rounded-[16px] border-2 p-3 transition-all ${checkIn?'border-emerald-500 bg-emerald-50':'border-dashed border-gray-300 bg-gray-50 opacity-60'}`}>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tarikh Masuk</p>
                    {checkIn ? (
                      <>
                        <p className="text-2xl font-bold text-emerald-700 leading-none">{new Date(checkIn+'T00:00:00').getDate().toString().padStart(2,'0')}</p>
                        <p className="text-xs font-bold text-emerald-600">{['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sep','Okt','Nov','Dis'][new Date(checkIn+'T00:00:00').getMonth()]} {new Date(checkIn+'T00:00:00').getFullYear()}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400">Pilih ↑</p>
                    )}
                  </div>
                  {/* Check-out */}
                  <div className={`rounded-[16px] border-2 p-3 transition-all ${checkOut?'border-emerald-500 bg-emerald-50':checkIn?'border-dashed border-gray-300 bg-white':'border-dashed border-gray-200 bg-gray-50 opacity-40'}`}>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tarikh Keluar</p>
                    {checkOut ? (
                      <>
                        <p className="text-2xl font-bold text-emerald-700 leading-none">{new Date(checkOut+'T00:00:00').getDate().toString().padStart(2,'0')}</p>
                        <p className="text-xs font-bold text-emerald-600">{['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sep','Okt','Nov','Dis'][new Date(checkOut+'T00:00:00').getMonth()]} {new Date(checkOut+'T00:00:00').getFullYear()}</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-400">{checkIn?'Pilih ↑':'—'}</p>
                    )}
                  </div>
                </div>
                {/* nights summary + reset */}
                {checkIn && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-bold text-gray-500">
                      {priceCalc ? `${priceCalc.totalNights} malam dipilih` : checkIn && !checkOut ? 'Pilih tarikh keluar' : ''}
                    </p>
                    <button type="button" onClick={()=>{setCheckIn('');setCheckOut('');}} className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors">
                      <X className="w-3.5 h-3.5"/> Reset Tarikh
                    </button>
                  </div>
                )}
              </div>

              {/* TETAMU */}
              <div className="border border-gray-200 rounded-[16px] mb-5 bg-white">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Tetamu</label>
                    <span className="text-sm font-bold text-gray-900">{guests} Orang</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={()=>setGuests(g=>Math.max(1,g-1))} className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold text-lg transition-colors">−</button>
                    <span className="w-5 text-center font-bold text-gray-900">{guests}</span>
                    <button type="button" onClick={()=>setGuests(g=>Math.min(pricing.max_guests||10,g+1))} className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold text-lg transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* NAMA + TELEFON */}
              <div className="space-y-3 mb-5">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input type="text" placeholder="Nama Penuh" value={guestName} onChange={e=>setGuestName(e.target.value)} className="w-full pl-11 p-3.5 bg-white border border-gray-300 rounded-[12px] text-sm font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" required/>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input type="tel" placeholder="Contoh: 0145346542" value={guestPhone}
                    onChange={e=>setGuestPhone(e.target.value)}
                    className="w-full pl-11 p-3.5 bg-white border border-gray-300 rounded-[12px] text-sm font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required/>
                </div>
                <div className="relative">
                  <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input type="email" placeholder="Emel (untuk pengesahan) — pilihan" value={guestEmail}
                    onChange={e=>setGuestEmail(e.target.value)}
                    className="w-full pl-11 p-3.5 bg-white border border-gray-300 rounded-[12px] text-sm font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"/>
                </div>
              </div>

              {formReady && (
                <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-[10px] px-3 py-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                  <p className="text-[11px] text-emerald-700 font-semibold">Semua maklumat telah lengkap. Tekan butang di bawah untuk semak & hantar tempahan.</p>
                </div>
              )}
              <button type="submit" className={`hidden md:flex w-full font-bold py-4 rounded-[12px] justify-center items-center transition-all text-lg tracking-widest uppercase ${formReady ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200' : 'bg-gray-900 hover:bg-black text-white shadow-md'}`}>
                TEMPAH SEKARANG
              </button>
              <div className="hidden md:flex items-center justify-center gap-2 mt-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600"/> Tiada caj tersembunyi
              </div>

              {/* PRICE SUMMARY + BREAKDOWN POPOUT */}
              {priceCalc && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="bg-gray-900 rounded-[16px] p-4 flex justify-between items-center mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{priceCalc.totalNights} Malam • {guests} Tetamu</p>
                      <p className="text-white font-bold">Jumlah Bayaran</p>
                    </div>
                    <p className="text-white font-bold text-2xl">{formatCurrency(priceCalc.grandTotal)}</p>
                  </div>
                  <button type="button" onClick={()=>setShowBreakdown(true)} className="w-full py-2.5 border border-gray-200 rounded-[12px] text-xs font-bold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
                    <Info className="w-3.5 h-3.5"/> Lihat Senarai Harga Per Malam
                  </button>
                  <div className="mt-3 bg-emerald-50 p-3 rounded-[12px] text-center border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-bold">Bayar deposit {formatCurrency(priceCalc.deposit)} selepas pengesahan.</p>
                  </div>
                </div>
              )}

              {/* BREAKDOWN POPOUT */}
              {showBreakdown && priceCalc && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm" onClick={()=>setShowBreakdown(false)}>
                  <div className="bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-md shadow-2xl flex flex-col" style={{maxHeight:'80vh'}} onClick={e=>e.stopPropagation()}>
                    <div className="px-6 pt-5 pb-3 shrink-0 border-b border-gray-100">
                      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden"/>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900">Senarai Harga Per Malam</h4>
                        <button onClick={()=>setShowBreakdown(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500"/></button>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
                      {priceCalc.breakdown.map((b,i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-[12px]">
                          <span className="text-sm font-bold text-gray-700">{formatDate(b.date)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">{b.type}</span>
                            <span className="font-bold text-gray-900">RM {b.price}</span>
                          </div>
                        </div>
                      ))}
                      {priceCalc.extraGuestFee > 0 && (
                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-[12px] border border-orange-100">
                          <span className="text-sm font-bold text-orange-700">Caj Tetamu Tambahan</span>
                          <span className="font-bold text-orange-700">{formatCurrency(priceCalc.extraGuestFee)}</span>
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 shrink-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-900">Jumlah</span>
                        <span className="font-bold text-xl text-emerald-600">{formatCurrency(priceCalc.grandTotal)}</span>
                      </div>
                      <button onClick={()=>setShowBreakdown(false)} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-[14px] hover:bg-black transition-colors">Tutup</button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* BOOKING STATUS + HISTORY TRIGGER */}
      <div className="max-w-6xl mx-auto px-3 md:px-6 mt-6 grid grid-cols-2 gap-3">
        {/* Semak Status */}
        <button
          onClick={()=>setShowStatusModal(true)}
          className="bg-white rounded-[20px] p-4 app-shadow border border-gray-100 flex flex-col items-start gap-3 hover:border-purple-200 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-[12px] flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
            <Receipt className="w-5 h-5 text-purple-500"/>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-gray-900 leading-tight">Semak Status</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">No. tempahan, telefon atau IC</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors"/>
        </button>

        {/* Sejarah Tempahan */}
        <button
          onClick={()=>setShowHistoryModal(true)}
          className="bg-white rounded-[20px] p-4 app-shadow border border-gray-100 flex flex-col items-start gap-3 hover:border-amber-200 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-[12px] flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
            <ClipboardList className="w-5 h-5 text-amber-600"/>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-gray-900 leading-tight">Sejarah Tempahan</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">Semua tempahan mengikut telefon</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-400 transition-colors"/>
        </button>
      </div>

      <Footer/>
      <div className="text-center pb-8">
        <button onClick={()=>setRoute('admin-login')} className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Log Masuk Kakitangan</button>
      </div>
      <ScrollToTop/>

      {/* MOBILE FLOATING MENU */}
      <div className="md:hidden fixed bottom-4 left-3 right-3 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full p-1.5 flex justify-between items-center bottom-bar-shadow z-50">
        <div className="flex gap-1 pl-1">
          <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-emerald-600"><Home className="w-5 h-5"/></button>
          <button onClick={()=>setShowRules(true)} className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"><ShieldAlert className="w-5 h-5"/></button>
          <button onClick={()=>setShowStatusModal(true)} className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"><Search className="w-5 h-5"/></button>
          <button onClick={()=>setShowHistoryModal(true)} className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"><ClipboardList className="w-5 h-5"/></button>
        </div>
        <button
          onClick={()=>{ if(formReady) formRef.current?.requestSubmit(); else bookingRef.current?.scrollIntoView({behavior:'smooth'}); }}
          className={`pl-5 pr-6 py-2.5 rounded-full font-bold shadow-md active:scale-95 transition-all flex items-center gap-3 mr-1 ${formReady ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-gray-900 text-white'}`}
        >
          <div className="text-left leading-tight">
            <span className="block text-[8px] text-white/60 font-bold uppercase tracking-wider">{priceCalc?`${priceCalc.totalNights} Malam`:'Bermula'}</span>
            <span className="block text-sm">{priceCalc?formatCurrency(priceCalc.grandTotal):formatCurrency(pricing.weekday)}</span>
          </div>
          <div className="w-px h-5 bg-white/30 mx-0.5"/>
          <span className="text-sm uppercase font-bold tracking-wide">{formReady?'SAHKAN':'TEMPAH'}</span>
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* ── Gallery Lightbox ── */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 backdrop-blur-md" onClick={()=>setLightboxIdx(null)}>
          {/* Close */}
          <button onClick={()=>setLightboxIdx(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center z-10 transition-colors">
            <X className="w-5 h-5 text-white"/>
          </button>
          {/* Prev */}
          {gallery.length > 1 && (
            <button onClick={e=>{e.stopPropagation();setLightboxIdx((lightboxIdx-1+gallery.length)%gallery.length);}}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center z-10 transition-colors">
              <ChevronLeft className="w-6 h-6 text-white"/>
            </button>
          )}
          {/* Image */}
          <img
            src={gallery[lightboxIdx]}
            alt={`Gambar ${lightboxIdx+1}`}
            className="max-w-[88vw] max-h-[82vh] object-contain rounded-2xl shadow-2xl"
            onClick={e=>e.stopPropagation()}
          />
          {/* Next */}
          {gallery.length > 1 && (
            <button onClick={e=>{e.stopPropagation();setLightboxIdx((lightboxIdx+1)%gallery.length);}}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center z-10 transition-colors">
              <ChevronRight className="w-6 h-6 text-white"/>
            </button>
          )}
          {/* Counter + dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
            <div className="flex gap-1.5">
              {gallery.map((_,i) => (
                <button key={i} onClick={e=>{e.stopPropagation();setLightboxIdx(i);}}
                  className={`h-1.5 rounded-full transition-all ${i===lightboxIdx?'w-6 bg-white':'w-1.5 bg-white/40 hover:bg-white/70'}`}/>
              ))}
            </div>
            <span className="text-white/60 text-xs font-bold tracking-widest">{lightboxIdx+1} / {gallery.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= ADMIN PANEL =================
const AdminView = ({ state, dispatch, setRoute, isDark, toggleDark }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const SETTINGS_IDS = ['special','pricing','gallery','homepage','templates','email','users'];
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Auto-expand settings group when a settings tab becomes active
  useEffect(() => { if (SETTINGS_IDS.includes(activeTab)) setSettingsOpen(true); }, [activeTab]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCleanerCount, setUnreadCleanerCount] = useState(0);
  const [newBookingNotif, setNewBookingNotif] = useState(null);
  const [newReceiptNotif, setNewReceiptNotif] = useState(null);
  // Persisted form refs — survive sub-component remounts caused by dispatch
  const waFormRef = useRef(null);
  const hpFormRef = useRef(null);
  const emailjsFormRef = useRef(null);
  const pricingFormRef = useRef(null);
  // Cleaner modal state lifted to AdminView so it survives AdminCleaner remounts
  const [cleanerViewReport, setCleanerViewReport] = useState(null);
  const cleanerUpahRef = useRef('');
  const knownIds = useRef(new Set(state.bookings.map(b => b.id)));
  const knownReportIds = useRef(new Set((state.cleaner_reports||[]).map(r => r.id)));
  const knownReceiptMap = useRef(new Map(state.bookings.map(b => [b.id, `${b.receipt_url||''}|${b.receipt_baki_url||''}`])));

  useEffect(() => { knownIds.current = new Set(state.bookings.map(b => b.id)); }, [state.bookings]);
  useEffect(() => { knownReportIds.current = new Set((state.cleaner_reports||[]).map(r => r.id)); }, [state.cleaner_reports]);
  // Keep receipt map in sync with local state so admin edits don't false-trigger
  useEffect(() => {
    state.bookings.forEach(b => {
      knownReceiptMap.current.set(b.id, `${b.receipt_url||''}|${b.receipt_baki_url||''}`);
    });
  }, [state.bookings]);
  // Auto-dismiss notification popups
  useEffect(() => { if (newBookingNotif) { const t = setTimeout(() => setNewBookingNotif(null), 8000); return () => clearTimeout(t); } }, [newBookingNotif]);
  useEffect(() => { if (newReceiptNotif) { const t = setTimeout(() => setNewReceiptNotif(null), 8000); return () => clearTimeout(t); } }, [newReceiptNotif]);

  const playTone = (freq, dur, type='sine', vol=0.3) => {
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = type;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
      ctx.close();
    } catch {}
  };

  // Real-time listener — new bookings + receipt uploads + new cleaner reports
  useEffect(() => {
    const unsub = onSnapshot(STATE_DOC, snap => {
      const data = snap.data();
      if (!data) return;
      if (data.bookings) {
        // ── New bookings ──
        const newOnes = data.bookings.filter(b => !knownIds.current.has(b.id));
        if (newOnes.length > 0) {
          newOnes.forEach(b => dispatch({ type: 'ADD_BOOKING', payload: b }));
          setUnreadCount(n => n + newOnes.length);
          setNewBookingNotif(newOnes[0]);
          playTone(880, 0.5);
          setTimeout(() => playTone(1100, 0.4), 250);
        }
        // ── Receipt uploads from customers ──
        data.bookings.forEach(b => {
          const newKey = `${b.receipt_url||''}|${b.receipt_baki_url||''}`;
          const oldKey = knownReceiptMap.current.get(b.id);
          if (oldKey !== undefined && oldKey !== newKey) {
            const hadDeposit = oldKey.split('|')[0];
            const hadBaki    = oldKey.split('|')[1];
            const hasNewDeposit = b.receipt_url     && !hadDeposit;
            const hasNewBaki    = b.receipt_baki_url && !hadBaki;
            if (hasNewDeposit || hasNewBaki) {
              setNewReceiptNotif({ booking: b, type: hasNewBaki ? 'baki' : 'deposit' });
              dispatch({ type: 'UPDATE_BOOK_DETAIL', id: b.id, payload: { receipt_url: b.receipt_url, receipt_baki_url: b.receipt_baki_url } });
              playTone(660, 0.6, 'triangle', 0.2);
              setTimeout(() => playTone(880, 0.4, 'triangle', 0.15), 350);
            }
            knownReceiptMap.current.set(b.id, newKey);
          }
        });
      }
      if (data.cleaner_reports) {
        const newReports = data.cleaner_reports.filter(r => !knownReportIds.current.has(r.id));
        if (newReports.length > 0) {
          newReports.forEach(r => dispatch({ type: 'ADD_CLEANER_REPORT', payload: r }));
          setUnreadCleanerCount(n => n + newReports.length);
          playTone(660, 0.5);
        }
      }
    });
    return () => unsub();
  }, []);

  const AdminDashboard = () => {
    const today = new Date().setHours(0,0,0,0);
    const next7 = today + 7*86400000;
    const upcoming = state.bookings.filter(b=>b.status==='confirmed'&&new Date(b.check_in).getTime()>=today&&new Date(b.check_in).getTime()<=next7);
    const jualanSah = state.bookings.filter(b=>b.status==='confirmed').reduce((s,b)=>s+b.total_price,0);
    const unjuranRugi = state.bookings.filter(b=>b.status==='cancelled'||b.status==='expired').reduce((s,b)=>s+b.total_price,0);
    const totalTetamu = state.bookings.filter(b=>b.status==='confirmed').reduce((s,b)=>s+Number(b.guests),0);
    const holds = state.bookings.filter(b=>b.status==='hold');
    return (
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-emerald-600"/> Dashboard</h2>
          <button onClick={()=>setActiveTab('bookings')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[14px] text-sm font-bold shadow-sm transition-colors"><BookOpen className="w-4 h-4"/> Lihat Semua Tempahan</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {t:'Total Tempahan', v:state.bookings.length, c:'text-gray-900', icon:'📋', tab:'bookings'},
            {t:'Jualan Sah', v:formatCurrency(jualanSah), c:'text-emerald-600', icon:'✅', tab:'bookings'},
            {t:'Rugi (Batal)', v:formatCurrency(unjuranRugi), c:'text-red-500', icon:'❌', tab:'bookings'},
            {t:'Jumlah Tetamu', v:`${totalTetamu} Org`, c:'text-blue-600', icon:'👥', tab:'bookings'}
          ].map((s,i)=>(
            <button key={i} onClick={()=>setActiveTab(s.tab)} className="bg-white p-5 rounded-[24px] border border-gray-100 app-shadow text-left hover:border-emerald-300 hover:shadow-md transition-all active:scale-95">
              <p className="text-lg mb-1">{s.icon}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{s.t}</p>
              <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
            </button>
          ))}
        </div>

        {holds.length > 0 && (
          <button onClick={()=>setActiveTab('bookings')} className="w-full bg-orange-50 border border-orange-200 p-4 rounded-[20px] flex items-center justify-between gap-3 hover:bg-orange-100 transition-colors text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold text-orange-800 text-sm">{holds.length} Tempahan Menunggu Deposit (Hold)</p>
                <p className="text-xs text-orange-600 mt-0.5">Klik untuk lihat & sahkan tempahan.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-400 shrink-0"/>
          </button>
        )}
        {(() => {
          const pendingReports = (state.cleaner_reports||[]).filter(r=>!r.admin_seen);
          if (!pendingReports.length) return null;
          return (
            <button onClick={()=>setActiveTab('cleaner')} className="w-full bg-emerald-50 border border-emerald-200 p-4 rounded-[20px] flex items-center justify-between gap-3 hover:bg-emerald-100 transition-colors text-left">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">{pendingReports.length} Laporan Cleaner Baru Untuk Semakan</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{pendingReports.map(r=>r.cleaner_name).join(', ')} — klik untuk semak laporan.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0"/>
            </button>
          );
        })()}

        {/* Analytics */}
        {(() => {
          const mNames = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sep','Okt','Nov','Dis'];
          const months = Array.from({length:6},(_,i)=>{
            const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-5+i);
            const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            const rev = state.bookings.filter(b=>b.status==='confirmed'&&b.check_in.startsWith(ym)).reduce((s,b)=>s+b.total_price,0);
            const cnt = state.bookings.filter(b=>b.check_in.startsWith(ym)).length;
            return {label:mNames[d.getMonth()], revenue:rev, count:cnt};
          });
          const maxRev = Math.max(...months.map(m=>m.revenue), 1);
          const now2 = new Date();
          const currYM = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}`;
          const daysInMonth = new Date(now2.getFullYear(), now2.getMonth()+1, 0).getDate();
          const bookedNights = state.bookings.filter(b=>b.status==='confirmed'&&b.check_in.startsWith(currYM)).reduce((s,b)=>s+b.total_nights,0);
          const occupancy = Math.min(100, Math.round(bookedNights/daysInMonth*100));
          const dayNames = ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab'];
          const dayCounts = [0,0,0,0,0,0,0];
          state.bookings.filter(b=>b.status==='confirmed').forEach(b=>{ dayCounts[new Date(b.check_in+'T00:00:00').getDay()]++; });
          const maxDay = Math.max(...dayCounts, 1);
          return (
            <div className="bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 app-shadow">
              <h3 className="text-base font-bold flex items-center gap-2 mb-5"><TrendingUp className="w-5 h-5 text-blue-500"/> Analitik</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pendapatan 6 Bulan Terakhir</p>
                  <div className="space-y-2">
                    {months.map((m,i)=>(
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-500 w-8 shrink-0">{m.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{width:`${(m.revenue/maxRev)*100}%`}}/>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 w-20 text-right shrink-0">{m.revenue>0?formatCurrency(m.revenue):'—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Occupancy Bulan Ini</p>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center relative shrink-0">
                        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6"/><circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray={`${occupancy*1.759} 175.9`} strokeLinecap="round"/></svg>
                        <span className="text-sm font-bold text-emerald-600">{occupancy}%</span>
                      </div>
                      <div><p className="font-bold text-gray-900 text-sm">{bookedNights} malam</p><p className="text-xs text-gray-500">daripada {daysInMonth} hari</p></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Check-in Popular</p>
                    <div className="flex items-end gap-1 h-12">
                      {dayCounts.map((c,i)=>(
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full bg-blue-100 rounded-sm" style={{height:`${(c/maxDay)*36}px`,minHeight:c>0?'4px':'0'}}/>
                          <span className="text-[8px] font-bold text-gray-400">{dayNames[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 app-shadow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-orange-500"/> Tempahan 7 Hari Terdekat</h3>
            <button onClick={()=>setActiveTab('bookings')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">Lihat Semua <ChevronRight className="w-3.5 h-3.5"/></button>
          </div>
          {upcoming.length>0 ? (
            <div className="space-y-2">{upcoming.map(b=>(
              <div key={b.id} onClick={()=>setActiveTab('bookings')} className="bg-orange-50/50 border border-orange-100 p-4 rounded-[20px] flex justify-between items-center cursor-pointer hover:border-orange-300 transition-colors">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{b.guest_name}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{b.invoice_id} • {formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                  <p className="text-xs text-gray-400">{b.total_nights} mlm • {b.guests} orang</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-[8px] font-bold uppercase">Sah</span>
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(b.total_price)}</span>
                </div>
              </div>
            ))}</div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-[20px] text-center border border-gray-100">
              <p className="text-sm font-bold text-gray-400">Tiada tempahan 7 hari terdekat.</p>
              <button onClick={()=>setActiveTab('bookings')} className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700">Lihat semua tempahan →</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AdminBookings = () => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [editPayment, setEditPayment] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editReceiptUrl, setEditReceiptUrl] = useState('');
    const [editReceiptBakiUrl, setEditReceiptBakiUrl] = useState('');
    const [now, setNow] = useState(new Date());
    const [uploadingAdminReceipt, setUploadingAdminReceipt] = useState(null); // 'deposit'|'baki'|null
    const [adminReceiptFullView, setAdminReceiptFullView] = useState(null); // url string
    const modalContentRef = useRef(null);
    useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),30000); return ()=>clearInterval(t); },[]);
    useEffect(()=>{ if(expandedBooking) modalContentRef.current?.scrollTo(0,0); }, [expandedBooking]);

    const filtered = [...state.bookings].sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0)).filter(b=>{
      const matchStatus = filter==='all'||b.status===filter;
      const q = search.toLowerCase();
      const matchSearch = b.guest_name.toLowerCase().includes(q)||b.id.toLowerCase().includes(q)||(b.guest_phone||'').includes(q)||(b.guest_ic||'').includes(q)||(b.invoice_id||'').toLowerCase().includes(q);
      const matchMonth = !monthFilter || b.check_in.startsWith(monthFilter);
      return matchStatus && matchSearch && matchMonth;
    });

    const [editGuestEmail, setEditGuestEmail] = useState('');
    const openModal = (b) => { setExpandedBooking(b); setEditPayment(b.payment_received||0); setEditNotes(b.admin_notes||''); setEditReceiptUrl(b.receipt_url||''); setEditReceiptBakiUrl(b.receipt_baki_url||''); setEditGuestEmail(b.guest_email||''); };

    const exportCSV = () => {
      const rows = [
        ['Invoice','Nama','Telefon','IC','Check-in','Check-out','Malam','Tetamu','Jumlah','Deposit','Status','Tarikh Buat'],
        ...filtered.map(b=>[b.invoice_id,b.guest_name,b.guest_phone,b.guest_ic||'',b.check_in,b.check_out,b.total_nights,b.guests,b.total_price,b.payment_received||0,b.status,(b.created_at||'').split('T')[0]])
      ];
      const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`tempahan-deloka-${new Date().toISOString().split('T')[0]}.csv`; a.click();
      URL.revokeObjectURL(url);
    };

    const saveDetails = () => {
      dispatch({type:'UPDATE_BOOK_DETAIL',id:expandedBooking.id,payload:{payment_received:Number(editPayment),admin_notes:editNotes,receipt_url:editReceiptUrl,receipt_baki_url:editReceiptBakiUrl}});
      setToast({type:'success',message:'Maklumat dikemaskini.'});
      setExpandedBooking(null);
    };

    const statusBadge = (s) => ({
      hold:'bg-orange-100 text-orange-700',confirmed:'bg-emerald-100 text-emerald-700',
      cancelled:'bg-red-100 text-red-700',expired:'bg-gray-100 text-gray-500',pending:'bg-blue-100 text-blue-700'
    }[s]||'bg-gray-100 text-gray-600');

    return (
      <div className="animate-fade-in space-y-6 relative">
        <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-600"/> Senarai Tempahan</h2>
        <div className="bg-white p-4 rounded-[24px] border border-gray-100 app-shadow flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-[16px] border border-gray-100 w-full md:w-auto overflow-x-auto no-scrollbar">
            {[{k:'all',l:'Semua'},{k:'hold',l:'⏳ Hold'},{k:'pending',l:'Pending'},{k:'confirmed',l:'Sah'},{k:'cancelled',l:'Batal'},{k:'expired',l:'Tamat'}].map(f=>(
              <button key={f.k} onClick={()=>setFilter(f.k)} className={`px-4 py-2 text-xs font-bold rounded-[12px] transition-colors whitespace-nowrap ${filter===f.k?'bg-white text-gray-900 shadow-sm border border-gray-200':'text-gray-500 hover:text-gray-900'}`}>{f.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input type="month" value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-100 rounded-[12px] outline-none focus:border-emerald-400 text-gray-600 cursor-pointer"/>
            {monthFilter && <button onClick={()=>setMonthFilter('')} className="text-xs text-red-500 font-bold">× Kosongkan</button>}
            <button onClick={exportCSV} title="Export CSV" className="w-9 h-9 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-[12px] transition-colors shrink-0"><Download className="w-4 h-4"/></button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
            <input type="text" placeholder="Nama / ID / Telefon / IC..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 p-2.5 text-sm font-bold bg-gray-50 rounded-[12px] outline-none border border-gray-100 focus:border-emerald-500"/>
          </div>
        </div>

        <div className="grid gap-4">
          {filtered.map(b=>{
            const cd = b.status==='hold'?formatCountdown(b.hold_until):null;
            return (
              <div key={b.id} onClick={()=>openModal(b)} className="bg-white p-5 rounded-[24px] border border-gray-100 app-shadow flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors group">
                <div className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-white shrink-0 ${b.status==='hold'?'bg-orange-400':b.status==='confirmed'?'bg-emerald-500':b.status==='expired'?'bg-gray-400':'bg-red-400'}`}>{b.guest_name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{b.guest_name}</p>
                      {isReturningGuest(b.guest_phone, state.bookings, b.id) && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⭐ Tetamu Lama</span>}
                    </div>
                    <p className="text-xs font-bold text-emerald-600">{b.invoice_id}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{b.guest_phone} • {formatDate(b.check_in)} → {formatDate(b.check_out)} • {b.total_nights} mlm</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wider ${statusBadge(b.status)}`}>{b.status}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(b.total_price)}</span>
                      {cd && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-[6px] flex items-center gap-1"><Clock className="w-3 h-3"/> {cd}</span>}
                      {b.agreed_terms && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-[6px]">✓ Setuju Syarat</span>}
                      {b.guest_ic && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-[6px]">IC ✓</span>}
                      {b.payment_received > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-[6px] flex items-center gap-1"><CreditCard className="w-3 h-3"/> Deposit Diterima</span>}
                      {b.receipt_url && <span className={`text-[10px] font-bold text-purple-600 px-2 py-1 rounded-[6px] flex items-center gap-1 ${newReceiptNotif?.booking?.id===b.id&&newReceiptNotif?.type==='deposit'?'bg-purple-200 animate-pulse':'bg-purple-50'}`}>📎 Resit Deposit{newReceiptNotif?.booking?.id===b.id&&newReceiptNotif?.type==='deposit'&&<span className="text-[9px] font-black text-purple-700 bg-purple-300 px-1.5 rounded-full">BARU</span>}</span>}
                      {b.receipt_baki_url && <span className={`text-[10px] font-bold text-emerald-600 px-2 py-1 rounded-[6px] flex items-center gap-1 ${newReceiptNotif?.booking?.id===b.id&&newReceiptNotif?.type==='baki'?'bg-emerald-200 animate-pulse':'bg-emerald-50'}`}>📎 Resit Baki{newReceiptNotif?.booking?.id===b.id&&newReceiptNotif?.type==='baki'&&<span className="text-[9px] font-black text-emerald-700 bg-emerald-300 px-1.5 rounded-full">BARU</span>}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span title={b.status} className={`p-2 rounded-[12px] shrink-0 ${b.status==='confirmed'?'bg-emerald-50 text-emerald-600':b.status==='hold'?'bg-blue-50 text-blue-500':b.status==='cancelled'?'bg-red-50 text-red-400':'bg-gray-100 text-gray-400'}`}>
                    {b.status==='confirmed'?<CheckCircle className="w-4 h-4"/>:b.status==='hold'?<Clock className="w-4 h-4"/>:b.status==='cancelled'?<XCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}
                  </span>
                  <button
                    onClick={e=>{e.stopPropagation(); const url=`${window.location.origin}/?semak=${b.invoice_id}`; navigator.clipboard?.writeText(url).then(()=>setToast({type:'success',message:'Link disalin!'})).catch(()=>setToast({type:'error',message:'Gagal salin link'}));}}
                    className="p-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 text-gray-400 rounded-[12px] transition-colors shrink-0"
                    title="Salin Link"
                  ><Hash className="w-4 h-4"/></button>
                  <button
                    onClick={e=>{e.stopPropagation(); const semakUrl=`${window.location.origin}/?semak=${b.invoice_id}`; const msg=renderWATemplate(state.wa_templates?.to_guest,{nama:b.guest_name,inv:b.invoice_id,masuk:formatDate(b.check_in),keluar:formatDate(b.check_out),jumlah:formatCurrency(b.total_price),link:semakUrl}); window.open(`https://wa.me/60${b.guest_phone.replace(/^0+/,'')}?text=${encodeURIComponent(msg)}`, '_blank');}}
                    className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-[12px] transition-colors shrink-0"
                    title="WhatsApp"
                  ><Phone className="w-4 h-4"/></button>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 hidden md:block shrink-0"/>
                </div>
              </div>
            );
          })}
          {filtered.length===0 && <div className="bg-white py-12 rounded-[24px] border border-gray-100 text-center"><p className="text-gray-500 font-bold">Tiada rekod dijumpai.</p></div>}
        </div>

        {expandedBooking && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white md:bg-gray-900/60 md:backdrop-blur-sm md:items-center md:justify-center md:p-4 no-print" onClick={e=>{if(e.target===e.currentTarget)setExpandedBooking(null);}}>
            <div className="bg-white md:rounded-[32px] w-full md:max-w-2xl shadow-2xl flex flex-col flex-1 md:flex-none md:max-h-[90vh]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={()=>setExpandedBooking(null)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors md:hidden"><ArrowLeft className="w-5 h-5 text-gray-700"/></button>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{expandedBooking.guest_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-emerald-600 font-bold">{expandedBooking.invoice_id}</p>
                      <button onClick={()=>{const url=`${window.location.origin}/?semak=${expandedBooking.invoice_id}`;navigator.clipboard?.writeText(url).then(()=>setToast({type:'success',message:'Link disalin!'})).catch(()=>setToast({type:'error',message:'Gagal salin — cuba lagi'}));}}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-[8px] text-[10px] font-bold">🔗 Salin Link</button>
                    </div>
                  </div>
                </div>
                <button onClick={()=>setExpandedBooking(null)} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors hidden md:flex"><X className="w-5 h-5"/></button>
              </div>
              <div ref={modalContentRef} className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-[16px] border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pelanggan</p>
                    <p className="font-bold text-gray-900">{expandedBooking.guest_name}</p>
                    <p className="text-sm text-gray-600">{expandedBooking.guest_phone}</p>
                    {expandedBooking.guest_ic && <p className="text-xs text-blue-600 font-bold mt-1">IC: {expandedBooking.guest_ic}</p>}
                    {expandedBooking.guest_email
                      ? <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><Send className="w-2.5 h-2.5"/>{expandedBooking.guest_email}</p>
                      : <div className="mt-2">
                          <input type="email" value={editGuestEmail} onChange={e=>setEditGuestEmail(e.target.value)}
                            placeholder="Tambah emel pelanggan"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-[8px] text-xs outline-none focus:border-emerald-400"/>
                          {editGuestEmail && <button onClick={()=>{ dispatch({type:'UPDATE_BOOK_DETAIL',id:expandedBooking.id,payload:{guest_email:editGuestEmail}}); setExpandedBooking({...expandedBooking,guest_email:editGuestEmail}); }}
                            className="mt-1 w-full py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-[8px]">Simpan Emel</button>}
                        </div>
                    }
                  </div>
                  <div className="bg-gray-50 p-4 rounded-[16px] border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tarikh & Tetamu</p>
                    <p className="font-bold text-gray-900">{formatDate(expandedBooking.check_in)} → {formatDate(expandedBooking.check_out)}</p>
                    <p className="text-sm text-gray-600">{expandedBooking.total_nights} Malam • {expandedBooking.guests} Orang</p>
                  </div>
                </div>
                {expandedBooking.status==='hold' && formatCountdown(expandedBooking.hold_until) && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-[16px] flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-500 shrink-0"/>
                    <p className="text-sm font-bold text-orange-700">Menunggu deposit. Tamat dalam: <span className="text-orange-600">{formatCountdown(expandedBooking.hold_until)}</span></p>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-[16px]">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-3 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Persetujuan Pelanggan</p>
                  <div className="flex items-center gap-3">
                    {expandedBooking.agreed_terms
                      ? <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Pelanggan telah bersetuju dengan peraturan</span>
                      : <span className="text-sm font-bold text-orange-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Belum bersetuju peraturan</span>
                    }
                  </div>
                  {expandedBooking.guest_ic && <p className="text-xs text-gray-500 mt-1">No. IC: {expandedBooking.guest_ic}</p>}
                </div>
                <div className="p-5 bg-emerald-50/50 rounded-[16px] border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-3">Kewangan</p>
                  <div className="flex justify-between mb-2"><span className="text-sm font-bold text-gray-600">Jumlah</span><span className="font-bold text-gray-900">{formatCurrency(expandedBooking.total_price)}</span></div>
                  <div className="flex justify-between items-center border-t border-emerald-200/50 pt-2 mt-2">
                    <span className="text-sm font-bold text-emerald-800">Telah Dibayar (RM)</span>
                    <input type="number" value={editPayment} onChange={e=>setEditPayment(e.target.value)} className="w-28 p-2 bg-white border border-emerald-200 rounded-[10px] outline-none font-bold text-right focus:border-emerald-500 text-sm"/>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200/50 pt-2 mt-2">
                    <span className="text-sm font-bold text-red-600">Baki</span>
                    <span className="font-bold text-red-600">{formatCurrency(expandedBooking.total_price-(Number(editPayment)||0))}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Catatan Admin</p>
                  <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[16px] outline-none font-medium h-20 focus:border-emerald-500 text-sm resize-none"/>
                </div>
                {/* ── Resit side-by-side (Deposit + Baki) ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Deposit */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-[16px] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1"><Receipt className="w-3 h-3"/> Deposit</p>
                      {editReceiptUrl && <button onClick={()=>setAdminReceiptFullView(editReceiptUrl)} className="text-[9px] font-black text-blue-600 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded-full flex items-center gap-0.5 transition-colors"><Eye className="w-2.5 h-2.5"/> Full</button>}
                    </div>
                    {/* Image preview */}
                    {editReceiptUrl ? (
                      <div className="rounded-[10px] overflow-hidden border border-blue-200 aspect-[4/3] bg-white cursor-pointer" onClick={()=>setAdminReceiptFullView(editReceiptUrl)}>
                        <img src={editReceiptUrl} alt="Resit Deposit" className="w-full h-full object-cover hover:opacity-90 transition-opacity" onError={e=>{e.target.style.display='none';}}/>
                      </div>
                    ) : (
                      <div className="rounded-[10px] border-2 border-dashed border-blue-200 aspect-[4/3] flex flex-col items-center justify-center gap-1 text-blue-200 bg-white">
                        <ImageIcon className="w-5 h-5"/><span className="text-[9px] font-bold">Belum ada</span>
                      </div>
                    )}
                    <input type="url" placeholder="URL gambar / Google Drive..." value={editReceiptUrl} onChange={e=>setEditReceiptUrl(e.target.value)} className="w-full p-2 bg-white border border-blue-200 rounded-[8px] outline-none font-medium text-[10px] focus:border-blue-400"/>
                    {/* File upload */}
                    {uploadingAdminReceipt==='deposit' ? (
                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-blue-400 py-1">
                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"/>Menghantar...
                      </div>
                    ) : (
                      <label className="w-full cursor-pointer flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] text-[9px] font-black transition-colors">
                        <Upload className="w-3 h-3"/> Upload Fail
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={async e=>{
                          const file=e.target.files?.[0]; if(!file) return;
                          setUploadingAdminReceipt('deposit');
                          try {
                            const sRef = storageRef(storage, `receipts/admin_deposit_${expandedBooking.id}_${Date.now()}`);
                            await uploadBytes(sRef, file);
                            const url = await getDownloadURL(sRef);
                            setEditReceiptUrl(url);
                            setToast({type:'success',message:'Resit deposit diupload!'});
                          } catch { setToast({type:'error',message:'Gagal upload. Cuba lagi.'}); }
                          finally { setUploadingAdminReceipt(null); e.target.value=''; }
                        }}/>
                      </label>
                    )}
                  </div>

                  {/* Baki */}
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-[16px] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1"><Receipt className="w-3 h-3"/> Baki</p>
                      {editReceiptBakiUrl && <button onClick={()=>setAdminReceiptFullView(editReceiptBakiUrl)} className="text-[9px] font-black text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5 transition-colors"><Eye className="w-2.5 h-2.5"/> Full</button>}
                    </div>
                    {/* Image preview */}
                    {editReceiptBakiUrl ? (
                      <div className="rounded-[10px] overflow-hidden border border-emerald-200 aspect-[4/3] bg-white cursor-pointer" onClick={()=>setAdminReceiptFullView(editReceiptBakiUrl)}>
                        <img src={editReceiptBakiUrl} alt="Resit Baki" className="w-full h-full object-cover hover:opacity-90 transition-opacity" onError={e=>{e.target.style.display='none';}}/>
                      </div>
                    ) : (
                      <div className="rounded-[10px] border-2 border-dashed border-emerald-200 aspect-[4/3] flex flex-col items-center justify-center gap-1 text-emerald-200 bg-white">
                        <ImageIcon className="w-5 h-5"/><span className="text-[9px] font-bold">Belum ada</span>
                      </div>
                    )}
                    <input type="url" placeholder="URL gambar / Google Drive..." value={editReceiptBakiUrl} onChange={e=>setEditReceiptBakiUrl(e.target.value)} className="w-full p-2 bg-white border border-emerald-200 rounded-[8px] outline-none font-medium text-[10px] focus:border-emerald-400"/>
                    {/* File upload */}
                    {uploadingAdminReceipt==='baki' ? (
                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-emerald-400 py-1">
                        <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"/>Menghantar...
                      </div>
                    ) : (
                      <label className="w-full cursor-pointer flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] text-[9px] font-black transition-colors">
                        <Upload className="w-3 h-3"/> Upload Fail
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={async e=>{
                          const file=e.target.files?.[0]; if(!file) return;
                          setUploadingAdminReceipt('baki');
                          try {
                            const sRef = storageRef(storage, `receipts/admin_baki_${expandedBooking.id}_${Date.now()}`);
                            await uploadBytes(sRef, file);
                            const url = await getDownloadURL(sRef);
                            setEditReceiptBakiUrl(url);
                            setToast({type:'success',message:'Resit baki diupload!'});
                          } catch { setToast({type:'error',message:'Gagal upload. Cuba lagi.'}); }
                          finally { setUploadingAdminReceipt(null); e.target.value=''; }
                        }}/>
                      </label>
                    )}
                  </div>
                </div>

                {/* Admin receipt full-view lightbox */}
                {adminReceiptFullView && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={()=>setAdminReceiptFullView(null)}>
                    <button onClick={()=>setAdminReceiptFullView(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"><X className="w-5 h-5 text-white"/></button>
                    <img src={adminReceiptFullView} alt="Resit" className="max-w-[92vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl" onClick={e=>e.stopPropagation()}/>
                  </div>
                )}
              </div>
              {confirmAction && (
                <div className="shrink-0 mx-4 mb-0 mt-0">
                  <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-amber-800">{confirmAction.label}</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={()=>setConfirmAction(null)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-[10px] text-xs font-bold">Batal</button>
                      <button onClick={()=>{confirmAction.fn();setConfirmAction(null);}} className={`px-3 py-1.5 text-white rounded-[10px] text-xs font-bold ${confirmAction.danger?'bg-red-500 hover:bg-red-600':'bg-emerald-500 hover:bg-emerald-600'}`}>Ya, Teruskan</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2 shrink-0">
                <div className="flex gap-2">
                  {expandedBooking.status!=='confirmed' && (
                    <button onClick={()=>setConfirmAction({label:`Sahkan tempahan ${expandedBooking.invoice_id}?`,fn:()=>{dispatch({type:'UPDATE_BOOK',id:expandedBooking.id,val:'confirmed'});setExpandedBooking({...expandedBooking,status:'confirmed'});setToast({type:'success',message:'Tempahan disahkan!'});}})}
                      className="w-11 h-11 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-[14px] transition-colors" title="Sahkan"><CheckCircle className="w-5 h-5"/></button>
                  )}
                  {(expandedBooking.status!=='cancelled'&&expandedBooking.status!=='expired') && (
                    <button onClick={()=>setConfirmAction({label:`Batalkan tempahan ${expandedBooking.invoice_id}?`,danger:true,fn:()=>{dispatch({type:'UPDATE_BOOK',id:expandedBooking.id,val:'cancelled'});setExpandedBooking({...expandedBooking,status:'cancelled'});setToast({type:'success',message:'Tempahan dibatalkan.'});}})}
                      className="w-11 h-11 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-[14px] transition-colors" title="Batal"><XCircle className="w-5 h-5"/></button>
                  )}
                  {(expandedBooking.status==='cancelled'||expandedBooking.status==='expired') && (
                    <button onClick={()=>setConfirmAction({label:`Pulihkan tempahan ${expandedBooking.invoice_id}?`,fn:()=>{dispatch({type:'UPDATE_BOOK',id:expandedBooking.id,val:'confirmed'});setExpandedBooking({...expandedBooking,status:'confirmed'});setToast({type:'success',message:'Tempahan dipulihkan!'});}})}
                      className="w-11 h-11 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-[14px] transition-colors" title="Pulihkan"><ArrowLeft className="w-5 h-5"/></button>
                  )}
                  {(expandedBooking.status==='cancelled'||expandedBooking.status==='expired') && (
                    <button onClick={()=>setConfirmAction({label:`Padam kekal ${expandedBooking.invoice_id}? Tidak boleh dipulihkan.`,danger:true,fn:()=>{dispatch({type:'DEL_BOOK',id:expandedBooking.id});setExpandedBooking(null);setToast({type:'success',message:'Tempahan dipadam.'});}})}
                      className="w-11 h-11 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-[14px] transition-colors" title="Padam"><Trash2 className="w-5 h-5"/></button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{const semakUrl=`${window.location.origin}/?semak=${expandedBooking.invoice_id}`; const msg=renderWATemplate(state.wa_templates?.to_guest,{nama:expandedBooking.guest_name,inv:expandedBooking.invoice_id,masuk:formatDate(expandedBooking.check_in),keluar:formatDate(expandedBooking.check_out),jumlah:formatCurrency(expandedBooking.total_price),link:semakUrl}); window.open(`https://wa.me/60${expandedBooking.guest_phone.replace(/^0+/,'')}?text=${encodeURIComponent(msg)}`,'_blank');}}
                    className="w-11 h-11 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded-[14px] transition-colors" title="WhatsApp Umum"><Phone className="w-5 h-5"/></button>
                  {expandedBooking.status==='confirmed' && (
                    <button onClick={()=>{const msg=renderWATemplate(state.wa_templates?.check_in_reminder,{nama:expandedBooking.guest_name,inv:expandedBooking.invoice_id,masuk:formatDate(expandedBooking.check_in),keluar:formatDate(expandedBooking.check_out),masa_masuk:state.homepage.check_in_time||'3:00 PM',alamat:state.homepage.address||''}); window.open(`https://wa.me/60${expandedBooking.guest_phone.replace(/^0+/,'')}?text=${encodeURIComponent(msg)}`,'_blank');}}
                      className="w-11 h-11 flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-[14px] transition-colors" title="Peringatan Check-in"><Bell className="w-5 h-5"/></button>
                  )}
                  <button onClick={()=>window.print()} className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-[14px] transition-colors" title="Cetak"><Printer className="w-5 h-5"/></button>
                  <button onClick={saveDetails} className="px-5 h-11 bg-gray-900 hover:bg-black text-white rounded-[14px] text-sm font-bold transition-colors">Simpan</button>
                  <button onClick={()=>setExpandedBooking(null)} className="px-5 h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-[14px] text-sm font-bold transition-colors flex items-center gap-1.5"><X className="w-4 h-4"/> Tutup</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedBooking && (() => {
          const paid = Number(editPayment)||0;
          const balance = expandedBooking.total_price - paid;
          const statusColor = {confirmed:'#16a34a',hold:'#d97706',cancelled:'#dc2626',expired:'#6b7280'}[expandedBooking.status]||'#374151';
          return (
            <div id="printable-receipt" className="hidden">
              <div style={{maxWidth:'680px',margin:'0 auto',fontFamily:"'Segoe UI',Arial,sans-serif",color:'#1a1a1a',background:'#fff',padding:'0'}}>
                {/* Header strip */}
                <div style={{background:'linear-gradient(135deg,#7c3d0c 0%,#c4760a 50%,#e8a020 100%)',padding:'32px 40px 24px',borderRadius:'0 0 0 0'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontFamily:'Georgia,serif',fontSize:'32px',fontWeight:'700',color:'#fff',letterSpacing:'0.5px',marginBottom:'4px'}}>{state.homepage.homestay_name}</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.8)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'2px'}}>Konsep Moden Bali</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.7)'}}>{state.homepage.address}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'4px'}}>No. Resit</div>
                      <div style={{fontSize:'18px',fontWeight:'800',color:'#fff',letterSpacing:'1px'}}>{expandedBooking.invoice_id}</div>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)',marginTop:'4px'}}>{expandedBooking.created_at ? formatDate(expandedBooking.created_at) : ''}</div>
                    </div>
                  </div>
                </div>
                {/* Status badge */}
                <div style={{background:'#fafaf8',padding:'10px 40px',borderBottom:'1px solid #f0ebe3',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:statusColor}}/>
                  <span style={{fontSize:'11px',fontWeight:'700',color:statusColor,textTransform:'uppercase',letterSpacing:'1px'}}>{expandedBooking.status}</span>
                  {expandedBooking.agreed_terms && <span style={{marginLeft:'8px',fontSize:'10px',color:'#16a34a',fontWeight:'600'}}>✓ Bersetuju Peraturan</span>}
                </div>
                {/* Guest + Dates */}
                <div style={{padding:'28px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',borderBottom:'1px solid #f0ebe3'}}>
                  <div>
                    <div style={{fontSize:'9px',fontWeight:'700',color:'#a78b6a',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'8px'}}>Maklumat Tetamu</div>
                    <div style={{fontSize:'18px',fontWeight:'800',color:'#1a1a1a',marginBottom:'4px'}}>{expandedBooking.guest_name}</div>
                    <div style={{fontSize:'13px',color:'#555',marginBottom:'2px'}}>{expandedBooking.guest_phone}</div>
                    {expandedBooking.guest_ic && <div style={{fontSize:'12px',color:'#777'}}>No. IC: {expandedBooking.guest_ic}</div>}
                  </div>
                  <div>
                    <div style={{fontSize:'9px',fontWeight:'700',color:'#a78b6a',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'8px'}}>Tarikh Penginapan</div>
                    <div style={{fontSize:'13px',fontWeight:'700',color:'#1a1a1a',marginBottom:'4px'}}>Check-in:&nbsp;&nbsp;{formatDate(expandedBooking.check_in)} <span style={{color:'#888',fontWeight:'400'}}>selepas {state.homepage.check_in_time||'3:00 PM'}</span></div>
                    <div style={{fontSize:'13px',fontWeight:'700',color:'#1a1a1a',marginBottom:'8px'}}>Check-out: {formatDate(expandedBooking.check_out)} <span style={{color:'#888',fontWeight:'400'}}>sebelum {state.homepage.check_out_time||'12:00 PM'}</span></div>
                    <div style={{display:'inline-flex',gap:'12px'}}>
                      <span style={{background:'#fef3c7',color:'#92400e',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{expandedBooking.total_nights} Malam</span>
                      <span style={{background:'#dbeafe',color:'#1e40af',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{expandedBooking.guests} Tetamu</span>
                    </div>
                  </div>
                </div>
                {/* Price breakdown */}
                {expandedBooking.price_breakdown?.length > 0 && (
                  <div style={{padding:'20px 40px',borderBottom:'1px solid #f0ebe3'}}>
                    <div style={{fontSize:'9px',fontWeight:'700',color:'#a78b6a',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'12px'}}>Pecahan Harga</div>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                      <thead><tr style={{borderBottom:'1px solid #e8e0d5'}}><th style={{padding:'6px 0',textAlign:'left',color:'#666',fontWeight:'600'}}>Tarikh</th><th style={{padding:'6px 0',textAlign:'left',color:'#666',fontWeight:'600'}}>Jenis</th><th style={{padding:'6px 0',textAlign:'right',color:'#666',fontWeight:'600'}}>Harga</th></tr></thead>
                      <tbody>{expandedBooking.price_breakdown.map((r,i)=>(
                        <tr key={i} style={{borderBottom:'1px solid #f5f0ea'}}><td style={{padding:'5px 0',color:'#444'}}>{formatDate(r.date)}</td><td style={{padding:'5px 0',color:'#666'}}>{r.type}</td><td style={{padding:'5px 0',textAlign:'right',fontWeight:'600',color:'#1a1a1a'}}>RM {parseFloat(r.price).toFixed(2)}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
                {/* Payment summary */}
                <div style={{padding:'24px 40px',borderBottom:'1px solid #f0ebe3'}}>
                  <div style={{maxWidth:'300px',marginLeft:'auto'}}>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',fontSize:'13px',color:'#555',borderBottom:'1px solid #f0ebe3'}}>
                      <span>Subtotal</span><span style={{fontWeight:'600',color:'#1a1a1a'}}>RM {parseFloat(expandedBooking.total_price).toFixed(2)}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',fontSize:'13px',color:'#555',borderBottom:'1px solid #f0ebe3'}}>
                      <span>Telah Dibayar</span><span style={{fontWeight:'700',color:'#16a34a'}}>RM {paid.toFixed(2)}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontSize:'17px',fontWeight:'800'}}>
                      <span style={{color: balance<=0?'#16a34a':'#dc2626'}}>{balance<=0?'✓ PENUH DIBAYAR':'BAKI'}</span>
                      <span style={{color: balance<=0?'#16a34a':'#dc2626'}}>RM {Math.abs(balance).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {/* Bank info */}
                {(state.homepage.bank_name||state.homepage.bank_account) && (
                  <div style={{padding:'20px 40px',background:'#fafaf8',borderBottom:'1px solid #f0ebe3'}}>
                    <div style={{fontSize:'9px',fontWeight:'700',color:'#a78b6a',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'10px'}}>Maklumat Pembayaran</div>
                    <div style={{display:'flex',gap:'24px',flexWrap:'wrap',fontSize:'12px',color:'#444'}}>
                      {state.homepage.bank_name && <div><span style={{color:'#888'}}>Bank: </span><strong>{state.homepage.bank_name}</strong></div>}
                      {state.homepage.bank_holder && <div><span style={{color:'#888'}}>Pemegang: </span><strong>{state.homepage.bank_holder}</strong></div>}
                      {state.homepage.bank_account && <div><span style={{color:'#888'}}>No. Akaun: </span><strong style={{letterSpacing:'1px'}}>{state.homepage.bank_account}</strong></div>}
                    </div>
                  </div>
                )}
                {/* Footer */}
                <div style={{padding:'20px 40px',textAlign:'center',fontSize:'11px',color:'#aaa'}}>
                  <div style={{height:'3px',background:'linear-gradient(90deg,transparent,#c4760a,transparent)',marginBottom:'16px',borderRadius:'2px'}}/>
                  Terima kasih kerana memilih <strong style={{color:'#7c3d0c'}}>{state.homepage.homestay_name}</strong>. Selamat berehat! 🏡
                  {state.homepage.whatsapp_number && <div style={{marginTop:'6px'}}>Pertanyaan: +{state.homepage.whatsapp_number}</div>}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const AdminSpecialDates = () => {
    const [form, setForm] = useState({start:'',end:'',type:'public_holiday',price:0,status:'available',note:''});
    return (
      <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-emerald-600"/> Tarikh Khas & Penutupan</h2>
        <form onSubmit={e=>{e.preventDefault();dispatch({type:'ADD_SPECIAL',payload:{...form,id:Date.now()}});setToast({type:'success',message:'Tarikh Ditambah'});setForm({start:'',end:'',type:'public_holiday',price:0,status:'available',note:''}); }} className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-wrap gap-4 items-end app-shadow">
          <div className="flex-1 min-w-[140px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Mula</label><input type="date" required value={form.start} onChange={e=>setForm({...form,start:e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"/></div>
          <div className="flex-1 min-w-[140px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tamat</label><input type="date" required min={form.start} value={form.end} onChange={e=>setForm({...form,end:e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"/></div>
          <div className="flex-1 min-w-[140px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Jenis</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 cursor-pointer"><option value="public_holiday">Cuti Umum</option><option value="school_holiday">Cuti Sekolah</option><option value="peak_season">Peak Season</option><option value="custom_price">Custom Price</option></select></div>
          <div className="flex-1 min-w-[110px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 cursor-pointer"><option value="available">Boleh Tempah</option><option value="blocked">Tutup (Block)</option></select></div>
          {form.status!=='blocked' && <div className="flex-1 min-w-[100px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Harga (RM)</label><input type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"/></div>}
          <div className="flex-1 min-w-[200px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nota</label><input type="text" placeholder="Nota..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"/></div>
          <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-[14px] font-bold flex items-center justify-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Tambah</button>
        </form>
        <div className="space-y-3">
          {state.special_dates.map(sd=>(
            <div key={sd.id} className={`bg-white p-5 rounded-[24px] flex flex-col md:flex-row justify-between md:items-center border app-shadow ${sd.status==='blocked'?'border-red-200':'border-gray-100'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] uppercase text-white ${sd.status==='blocked'?'bg-red-500':'bg-emerald-500'}`}>{sd.status==='blocked'?'Tutup':'Boleh Tempah'}</span>
                  <p className="font-bold text-gray-900">{formatDate(sd.start)} hingga {formatDate(sd.end)}</p>
                </div>
                <p className="text-sm font-bold text-gray-500">{sd.type.replace(/_/g,' ').toUpperCase()}{sd.status!=='blocked'&&<span className="text-emerald-600 ml-2">• RM{sd.price}</span>}</p>
                {sd.note&&<p className="text-xs text-gray-400 mt-1">Nota: {sd.note}</p>}
              </div>
              <button onClick={()=>{dispatch({type:'DEL_SPECIAL',id:sd.id});setToast({type:'success',message:'Dibuang'});}} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-[14px] mt-3 md:mt-0 self-start md:self-auto"><Trash2 className="w-5 h-5"/></button>
            </div>
          ))}
          {state.special_dates.length===0&&<p className="text-center text-gray-500 py-10 font-bold">Tiada tarikh khas.</p>}
        </div>
      </div>
    );
  };

  const AdminGallery = () => {
    const [newImg, setNewImg] = useState('');
    const [dragIdx, setDragIdx] = useState(null);
    const [dragOver, setDragOver] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleDrop = (dropI) => {
      if (dragIdx === null || dragIdx === dropI) { setDragIdx(null); setDragOver(null); return; }
      const arr = [...state.gallery];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(dropI, 0, moved);
      dispatch({type:'REORDER_GALLERY', gallery: arr});
      setDragIdx(null); setDragOver(null);
    };

    const handleFileUpload = async (files) => {
      if (!files?.length) return;
      setUploading(true);
      for (const file of Array.from(files)) {
        try {
          const sRef = storageRef(storage, `gallery/${Date.now()}_${file.name}`);
          await uploadBytes(sRef, file);
          const url = await getDownloadURL(sRef);
          dispatch({type:'ADD_GALLERY_IMAGE', payload: url});
        } catch { setToast({type:'error', message:'Gagal upload gambar.'}); }
      }
      setUploading(false);
      setToast({type:'success', message:'Gambar berjaya ditambah.'});
    };

    return (
      <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6 text-emerald-600"/> Urus Galeri</h2>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[20px] text-sm text-emerald-800">Gambar pertama = Hero Image. <strong>Drag & drop</strong> untuk susun semula. Boleh upload terus dari galeri atau ambil gambar.</div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 app-shadow space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]"><label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">URL Gambar</label><input type="url" placeholder="https://images.unsplash.com/..." value={newImg} onChange={e=>setNewImg(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
            <button onClick={()=>{if(!newImg)return;dispatch({type:'ADD_GALLERY_IMAGE',payload:newImg});setNewImg('');setToast({type:'success',message:'Gambar ditambah.'});}} className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-[14px] font-bold flex items-center gap-2 shadow-md"><Plus className="w-5 h-5"/> Tambah URL</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs font-bold text-gray-400">ATAU</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>
          <label className={`flex items-center justify-center gap-3 w-full py-4 rounded-[14px] border-2 border-dashed border-emerald-200 bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors ${uploading?'opacity-50':''}`}>
            {uploading ? <><div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/> <span className="text-sm font-bold text-emerald-700">Menghantar...</span></> : <><Camera className="w-5 h-5 text-emerald-600"/> <span className="text-sm font-bold text-emerald-700">Upload dari Galeri / Snap Gambar</span></>}
            <input type="file" accept="image/*" multiple capture className="hidden" disabled={uploading} onChange={e=>handleFileUpload(e.target.files)}/>
          </label>
        </div>
        <p className="text-xs font-bold text-gray-400 text-center">Tahan dan seret gambar untuk susun semula ↕</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {state.gallery.map((img,i)=>(
            <div key={img+i}
              draggable
              onDragStart={()=>setDragIdx(i)}
              onDragOver={e=>{e.preventDefault();setDragOver(i);}}
              onDragLeave={()=>setDragOver(null)}
              onDrop={()=>handleDrop(i)}
              onTouchStart={()=>setDragIdx(i)}
              className={`relative group rounded-[20px] overflow-hidden aspect-video bg-gray-100 border-2 app-shadow cursor-grab active:cursor-grabbing transition-all ${dragOver===i?'border-emerald-400 scale-105':'border-gray-200'} ${dragIdx===i?'opacity-40':''}`}>
              <img src={img} className="w-full h-full object-cover pointer-events-none" alt={`Gallery ${i+1}`}/>
              <button onClick={()=>{dispatch({type:'DEL_GALLERY_IMAGE',index:i});setToast({type:'success',message:'Dibuang'});}} className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 className="w-4 h-4"/></button>
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 text-white text-[10px] font-bold uppercase rounded-[8px]">{i===0?'Hero':`#${i+1}`}</div>
            </div>
          ))}
          {state.gallery.length===0&&<div className="col-span-full py-12 text-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-[32px]">Tiada gambar.</div>}
        </div>
      </div>
    );
  };

  const AdminFormConfig = ({ title, data, actionType, icon: Icon, desc, formRef }) => {
    const [form, setFormState] = useState(() => (formRef?.current) || data);
    const setForm = v => { if (formRef) formRef.current = v; setFormState(v); };
    return (
      <div className="animate-fade-in space-y-6 max-w-4xl">
        <h2 className="text-2xl font-bold flex items-center gap-2">{Icon&&<Icon className="w-6 h-6 text-emerald-600"/>} {title}</h2>
        {desc&&<div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[20px] text-sm text-emerald-800">{desc}</div>}
        <form onSubmit={e=>{e.preventDefault();dispatch({type:actionType,payload:form});setToast({type:'success',message:'Berjaya disimpan.'});}} className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 app-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {Object.keys(form).map(key=>(
              <div key={key} className={key.includes('description')?'md:col-span-2':''}>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{key.replace(/_/g,' ')}</label>
                {typeof form[key]==='number'?<input type="number" value={form[key]} onChange={e=>setForm({...form,[key]:Number(e.target.value)})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold focus:border-emerald-500 text-gray-900" required/>
                :key.includes('description')?<textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[20px] outline-none font-medium h-32 focus:border-emerald-500 text-gray-900 resize-none" required/>
                :<input type={key.includes('time')?'time':'text'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold focus:border-emerald-500 text-gray-900" required={!key.includes('_url')}/>}
              </div>
            ))}
          </div>
          <button type="submit" className="w-full md:w-auto md:px-12 bg-gray-900 text-white font-bold py-4 rounded-[14px] hover:bg-black transition-colors shadow-md">Simpan Tetapan</button>
        </form>
      </div>
    );
  };

  const AdminUsers = () => {
    const [un,setUn]=useState('');const [pw,setPw]=useState('');const [role,setRole]=useState('Admin');
    return (
      <div className="animate-fade-in space-y-6 max-w-3xl">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-600"/> Pengurusan Admin</h2>
        <form onSubmit={e=>{e.preventDefault();if(un&&pw){dispatch({type:'ADD_ADMIN',payload:{id:Date.now(),username:un,password:pw,role}});setUn('');setPw('');setToast({type:'success',message:'Admin ditambah.'});}}} className="bg-white p-6 rounded-[32px] border border-gray-100 app-shadow flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[140px]"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">ID</label><input type="text" required value={un} onChange={e=>setUn(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"/></div>
          <div className="flex-1 min-w-[140px]"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">Kata Laluan</label><input type="text" required value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"/></div>
          <div className="flex-1 min-w-[120px]"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">Peranan</label><select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900"><option value="Superadmin">Superadmin</option><option value="Admin">Admin Biasa</option></select></div>
          <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 h-[48px] rounded-[14px] font-bold flex items-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Tambah</button>
        </form>
        <div className="bg-white rounded-[32px] border border-gray-100 app-shadow overflow-hidden">
          {state.admins.map(a=>(
            <div key={a.id} className="p-5 border-b border-gray-50 flex justify-between items-center last:border-0">
              <div><p className="font-bold text-gray-900">{a.username}</p><p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">{a.role}</p></div>
              {a.username!=='admin'&&<button onClick={()=>{dispatch({type:'DEL_ADMIN',id:a.id});setToast({type:'success',message:'Dibuang'});}} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-[12px]"><Trash2 className="w-4 h-4"/></button>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AdminHomepage = () => {
    const [hpTab, setHpTab] = useState('info');
    const [form, setFormState] = useState(() => hpFormRef.current || state.homepage);
    const setForm = v => { hpFormRef.current = v; setFormState(v); };
    const [rTitle, setRTitle] = useState(''); const [rDesc, setRDesc] = useState('');
    const [fName, setFName] = useState(''); const [fIcon, setFIcon] = useState('CheckCircle');
    const [editRuleId, setEditRuleId] = useState(null);
    const [editRuleTitle, setEditRuleTitle] = useState('');
    const [editRuleDesc, setEditRuleDesc] = useState('');
    const [editFacilityId, setEditFacilityId] = useState(null);
    const [editFacilityName, setEditFacilityName] = useState('');
    const [editFacilityIcon, setEditFacilityIcon] = useState('CheckCircle');
    const iconOptions = ['Wifi','Wind','Car','Utensils','Tv','CheckCircle','Users','Moon','MapPin','ShieldCheck','Home','Sparkles','Camera','CreditCard'];

    const hpFields = {
      info: ['homestay_name','tagline','short_description','whatsapp_number','address','check_in_time','check_out_time','maps_url','waze_url','facebook_url','instagram_url'],
      bank: ['bank_name','bank_account','bank_holder','bank_qr'],
      branding: ['logo_url'],
      kunci: ['key_door_pin','key_wifi_name','key_wifi_pw','key_note'],
    };

    return (
      <div className="animate-fade-in space-y-5 max-w-3xl">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Home className="w-6 h-6 text-emerald-600"/> Laman Utama</h2>
        <div className="flex gap-2 flex-wrap">
          {[{id:'info',label:'Maklumat'},{id:'bank',label:'Akaun Bank'},{id:'kunci',label:'🔑 Akses & Kunci'},{id:'branding',label:'Branding'},{id:'rules',label:'Peraturan'},{id:'facilities',label:'Kemudahan'}].map(t=>(
            <button key={t.id} onClick={()=>setHpTab(t.id)} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${hpTab===t.id?'bg-gray-900 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label}</button>
          ))}
        </div>

        {(hpTab==='info'||hpTab==='bank'||hpTab==='branding'||hpTab==='kunci') && (
          <form onSubmit={e=>{e.preventDefault();dispatch({type:'UPDATE_HOMEPAGE',payload:form});setToast({type:'success',message:'Berjaya disimpan.'});}} className="bg-white p-6 rounded-[32px] border border-gray-100 app-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {(hpFields[hpTab]||[]).map(key=>{
                const labelMap = { key_door_pin:'PIN Pintu / Lockbox', key_wifi_name:'Nama WiFi (SSID)', key_wifi_pw:'Kata Laluan WiFi', key_note:'Nota Akses (arahan tambahan)' };
                const isWide = key.includes('description')||key.includes('url')||key==='key_note';
                const isTextarea = key.includes('description')||key==='key_note';
                return (
                  <div key={key} className={isWide?'md:col-span-2':''}>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{labelMap[key]||key.replace(/_/g,' ')}</label>
                    {isTextarea
                      ? <textarea value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-medium focus:border-emerald-500 text-gray-900 resize-none"/>
                      : <input type={key.includes('time')?'time':'text'} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold focus:border-emerald-500 text-gray-900" required={['homestay_name','whatsapp_number'].includes(key)}/>
                    }
                    {key==='bank_qr' && form[key] && <img src={form[key]} alt="QR Preview" className="mt-2 h-28 rounded-[12px] border border-gray-200 object-contain bg-gray-50"/>}
                    {key==='logo_url' && form[key] && <img src={form[key]} alt="Logo Preview" className="mt-2 h-16 rounded-[12px] border border-gray-200 object-contain bg-gray-50"/>}
                  </div>
                );
              })}
            </div>
            <button type="submit" className="w-full md:w-auto md:px-12 bg-gray-900 text-white font-bold py-4 rounded-[14px] hover:bg-black transition-colors shadow-md">Simpan</button>
          </form>
        )}

        {hpTab==='rules' && (
          <div className="space-y-4">
            <form onSubmit={e=>{e.preventDefault();if(!rTitle.trim())return;dispatch({type:'ADD_RULE',payload:{id:Date.now(),title:rTitle.trim(),desc:rDesc.trim()}});setRTitle('');setRDesc('');setToast({type:'success',message:'Peraturan ditambah.'});}}
              className="bg-white p-5 rounded-[24px] border border-gray-100 app-shadow flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tajuk</label><input required value={rTitle} onChange={e=>setRTitle(e.target.value)} placeholder="Cth: Waktu Daftar" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <div className="flex-1 min-w-[220px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Keterangan</label><input value={rDesc} onChange={e=>setRDesc(e.target.value)} placeholder="Huraikan peraturan..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-[12px] font-bold text-sm flex items-center gap-2 shadow-sm"><Plus className="w-4 h-4"/> Tambah</button>
            </form>
            <div className="bg-white rounded-[24px] border border-gray-100 app-shadow overflow-hidden">
              {(state.rules||[]).length===0 && <p className="py-10 text-center text-gray-400 font-bold text-sm">Tiada peraturan.</p>}
              {(state.rules||[]).map((r,i)=>(
                <div key={r.id} className="border-b border-gray-50 last:border-0">
                  {editRuleId===r.id ? (
                    <div className="p-4 space-y-2 bg-emerald-50 border-l-4 border-emerald-500">
                      <input value={editRuleTitle} onChange={e=>setEditRuleTitle(e.target.value)} placeholder="Tajuk peraturan" className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] outline-none font-bold text-sm focus:border-emerald-500 text-gray-900"/>
                      <input value={editRuleDesc} onChange={e=>setEditRuleDesc(e.target.value)} placeholder="Keterangan peraturan" className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] outline-none font-medium text-sm focus:border-emerald-500 text-gray-900"/>
                      <div className="flex gap-2">
                        <button onClick={()=>{ dispatch({type:'UPDATE_RULE',id:r.id,payload:{title:editRuleTitle,desc:editRuleDesc}}); setEditRuleId(null); setToast({type:'success',message:'Dikemaskini.'}); }} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-[10px]">Simpan</button>
                        <button onClick={()=>setEditRuleId(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-[10px]">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="flex gap-3 items-start">
                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">{i+1}</span>
                        <div><p className="font-bold text-sm text-gray-900">{r.title}</p><p className="text-xs text-gray-500 mt-0.5">{r.desc}</p></div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={()=>{ setEditRuleId(r.id); setEditRuleTitle(r.title); setEditRuleDesc(r.desc||''); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-[10px] text-gray-500"><FileEdit className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>{dispatch({type:'DEL_RULE',id:r.id});setToast({type:'success',message:'Dibuang.'});}} className="p-2 bg-red-50 hover:bg-red-100 rounded-[10px] text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hpTab==='facilities' && (
          <div className="space-y-4">
            <form onSubmit={e=>{e.preventDefault();if(!fName.trim())return;dispatch({type:'ADD_FACILITY',payload:{id:Date.now(),name:fName.trim(),icon:fIcon}});setFName('');setFIcon('CheckCircle');setToast({type:'success',message:'Kemudahan ditambah.'});}}
              className="bg-white p-5 rounded-[24px] border border-gray-100 app-shadow flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[160px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nama Kemudahan</label><input required value={fName} onChange={e=>setFName(e.target.value)} placeholder="Cth: Kolam Renang" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <div className="min-w-[140px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Ikon</label>
                <select value={fIcon} onChange={e=>setFIcon(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none font-bold text-gray-900 focus:border-emerald-500">
                  {iconOptions.map(ic=><option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-[12px] font-bold text-sm flex items-center gap-2 shadow-sm"><Plus className="w-4 h-4"/> Tambah</button>
            </form>
            <div className="bg-white rounded-[24px] border border-gray-100 app-shadow overflow-hidden">
              {(state.facilities||[]).length===0 && <p className="py-10 text-center text-gray-400 font-bold text-sm">Tiada kemudahan.</p>}
              {(state.facilities||[]).map(f=>{
                const IconC = IconMap[f.icon]||CheckCircle;
                return (
                  <div key={f.id} className="border-b border-gray-50 last:border-0">
                    {editFacilityId===f.id ? (
                      <div className="p-4 space-y-2 bg-blue-50 border-l-4 border-blue-400">
                        <input value={editFacilityName} onChange={e=>setEditFacilityName(e.target.value)} placeholder="Nama kemudahan" className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] outline-none font-bold text-sm focus:border-blue-400 text-gray-900"/>
                        <select value={editFacilityIcon} onChange={e=>setEditFacilityIcon(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-[10px] outline-none font-bold text-sm focus:border-blue-400 text-gray-900">
                          {iconOptions.map(ic=><option key={ic} value={ic}>{ic}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={()=>{ dispatch({type:'UPDATE_FACILITY',id:f.id,payload:{name:editFacilityName,icon:editFacilityIcon}}); setEditFacilityId(null); setToast({type:'success',message:'Dikemaskini.'}); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-[10px]">Simpan</button>
                          <button onClick={()=>setEditFacilityId(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-[10px]">Batal</button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-[12px] flex items-center justify-center shrink-0"><IconC className="w-4 h-4 text-gray-600"/></div>
                          <p className="font-bold text-sm text-gray-900">{f.name}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={()=>{ setEditFacilityId(f.id); setEditFacilityName(f.name); setEditFacilityIcon(f.icon||'CheckCircle'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-[10px] text-gray-500"><FileEdit className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>{dispatch({type:'DEL_FACILITY',id:f.id});setToast({type:'success',message:'Dibuang.'});}} className="p-2 bg-red-50 hover:bg-red-100 rounded-[10px] text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const AdminWATemplates = () => {
    // Use ref-backed state so form data survives component remounts
    const [form, setFormState] = useState(() => waFormRef.current || state.wa_templates || {});
    const setForm = v => { waFormRef.current = v; setFormState(v); };

    const TEMPLATES = [
      { key:'new_booking', label:'Tempahan Baru → Admin', rows:6, vars:'{homestay_name} {nama} {telefon} {inv} {masuk} {keluar} {malam} {tetamu} {jumlah} {deposit}' },
      { key:'to_guest', label:'Admin → Tetamu (Pengesahan)', rows:5, vars:'{nama} {inv} {masuk} {keluar} {jumlah} {link}' },
      { key:'deposit_confirmed', label:'Deposit Diterima → Tetamu', rows:5, vars:'{nama} {inv} {masuk} {keluar} {jumlah}' },
      { key:'check_in_reminder', label:'Peringatan Check-In → Tetamu', rows:5, vars:'{nama} {inv} {masuk} {masa_masuk} {alamat}' },
      { key:'check_out_reminder', label:'Peringatan Check-Out → Tetamu', rows:4, vars:'{nama} {inv} {keluar} {masa_keluar}' },
      { key:'booking_cancelled', label:'Pembatalan Tempahan → Tetamu', rows:4, vars:'{nama} {inv} {masuk} {keluar}' },
      { key:'payment_reminder', label:'Peringatan Bayaran Deposit → Tetamu', rows:4, vars:'{nama} {inv} {deposit} {bank} {akaun} {pemegang}' },
      { key:'review_request', label:'Minta Ulasan → Tetamu (Selepas Checkout)', rows:4, vars:'{nama} {inv}' },
    ];

    const defaults = {
      new_booking: '*Tempahan {homestay_name}*\n\nNama: {nama}\nNo. Tel: {telefon}\nTempahan: {inv}\nIn: {masuk}\nOut: {keluar}\nMalam: {malam}\nTetamu: {tetamu}\nJumlah: RM {jumlah}\nDeposit: RM {deposit}\n\n_Sila sahkan tempahan dan hantar butiran pembayaran deposit._',
      to_guest: 'Hai {nama}, berkenaan tempahan *{inv}*\nTarikh: {masuk} - {keluar}\nJumlah: RM {jumlah}\n\nSemak status tempahan anda:\n{link}',
      deposit_confirmed: 'Terima kasih {nama}! 🎉\n\nDeposit bagi tempahan *{inv}* telah kami terima dan disahkan.\n\nTarikh: *{masuk}* hingga *{keluar}*\nJumlah: RM {jumlah}\n\nJumpa anda tidak lama lagi! 🏡',
      check_in_reminder: 'Salam {nama}! 👋\n\nSekadar mengingatkan, tempahan anda *{inv}* adalah esok.\n\n📅 Check-in: *{masuk}* ({masa_masuk})\n📍 Alamat: {alamat}\n\nSelamat datang dan selamat berehat!',
      check_out_reminder: 'Salam {nama}! 😊\n\nPeringatan mesra — tempahan *{inv}* tamat hari ini.\n\n🕐 Check-out: *{keluar}* sebelum {masa_keluar}\n\nTerima kasih kerana menginap! Harap berpuas hati.',
      booking_cancelled: 'Salam {nama},\n\nMaaf dimaklumkan, tempahan *{inv}* (In: {masuk} | Out: {keluar}) telah dibatalkan.\n\nSila hubungi kami untuk sebarang pertanyaan. Maaf atas kesulitan. 🙏',
      payment_reminder: 'Salam {nama},\n\nSekadar peringatan, deposit sebanyak *RM {deposit}* bagi tempahan *{inv}* belum diterima.\n\nSila transfer ke:\n🏦 {bank}\n💳 {akaun}\n👤 {pemegang}\n\nHantar resit selepas transfer. Terima kasih!',
      review_request: 'Salam {nama}! 🌟\n\nTerima kasih kerana menginap di homestay kami untuk tempahan *{inv}*.\n\nKami amat menghargai sekiranya anda boleh berkongsi ulasan anda. Pengalaman anda sangat bermakna kepada kami!\n\nSekian, terima kasih. 🙏',
    };

    return (
      <div className="animate-fade-in space-y-6 max-w-3xl">
        <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6 text-emerald-600"/> Templat WhatsApp</h2>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-[20px] text-xs text-blue-800 leading-relaxed">
          Gunakan pembolehubah dalam <code className="bg-blue-100 px-1 rounded">{'{kurungan}'}</code> — teks diganti automatik semasa penghantaran. Klik <strong>Simpan</strong> selepas edit.
        </div>
        <form onSubmit={e=>{e.preventDefault();dispatch({type:'UPDATE_WA_TEMPLATES',payload:form});waFormRef.current=form;setToast({type:'success',message:'Templat disimpan!'});}} className="space-y-5">
          {TEMPLATES.map(t=>(
            <div key={t.key} className="bg-white rounded-[24px] border border-gray-100 app-shadow p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <label className="block text-xs font-black text-gray-800">{t.label}</label>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{t.vars}</p>
                </div>
                <button type="button" onClick={()=>setForm({...form,[t.key]:defaults[t.key]||''})}
                  className="shrink-0 text-[10px] text-gray-400 hover:text-gray-700 font-bold px-2 py-1 bg-gray-50 rounded-[8px] hover:bg-gray-100 transition-colors">Reset</button>
              </div>
              <textarea value={form[t.key]||''} onChange={e=>setForm({...form,[t.key]:e.target.value})}
                rows={t.rows}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-mono text-xs focus:border-emerald-400 resize-y text-gray-900 leading-relaxed"/>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-[14px] hover:bg-black transition-colors shadow-md flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Simpan Semua Templat</button>
            <button type="button" onClick={()=>setForm({...defaults})} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-[14px] hover:bg-gray-200 transition-colors">Reset Semua</button>
          </div>
        </form>
      </div>
    );
  };

  // ── EmailJS Config ──────────────────────────────
  const AdminEmailJS = () => {
    const [form, setFormState] = useState(() => emailjsFormRef.current || {
      service_id: '',
      admin_template_id: '',
      customer_template_id: '',
      public_key: '',
      admin_email: '',
      ...state.emailjs_config,
    });
    const setForm = v => { emailjsFormRef.current = v; setFormState(v); };
    const [testing, setTesting] = useState(null); // 'admin'|'customer'|null
    const [testMsg, setTestMsg] = useState(null);

    const save = (e) => {
      e.preventDefault();
      dispatch({ type: 'UPDATE_EMAILJS_CONFIG', payload: form });
      setToast({ type: 'success', message: 'Tetapan EmailJS disimpan!' });
    };

    const sendTest = async (type) => {
      const ej = form;
      if (!ej.public_key || !ej.service_id) return setTestMsg({ type: 'err', text: 'Sila isi Service ID dan Public Key dahulu.' });
      const tplId = type === 'admin' ? ej.admin_template_id : ej.customer_template_id;
      const toEmail = type === 'admin' ? ej.admin_email : ej.admin_email; // test to admin email for both
      if (!tplId) return setTestMsg({ type: 'err', text: `Template ID ${type === 'admin' ? 'Admin' : 'Customer'} kosong.` });
      if (!toEmail) return setTestMsg({ type: 'err', text: 'Sila isi emel admin dahulu.' });
      setTesting(type); setTestMsg(null);
      try {
        await emailjs.send(ej.service_id, tplId, {
          to_email: toEmail, to_name: 'Admin Test',
          homestay_name: state.homepage.homestay_name || 'Deloka Senja',
          invoice_id: 'DELOKA-INV-TEST',
          guest_name: 'Test Customer', guest_phone: '0123456789',
          check_in: 'Isnin, 1 Jan 2026', check_out: 'Rabu, 3 Jan 2026',
          total_nights: '2', guests: '4',
          total_price: 'RM 560.00', deposit: 'RM 150.00',
          hold_until: '6 jam dari sekarang', status: 'Menunggu Deposit',
        }, { publicKey: ej.public_key });
        setTestMsg({ type: 'ok', text: `✓ Emel ujian ${type === 'admin' ? 'admin' : 'customer'} berjaya dihantar ke ${toEmail}` });
      } catch (err) {
        const errText = err?.text || err?.message || 'Ralat tidak diketahui';
        const isRecipient = errText.toLowerCase().includes('recipient') || errText.toLowerCase().includes('address');
        setTestMsg({ type: 'err', text: isRecipient
          ? `Gagal: "${errText}" — Dalam EmailJS template → tab Settings → field "To Email" mesti diisi dengan {{to_email}}`
          : `Gagal: ${errText}` });
      } finally { setTesting(null); }
    };

    const Field = ({ label, name, placeholder, type='text', hint }) => (
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
        {hint && <p className="text-[10px] text-gray-400 mb-1.5">{hint}</p>}
        <input type={type} value={form[name]||''} onChange={e=>setForm({...form,[name]:e.target.value})}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-mono"/>
      </div>
    );

    return (
      <div className="animate-fade-in space-y-6 max-w-3xl">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Send className="w-6 h-6 text-amber-500"/> Notifikasi Emel
        </h2>

        {/* Setup guide */}
        <div className="bg-amber-50 border border-amber-100 rounded-[20px] p-5 space-y-3">
          <p className="text-xs font-black text-amber-800 flex items-center gap-2"><Info className="w-4 h-4"/> Cara Setup EmailJS (percuma 200 emel/bulan)</p>
          <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Daftar akaun di <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="underline font-bold">emailjs.com</a></li>
            <li>Tambah <strong>Email Service</strong> (Gmail/Outlook) → salin <strong>Service ID</strong></li>
            <li>Cipta 2 <strong>Email Template</strong>: satu untuk admin, satu untuk customer → salin <strong>Template ID</strong></li>
            <li>Pergi ke <strong>Account → API Keys</strong> → salin <strong>Public Key</strong></li>
          </ol>
          <div className="mt-3 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2.5 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5"/>
            <p className="text-xs text-red-700 font-semibold">
              <strong>Wajib:</strong> Dalam setiap template EmailJS → tab <strong>"Settings"</strong> → field <strong>"To Email"</strong> → isi dengan <code className="bg-red-100 px-1 rounded font-mono">{'{{to_email}}'}</code>. Tanpa ini emel tidak akan berjaya dihantar.
            </p>
          </div>
          <a href="https://www.emailjs.com/docs/" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-white border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
            <ChevronRight className="w-3 h-3"/> Dokumentasi EmailJS
          </a>
        </div>

        {/* Template variable guide */}
        <div className="bg-blue-50 border border-blue-100 rounded-[20px] p-5">
          <p className="text-xs font-black text-blue-800 mb-2 flex items-center gap-2"><Hash className="w-4 h-4"/> Pembolehubah Template EmailJS</p>
          <p className="text-[10px] text-blue-700 mb-2">Salin & tampal ke dalam template EmailJS anda:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              ['{{to_email}}','Emel penerima'],
              ['{{to_name}}','Nama penerima'],
              ['{{homestay_name}}','Nama homestay'],
              ['{{invoice_id}}','No. invois'],
              ['{{guest_name}}','Nama tetamu'],
              ['{{guest_phone}}','No. telefon tetamu'],
              ['{{check_in}}','Tarikh check-in'],
              ['{{check_out}}','Tarikh check-out'],
              ['{{total_nights}}','Bilangan malam'],
              ['{{guests}}','Bilangan tetamu'],
              ['{{total_price}}','Jumlah bayaran'],
              ['{{deposit}}','Deposit'],
              ['{{hold_until}}','Masa tamat hold'],
              ['{{status}}','Status tempahan'],
            ].map(([v,d])=>(
              <div key={v} className="bg-white rounded-[10px] px-2.5 py-1.5 flex items-center gap-2">
                <code className="text-[9px] font-mono font-bold text-blue-700 shrink-0">{v}</code>
                <span className="text-[9px] text-gray-500 truncate">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Config form */}
        <form onSubmit={save} className="bg-white border border-gray-100 rounded-[24px] p-6 app-shadow space-y-5">
          <p className="text-sm font-black text-gray-800 flex items-center gap-2"><Settings className="w-4 h-4 text-gray-500"/> Konfigurasi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="service_id"           label="Service ID"           placeholder="service_xxxxxxx"/>
            <Field name="public_key"           label="Public Key"           placeholder="xxxxxxxxxxxxxxxxxxx"/>
            <Field name="admin_template_id"    label="Template ID — Admin"    placeholder="template_xxxxxxx" hint="Dihantar ke emel admin bila ada tempahan baru"/>
            <Field name="customer_template_id" label="Template ID — Customer" placeholder="template_xxxxxxx" hint="Dihantar ke tetamu sebagai pengesahan tempahan"/>
            <Field name="admin_email"          label="Emel Admin (penerima)" placeholder="admin@email.com" type="email" hint="Emel yang akan terima notifikasi tempahan baru"/>
          </div>
          <button type="submit" className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-[14px] hover:bg-black transition-colors shadow-md flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4"/> Simpan Tetapan
          </button>
        </form>

        {/* Test buttons */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 app-shadow space-y-4">
          <p className="text-sm font-black text-gray-800 flex items-center gap-2"><Send className="w-4 h-4 text-emerald-500"/> Uji Penghantaran Emel</p>
          <p className="text-xs text-gray-500">Hantar emel ujian untuk pastikan template berfungsi. Emel akan dihantar ke alamat admin.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={()=>sendTest('admin')} disabled={!!testing}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs rounded-[12px] hover:bg-amber-100 transition-colors disabled:opacity-50">
              {testing==='admin' ? <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
              Test Emel Admin
            </button>
            <button onClick={()=>sendTest('customer')} disabled={!!testing}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-[12px] hover:bg-emerald-100 transition-colors disabled:opacity-50">
              {testing==='customer' ? <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
              Test Emel Customer
            </button>
          </div>
          {testMsg && (
            <div className={`rounded-[12px] px-4 py-3 flex items-start gap-2 text-xs font-bold ${testMsg.type==='ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-600'}`}>
              {testMsg.type==='ok' ? <CheckCircle className="w-4 h-4 shrink-0"/> : <AlertCircle className="w-4 h-4 shrink-0"/>}
              {testMsg.text}
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className={`rounded-[16px] px-4 py-3 flex items-center gap-3 text-xs font-bold border ${
          form.public_key && form.service_id && form.admin_template_id && form.admin_email
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-gray-50 border-gray-100 text-gray-500'
        }`}>
          {form.public_key && form.service_id && form.admin_template_id && form.admin_email
            ? <><CheckCircle className="w-4 h-4"/> Notifikasi emel aktif — admin akan terima emel setiap tempahan baru</>
            : <><AlertCircle className="w-4 h-4"/> Belum dikonfigurasi — isi semua field di atas untuk aktifkan</>
          }
        </div>
      </div>
    );
  };

  const AdminCleaner = () => {
    const [tab, setTab] = useState('reports');
    // viewReport + upahInput are LIFTED to AdminView (cleanerViewReport / cleanerUpahInput)
    // so they survive AdminCleaner remounts caused by dispatch
    const viewReport = cleanerViewReport;
    const setViewReport = setCleanerViewReport;
    const [cName, setCName] = useState(''); const [cPhone, setCPhone] = useState('');
    const [cUn, setCUn] = useState(''); const [cPw, setCPw] = useState('');
    const [newSecName, setNewSecName] = useState('');
    const [newSecImage, setNewSecImage] = useState('');
    const [expandedSecId, setExpandedSecId] = useState(null);
    const [taskInputs, setTaskInputs] = useState({});
    const [editImgId, setEditImgId] = useState(null);
    const [editImgVal, setEditImgVal] = useState('');
    const [filterCleaner, setFilterCleaner] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [searchQ, setSearchQ] = useState('');
    const [editNoteId, setEditNoteId] = useState(null);

    const allReports = [...(state.cleaner_reports||[])].sort((a,b)=>new Date(b.submitted_at)-new Date(a.submitted_at));
    const reports = allReports.filter(r => {
      if (filterCleaner && r.cleaner_name !== filterCleaner) return false;
      if (filterDate && !r.submitted_at?.startsWith(filterDate)) return false;
      if (filterCustomer && !(r.booking_ref||'').toLowerCase().includes(filterCustomer.toLowerCase())) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        return (r.cleaner_name||'').toLowerCase().includes(q) || (r.booking_ref||'').toLowerCase().includes(q) || (r.id||'').toLowerCase().includes(q);
      }
      return true;
    });
    const newReports = allReports.filter(r=>!r.admin_seen).length;
    const uniqueCleaners = [...new Set(allReports.map(r=>r.cleaner_name).filter(Boolean))];

    const getReportProgress = (r) => {
      if (r.sections?.length) {
        const total = r.sections.reduce((s,sec)=>s+(sec.tasks?.length||0),0);
        const done = r.sections.reduce((s,sec)=>s+(sec.tasks?.filter(t=>t.done).length||0),0);
        return {done, total};
      }
      const total = r.checklist?.length||0;
      const done = r.checklist?.filter(c=>c.done).length||0;
      return {done, total};
    };

    const getAllPhotos = (r) => {
      if (r.sections?.length) return r.sections.flatMap(s=>s.photoUrls||[]);
      return r.photos||[];
    };

    return (
      <>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Sparkles className="w-6 h-6 text-emerald-600"/>
          <h2 className="text-2xl font-bold">Modul Cleaner</h2>
          {newReports > 0 && <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">{newReports} Laporan Baru</span>}
        </div>

        <div className="flex gap-2 flex-wrap">
          {[{id:'reports',label:'Laporan'},{id:'cleaners',label:'Cleaner'},{id:'bahagian',label:'Bahagian Semak'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${tab===t.id?'bg-gray-900 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t.label}
              {t.id==='reports' && newReports>0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{newReports}</span>}
            </button>
          ))}
        </div>

        {tab==='reports' && (
          <div className="space-y-4">

            {/* ── FILTER BAR ── */}
            <div className="bg-white rounded-[20px] p-4 border border-gray-100 app-shadow space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                  placeholder="Cari nama cleaner, no. tempahan..."
                  className="w-full pl-9 py-2.5 pr-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-sm font-medium focus:border-emerald-500"/>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={filterCleaner} onChange={e=>setFilterCleaner(e.target.value)}
                  className="flex-1 min-w-[130px] p-2.5 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-gray-700 focus:border-emerald-500">
                  <option value="">Semua Cleaner</option>
                  {uniqueCleaners.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
                  className="flex-1 min-w-[130px] p-2.5 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-gray-700 focus:border-emerald-500"/>
                <input value={filterCustomer} onChange={e=>setFilterCustomer(e.target.value)}
                  placeholder="No. Tempahan..."
                  className="flex-1 min-w-[130px] p-2.5 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-gray-700 focus:border-emerald-500"/>
                {(filterCleaner||filterDate||filterCustomer||searchQ) && (
                  <button type="button" onClick={()=>{setFilterCleaner('');setFilterDate('');setFilterCustomer('');setSearchQ('');}}
                    className="px-3 py-2.5 bg-red-50 text-red-500 rounded-[12px] text-xs font-bold hover:bg-red-100 flex items-center gap-1">
                    <X className="w-3.5 h-3.5"/> Reset
                  </button>
                )}
              </div>
              {(filterCleaner||filterDate||filterCustomer||searchQ) && (
                <p className="text-xs font-bold text-gray-400">{reports.length} / {allReports.length} laporan</p>
              )}
            </div>

            {/* ── STAT CHIPS ── */}
            <div className="flex gap-2 flex-wrap">
              {[
                {label:'Semua', val:'', count:allReports.length, cls:'bg-gray-900 text-white'},
                {label:'🔴 Baru', val:'new', count:allReports.filter(r=>!r.admin_seen).length, cls:'bg-red-500 text-white'},
                {label:'⏳ Perlu Sahkan', val:'pending', count:allReports.filter(r=>r.admin_seen&&r.status!=='acknowledged'&&r.status!=='rejected').length, cls:'bg-amber-400 text-white'},
                {label:'✓ Diluluskan', val:'acknowledged', count:allReports.filter(r=>r.status==='acknowledged').length, cls:'bg-emerald-500 text-white'},
                {label:'✗ Ditolak', val:'rejected', count:allReports.filter(r=>r.status==='rejected').length, cls:'bg-gray-400 text-white'},
              ].map(chip=>(
                <button key={chip.val} type="button"
                  onClick={()=>setSearchQ(chip.val===''?'':chip.val==='new'?'__new__':chip.val==='pending'?'__pending__':chip.val)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-opacity ${chip.count===0?'opacity-40':''} ${chip.cls}`}>
                  {chip.label} ({chip.count})
                </button>
              ))}
            </div>

            {reports.length===0 && (
              <div className="py-16 text-center bg-white rounded-[24px] border border-gray-100">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-gray-400 font-bold text-sm">Tiada laporan dijumpai</p>
              </div>
            )}

            {/* ── REPORT CARDS ── */}
            {reports.map(r=>{
              const {done,total} = getReportProgress(r);
              const allPhotos = getAllPhotos(r);
              const pct = total ? Math.round((done/total)*100) : 0;
              const cleanerPhone = (state.cleaners||[]).find(c=>c.name===r.cleaner_name)?.phone||'';
              const statusCfg = r.status==='acknowledged'
                ? {label:'✓ Diluluskan', bg:'bg-emerald-50', border:'border-emerald-200', badge:'bg-emerald-100 text-emerald-700'}
                : r.status==='rejected'
                ? {label:'✗ Ditolak', bg:'bg-red-50', border:'border-red-200', badge:'bg-red-100 text-red-600'}
                : !r.admin_seen
                ? {label:'🔴 Baru', bg:'bg-white', border:'border-red-200', badge:'bg-red-100 text-red-700'}
                : {label:'⏳ Semakan', bg:'bg-white', border:'border-amber-200', badge:'bg-amber-100 text-amber-700'};

              return (
                <div key={r.id} className={`rounded-[24px] border overflow-hidden app-shadow ${statusCfg.bg} ${statusCfg.border}`}>

                  {/* Card header */}
                  <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-black text-gray-700 shrink-0">
                          {(r.cleaner_name||'?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm leading-tight">{r.cleaner_name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{new Date(r.submitted_at).toLocaleString('ms-MY')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {r.booking_ref && <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">📋 {r.booking_ref}</span>}
                        {r.upah > 0 && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">💰 RM {Number(r.upah).toFixed(2)}</span>}
                        {r.ack_at && <span className="text-[10px] text-gray-400 font-medium">Lulus: {new Date(r.ack_at).toLocaleDateString('ms-MY')}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full shrink-0 ${statusCfg.badge}`}>{statusCfg.label}</span>
                  </div>

                  {/* Progress */}
                  <div className="px-5 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct===100?'bg-emerald-500':pct>50?'bg-amber-400':'bg-gray-400'}`} style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 shrink-0">{done}/{total} · {pct}%</span>
                    </div>
                    {r.sections?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {r.sections.map(sec=>{
                          const sd = sec.tasks?.filter(t=>t.done).length||0;
                          const st = sec.tasks?.length||0;
                          return (
                            <span key={sec.id} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sd===st&&st>0?'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-500'}`}>
                              {sec.name} {sd}/{st}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Photos strip */}
                  {allPhotos.length > 0 && (
                    <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
                      {allPhotos.slice(0,5).map((url,i)=>(
                        <a key={i} href={url} target="_blank" rel="noreferrer"
                          className="shrink-0 w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                          <img src={url} className="w-full h-full object-cover" alt=""/>
                        </a>
                      ))}
                      {allPhotos.length > 5 && (
                        <div className="shrink-0 w-14 h-14 rounded-[10px] bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500">
                          +{allPhotos.length-5}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ACTION ROW ── */}
                  <div className="px-4 py-3 bg-white/60 border-t border-gray-100 flex items-center gap-2 flex-wrap">

                    {/* Lihat */}
                    <button type="button"
                      onClick={()=>{ cleanerUpahRef.current = r.upah>0?String(r.upah):''; setViewReport(r); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white rounded-[10px] text-xs font-bold transition-colors">
                      <Eye className="w-3.5 h-3.5"/> Lihat
                    </button>

                    {/* Lulus (if not yet approved) */}
                    {r.status !== 'acknowledged' && (
                      <button type="button"
                        onClick={()=>{ cleanerUpahRef.current = r.upah>0?String(r.upah):''; setViewReport(r); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[10px] text-xs font-bold transition-colors">
                        <CheckCircle className="w-3.5 h-3.5"/> Lulus
                      </button>
                    )}

                    {/* Tolak (if not rejected) */}
                    {r.status !== 'rejected' && r.status !== 'acknowledged' && (
                      <button type="button"
                        onClick={()=>{ if(window.confirm(`Tolak laporan daripada ${r.cleaner_name}?`)) { dispatch({type:'REJECT_CLEANER_REPORT',id:r.id}); setToast({type:'info',message:'Laporan ditolak.'}); } }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-[10px] text-xs font-bold transition-colors">
                        <XCircle className="w-3.5 h-3.5"/> Tolak
                      </button>
                    )}

                    {/* Batal kelulusan (if approved) */}
                    {r.status === 'acknowledged' && (
                      <button type="button"
                        onClick={()=>{ if(window.confirm('Batal kelulusan laporan ini?')) { dispatch({type:'REJECT_CLEANER_REPORT',id:r.id}); setToast({type:'info',message:'Kelulusan dibatalkan.'}); } }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-[10px] text-xs font-bold transition-colors">
                        <XCircle className="w-3.5 h-3.5"/> Batal
                      </button>
                    )}

                    {/* WA Bayaran (if approved + phone) */}
                    {r.status==='acknowledged' && cleanerPhone && (
                      <a href={`https://wa.me/6${cleanerPhone.replace(/^0/,'')}?text=${encodeURIComponent(`Assalamualaikum ${r.cleaner_name},\n\nUpah kebersihan bagi ${r.booking_ref?`tempahan *${r.booking_ref}*`:`tarikh *${r.date}*`} telah diproses.\n\nJumlah: *RM ${Number(r.upah||0).toFixed(2)}*\n\nTerima kasih! 🙏`)}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-[10px] text-xs font-bold transition-colors">
                        <MessageSquare className="w-3.5 h-3.5"/> WA Bayaran
                      </a>
                    )}

                    {/* Padam */}
                    <button type="button"
                      onClick={()=>{ if(window.confirm(`Padam laporan daripada ${r.cleaner_name}? Tindakan ini tidak boleh dibatalkan.`)) { dispatch({type:'DEL_CLEANER_REPORT',id:r.id}); setToast({type:'success',message:'Laporan dipadam.'}); } }}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-[10px] text-xs font-bold transition-colors">
                      <Trash2 className="w-3.5 h-3.5"/> Padam
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==='cleaners' && (
          <div className="space-y-5 max-w-2xl">
            <form onSubmit={e=>{e.preventDefault();if(cName&&cUn&&cPw){dispatch({type:'ADD_CLEANER',payload:{id:Date.now(),name:cName,phone:cPhone,username:cUn,password:cPw,active:true}});setCName('');setCPhone('');setCUn('');setCPw('');setToast({type:'success',message:'Cleaner ditambah.'});}}}
              className="bg-white p-6 rounded-[32px] border border-gray-100 app-shadow flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nama Penuh</label><input required value={cName} onChange={e=>setCName(e.target.value)} placeholder="Nama cleaner" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <div className="flex-1 min-w-[130px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">No. Tel</label><input value={cPhone} onChange={e=>setCPhone(e.target.value)} placeholder="0123456789" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Username</label><input required value={cUn} onChange={e=>setCUn(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Password</label><input required value={cPw} onChange={e=>setCPw(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-[14px] font-bold flex items-center justify-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Tambah</button>
            </form>
            <div className="bg-white rounded-[32px] border border-gray-100 app-shadow overflow-hidden">
              {(state.cleaners||[]).length===0 && <div className="py-12 text-center text-gray-400 font-bold">Tiada cleaner berdaftar.</div>}
              {(state.cleaners||[]).map(c=>{
                const notes = (state.cleaner_payment_notes||{})[c.id] || {payment_notes:'',other_notes:''};
                const isEditing = editNoteId === c.id;
                return (
                  <div key={c.id} className="border-b border-gray-50 last:border-0">
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.phone&&`${c.phone} • `}<span className="font-bold text-gray-700">@{c.username}</span></p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button onClick={()=>setEditNoteId(isEditing?null:c.id)} className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-[12px]"><FileEdit className="w-4 h-4"/></button>
                        <button onClick={()=>{dispatch({type:'DEL_CLEANER',id:c.id});setToast({type:'success',message:'Dibuang'});}} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-[12px]"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-3">
                        {(() => {
                          const [pn, setPn] = useState(notes.payment_notes||'');
                          const [on, setOn] = useState(notes.other_notes||'');
                          return (
                            <>
                              <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Catatan Bayaran</label><textarea value={pn} onChange={e=>setPn(e.target.value)} placeholder="Cth: Dibayar RM200 pada 01/01/2026..." rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none text-sm font-medium resize-none focus:border-emerald-500 text-gray-900"/></div>
                              <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Catatan Lain</label><textarea value={on} onChange={e=>setOn(e.target.value)} placeholder="Cth: Cuti pada bulan Jun..." rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none text-sm font-medium resize-none focus:border-emerald-500 text-gray-900"/></div>
                              <button onClick={()=>{ dispatch({type:'UPDATE_CLEANER_NOTE',cleanerId:c.id,payload:{payment_notes:pn,other_notes:on}}); setEditNoteId(null); setToast({type:'success',message:'Catatan disimpan.'}); }} className="px-5 py-2.5 bg-gray-900 text-white rounded-[12px] text-xs font-bold hover:bg-black transition-colors">Simpan Catatan</button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    {!isEditing && (notes.payment_notes||notes.other_notes) && (
                      <div className="px-5 pb-4 space-y-1">
                        {notes.payment_notes && <p className="text-xs text-gray-600 bg-yellow-50 px-3 py-2 rounded-[10px] border border-yellow-100">💰 {notes.payment_notes}</p>}
                        {notes.other_notes && <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-[10px]">📝 {notes.other_notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==='bahagian' && (
          <div className="space-y-5 max-w-2xl">
            <form onSubmit={e=>{e.preventDefault();if(newSecName.trim()){dispatch({type:'ADD_CLEANER_SECTION',payload:{id:Date.now(),name:newSecName.trim(),image:newSecImage.trim()||'',tasks:[]}});setNewSecName('');setNewSecImage('');setToast({type:'success',message:'Bahagian ditambah.'});}}}
              className="bg-white p-6 rounded-[32px] border border-gray-100 app-shadow flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nama Bahagian</label><input required value={newSecName} onChange={e=>setNewSecName(e.target.value)} placeholder="Cth: Ruang Tamu" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <div className="flex-1 min-w-[200px]"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">URL Gambar (pilihan)</label><input value={newSecImage} onChange={e=>setNewSecImage(e.target.value)} placeholder="https://..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[14px] outline-none font-bold text-gray-900 focus:border-emerald-500"/></div>
              <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-[14px] font-bold flex items-center justify-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Tambah Bahagian</button>
            </form>

            <div className="space-y-3">
              {(state.cleaner_sections||[]).length===0 && <div className="py-12 text-center text-gray-400 font-bold bg-white rounded-[32px] border border-gray-100">Tiada bahagian ditambah.</div>}
              {(state.cleaner_sections||[]).map(sec=>(
                <div key={sec.id} className="bg-white rounded-[24px] border border-gray-100 app-shadow overflow-hidden">
                  <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={()=>{setExpandedSecId(expandedSecId===sec.id?null:sec.id);setEditImgId(null);}}>
                    {sec.image
                      ? <img src={sec.image} alt={sec.name} className="w-12 h-12 rounded-[10px] object-cover shrink-0 border border-gray-100"/>
                      : <div className="w-12 h-12 rounded-[10px] bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200"><ImageIcon className="w-5 h-5 text-gray-400"/></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{sec.name}</p>
                      <p className="text-xs text-gray-500">{sec.tasks?.length||0} tugasan</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e=>{e.stopPropagation();setEditImgId(editImgId===sec.id?null:sec.id);setEditImgVal(sec.image||'');setExpandedSecId(null);}} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-[10px]" title="Edit Gambar"><ImageIcon className="w-3.5 h-3.5"/></button>
                      <button onClick={e=>{e.stopPropagation();dispatch({type:'DEL_CLEANER_SECTION',id:sec.id});setToast({type:'success',message:'Bahagian dibuang.'});}} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-[10px]"><Trash2 className="w-3.5 h-3.5"/></button>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSecId===sec.id?'rotate-180':''}`}/>
                    </div>
                  </div>

                  {editImgId===sec.id && (
                    <div className="border-t border-blue-50 bg-blue-50 p-4">
                      <label className="text-[10px] font-bold text-blue-700 uppercase block mb-2">URL Gambar Bahagian</label>
                      <div className="flex gap-2">
                        <input value={editImgVal} onChange={e=>setEditImgVal(e.target.value)} placeholder="https://..." className="flex-1 p-2.5 bg-white border border-blue-200 rounded-[12px] outline-none text-sm font-bold text-gray-900 focus:border-blue-500"/>
                        <button onClick={()=>{ dispatch({type:'UPDATE_SECTION_IMAGE',id:sec.id,image:editImgVal}); setEditImgId(null); setToast({type:'success',message:'Gambar dikemaskini.'}); }} className="px-4 py-2.5 bg-blue-600 text-white rounded-[12px] font-bold text-xs hover:bg-blue-700 transition-colors">Simpan</button>
                      </div>
                    </div>
                  )}

                  {expandedSecId===sec.id && (
                    <div className="border-t border-gray-100 p-4 space-y-3">
                      <div className="space-y-1.5">
                        {(sec.tasks||[]).length===0 && <p className="text-xs text-gray-400 italic py-2 text-center">Tiada tugasan dalam bahagian ini.</p>}
                        {(sec.tasks||[]).map((t,i)=>(
                          <div key={t.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-[10px]">
                            <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                            <p className="flex-1 text-sm font-bold text-gray-800">{t.task}</p>
                            <button onClick={()=>{dispatch({type:'DEL_SECTION_TASK',sectionId:sec.id,taskId:t.id});setToast({type:'success',message:'Tugasan dibuang.'});}} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-[8px]"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={e=>{e.preventDefault();const v=(taskInputs[sec.id]||'').trim();if(v){dispatch({type:'ADD_SECTION_TASK',sectionId:sec.id,payload:{id:Date.now(),task:v}});setTaskInputs(p=>({...p,[sec.id]:''}));setToast({type:'success',message:'Tugasan ditambah.'});}}} className="flex gap-2">
                        <input value={taskInputs[sec.id]||''} onChange={e=>setTaskInputs(p=>({...p,[sec.id]:e.target.value}))} placeholder="Tugasan baru..." className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-sm font-bold text-gray-900 focus:border-emerald-500"/>
                        <button type="submit" className="px-4 py-2.5 bg-gray-900 text-white rounded-[12px] font-bold text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Tambah</button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm" onClick={()=>setViewReport(null)}>
            <div className="bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col" style={{maxHeight:'85vh'}} onClick={e=>e.stopPropagation()}>
              <div className="px-6 pt-5 pb-4 shrink-0 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{viewReport.cleaner_name}</p>
                  <p className="text-xs text-gray-500">{new Date(viewReport.submitted_at).toLocaleString('ms-MY')}</p>
                </div>
                <button onClick={()=>{ dispatch({type:'MARK_REPORT_SEEN',id:viewReport.id}); setViewReport(null); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4"/></button>
              </div>
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                {viewReport.booking_ref && <div className="bg-blue-50 border border-blue-100 p-3 rounded-[14px]"><p className="text-xs font-bold text-blue-800">Tempahan: {viewReport.booking_ref}</p></div>}

                {viewReport.sections?.length > 0 ? (
                  <div className="space-y-5">
                    {viewReport.sections.map(sec=>{
                      const secDone = sec.tasks?.filter(t=>t.done).length||0;
                      const secTotal = sec.tasks?.length||0;
                      return (
                        <div key={sec.id} className="border border-gray-100 rounded-[18px] overflow-hidden">
                          <div className={`px-4 py-3 flex items-center justify-between ${secDone===secTotal&&secTotal>0?'bg-emerald-50':'bg-gray-50'}`}>
                            <p className="font-bold text-sm text-gray-900">{sec.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] ${secDone===secTotal&&secTotal>0?'bg-emerald-200 text-emerald-800':'bg-gray-200 text-gray-700'}`}>{secDone}/{secTotal}</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="space-y-1.5">
                              {sec.tasks?.map(t=>(
                                <div key={t.id} className={`flex items-center gap-2.5 p-2.5 rounded-[10px] ${t.done?'bg-emerald-50':'bg-gray-50'}`}>
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${t.done?'bg-emerald-500':'bg-gray-200'}`}>{t.done&&<CheckCircle className="w-3 h-3 text-white"/>}</div>
                                  <span className={`text-xs font-bold ${t.done?'text-emerald-700':'text-gray-400 line-through'}`}>{t.task}</span>
                                </div>
                              ))}
                            </div>
                            {sec.notes && <div className="bg-amber-50 border border-amber-100 p-3 rounded-[10px]"><p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Catatan</p><p className="text-xs text-amber-800 italic">"{sec.notes}"</p></div>}
                            {sec.photoUrls?.length > 0 && (
                              <div className="grid grid-cols-3 gap-1.5">
                                {sec.photoUrls.map((url,i)=>(
                                  <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-[10px] overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity">
                                    <img src={url} className="w-full h-full object-cover" alt={`${sec.name} ${i+1}`}/>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Senarai Tugasan</p>
                      <div className="space-y-2">
                        {viewReport.checklist?.map(t=>(
                          <div key={t.id} className={`flex items-center gap-3 p-3 rounded-[12px] ${t.done?'bg-emerald-50':'bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${t.done?'bg-emerald-500':'bg-gray-200'}`}>{t.done&&<CheckCircle className="w-3.5 h-3.5 text-white"/>}</div>
                            <span className={`text-sm font-bold ${t.done?'text-emerald-700':'text-gray-400 line-through'}`}>{t.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {viewReport.photos?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Gambar ({viewReport.photos.length})</p>
                        <div className="grid grid-cols-2 gap-2">
                          {viewReport.photos.map((url,i)=>(
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-video rounded-[12px] overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity">
                              <img src={url} className="w-full h-full object-cover" alt={`Gambar ${i+1}`}/>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewReport.notes && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nota</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-[14px] italic">"{viewReport.notes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* UPAH + SAHKAN SECTION */}
              <div className="px-6 py-5 border-t border-gray-100 shrink-0 space-y-3">
                {viewReport.status !== 'acknowledged' ? (
                  <>
                    <div className="bg-amber-50 border border-amber-100 rounded-[18px] p-4 space-y-3">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">💰 Upah Kebersihan</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-700">RM</span>
                        <input
                          type="number" min="0" step="0.50"
                          key={viewReport?.id} defaultValue={cleanerUpahRef.current} onChange={e=>{ cleanerUpahRef.current = e.target.value; }}
                          placeholder="0.00"
                          className="flex-1 p-3 bg-white border-2 border-amber-200 rounded-[12px] outline-none text-lg font-black text-gray-900 focus:border-amber-400 text-center"
                        />
                      </div>
                      <p className="text-[10px] text-amber-600 font-medium">Masukkan jumlah upah kebersihan untuk cleaner ini sebelum sahkan.</p>
                    </div>
                    <button
                      onClick={()=>{
                        const _upah = Number(cleanerUpahRef.current);
                        if (!cleanerUpahRef.current || _upah <= 0) { alert('Sila masukkan jumlah upah terlebih dahulu.'); return; }
                        dispatch({type:'ACK_CLEANER_REPORT', id:viewReport.id, upah:_upah});
                        setViewReport({...viewReport, status:'acknowledged', upah:_upah, ack_at:new Date().toISOString()});
                        setToast({type:'success', message:`Laporan disahkan! Upah RM ${_upah.toFixed(2)} direkodkan.`});
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[16px] transition-colors shadow-md shadow-emerald-100 flex items-center justify-center gap-2 text-sm">
                      <CheckCircle className="w-5 h-5"/> Sahkan Laporan &amp; Rekod Bayaran
                    </button>
                    <button onClick={()=>{ dispatch({type:'MARK_REPORT_SEEN',id:viewReport.id}); setViewReport(null); }} className="w-full text-gray-400 font-bold py-2 text-sm hover:text-gray-600 transition-colors">Tutup</button>
                  </>
                ) : (
                  <>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-[18px] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">✓ Laporan Disahkan</p>
                        <p className="text-xl font-black text-emerald-800 mt-0.5">RM {Number(viewReport.upah||0).toFixed(2)} <span className="text-sm font-bold text-emerald-600">Upah</span></p>
                        {viewReport.ack_at && <p className="text-[10px] text-emerald-500 mt-0.5">{new Date(viewReport.ack_at).toLocaleString('ms-MY')}</p>}
                      </div>
                      <CheckCircle className="w-10 h-10 text-emerald-400"/>
                    </div>
                    {(() => {
                      const cl = (state.cleaners||[]).find(c=>c.id===viewReport.cleaner_id||c.name===viewReport.cleaner_name);
                      const waMsg = `Assalamualaikum ${viewReport.cleaner_name},\n\nUpah kebersihan bagi ${viewReport.booking_ref?`tempahan *${viewReport.booking_ref}*`:`tarikh *${viewReport.date}*`} telah diproses.\n\nJumlah Upah: *RM ${Number(viewReport.upah||0).toFixed(2)}*\n\nTerima kasih atas kerja keras anda! 🙏\n\n— ${state.homepage?.homestay_name||'Deloka Senja'}`;
                      return (
                        <div className="flex gap-2">
                          {cl?.phone && (
                            <a href={`https://wa.me/6${cl.phone.replace(/^0/,'')}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer"
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3.5 rounded-[16px] transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-green-100">
                              <MessageSquare className="w-4 h-4"/> Hantar WA Bayaran
                            </a>
                          )}
                          <button onClick={()=>setViewReport(null)}
                            className={`${cl?.phone?'px-5':'flex-1'} bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-[16px] transition-colors text-sm`}>
                            Tutup
                          </button>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Primary tabs — always visible, prominent
  const primaryTabs = [
    {id:'dashboard', icon:LayoutDashboard, label:'Dashboard'},
    {id:'bookings',  icon:BookOpen,        label:'Tempahan'},
    {id:'cleaner',   icon:Sparkles,        label:'Cleaner'},
  ];
  // Settings sub-tabs — grouped under ⚙️ Tetapan
  const settingsTabs = [
    {id:'special',   icon:CalendarIcon,   label:'Tarikh Khas'},
    {id:'pricing',   icon:CreditCard,     label:'Harga'},
    {id:'gallery',   icon:ImageIcon,      label:'Galeri'},
    {id:'homepage',  icon:Home,           label:'Laman Utama'},
    {id:'templates', icon:MessageSquare,  label:'Templat WA'},
    {id:'email',     icon:Send,           label:'Notifikasi Emel'},
    {id:'users',     icon:Shield,         label:'Admin'},
  ];
  // Combined for mobile sheet + mobile header lookup
  const tabs = [...primaryTabs, ...settingsTabs];

  const renderTab = () => {
    switch(activeTab) {
      case 'dashboard': return <AdminDashboard/>;
      case 'bookings': return <AdminBookings/>;
      case 'special': return <AdminSpecialDates/>;
      case 'pricing': return <AdminFormConfig title="Tetapan Harga" data={state.pricing} actionType="UPDATE_PRICING" icon={CreditCard} formRef={pricingFormRef}/>;
      case 'gallery': return <AdminGallery/>;
      case 'homepage': return <AdminHomepage/>;
      case 'templates': return <AdminWATemplates/>;
      case 'email': return <AdminEmailJS/>;
      case 'users': return <AdminUsers/>;
      case 'cleaner': return <AdminCleaner/>;
      default: return <AdminDashboard/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex relative font-sans">
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-100 z-10 h-screen fixed top-0 left-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h1 className="text-lg font-bold text-emerald-600 flex items-center gap-2"><Settings className="w-5 h-5"/> Admin Panel</h1>
          <button onClick={toggleDark} className="text-gray-400 hover:text-gray-900">{isDark?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-5 pb-24 space-y-1">

          {/* ── Primary Tabs ── */}
          {primaryTabs.map(t=>(
            <button key={t.id} onClick={()=>{ setActiveTab(t.id); if(t.id==='bookings') setUnreadCount(0); if(t.id==='cleaner') setUnreadCleanerCount(0); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] font-bold text-xs transition-colors ${activeTab===t.id?'bg-gray-900 text-white shadow-md':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <t.icon className="w-5 h-5"/>
              <span className="flex-1 text-left">{t.label}</span>
              {t.id==='bookings' && unreadCount>0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
              {t.id==='cleaner' && unreadCleanerCount>0 && <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCleanerCount}</span>}
            </button>
          ))}

          {/* ── Divider ── */}
          <div className="my-3 border-t border-gray-100"/>

          {/* ── Settings Group ── */}
          <button
            onClick={()=>setSettingsOpen(o=>!o)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] font-bold text-xs transition-colors ${SETTINGS_IDS.includes(activeTab)?'text-gray-900 bg-gray-50':'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
            <Settings className="w-4 h-4 shrink-0"/>
            <span className="flex-1 text-left text-[11px] uppercase tracking-wider">Tetapan</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${settingsOpen?'rotate-180':''}`}/>
          </button>

          {settingsOpen && (
            <div className="ml-2 space-y-0.5 border-l-2 border-gray-100 pl-3">
              {settingsTabs.map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] font-bold text-xs transition-colors ${activeTab===t.id?'bg-gray-900 text-white shadow-sm':'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                  <t.icon className="w-4 h-4 shrink-0"/>
                  <span className="flex-1 text-left">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-50 bg-white absolute bottom-0 w-full space-y-2">
          <button onClick={()=>setRoute('customer')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] font-bold text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"><Home className="w-4 h-4"/> Ke Laman Utama</button>
          <button onClick={()=>{ localStorage.removeItem('delokaAdminAuth'); setRoute('customer'); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><ArrowLeft className="w-4 h-4"/> Log Keluar</button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20 shadow-sm gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Panel</p>
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">{tabs.find(t=>t.id===activeTab)?.label}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={()=>setRoute('customer')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-[10px] text-xs font-bold hover:bg-gray-200 transition-colors">
            <Home className="w-3.5 h-3.5"/> Utama
          </button>
          <button onClick={()=>{ localStorage.removeItem('delokaAdminAuth'); setRoute('customer'); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-[10px] text-xs font-bold hover:bg-red-100 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5"/> Keluar
          </button>
          <button onClick={()=>setMobileMenuOpen(true)} className="w-10 h-10 bg-gray-900 text-white rounded-[12px] flex flex-col items-center justify-center gap-1.5 shrink-0">
            <span className="w-4 h-0.5 bg-white rounded-full"/>
            <span className="w-3 h-0.5 bg-white rounded-full self-start ml-1"/>
            <span className="w-4 h-0.5 bg-white rounded-full"/>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={()=>setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"/>
          <div className="relative bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>

            {/* Primary tabs — big 3 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {primaryTabs.map(t=>(
                <button key={t.id} onClick={()=>{ setActiveTab(t.id); setMobileMenuOpen(false); if(t.id==='bookings') setUnreadCount(0); if(t.id==='cleaner') setUnreadCleanerCount(0); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-[18px] font-bold transition-colors relative ${activeTab===t.id?'bg-gray-900 text-white':'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  <t.icon className="w-6 h-6 shrink-0"/>
                  <span className="text-[11px] leading-tight text-center">{t.label}</span>
                  {t.id==='bookings' && unreadCount>0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
                  {t.id==='cleaner' && unreadCleanerCount>0 && <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCleanerCount}</span>}
                </button>
              ))}
            </div>

            {/* Settings sub-tabs */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5"><Settings className="w-3 h-3"/> Tetapan</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {settingsTabs.map(t=>(
                <button key={t.id} onClick={()=>{ setActiveTab(t.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2.5 p-3 rounded-[14px] font-bold text-xs transition-colors text-left ${activeTab===t.id?'bg-gray-900 text-white':'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  <t.icon className="w-4 h-4 shrink-0"/>
                  <span className="text-xs leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={()=>{ setMobileMenuOpen(false); setRoute('customer'); }} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-[18px] font-bold text-sm bg-gray-50 text-gray-700 hover:bg-gray-100">
                <Home className="w-4 h-4"/> Ke Utama
              </button>
              <button onClick={()=>{ localStorage.removeItem('delokaAdminAuth'); setMobileMenuOpen(false); setRoute('customer'); }} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-[18px] font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100">
                <ArrowLeft className="w-4 h-4"/> Log Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-5 md:pl-[280px] md:pr-8 md:py-8 max-w-7xl mx-auto w-full min-h-screen pb-16 md:pb-10 overflow-x-hidden">
        {renderTab()}
      </main>

      <ScrollToTop/>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* ── Real-time: New Booking Popup ── */}
      {newBookingNotif && (
        <div className="fixed bottom-20 right-4 md:bottom-auto md:top-6 md:right-6 z-[200] animate-fade-in w-72 max-w-[calc(100vw-2rem)]">
          <div className="bg-gray-900 text-white rounded-[22px] p-4 shadow-2xl border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center shrink-0" style={{animation:'iconPulse 1.5s ease-in-out infinite'}}>
                  <Bell className="w-4 h-4 text-white"/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tempahan Baru! 🎉</p>
                  <p className="text-sm font-bold text-white leading-tight">{newBookingNotif.guest_name}</p>
                </div>
              </div>
              <button onClick={()=>setNewBookingNotif(null)} className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center shrink-0 transition-colors"><X className="w-3 h-3 text-white"/></button>
            </div>
            <div className="bg-white/10 rounded-[12px] px-3 py-2 text-[11px] font-bold text-gray-300 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-emerald-400 shrink-0"/>
              <span>{newBookingNotif.invoice_id} • {formatDate(newBookingNotif.check_in)} → {formatDate(newBookingNotif.check_out)}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="bg-white/10 px-2.5 py-1 rounded-[8px] font-bold text-gray-300">{newBookingNotif.total_nights} mlm</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-[8px] font-bold text-gray-300">{newBookingNotif.guests} orang</span>
              <span className="ml-auto font-black text-emerald-400">{formatCurrency(newBookingNotif.total_price)}</span>
            </div>
            <button onClick={()=>{setActiveTab('bookings');setNewBookingNotif(null);}} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-[14px] text-xs transition-colors flex items-center justify-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> Lihat Tempahan</button>
          </div>
        </div>
      )}

      {/* ── Real-time: New Receipt Badge Popup ── */}
      {newReceiptNotif && (
        <div className="fixed bottom-20 right-4 md:bottom-auto md:right-6 z-[200] animate-fade-in w-72 max-w-[calc(100vw-2rem)]"
          style={{top: newBookingNotif ? undefined : undefined, marginTop: newBookingNotif ? '0' : '0',
            ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? {top: newBookingNotif ? '188px' : '24px'} : {})}}>
          <div className="bg-white rounded-[22px] p-4 shadow-2xl border border-purple-100 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-white"/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Resit {newReceiptNotif.type==='baki'?'Baki':'Deposit'} Baru! 📎</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{newReceiptNotif.booking.guest_name}</p>
                </div>
              </div>
              <button onClick={()=>setNewReceiptNotif(null)} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shrink-0 transition-colors"><X className="w-3 h-3 text-gray-500"/></button>
            </div>
            <p className="text-[11px] text-gray-500 font-medium bg-gray-50 rounded-[10px] px-3 py-2">
              <span className="font-bold text-gray-700">{newReceiptNotif.booking.invoice_id}</span> telah mengupload resit {newReceiptNotif.type==='baki'?'baki':'deposit'}.
            </p>
            <button onClick={()=>{setActiveTab('bookings');setNewReceiptNotif(null);}} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-[14px] text-xs transition-colors flex items-center justify-center gap-1.5"><Eye className="w-3.5 h-3.5"/> Semak Resit</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= MAIN APP =================
export default function DelokaSenjaApp() {
  const [route, setRoute] = useState('customer');
  const [isDark, setIsDark] = useState(false);
  const [cleanerUser, setCleanerUser] = useState(null);
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef(null);
  // isSynced: true after Firestore read succeeds OR after user makes real changes
  const isSynced = useRef(false);

  // Detect whether state has real user data vs pure INITIAL_STATE
  // Used to allow saves when user makes changes even if initial Firestore load failed
  const hasRealData = (s) =>
    s.bookings.length > 0 ||
    (s.homepage?.bank_account || '') !== '' ||
    (s.homepage?.logo_url || '') !== '' ||
    (s.emailjs_config?.service_id || '') !== '' ||
    s.gallery.some(url => !url.includes('unsplash.com'));

  // Load state once from Firestore on mount
  useEffect(() => {
    getDoc(STATE_DOC)
      .then(snap => {
        if (snap.exists()) dispatch({ type: 'HYDRATE', payload: snap.data() });
        isSynced.current = true; // ✅ Read succeeded — saves always safe
      })
      .catch(() => {
        // Firestore read failed — isSynced stays false until user makes real changes
        // hasRealData() check below will unblock saves once user acts
      })
      .finally(() => {
        setReady(true);
        const loader = document.getElementById('app-loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 500);
        }
      });
  }, []);

  // Save state to Firestore (debounced 800ms) after initial load
  // GUARD: only save if synced OR state has real user data (prevents INITIAL_STATE overwrite)
  useEffect(() => {
    if (!ready) return;
    if (!isSynced.current && !hasRealData(state)) return;
    if (hasRealData(state)) isSynced.current = true; // promote once real data is present
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDoc(STATE_DOC, state).catch(() => {});
    }, 800);
  }, [state, ready]);

  // Immediate save when admins or cleaners change
  useEffect(() => {
    if (!ready) return;
    if (!isSynced.current && !hasRealData(state)) return;
    if (hasRealData(state)) isSynced.current = true;
    setDoc(STATE_DOC, state).catch(() => {});
  }, [state.admins, state.cleaners, ready]); // eslint-disable-line

  useEffect(() => {
    if(isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Auto-expire holds every 60 seconds
  useEffect(() => {
    dispatch({type:'EXPIRE_HOLDS'});
    const t = setInterval(()=>dispatch({type:'EXPIRE_HOLDS'}), 60000);
    return ()=>clearInterval(t);
  }, []);

  if (!ready) return null;

  return (
    <>
      <FontSetup/>
      {route==='customer' && <CustomerView state={state} dispatch={dispatch} setRoute={setRoute} isDark={isDark} toggleDark={()=>setIsDark(!isDark)}/>}
      {route==='admin-panel' && <AdminView state={state} dispatch={dispatch} setRoute={setRoute} isDark={isDark} toggleDark={()=>setIsDark(!isDark)}/>}
      {(route==='admin-login'||route==='cleaner-login') && <LoginPage state={state} dispatch={dispatch} setRoute={setRoute} setCleanerUser={setCleanerUser} defaultTab={route==='cleaner-login'?'cleaner':'admin'}/>}
      {route==='cleaner-panel' && cleanerUser && <CleanerView state={state} dispatch={dispatch} setRoute={setRoute} cleanerUser={cleanerUser} setCleanerUser={setCleanerUser}/>}
      {route==='cleaner-panel' && !cleanerUser && <LoginPage state={state} dispatch={dispatch} setRoute={setRoute} setCleanerUser={setCleanerUser} defaultTab="cleaner"/>}
    </>
  );
}
