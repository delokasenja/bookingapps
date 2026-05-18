import React, { useState, useEffect, useMemo, useRef, useReducer } from 'react';
import {
  Calendar as CalendarIcon, MapPin, Wifi, Wind, Car, Utensils, Tv,
  CheckCircle, XCircle, Clock, Home, Settings, CreditCard,
  Image as ImageIcon, LayoutDashboard, Trash2, Plus, ArrowLeft,
  MoreVertical, CalendarDays, BookOpen, User, Phone, List, ShieldAlert,
  ChevronRight, ChevronLeft, Moon, Sun, Eye, EyeOff, Search, ChevronUp, Bell, ShieldCheck, Shield,
  FileText, Printer, FileEdit
} from 'lucide-react';

// ================= FONT, DARK MODE & PRINT STYLES =================
const FontSetup = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

    * { font-family: 'Poppins', sans-serif !important; }
    html { scroll-behavior: smooth; }
    body { background-color: #F8FAFC; color: #111827; transition: background-color 0.3s, color 0.3s; }

    .app-shadow { box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
    .booking-shadow { box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    .bottom-bar-shadow { box-shadow: 0 -4px 24px rgba(0,0,0,0.06); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; }

    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* --- DARK MODE OVERRIDES --- */
    html.dark body { background-color: #0F172A; color: #F8FAFC; }
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

    /* --- PRINT MODE FOR RECEIPT PDF --- */
    @media print {
      body * { visibility: hidden; }
      #printable-receipt, #printable-receipt * { visibility: visible; }
      #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 20px; display: block !important; }
      .no-print { display: none !important; }
    }
  `}} />
);

// ================= IN-MEMORY DB =================
const INITIAL_STATE = {
  homepage: {
    homestay_name: 'Deloka Senja',
    tagline: 'Keselesaan Mewah di Tengah Alam Semulajadi',
    short_description: 'Alami percutian mendamaikan di villa premium kami. Konsep moden kontemporari khusus untuk keselesaan keluarga besar anda dengan privasi penuh.',
    whatsapp_number: '60123456789',
    address: 'Taman Deloka, Sungai Petani, Kedah',
    check_in_time: '15:00',
    check_out_time: '12:00',
  },
  pricing: { weekday: 250, weekend: 350, public_holiday: 400, school_holiday: 300, peak_season: 450, deposit: 100, cleaning_fee: 50, extra_guest_fee: 30, max_guests: 10, min_nights: 1 },
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
    { id: 1, name: 'WiFi Pantas', icon: 'Wifi' }, { id: 2, name: 'Aircond Penuh', icon: 'Wind' },
    { id: 3, name: 'Parkir 3 Kereta', icon: 'Car' }, { id: 4, name: 'Dapur Lengkap', icon: 'Utensils' },
    { id: 5, name: 'Smart TV', icon: 'Tv' }, { id: 6, name: 'Kolam Renang', icon: 'CheckCircle' }
  ],
  rules: [
    { id: 1, title: 'Waktu Daftar', desc: 'Check-in selepas 3.00 PM, Check-out sebelum 12.00 PM' },
    { id: 2, title: 'Larangan Merokok', desc: 'Tidak dibenarkan merokok di dalam rumah' },
    { id: 3, title: 'Haiwan Peliharaan', desc: 'Tidak dibenarkan membawa haiwan peliharaan' }
  ],
  bookings: [
    { id: 'BK1001', guest_name: 'Ahmad Albab', guest_phone: '0123456789', check_in: '2026-05-20', check_out: '2026-05-22', guests: 4, total_nights: 2, total_price: 600, payment_received: 100, admin_notes: 'Deposit RM100 dah transfer', status: 'pending', created_at: new Date().toISOString() }
  ],
  admins: [
    { id: 1, username: 'admin', password: 'admin123', role: 'Superadmin' }
  ]
};

// ================= REDUCER =================
const reducer = (state, action) => {
  switch(action.type) {
    case 'ADD_BOOKING': return {...state, bookings: [...state.bookings, action.payload]};
    case 'UPDATE_BOOK': return {...state, bookings: state.bookings.map(b=>b.id===action.id ? {...b, status:action.val} : b)};
    case 'DEL_BOOK': return {...state, bookings: state.bookings.filter(b=>b.id !== action.id)};
    case 'UPDATE_BOOK_DETAIL': return {...state, bookings: state.bookings.map(b=>b.id===action.id ? {...b, ...action.payload} : b)};
    case 'UPDATE_PRICING': return {...state, pricing: action.payload};
    case 'UPDATE_HOMEPAGE': return {...state, homepage: action.payload};
    case 'ADD_SPECIAL': return {...state, special_dates: [...state.special_dates, action.payload]};
    case 'DEL_SPECIAL': return {...state, special_dates: state.special_dates.filter(s=>s.id !== action.id)};
    case 'ADD_GALLERY_IMAGE': return {...state, gallery: [...state.gallery, action.payload]};
    case 'DEL_GALLERY_IMAGE': return {...state, gallery: state.gallery.filter((_,i) => i !== action.index)};
    case 'ADD_ADMIN': return {...state, admins: [...state.admins, action.payload]};
    case 'DEL_ADMIN': return {...state, admins: state.admins.filter(a=>a.id !== action.id)};
    default: return state;
  }
};

// ================= UTILS & LOGIC =================
const formatCurrency = (amount) => `RM ${parseFloat(amount).toFixed(2)}`;
const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = n => n < 10 ? '0' + n : n;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const checkOverlap = (newIn, newOut, bookings, specialDates, ignoreBookingId = null) => {
  const nIn = new Date(newIn).setHours(0,0,0,0);
  const nOut = new Date(newOut).setHours(0,0,0,0);

  const isBooked = bookings.some(b => {
    if (b.id === ignoreBookingId || b.status === 'cancelled') return false;
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
  let totalNights = 0;
  let subtotal = 0;
  const breakdown = [];
  const numGuests = Number(guests); // FIX: ensure guests is number

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
      const curr = currentDate.setHours(0,0,0,0);

      if (curr >= sStart && curr < sEnd && sd.status !== 'blocked') {
        const typePriority = { custom_price: 1, peak_season: 2, public_holiday: 3, school_holiday: 4 };
        const currPriority = typePriority[sd.type] || 5;

        if (currPriority < priority) {
          priority = currPriority;
          nightPrice = sd.price || pricing[sd.type] || nightPrice;
          nightType = sd.type.replace('_', ' ').toUpperCase();
        }
      }
    });

    breakdown.push({ date: dateStr, type: nightType, price: nightPrice });
    subtotal += parseFloat(nightPrice);
    start.setDate(start.getDate() + 1);
    totalNights++;
  }

  const extraGuests = Math.max(0, numGuests - 6);
  const extraGuestTotal = extraGuests * pricing.extra_guest_fee * totalNights;

  const grandTotal = subtotal + parseFloat(pricing.cleaning_fee) + extraGuestTotal;
  const balance = grandTotal - parseFloat(pricing.deposit);

  return { totalNights, breakdown, subtotal, cleaningFee: pricing.cleaning_fee, extraGuestFee: extraGuestTotal, grandTotal, deposit: pricing.deposit, balance };
};

const IconMap = { Wifi, Wind, Car, Utensils, Tv, CheckCircle };

// ================= REUSABLE COMPONENTS =================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const isErr = type === 'error';
  return (
    <div className="fixed top-24 md:top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in w-[90%] max-w-sm">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-[20px] shadow-xl ${isErr ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-900 text-white border border-gray-800'}`}>
        {isErr ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
        <span className="font-medium text-sm leading-tight">{message}</span>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-emerald-600 text-white p-3 rounded-full z-[60] shadow-lg hover:bg-emerald-700 transition-colors">
      <ChevronUp className="w-6 h-6"/>
    </button>
  );
};

const Footer = () => (
  <footer className="text-center py-8 mt-10 text-xs font-medium text-gray-400 border-t border-gray-200 dark:border-gray-800">
    <div className="flex justify-center items-center gap-2 mb-2">
       <ShieldCheck className="w-4 h-4 text-emerald-600"/> Sistem Tempahan Selamat
    </div>
    Deloka Senja Booking System © {new Date().getFullYear()} Hak Cipta Terpelihara
  </footer>
);

const MonthCalendar = ({ bookings, specialDates }) => {
  const [offset, setOffset] = useState(0);

  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => new Date(year, month, i + 1)));

  const getStatus = (date) => {
    if (!date) return null;
    const time = date.getTime();
    const today = new Date().setHours(0,0,0,0);
    if (time < today) return 'past';

    let isBlocked = false, isSpecial = false;
    specialDates.forEach(sd => {
      const s = new Date(sd.start).setHours(0,0,0,0);
      const e = new Date(sd.end).setHours(0,0,0,0);
      if (time >= s && time < e) {
        if (sd.status === 'blocked') isBlocked = true;
        else isSpecial = true;
      }
    });
    if (isBlocked) return 'blocked';

    const isBooked = bookings.some(b => b.status !== 'cancelled' && time >= new Date(b.check_in).setHours(0,0,0,0) && time < new Date(b.check_out).setHours(0,0,0,0));
    if (isBooked) return 'booked';
    if (isSpecial) return 'special';
    return 'available';
  };

  const monthNames = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 app-shadow w-full max-w-[450px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={(e) => { e.preventDefault(); setOffset(o => o - 1) }} className="p-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-[12px] transition-colors"><ChevronLeft className="w-5 h-5"/></button>
        <h4 className="font-bold text-gray-900 text-lg">{monthNames[month]} {year}</h4>
        <button onClick={(e) => { e.preventDefault(); setOffset(o => o + 1) }} className="p-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-[12px] transition-colors"><ChevronRight className="w-5 h-5"/></button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
        <div>Ah</div><div>Is</div><div>Se</div><div>Ra</div><div>Kh</div><div>Ju</div><div>Sa</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, i) => {
          const status = getStatus(date);
          let style = "";
          if (!date) return <div key={i}/>;
          if (status === 'past') style = "text-gray-300 opacity-50";
          else if (status === 'blocked' || status === 'booked') style = "bg-red-50 text-red-500 line-through decoration-red-400 font-medium";
          else if (status === 'special') style = "bg-emerald-100 text-emerald-800 font-bold ring-1 ring-emerald-300";
          else style = "bg-gray-50 text-gray-700 font-bold hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer border border-gray-100/50";

          return <div key={i} className={`h-10 w-full flex items-center justify-center rounded-[10px] text-sm transition-colors ${style}`}>{date.getDate()}</div>;
        })}
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
  const [guests, setGuests] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(0);
  const bookingRef = useRef(null);
  const formRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today;

  const priceCalc = useMemo(() => {
    if (checkIn && checkOut && new Date(checkIn) < new Date(checkOut)) {
      return calculatePrice(checkIn, checkOut, pricing, special_dates, guests);
    }
    return null;
  }, [checkIn, checkOut, pricing, special_dates, guests]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !guestName || !guestPhone) return setToast({ type: 'error', message: 'Sila lengkapkan borang.' });
    if (checkOverlap(checkIn, checkOut, bookings, special_dates)) return setToast({ type: 'error', message: 'Tarikh telah ditempah atau ditutup.' });

    const newBk = {
      id: `BK${Math.floor(Math.random() * 10000)}`,
      guest_name: guestName, guest_phone: guestPhone, check_in: checkIn, check_out: checkOut,
      guests: Number(guests), total_nights: priceCalc.totalNights, total_price: priceCalc.grandTotal, payment_received: 0, admin_notes: '', status: 'pending', created_at: new Date().toISOString()
    };
    dispatch({ type: 'ADD_BOOKING', payload: newBk });

    const waMsg = `*Tempahan ${homepage.homestay_name}*\n\nNama: ${guestName}\nIn: ${formatDate(checkIn)}\nOut: ${formatDate(checkOut)}\nMalam: ${priceCalc.totalNights}\nTetamu: ${guests}\nJumlah: RM ${priceCalc.grandTotal.toFixed(0)}\nDeposit: RM ${priceCalc.deposit.toFixed(0)}\n\nMohon pengesahan.`;
    window.open(`https://wa.me/${homepage.whatsapp_number}?text=${encodeURIComponent(waMsg)}`, '_blank');

    setCheckIn(''); setCheckOut(''); setGuestName(''); setGuestPhone(''); setGuests(1);
    setToast({ type: 'success', message: 'Berjaya direkod! Membuka WhatsApp...' });
  };

  return (
    <div className="min-h-screen pb-36 md:pb-6" id="home">

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex bg-white/80 backdrop-blur-xl px-8 py-4 justify-between items-center sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="font-bold text-xl text-emerald-600 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[12px] text-white flex items-center justify-center text-lg shadow-md">D</div>
          {homepage.homestay_name}
        </div>
        <div className="flex items-center gap-8 bg-gray-50/80 border border-gray-100 px-6 py-2.5 rounded-full">
           <a href="#home" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Utama</a>
           <a href="#facilities" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Kemudahan</a>
           <a href="#rules" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Peraturan</a>
           <a href="#availability" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Kekosongan</a>
           <a href="#booking" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Tempahan</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors text-gray-600">
             {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          <button onClick={() => setRoute('admin-login')} title="Admin Login" className="text-white hover:bg-gray-800 transition-colors flex items-center justify-center bg-gray-900 w-11 h-11 rounded-full shadow-md border border-gray-800">
            <Settings className="w-5 h-5"/>
          </button>
        </div>
      </nav>

      {/* Mobile Top Controls */}
      <div className="md:hidden absolute top-0 w-full p-5 flex justify-between z-20 pointer-events-none">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto shadow-sm"><ArrowLeft className="w-5 h-5"/></div>
        <button onClick={toggleDark} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto shadow-sm">
          {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        </button>
      </div>

      <div className="max-w-6xl mx-auto md:pt-8 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

        {/* LEFT CONTENT */}
        <div className="md:col-span-7 lg:col-span-7 xl:col-span-8 space-y-6 md:space-y-8">

          {/* Gallery Mobile */}
          <div className="md:hidden h-[45vh] w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-gray-900 relative">
            {gallery.map((img, i) => <img key={i} src={img} className="w-full h-full object-cover snap-center shrink-0 brightness-95" alt="Home"/>)}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"/>
          </div>

          {/* Gallery Desktop */}
          <div className="hidden md:block">
             <div className="w-full h-[400px] xl:h-[450px] rounded-[32px] overflow-hidden mb-4 relative bg-gray-900 shadow-sm border border-gray-100">
               <img src={gallery[selectedGalleryImg] || gallery[0]} className="w-full h-full object-cover transition-opacity duration-500 animate-fade-in" alt="Main" />
             </div>
             <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedGalleryImg(i)}
                    className={`shrink-0 w-32 h-[84px] rounded-[20px] overflow-hidden transition-all duration-300 ${selectedGalleryImg === i ? 'border-[3px] border-emerald-500 shadow-md scale-105 opacity-100' : 'border-[3px] border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i+1}`} />
                  </button>
                ))}
             </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-t-[32px] md:rounded-[32px] -mt-10 md:mt-0 relative z-10 p-6 md:p-8 app-shadow border border-gray-50 md:border-gray-100">
             <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight md:w-2/3">{homepage.homestay_name}</h1>
                <div className="text-left md:text-right bg-emerald-50 md:bg-transparent p-4 md:p-0 rounded-[16px] w-full md:w-auto">
                  <p className="text-3xl font-bold text-emerald-600">{formatCurrency(pricing.weekday)}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Bermula / Malam</p>
                </div>
             </div>
             <p className="flex items-center gap-2 text-gray-600 text-sm mb-6 font-medium bg-gray-50 w-fit px-4 py-2 rounded-full border border-gray-100"><MapPin className="w-4 h-4 text-emerald-600 shrink-0"/> {homepage.address}</p>
             <div className="h-px w-full bg-gray-100 my-6"/>
             <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500"/> Pengenalan</h3>
             <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">{homepage.short_description}</p>
          </div>

          {/* Facilities */}
          <div id="facilities" className="bg-white rounded-[32px] p-6 md:p-8 app-shadow border border-gray-100 scroll-mt-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><List className="w-5 h-5 text-emerald-500"/> Kemudahan Disediakan</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {facilities.map(f => {
                const IconC = IconMap[f.icon] || CheckCircle;
                return (
                  <div key={f.id} className="bg-gray-50 rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center border border-gray-100 hover:bg-emerald-50 transition-colors">
                    <IconC className="w-6 h-6 md:w-7 md:h-7 text-gray-700"/>
                    <span className="text-[10px] md:text-[11px] font-bold text-gray-600 uppercase tracking-wide">{f.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rules */}
          <div id="rules" className="bg-white rounded-[32px] p-6 md:p-8 app-shadow border border-gray-100 scroll-mt-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-emerald-500"/> Peraturan Rumah</h3>
            <div className="space-y-4">
               {rules.map(r => (
                 <div key={r.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-[20px] border border-gray-100">
                   <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"/>
                   <div><p className="font-bold text-sm text-gray-900">{r.title}</p><p className="text-sm text-gray-500 font-medium">{r.desc}</p></div>
                 </div>
               ))}
            </div>
          </div>

          {/* Calendar */}
          <div id="availability" className="bg-white rounded-[32px] p-6 md:p-8 app-shadow border border-gray-100 scroll-mt-24">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 justify-center text-center"><CalendarDays className="w-6 h-6 text-emerald-500"/> Semak Kekosongan</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium text-center">Lihat tarikh kosong di bawah sebelum membuat tempahan.</p>
            <MonthCalendar bookings={bookings} specialDates={special_dates} />
            <div className="flex flex-wrap gap-4 justify-center text-[11px] font-bold text-gray-600 bg-gray-50 p-4 rounded-[20px] mt-8 max-w-[500px] mx-auto border border-gray-100">
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div> Tersedia</span>
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center border border-red-200 text-red-400 text-[9px] font-bold">X</div> Ditempah / Tutup</span>
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-100 rounded border border-emerald-200"></div> Tarikh Khas</span>
            </div>
          </div>

        </div>

        {/* RIGHT BOOKING CARD */}
        <div className="md:col-span-5 lg:col-span-5 xl:col-span-4 relative">
          <div id="booking" ref={bookingRef} className="bg-white rounded-[32px] p-6 md:p-8 booking-shadow border border-gray-200 md:sticky md:top-28 mx-4 md:mx-0 scroll-mt-28">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900"><CreditCard className="w-6 h-6 text-emerald-600"/> Tempah Disini</h3>

            <form ref={formRef} onSubmit={handleSubmit}>
               {/* BOOKING DATE WIDGET */}
               <div className="border border-gray-300 rounded-[16px] overflow-hidden mb-6 bg-white focus-within:ring-2 focus-within:ring-emerald-500/50 transition-shadow">
                 <div className="flex border-b border-gray-300">
                   <div className="flex-1 p-3.5 border-r border-gray-300 relative focus-within:bg-emerald-50/30 transition-colors min-w-0">
                     <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-0.5">Tarikh Masuk</label>
                     <input type="date" min={today} value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none text-gray-900 cursor-pointer" required/>
                   </div>
                   <div className="flex-1 p-3.5 relative focus-within:bg-emerald-50/30 transition-colors min-w-0">
                     <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-0.5">Tarikh Keluar</label>
                     <input type="date" min={minCheckOut} value={checkOut} onChange={e=>setCheckOut(e.target.value)} disabled={!checkIn} className="w-full bg-transparent text-sm font-medium outline-none text-gray-900 disabled:opacity-40 cursor-pointer" required/>
                   </div>
                 </div>
                 <div className="p-3.5 relative focus-within:bg-emerald-50/30 transition-colors">
                    <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-0.5">Tetamu</label>
                    <select value={guests} onChange={e=>setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm font-medium outline-none text-gray-900 cursor-pointer appearance-none">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => <option key={n} value={n}>{n} Orang Tetamu</option>)}
                    </select>
                 </div>
               </div>

               {/* PERSONAL DETAILS */}
               <div className="space-y-3 mb-6">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input type="text" placeholder="Nama Penuh" value={guestName} onChange={e=>setGuestName(e.target.value)} className="w-full pl-11 p-3.5 bg-white border border-gray-300 rounded-[12px] text-sm font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" required/>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input type="tel" placeholder="No. WhatsApp" value={guestPhone} onChange={e=>setGuestPhone(e.target.value)} className="w-full pl-11 p-3.5 bg-white border border-gray-300 rounded-[12px] text-sm font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" required/>
                  </div>
               </div>

               <button type="submit" className="hidden md:flex w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-[12px] justify-center items-center transition-all shadow-lg shadow-emerald-200 dark:shadow-none text-lg tracking-wide">
                 Tempah Sekarang
               </button>

               <div className="hidden md:flex items-center justify-center gap-2 mt-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600"/> Tiada caj tersembunyi
               </div>

               {/* PRICE BREAKDOWN */}
               {priceCalc && (
                 <div className="mt-8 pt-6 border-t border-gray-200">
                   <div className="space-y-3 text-sm font-medium text-gray-600">
                     <div className="flex justify-between items-center">
                        <span className="underline decoration-gray-300 decoration-dashed underline-offset-4">
                          Sewa RM{(priceCalc.subtotal / priceCalc.totalNights).toFixed(0)} x {priceCalc.totalNights} mlm
                        </span>
                        <span className="text-gray-900">{formatCurrency(priceCalc.subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="underline decoration-gray-300 decoration-dashed underline-offset-4">Caj Pembersihan</span>
                        <span className="text-gray-900">{formatCurrency(priceCalc.cleaningFee)}</span>
                     </div>
                     {priceCalc.extraGuestFee > 0 && (
                        <div className="flex justify-between items-center text-orange-600">
                           <span className="underline decoration-orange-200 decoration-dashed underline-offset-4">Tetamu Tambahan</span>
                           <span>{formatCurrency(priceCalc.extraGuestFee)}</span>
                        </div>
                     )}
                   </div>

                   <div className="mt-4 pt-4 border-t border-gray-900 flex justify-between items-center font-bold text-xl text-gray-900">
                      <span>Jumlah Bayaran</span>
                      <span>{formatCurrency(priceCalc.grandTotal)}</span>
                   </div>
                   <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-[12px] text-center border border-emerald-100 dark:border-emerald-800/50">
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Bayar deposit {formatCurrency(priceCalc.deposit)} selepas pengesahan.</p>
                   </div>
                 </div>
               )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
      <ScrollToTop />

      {/* MOBILE FLOATING MENU */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-full p-2 flex justify-between items-center bottom-bar-shadow z-50">
        <div className="flex gap-1 pl-1">
          <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-emerald-600">
            <Home className="w-5 h-5"/>
          </button>
          <button onClick={() => document.getElementById('availability')?.scrollIntoView({behavior:'smooth'})} className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
            <CalendarDays className="w-5 h-5"/>
          </button>
          <button onClick={() => setRoute('admin-login')} className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5"/>
          </button>
        </div>

        <button
          onClick={() => {
            if(checkIn && checkOut && guestName && guestPhone) {
              formRef.current?.requestSubmit();
            } else {
              bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-gray-900 text-white pl-4 pr-5 py-2.5 rounded-full font-bold shadow-md active:scale-95 transition-transform flex items-center gap-3 mr-1"
        >
          <div className="text-left leading-tight">
             <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">
               {priceCalc ? `${priceCalc.totalNights} Malam` : 'Bermula'}
             </span>
             <span className="block text-sm">
               {priceCalc ? formatCurrency(priceCalc.grandTotal) : formatCurrency(pricing.weekday)}
             </span>
          </div>
          <div className="w-px h-5 bg-gray-700 mx-0.5"></div>
          <span className="text-sm">{checkIn && guestName ? 'Sahkan' : 'Tempah'}</span>
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
};


// ================= ADMIN LOGIN =================
const AdminLogin = ({ state, setRoute }) => {
  const [un, setUn] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('delokaAdminAuth');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUn(data.un); setPw(data.pw); setRemember(true);
      } catch {}
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const valid = state.admins.find(a => a.username === un && a.password === pw);
    if (valid) {
      if (remember) localStorage.setItem('delokaAdminAuth', JSON.stringify({un, pw}));
      else localStorage.removeItem('delokaAdminAuth');
      setRoute('admin-panel');
    } else {
      setToast({type: 'error', message: 'ID atau Kata Laluan Salah!'});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-[32px] app-shadow border border-gray-100">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 dark:shadow-none">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Admin Panel</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="ID Pengguna" value={un} onChange={e=>setUn(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold focus:border-emerald-500 focus:bg-white transition-colors text-gray-900" required />
          <div className="relative">
             <input type={showPw ? 'text' : 'password'} placeholder="Kata Laluan" value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold focus:border-emerald-500 focus:bg-white transition-colors text-gray-900" required />
             <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
          </div>
          <div className="flex items-center gap-2 px-1">
             <input type="checkbox" id="rmb" checked={remember} onChange={e=>setRemember(e.target.checked)} className="w-4 h-4 cursor-pointer accent-emerald-600"/>
             <label htmlFor="rmb" className="text-sm font-bold text-gray-600 cursor-pointer">Ingat Kata Laluan</label>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-[16px] hover:bg-black transition-colors mt-2 shadow-md">Log Masuk</button>
        </form>
        <button onClick={() => setRoute('customer')} className="w-full mt-6 text-sm text-gray-500 hover:text-emerald-600 font-bold text-center transition-colors flex justify-center items-center gap-2"><ArrowLeft className="w-4 h-4"/> Laman Utama</button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
};


// ================= ADMIN PANEL =================
const AdminView = ({ state, dispatch, setRoute, isDark, toggleDark }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const AdminDashboard = () => {
    const today = new Date().setHours(0,0,0,0);
    const next7Days = today + 7 * 86400000;
    const upcoming = state.bookings.filter(b => b.status === 'confirmed' && new Date(b.check_in).getTime() >= today && new Date(b.check_in).getTime() <= next7Days);
    const jualanSah = state.bookings.filter(b => b.status === 'confirmed').reduce((sum,b)=>sum+b.total_price, 0);
    const unjuranRugi = state.bookings.filter(b => b.status === 'cancelled').reduce((sum,b)=>sum+b.total_price, 0);
    const totalTetamu = state.bookings.filter(b => b.status === 'confirmed').reduce((sum,b)=>sum+Number(b.guests), 0);

    return (
      <div className="animate-fade-in space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-emerald-600"/> Dashboard Keseluruhan</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{t: 'Total Tempahan', v: state.bookings.length, c: 'text-gray-900'},
            {t: 'Jualan Bersih', v: formatCurrency(jualanSah), c: 'text-emerald-600'},
            {t: 'Batal (Unjuran Rugi)', v: formatCurrency(unjuranRugi), c: 'text-red-500'},
            {t: 'Jumlah Tetamu Sah', v: `${totalTetamu} Orang`, c: 'text-blue-600'}
           ].map((s,i) => (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 app-shadow">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{s.t}</p>
              <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 app-shadow">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-orange-500"/> Peringatan: Tempahan 7 Hari Terdekat</h3>
          {upcoming.length > 0 ? (
             <div className="space-y-3">
               {upcoming.map(b => (
                 <div key={b.id} className="bg-orange-50/50 border border-orange-100 p-4 rounded-[20px] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{b.guest_name}</p>
                      <p className="text-xs font-bold text-gray-500">{formatDate(b.check_in)} - {formatDate(b.check_out)} | {b.guest_phone}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1.5 rounded-[8px] font-bold uppercase">Sah</span>
                 </div>
               ))}
             </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-[20px] text-center border border-gray-100">
               <p className="text-sm font-bold text-gray-400">Tiada tempahan terdekat untuk 7 hari akan datang.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AdminBookings = () => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [editPayment, setEditPayment] = useState('');
    const [editNotes, setEditNotes] = useState('');

    const filtered = state.bookings.filter(b => {
      const matchStatus = filter === 'all' || b.status === filter;
      const matchSearch = b.guest_name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });

    const openEditModal = (b) => {
      setExpandedBooking(b);
      setEditPayment(b.payment_received || 0);
      setEditNotes(b.admin_notes || '');
    };

    const saveEditDetails = () => {
      dispatch({ type: 'UPDATE_BOOK_DETAIL', id: expandedBooking.id, payload: { payment_received: Number(editPayment), admin_notes: editNotes } });
      setToast({ type: 'success', message: 'Maklumat tempahan dikemaskini.' });
      setExpandedBooking(null);
    };

    return (
      <div className="animate-fade-in space-y-6 relative">
        <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-600"/> Senarai Tempahan</h2>

        <div className="bg-white p-4 rounded-[24px] border border-gray-100 app-shadow flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex gap-2 bg-gray-50 p-1.5 rounded-[16px] border border-gray-100 w-full md:w-auto overflow-x-auto no-scrollbar">
              {[ {k:'all', l:'Semua'}, {k:'pending', l:'Pending'}, {k:'confirmed', l:'Sah'}, {k:'cancelled', l:'Batal'}].map(f => (
                <button key={f.k} onClick={()=>setFilter(f.k)} className={`px-4 py-2 text-xs font-bold rounded-[12px] transition-colors whitespace-nowrap ${filter===f.k ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}>{f.l}</button>
              ))}
           </div>
           <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
             <input type="text" placeholder="Cari Nama / ID..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 p-2.5 text-sm font-bold bg-gray-50 rounded-[12px] outline-none border border-gray-100 focus:border-emerald-500 transition-colors"/>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filtered.map(b => (
            <div key={b.id} onClick={() => openEditModal(b)} className="bg-white p-5 rounded-[24px] border border-gray-100 app-shadow flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-emerald-500 cursor-pointer transition-colors group">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-white shrink-0 ${b.status==='pending'?'bg-orange-400': b.status==='confirmed'?'bg-emerald-500':'bg-red-400'}`}>
                   {b.guest_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap"><p className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">{b.guest_name}</p> <span className="text-xs font-bold text-gray-400">({b.id})</span></div>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{b.guest_phone} • {formatDate(b.check_in)} - {formatDate(b.check_out)} • {b.total_nights} mlm</p>
                  <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wider ${b.status==='pending'?'bg-orange-100 text-orange-700': b.status==='confirmed'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{b.status}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(b.total_price)}</span>
                    {b.admin_notes && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-[6px] flex items-center gap-1"><FileEdit className="w-3 h-3"/> Ada Nota</span>}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 hidden md:block shrink-0"/>
            </div>
          ))}
          {filtered.length===0 && <div className="bg-white py-12 rounded-[24px] border border-gray-100 text-center"><p className="text-gray-500 font-bold">Tiada rekod tempahan dijumpai.</p></div>}
        </div>

        {/* MODAL DETAIL */}
        {expandedBooking && (
           <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-gray-900/60 backdrop-blur-sm no-print" onClick={(e)=>{ if(e.target===e.currentTarget) setExpandedBooking(null); }}>
              <div className="bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] md:max-h-[90vh]">

                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">Maklumat Tempahan <span className="text-emerald-600 text-base">#{expandedBooking.id}</span></h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">Dibuat pada: {formatDate(expandedBooking.created_at)}</p>
                    </div>
                    <button onClick={() => setExpandedBooking(null)} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"><XCircle className="w-5 h-5"/></button>
                 </div>

                 <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                       <div className="bg-gray-50 p-4 rounded-[20px] border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Maklumat Pelanggan</p>
                          <p className="font-bold text-gray-900">{expandedBooking.guest_name}</p>
                          <p className="text-sm text-gray-600">{expandedBooking.guest_phone}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-[20px] border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tarikh & Tetamu</p>
                          <p className="font-bold text-gray-900">{formatDate(expandedBooking.check_in)} → {formatDate(expandedBooking.check_out)}</p>
                          <p className="text-sm text-gray-600">{expandedBooking.total_nights} Malam • {expandedBooking.guests} Orang</p>
                       </div>
                    </div>

                    <div className="mb-6 p-5 bg-emerald-50/50 rounded-[20px] border border-emerald-100">
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3">Kewangan</p>
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-gray-600">Jumlah Keseluruhan</span>
                          <span className="font-bold text-gray-900">{formatCurrency(expandedBooking.total_price)}</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-emerald-200/50 pt-2 mt-2">
                          <span className="text-sm font-bold text-emerald-800">Telah Dibayar (RM)</span>
                          <input type="number" value={editPayment} onChange={e=>setEditPayment(e.target.value)} className="w-32 p-2 bg-white border border-emerald-200 rounded-[12px] outline-none font-bold text-right focus:border-emerald-500"/>
                       </div>
                       <div className="flex justify-between items-center border-t border-emerald-200/50 pt-2 mt-2">
                          <span className="text-sm font-bold text-red-600">Baki Tertunggak</span>
                          <span className="font-bold text-red-600">{formatCurrency(expandedBooking.total_price - (Number(editPayment)||0))}</span>
                       </div>
                    </div>

                    <div className="mb-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Admin (Sulit)</p>
                       <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} placeholder="Contoh: Dah bayar deposit, minta extra bantal..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none font-medium h-24 focus:border-emerald-500 text-sm resize-none"/>
                    </div>
                 </div>

                 <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 items-center justify-between shrink-0">
                    <div className="flex gap-2">
                       {expandedBooking.status !== 'confirmed' && <button onClick={()=>{dispatch({type:'UPDATE_BOOK', id:expandedBooking.id, val:'confirmed'}); setExpandedBooking({...expandedBooking, status:'confirmed'})}} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[16px] text-sm font-bold">Sah Tempahan</button>}
                       {expandedBooking.status !== 'cancelled' && <button onClick={()=>{dispatch({type:'UPDATE_BOOK', id:expandedBooking.id, val:'cancelled'}); setExpandedBooking({...expandedBooking, status:'cancelled'})}} className="px-4 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-[16px] text-sm font-bold">Batal</button>}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => window.print()} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[16px] text-sm font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Cetak Resit</button>
                       <button onClick={saveEditDetails} className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-[16px] text-sm font-bold">Simpan</button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* PRINTABLE RECEIPT */}
        {expandedBooking && (
          <div id="printable-receipt" className="hidden">
            <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#000' }}>
               <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                  <h1 style={{ fontSize: '28px', margin: '0 0 5px 0' }}>{state.homepage.homestay_name}</h1>
                  <p style={{ margin: 0, color: '#555' }}>{state.homepage.address}</p>
                  <p style={{ margin: '5px 0 0 0', color: '#555' }}>Tel: +{state.homepage.whatsapp_number}</p>
               </div>
               <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', fontSize: '22px', textTransform: 'uppercase', letterSpacing: '2px' }}>INVOIS / RESIT TEMPAHAN</h2>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Dikeluarkan Kepada:</strong></p>
                    <p style={{ margin: '0 0 5px 0' }}>{expandedBooking.guest_name}</p>
                    <p style={{ margin: 0 }}>{expandedBooking.guest_phone}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>No. Rujukan:</strong> {expandedBooking.id}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Tarikh Tempahan:</strong> {formatDate(expandedBooking.created_at)}</p>
                    <p style={{ margin: 0 }}><strong>Status:</strong> {expandedBooking.status.toUpperCase()}</p>
                  </div>
               </div>
               {/* FIX: w:'100%' → width:'100%' */}
               <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Keterangan</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Masa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}><strong>Tarikh Masuk (Check-in)</strong></td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{formatDate(expandedBooking.check_in)} selepas {state.homepage.check_in_time}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}><strong>Tarikh Keluar (Check-out)</strong></td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{formatDate(expandedBooking.check_out)} sebelum {state.homepage.check_out_time}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}><strong>Maklumat Penginapan</strong></td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{expandedBooking.total_nights} Malam, {expandedBooking.guests} Tetamu</td>
                    </tr>
                  </tbody>
               </table>
               <div style={{ width: '300px', marginLeft: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                     <span>Jumlah Keseluruhan:</span>
                     <strong>{formatCurrency(expandedBooking.total_price)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #000' }}>
                     <span>Telah Dibayar:</span>
                     <strong>{formatCurrency(Number(editPayment) || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px' }}>
                     <strong>BAKI TERTUNGGAK:</strong>
                     <strong>{formatCurrency(expandedBooking.total_price - (Number(editPayment)||0))}</strong>
                  </div>
               </div>
               <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  Terima kasih kerana memilih {state.homepage.homestay_name}. Dokumen ini janaan komputer dan tidak memerlukan tandatangan.
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AdminSpecialDates = () => {
    const [form, setForm] = useState({start:'', end:'', type:'public_holiday', price:0, status:'available', note:''});
    const addDate = (e) => {
      e.preventDefault();
      dispatch({type:'ADD_SPECIAL', payload:{...form, id:Date.now()}});
      setToast({type:'success', message:'Tarikh Khas Ditambah'});
      setForm({start:'', end:'', type:'public_holiday', price:0, status:'available', note:''});
    };
    return (
      <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-emerald-600"/> Tarikh Khas & Penutupan (Block)</h2>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[20px] text-sm text-emerald-800">
           Bina tarikh untuk menetapkan harga khas semasa cuti, atau "Tutup (Block)" tarikh untuk kegunaan peribadi/penyelenggaraan.
        </div>

        <form onSubmit={addDate} className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 flex flex-wrap gap-4 items-end app-shadow">
           <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mula</label><input type="date" required value={form.start} onChange={e=>setForm({...form,start:e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"/></div>
           <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Tamat</label><input type="date" required min={form.start} value={form.end} onChange={e=>setForm({...form,end:e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"/></div>
           <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Jenis</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900 cursor-pointer">
                 <option value="public_holiday">Cuti Umum</option><option value="school_holiday">Cuti Sekolah</option><option value="peak_season">Peak Season</option><option value="custom_price">Custom Price</option><option value="maintenance">Penyelenggaraan (Block)</option>
              </select>
           </div>
           <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900 cursor-pointer"><option value="available">Boleh Tempah</option><option value="blocked">Tutup (Block)</option></select>
           </div>
           {form.status !== 'blocked' && (
             <div className="flex-1 min-w-[100px]"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Harga (RM)</label><input type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"/></div>
           )}
           <div className="flex-1 min-w-[200px] w-full"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nota Catatan</label><input type="text" placeholder="Cth: Cuti Raya / Paip Bocor" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"/></div>
           <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-[16px] font-bold flex items-center justify-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Tambah Tarikh</button>
        </form>

        <div className="space-y-3">
          {state.special_dates.map(sd => (
            <div key={sd.id} className={`bg-white p-5 rounded-[24px] flex flex-col md:flex-row justify-between md:items-center border app-shadow ${sd.status === 'blocked' ? 'border-red-200' : 'border-gray-100'}`}>
               <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wider text-white ${sd.status === 'blocked' ? 'bg-red-500' : 'bg-emerald-500'}`}>{sd.status === 'blocked' ? 'Tutup' : 'Boleh Tempah'}</span>
                     <p className="font-bold text-gray-900 text-lg">{formatDate(sd.start)} <span className="text-gray-400 text-sm mx-1">hingga</span> {formatDate(sd.end)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-500 flex items-center gap-2 mt-1">
                     {sd.type.replace('_', ' ').toUpperCase()}
                     {sd.status !== 'blocked' && <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-[6px]">• RM{sd.price}</span>}
                  </p>
                  {sd.note && <p className="text-xs text-gray-400 mt-2">Nota: {sd.note}</p>}
               </div>
               <button onClick={()=>{dispatch({type:'DEL_SPECIAL', id:sd.id}); setToast({type:'success', message:'Tarikh Dibuang'})}} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-[16px] transition-colors mt-3 md:mt-0 self-start md:self-auto"><Trash2 className="w-5 h-5"/></button>
            </div>
          ))}
          {state.special_dates.length === 0 && <p className="text-center text-gray-500 py-10 font-bold">Tiada tarikh khas direkodkan.</p>}
        </div>
      </div>
    );
  };

  const AdminGallery = () => {
    const [newImg, setNewImg] = useState('');
    const handleAdd = (e) => {
      e.preventDefault();
      if(!newImg) return;
      dispatch({type:'ADD_GALLERY_IMAGE', payload: newImg});
      setNewImg('');
      setToast({type:'success', message:'Gambar ditambah ke Laman Utama.'});
    };
    return (
      <div className="animate-fade-in space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6 text-emerald-600"/> Urus Galeri Utama</h2>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[20px] text-sm text-emerald-800">
           Gambar yang ditambah di sini akan dipaparkan secara automatik di laman utama pelanggan. Gambar Pertama akan menjadi "Hero Image".
        </div>
        <form onSubmit={handleAdd} className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 flex flex-wrap gap-4 items-end app-shadow">
           <div className="flex-1 min-w-[250px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">URL Pautan Gambar Baru</label>
              <input type="url" required placeholder="Contoh: https://images.unsplash.com/..." value={newImg} onChange={e=>setNewImg(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900 focus:border-emerald-500 transition-colors"/>
           </div>
           <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-[16px] font-bold flex justify-center items-center gap-2 shadow-md"><Plus className="w-5 h-5"/> Tambah</button>
        </form>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {state.gallery.map((img, i) => (
             <div key={i} className="relative group rounded-[24px] overflow-hidden aspect-video bg-gray-100 border border-gray-200 app-shadow">
                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i+1}`}/>
                <button onClick={()=>{dispatch({type:'DEL_GALLERY_IMAGE', index:i}); setToast({type:'success', message:'Gambar Dibuang'})}} className="absolute top-3 right-3 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 className="w-4 h-4"/></button>
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider rounded-[10px] backdrop-blur-md">
                   {i === 0 ? 'Utama (Hero)' : `Gambar ${i+1}`}
                </div>
             </div>
           ))}
           {state.gallery.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-[32px]">Tiada gambar di dalam galeri.</div>}
        </div>
      </div>
    );
  };

  const AdminFormConfig = ({ title, data, actionType, icon: Icon, desc }) => {
    const [form, setForm] = useState(data);
    return (
      <div className="animate-fade-in space-y-6 max-w-4xl">
        <h2 className="text-2xl font-bold flex items-center gap-2">{Icon && <Icon className="w-6 h-6 text-emerald-600"/>} {title}</h2>
        {desc && <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[20px] text-sm text-emerald-800">{desc}</div>}
        <form onSubmit={e => { e.preventDefault(); dispatch({type: actionType, payload: form}); setToast({type:'success', message:'Berjaya disimpan.'}); }} className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 app-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {Object.keys(form).map(key => (
              <div key={key} className={key.includes('description') ? 'md:col-span-2' : ''}>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{key.replace(/_/g, ' ')}</label>
                {typeof form[key] === 'number' ?
                  <input type="number" value={form[key]} onChange={e=>setForm({...form, [key]: Number(e.target.value)})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold focus:border-emerald-500 transition-colors text-gray-900" required/>
                  : key.includes('description') ?
                  <textarea value={form[key]} onChange={e=>setForm({...form, [key]: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[20px] outline-none font-medium h-32 focus:border-emerald-500 transition-colors text-gray-900 leading-relaxed resize-none" required/>
                  : <input type={key.includes('time')?'time':'text'} value={form[key]} onChange={e=>setForm({...form, [key]: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold focus:border-emerald-500 transition-colors text-gray-900" required/>
                }
              </div>
            ))}
          </div>
          <button type="submit" className="w-full md:w-auto md:px-12 bg-gray-900 text-white font-bold py-4 rounded-[16px] hover:bg-black transition-colors shadow-md">Simpan Tetapan</button>
        </form>
      </div>
    );
  };

  const AdminUsers = () => {
    const [un, setUn] = useState(''); const [pw, setPw] = useState(''); const [role, setRole] = useState('Admin');
    return (
      <div className="animate-fade-in space-y-6 max-w-3xl">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-600"/> Urus Admin Panel</h2>
        <form onSubmit={(e)=>{
           e.preventDefault();
           if(un && pw) { dispatch({type:'ADD_ADMIN', payload:{id:Date.now(), username:un, password:pw, role}}); setUn(''); setPw(''); setToast({type:'success', message:'Admin ditambah.'}); }
        }} className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 app-shadow flex flex-wrap gap-4 items-end">
           <div className="flex-1 min-w-[150px]"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">ID Admin</label><input type="text" required value={un} onChange={e=>setUn(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"/></div>
           <div className="flex-1 min-w-[150px]"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">Kata Laluan</label><input type="text" required value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"/></div>
           <div className="flex-1 min-w-[120px]"><label className="text-xs font-bold text-gray-500 uppercase block mb-2">Peranan</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[16px] outline-none font-bold text-gray-900"><option value="Superadmin">Superadmin</option><option value="Admin">Admin Biasa</option></select>
           </div>
           <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 h-[48px] rounded-[16px] font-bold flex justify-center items-center gap-2 shadow-md"><Plus className="w-4 h-4"/> Tambah</button>
        </form>

        <div className="bg-white rounded-[32px] border border-gray-100 app-shadow overflow-hidden">
          {state.admins.map(a => (
             <div key={a.id} className="p-5 border-b border-gray-50 flex justify-between items-center last:border-0">
               <div><p className="font-bold text-gray-900">{a.username}</p><p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">{a.role}</p></div>
               {a.username !== 'admin' && <button onClick={()=>{dispatch({type:'DEL_ADMIN', id:a.id}); setToast({type:'success', message:'Admin Dibuang'})}} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-[12px] transition-colors"><Trash2 className="w-4 h-4"/></button>}
             </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    {id:'dashboard', icon: LayoutDashboard, label: 'Dashboard'},
    {id:'bookings', icon: BookOpen, label: 'Tempahan Terperinci'},
    {id:'special', icon: CalendarIcon, label: 'Tarikh Khas & Block'},
    {id:'pricing', icon: CreditCard, label: 'Harga Asas'},
    {id:'gallery', icon: ImageIcon, label: 'Urus Galeri Web'},
    {id:'homepage', icon: Home, label: 'Urus Laman Utama'},
    {id:'users', icon: Shield, label: 'Pengurusan Admin'},
  ];

  const renderTab = () => {
    switch(activeTab) {
      case 'dashboard': return <AdminDashboard/>;
      case 'bookings': return <AdminBookings/>;
      case 'special': return <AdminSpecialDates/>;
      case 'pricing': return <AdminFormConfig title="Tetapan Harga Semasa" data={state.pricing} actionType="UPDATE_PRICING" icon={CreditCard}/>;
      case 'gallery': return <AdminGallery/>;
      case 'homepage': return <AdminFormConfig title="Informasi Laman Utama" data={state.homepage} actionType="UPDATE_HOMEPAGE" icon={Home} desc="Perubahan di sini akan dikemaskini secara 'live' ke laman pelanggan."/>;
      case 'users': return <AdminUsers/>;
      default: return <AdminDashboard/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex relative font-sans">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-gray-100 z-10 h-screen fixed top-0 left-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
           <h1 className="text-lg font-bold text-emerald-600 flex items-center gap-2"><Settings className="w-5 h-5"/> Admin Panel</h1>
           <button onClick={toggleDark} className="text-gray-400 hover:text-gray-900 transition-colors">{isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}</button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-2 pb-24">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-3 mb-4">Menu Sistem Operasi</p>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-4 rounded-[16px] font-bold text-xs transition-colors ${activeTab===t.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <t.icon className="w-5 h-5"/> {t.label}
            </button>
          ))}
        </div>
        <div className="p-5 border-t border-gray-50 bg-white z-20 absolute bottom-0 w-full">
           <button onClick={()=>setRoute('customer')} className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-[16px] font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><ArrowLeft className="w-4 h-4"/> Log Keluar Platform</button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-white p-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <button onClick={()=>setRoute('customer')} className="shrink-0 px-4 py-2 bg-red-50 text-red-600 rounded-full font-bold text-xs flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Keluar</button>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`shrink-0 px-4 py-2.5 rounded-full font-bold text-xs transition-colors ${activeTab===t.id?'bg-gray-900 text-white':'bg-gray-50 text-gray-600'}`}>{t.label}</button>
        ))}
      </div>

      <main className="flex-1 p-6 md:pl-[310px] md:pr-10 md:py-10 max-w-7xl mx-auto w-full min-h-screen">
        {renderTab()}
      </main>

      <ScrollToTop />
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
};


// ================= MAIN APP =================
export default function DelokaSenjaApp() {
  const [route, setRoute] = useState('customer');
  const [isDark, setIsDark] = useState(false);
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
     if(isDark) document.documentElement.classList.add('dark');
     else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <>
      <FontSetup />
      {route === 'customer' && <CustomerView state={state} dispatch={dispatch} setRoute={setRoute} isDark={isDark} toggleDark={()=>setIsDark(!isDark)} />}
      {route === 'admin-login' && <AdminLogin state={state} setRoute={setRoute} />}
      {route === 'admin-panel' && <AdminView state={state} dispatch={dispatch} setRoute={setRoute} isDark={isDark} toggleDark={()=>setIsDark(!isDark)} />}
    </>
  );
}
