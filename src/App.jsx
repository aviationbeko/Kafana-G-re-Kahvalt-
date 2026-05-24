import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Plus, Minus, Check, Coffee, FileText, X, 
  UtensilsCrossed, Receipt, ChevronRight, History, 
  Archive, Settings, Store, Clock, Save, Trash2, Database,
  Wifi, WifiOff, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuCategories as defaultMenu } from './data';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'orders', 'archive', 'settings', 'menu'
  const [menuCategories, setMenuCategories] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [currentDayOrders, setCurrentDayOrders] = useState([]);
  const [archives, setArchives] = useState([]);
  
  const [showReport, setShowReport] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Supabase durumu
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const isInitialized = useRef(false); // İlk yüklemede kayıt yapmasını engelle

  // Hoşgeldin Ekranı (Splash Screen) State
  const [showSplash, setShowSplash] = useState(true);

  // Şifre Doğrulama Modal State'leri
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null); // { categoryName, item }

  // İndirim ve Menü State'leri
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState('');

  // Cihazdan resim seçme yardımcısı (Base64)
  const handleImageChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Resim dosyası çok büyük (Maksimum 2MB olmalıdır).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Ürün Düzenleme Modal State'leri
  const [editingItem, setEditingItem] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editChefRecommend, setEditChefRecommend] = useState(false);
  const [editVegan, setEditVegan] = useState(false);
  const [editSpicy, setEditSpicy] = useState(false);
  const [editHasAllergen, setEditHasAllergen] = useState(false);
  const [editExtras, setEditExtras] = useState([]);

  // POS Ekstra Seçim Modalı
  const [extrasModalItem, setExtrasModalItem] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Sipariş Düzenleme Modalı
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [editOrderDiscount, setEditOrderDiscount] = useState(0);
  const [showAddItemToOrder, setShowAddItemToOrder] = useState(false);

  // Arşiv Tarih Filtresi State'leri
  const [archiveStartDate, setArchiveStartDate] = useState('');
  const [archiveEndDate, setArchiveEndDate] = useState('');

  // Gider (Gün Sonu Raporu)
  const [dayExpenses, setDayExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // States for Settings (Adding items)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemImage, setNewItemImage] = useState('');

  // Arayuz Tema Ayarlari (1. Renk Cam Gobegi, 2. Renk Mavi)
  const [themeColor1, setThemeColor1] = useState('#06b6d4'); 
  const [themeColor2, setThemeColor2] = useState('#2563eb'); 
  const [autoCycle, setAutoCycle] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const cycleRef = useRef(null);

  // Tema renkleri degisince CSS degiskenlerini guncelle
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', themeColor1);
    document.documentElement.style.setProperty('--color-accent', themeColor2);
    
    // Arkaplan icin hafif acik tonlar uret
    document.documentElement.style.setProperty('--color-bg1', themeColor1 + '55');
    document.documentElement.style.setProperty('--color-bg2', themeColor2 + '55');
    
    // Varsayilan arayüz degiskenleri
    document.documentElement.style.setProperty('--font-family', "'Outfit', sans-serif");
    document.documentElement.style.setProperty('--radius', '12px');
    document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.65)');
    document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.5)');
    document.documentElement.style.setProperty('--text-main', '#1e293b');
    document.documentElement.style.setProperty('--text-muted', '#475569');
  }, [themeColor1, themeColor2]);

  // Otomatik renk dongusu
  useEffect(() => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    if (!autoCycle) return;
    let swapped = false;
    cycleRef.current = setInterval(() => {
      swapped = !swapped;
      if (swapped) {
        document.documentElement.style.setProperty('--color-primary', themeColor2);
        document.documentElement.style.setProperty('--color-accent', themeColor1);
        document.documentElement.style.setProperty('--color-bg1', themeColor2 + '55');
        document.documentElement.style.setProperty('--color-bg2', themeColor1 + '55');
      } else {
        document.documentElement.style.setProperty('--color-primary', themeColor1);
        document.documentElement.style.setProperty('--color-accent', themeColor2);
        document.documentElement.style.setProperty('--color-bg1', themeColor1 + '55');
        document.documentElement.style.setProperty('--color-bg2', themeColor2 + '55');
      }
    }, 4000);
    return () => clearInterval(cycleRef.current);
  }, [autoCycle, themeColor1, themeColor2]);

  // Hosgeldin Ekrani 3.5 saniye sonra otomatik kapanma zamanlayicisi
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);



  // =============================================
  // SUPABASE: Veri Yükleme (İlk Açılış)
  // =============================================
  useEffect(() => {
    const loadFromSupabase = async () => {
      setIsLoading(true);
      try {
        // 1) Menüyü yükle
        const { data: menuData, error: menuErr } = await supabase
          .from('kafana_gore_menu')
          .select('data')
          .eq('id', 'main')
          .single();

        if (menuErr && menuErr.code !== 'PGRST116') throw menuErr;

        if (menuData?.data) {
          setMenuCategories(menuData.data);
        } else {
          // İlk açılış: varsayılan menüyü Supabase'e kaydet
          await supabase.from('kafana_gore_menu').upsert({ id: 'main', data: defaultMenu });
          setMenuCategories(defaultMenu);
        }

        // 2) Güncel siparişleri yükle
        const { data: ordersData, error: ordersErr } = await supabase
          .from('kafana_gore_orders')
          .select('*')
          .order('created_at', { ascending: true });

        if (ordersErr) throw ordersErr;
        if (ordersData) {
          const orders = ordersData.map(o => ({
            id: o.id,
            time: o.time,
            items: o.items,
            discount: o.discount,
            total: o.total
          }));
          setCurrentDayOrders(orders);
        }

        // 3) Arşivleri yükle
        const { data: archData, error: archErr } = await supabase
          .from('kafana_gore_archives')
          .select('*')
          .order('created_at', { ascending: false });

        if (archErr) throw archErr;
        if (archData) {
          const arcs = archData.map(a => ({ id: a.id, ...a.data }));
          setArchives(arcs);
        }

        // 4) Tema ayarlarını yükle
        const { data: settingsData } = await supabase
          .from('kafana_gore_settings')
          .select('*')
          .eq('id', 'main')
          .single();

        if (settingsData) {
          // Renkler kodda sabitlenmistir, sadece auto_cycle yuklenir
          if (settingsData.auto_cycle !== undefined) setAutoCycle(settingsData.auto_cycle);
        }

        setIsOnline(true);

      } catch (err) {
        console.error('Supabase yükleme hatası:', err);
        setIsOnline(false);
        showToast('Bağlantı hatası! Yerel veri kullanılıyor.');
        // Yedek: localStorage
        const savedMenu = localStorage.getItem('kafana-gore-menu');
        setMenuCategories(savedMenu ? JSON.parse(savedMenu) : defaultMenu);
        const savedOrders = localStorage.getItem('kafana-gore-current-orders');
        if (savedOrders) setCurrentDayOrders(JSON.parse(savedOrders));
        const savedArchives = localStorage.getItem('kafana-gore-archives');
        if (savedArchives) setArchives(JSON.parse(savedArchives));
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    loadFromSupabase();
  }, []);

  useEffect(() => {
    if (menuCategories.length > 0 && !newItemCategory) {
      setNewItemCategory(menuCategories[0].category);
    }
  }, [menuCategories]);

  // =============================================
  // SUPABASE: Menü değişince buluta kaydet
  // =============================================
  useEffect(() => {
    if (!isInitialized.current || menuCategories.length === 0) return;
    const saveMenu = async () => {
      try {
        await supabase.from('kafana_gore_menu').upsert({ id: 'main', data: menuCategories, updated_at: new Date().toISOString() });
        // Yerel yedek
        localStorage.setItem('kafana-gore-menu', JSON.stringify(menuCategories));
      } catch (err) {
        console.error('Menü kaydetme hatası:', err);
      }
    };
    const timer = setTimeout(saveMenu, 800); // 800ms debounce
    return () => clearTimeout(timer);
  }, [menuCategories]);

  // Yerel yedek
  useEffect(() => {
    localStorage.setItem('kafana-gore-current-orders', JSON.stringify(currentDayOrders));
  }, [currentDayOrders]);

  useEffect(() => {
    localStorage.setItem('kafana-gore-archives', JSON.stringify(archives));
  }, [archives]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // POS Actions
  const addToOrder = (item) => {
    if (item.extras && item.extras.length > 0) {
      setExtrasModalItem(item);
      setSelectedExtras([]);
    } else {
      addToOrderWithExtras(item, []);
    }
  };

  const addToOrderWithExtras = (item, extrasList) => {
    // Benzersiz sepet anahtarı oluştur (Ürün ID + seçili ekstraların adları)
    const extrasKey = extrasList.map(e => e.name).sort().join('_');
    const cartId = extrasKey ? `${item.id}_${extrasKey}` : item.id;
    
    // Birim fiyatı hesapla (Ürün fiyatı + ekstralar)
    const extrasTotal = extrasList.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = item.price + extrasTotal;

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev, 
        { 
          ...item, 
          cartId,
          selectedExtras: extrasList,
          unitPrice,
          qty: 1 
        }
      ];
    });
    
    showToast(`${item.name} eklendi`);
    setExtrasModalItem(null);
    setSelectedExtras([]);
  };

  const updateQuantity = (cartId, delta) => {
    setOrderItems((prev) =>
      prev.map((i) => {
        if (i.cartId === cartId) {
          const newQty = i.qty + delta;
          return { ...i, qty: Math.max(0, newQty) };
        }
        return i;
      }).filter((i) => i.qty > 0)
    );
  };

  const currentTotal = orderItems.reduce((sum, item) => sum + (item.unitPrice || item.price) * item.qty, 0);
  const finalTotal = Math.max(0, currentTotal - discount);

  const saveOrder = async () => {
    if (orderItems.length === 0) return;
    
    const newOrder = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute:'2-digit' }),
      items: [...orderItems],
      discount: discount,
      total: finalTotal
    };

    // Supabase'e kaydet
    try {
      await supabase.from('kafana_gore_orders').insert({
        id: newOrder.id,
        time: newOrder.time,
        items: newOrder.items,
        discount: newOrder.discount,
        total: newOrder.total
      });
    } catch (err) {
      console.error('Sipariş kaydedilemedi:', err);
    }

    setCurrentDayOrders((prev) => [...prev, newOrder]);
    setOrderItems([]);
    setDiscount(0);
    showToast('Sipariş başarıyla kaydedildi!');
  };

  // Reports and Archives
  const generateDailySummary = (ordersArray = currentDayOrders) => {
    const summary = {};
    let totalRevenue = 0;
    let totalItems = 0;
    let totalDiscount = 0;

    ordersArray.forEach(order => {
      totalRevenue += order.total; // İndirim düşülmüş net ciro
      totalDiscount += order.discount || 0;
      
      order.items.forEach(item => {
        const extrasStr = item.selectedExtras && item.selectedExtras.length > 0
          ? ` (+${item.selectedExtras.map(e => e.name).join(', ')})`
          : '';
        const nameWithExtras = item.name + extrasStr;
        const reportKey = item.cartId || item.id;
        const priceToUse = item.unitPrice || item.price;

        if (summary[reportKey]) {
          summary[reportKey].qty += item.qty;
          summary[reportKey].total += (item.qty * priceToUse);
        } else {
          summary[reportKey] = {
            id: reportKey,
            name: nameWithExtras,
            qty: item.qty,
            total: item.qty * priceToUse
          };
        }
        totalItems += item.qty;
      });
    });

    return {
      summaryItems: Object.values(summary).sort((a, b) => b.qty - a.qty),
      totalRevenue,
      totalItems,
      totalDiscount
    };
  };

  const endDay = () => {
    setShowReport(true);
  };

  const finalizeDay = async () => {
    if (currentDayOrders.length === 0) {
      alert("Bugün hiç sipariş yok. Günü bitiremezsiniz.");
      return;
    }

    if (confirm("Günü bitirip arşive kaydetmek istediğinize emin misiniz? Güncel siparişler sıfırlanacaktır.")) {
      const summaryData = generateDailySummary();
      const archiveId = Date.now().toString();
      
      const totalExp = dayExpenses.reduce((s, e) => s + e.amount, 0);
      const newArchive = {
        id: archiveId,
        date: new Date().toLocaleDateString('tr-TR'),
        ...summaryData,
        ordersCount: currentDayOrders.length,
        expenses: dayExpenses,
        totalExpenses: totalExp,
        netProfit: summaryData.totalRevenue - totalExp
      };

      // Supabase'e arşiv kaydet + siparişleri sil
      try {
        await supabase.from('kafana_gore_archives').insert({
          id: archiveId,
          date: newArchive.date,
          data: newArchive
        });
        await supabase.from('kafana_gore_orders').delete().neq('id', 'NONE');
      } catch (err) {
        console.error('Arşivleme hatası:', err);
      }

      setArchives(prev => [newArchive, ...prev]);
      setCurrentDayOrders([]);
      setDayExpenses([]); // Giderleri sıfırla
      setShowReport(false);
      showToast('Gün başarıyla arşive kaydedildi.');
    }
  };

  // =============================================
  // ARŞİV SİLME
  // =============================================
  const deleteArchive = async (archiveId) => {
    if (!confirm('Bu arşiv kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await supabase.from('kafana_gore_archives').delete().eq('id', archiveId);
    } catch (err) {
      console.error('Arşiv silme hatası:', err);
    }
    setArchives(prev => prev.filter(a => a.id !== archiveId));
    showToast('Arşiv kaydı silindi.');
  };

  // =============================================
  // SİPARİŞ DÜZENLEME
  // =============================================
  const openOrderEdit = (order) => {
    setEditingOrder(order);
    setEditOrderItems(order.items.map(item => ({ ...item })));
    setEditOrderDiscount(order.discount || 0);
    setShowAddItemToOrder(false);
  };

  const updateEditOrderItemQty = (cartId, delta) => {
    setEditOrderItems(prev =>
      prev.map(i => (i.cartId === cartId || i.id === cartId)
        ? { ...i, qty: Math.max(0, i.qty + delta) }
        : i
      ).filter(i => i.qty > 0)
    );
  };

  const addItemToEditOrder = (item) => {
    const cartId = item.id;
    setEditOrderItems(prev => {
      const existing = prev.find(i => (i.cartId || i.id) === cartId && (!i.selectedExtras || i.selectedExtras.length === 0));
      if (existing) {
        return prev.map(i => (i.cartId || i.id) === cartId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, cartId: item.id, selectedExtras: [], unitPrice: item.price, qty: 1 }];
    });
    showToast(`${item.name} eklendi`);
  };

  const saveOrderEdit = async () => {
    if (!editingOrder) return;
    if (editOrderItems.length === 0) {
      if (confirm('Tüm ürünler kaldırıldı. Siparişi tamamen silmek istiyor musunuz?')) {
        try {
          await supabase.from('kafana_gore_orders').delete().eq('id', editingOrder.id);
        } catch (err) { console.error(err); }
        setCurrentDayOrders(prev => prev.filter(o => o.id !== editingOrder.id));
        setEditingOrder(null);
        showToast('Sipariş silindi.');
      }
      return;
    }
    const discountVal = parseFloat(editOrderDiscount);
    const finalDiscount = isNaN(discountVal) ? 0 : discountVal;

    const subTotal = editOrderItems.reduce((sum, i) => sum + (i.unitPrice || i.price) * i.qty, 0);
    const newTotal = Math.max(0, subTotal - finalDiscount);

    const updatedOrder = { 
      ...editingOrder, 
      items: editOrderItems, 
      discount: finalDiscount, 
      total: newTotal 
    };

    try {
      await supabase.from('kafana_gore_orders').update({
        items: editOrderItems,
        discount: finalDiscount,
        total: newTotal
      }).eq('id', editingOrder.id);
    } catch (err) { console.error('Sipariş güncelleme hatası:', err); }
    setCurrentDayOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o));
    setEditingOrder(null);
    showToast('Sipariş güncellendi.');
  };

  // =============================================
  // ARŞİV FİLTRELEME & HESAPLAMA YARDIMCILARI
  // =============================================
  const getFilteredArchives = () => {
    return archives.filter(arc => {
      if (!arc.date) return true;
      const parts = arc.date.split('.');
      if (parts.length !== 3) return true;
      const arcDateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      arcDateObj.setHours(0,0,0,0);
      
      // Tarihleri UTC uyuşmazlığı yaşamamak için yerel saat diliminde parse eden yardımcı
      const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        const p = dateStr.split('-');
        if (p.length === 3) {
          return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
        }
        return new Date(dateStr);
      };

      if (archiveStartDate) {
        const start = parseLocalDate(archiveStartDate);
        if (start) {
          start.setHours(0,0,0,0);
          if (arcDateObj < start) return false;
        }
      }
      
      if (archiveEndDate) {
        const end = parseLocalDate(archiveEndDate);
        if (end) {
          end.setHours(23,59,59,999);
          if (arcDateObj > end) return false;
        }
      }
      
      return true;
    });
  };

  const getFilteredArchivesSummary = (filteredList) => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalOrders = 0;
    let totalItems = 0;
    
    filteredList.forEach(arc => {
      totalRevenue += arc.totalRevenue || 0;
      totalExpenses += arc.totalExpenses || 0;
      totalOrders += arc.ordersCount || 0;
      totalItems += arc.totalItems || 0;
    });
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalOrders,
      totalItems
    };
  };

  const setQuickDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (days === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setArchiveStartDate(formatDate(yesterday));
      setArchiveEndDate(formatDate(yesterday));
    } else if (days === 'today') {
      const today = new Date();
      setArchiveStartDate(formatDate(today));
      setArchiveEndDate(formatDate(today));
    } else {
      // Gün çıkarma işlemini güvenli yerel tarihler üzerinden yapıyoruz
      start.setDate(start.getDate() - days);
      setArchiveStartDate(formatDate(start));
      setArchiveEndDate(formatDate(end));
    }
  };

  // =============================================
  // GİDER EKLEME
  // =============================================
  const addExpense = () => {
    const amount = parseFloat(newExpenseAmount);
    if (!newExpenseName.trim() || isNaN(amount) || amount <= 0) {
      showToast('Lütfen gider adı ve tutarını girin.');
      return;
    }
    setDayExpenses(prev => [...prev, { id: Date.now().toString(), name: newExpenseName.trim(), amount }]);
    setNewExpenseName('');
    setNewExpenseAmount('');
    setShowExpenseForm(false);
    showToast(`${newExpenseName} gideri eklendi.`);
  };

  const removeExpense = (id) => {
    setDayExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleAddExpensePrompt = () => {
    const name = prompt("Gider adı girin (örn. Elektrik Faturası, Manav, Kurye):");
    if (!name || !name.trim()) return;
    const amountStr = prompt("Gider tutarını (TL) girin:");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Lütfen geçerli bir tutar girin.");
      return;
    }
    setDayExpenses(prev => [...prev, { id: Date.now().toString(), name: name.trim(), amount }]);
    showToast(`${name} gideri eklendi.`);
  };

  // Settings Actions
  const updateItemPrice = (categoryId, itemId, newPrice) => {
    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    setMenuCategories(prev => {
      const newMenu = [...prev];
      const category = newMenu.find(c => c.category === categoryId);
      if (category) {
        const item = category.items.find(i => i.id === itemId);
        if (item) {
          item.price = parsedPrice;
        }
      }
      return newMenu;
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    setMenuCategories(prev => [...prev, { category: newCategoryName.trim(), items: [] }]);
    setNewCategoryName('');
    showToast('Yeni kategori eklendi.');
  };

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice || !newItemCategory) return;
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0) return;

    setMenuCategories(prev => {
      const newMenu = [...prev];
      const category = newMenu.find(c => c.category === newItemCategory);
      if (category) {
        category.items.push({
          id: 'item_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
          name: newItemName.trim(),
          price: price,
          description: newItemDescription.trim(),
          image: newItemImage,
          active: true,
          chefRecommend: false,
          vegan: false,
          spicy: false,
          hasAllergen: false,
          extras: []
        });
      }
      return newMenu;
    });
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('');
    setNewItemImage('');
    showToast('Yeni ürün eklendi.');
  };

  const deleteItem = (categoryId, itemId) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      setMenuCategories(prev => {
        const newMenu = [...prev];
        const catIndex = newMenu.findIndex(c => c.category === categoryId);
        if (catIndex > -1) {
          newMenu[catIndex].items = newMenu[catIndex].items.filter(i => i.id !== itemId);
        }
        // Save deletion specifically, in case the items are now empty it doesn't trigger length > 0 if there are no categories, 
        // but we have other categories usually. LocalStorage effect handles it.
        return newMenu;
      });
      showToast('Ürün silindi.');
    }
  };

  const deleteCategory = (categoryId) => {
    if (confirm("Bu kategoriyi ve içindeki TÜM ürünleri silmek istediğinize emin misiniz?")) {
      setMenuCategories(prev => prev.filter(c => c.category !== categoryId));
      showToast('Kategori silindi.');
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  // Renders
  const renderPOS = () => (
    <motion.div 
      key="pos"
      variants={tabVariants}
      initial="hidden" animate="show" exit="exit"
      className="app-container"
    >
      <div className="menu-area">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="categories-grid">
          {menuCategories.map((cat, idx) => {
            // Sadece aktif olan ürünleri filtreleyip göster
            const activeItems = cat.items.filter(item => item.active !== false);
            if (activeItems.length === 0) return null;

            return (
              <motion.div variants={itemVariants} key={idx} className="category-section">
                <h2><ChevronRight color="#ea580c" /> {cat.category}</h2>
                <div className="items-grid">
                  {activeItems.map((item) => (
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      key={item.id} 
                      className="menu-item"
                      onClick={() => addToOrder(item)}
                    >
                      {item.image && (
                        <div className="item-image-wrapper">
                          <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
                          <div className="item-image-overlay" />
                        </div>
                      )}
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">{item.price.toFixed(2)} TL</div>
                      </div>
                      <div className="add-icon-wrapper">
                        <Plus size={20} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="order-sidebar">
        <div className="sidebar-card glass-panel">
          <h2><ShoppingCart /> Aktif Sipariş</h2>
          
          <div className="order-items">
            <AnimatePresence>
              {orderItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="empty-state"
                >
                  <UtensilsCrossed size={64} opacity={0.3} />
                  <p>Sipariş henüz boş.</p>
                </motion.div>
              ) : (
                orderItems.map((item) => (
                  <motion.div 
                    key={item.cartId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="order-item"
                  >
                    <div className="order-item-info">
                      <span className="order-item-name">{item.name}</span>
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: '800' }}>
                          +{item.selectedExtras.map(e => e.name).join(', ')}
                        </span>
                      )}
                      <span className="order-item-price">{(item.unitPrice || item.price).toFixed(2)} TL</span>
                    </div>
                    <div className="order-item-actions">
                      <motion.button whileTap={{ scale: 0.8 }} className="qty-btn" onClick={() => updateQuantity(item.cartId, -1)}><Minus size={16} /></motion.button>
                      <span className="qty-display">{item.qty}</span>
                      <motion.button whileTap={{ scale: 0.8 }} className="qty-btn" onClick={() => updateQuantity(item.cartId, 1)}><Plus size={16} /></motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="order-summary">
            {/* İNDİRİM GÖSTERİMİ */}
            {discount > 0 && (
              <div className="discount-row">
                <span>İndirim:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  -{discount.toFixed(2)} TL
                  <button onClick={() => setDiscount(0)} title="İndirimi Kaldır">
                    <X size={16} />
                  </button>
                </span>
              </div>
            )}

            {/* İNDİRİM PANELİ VEYA BUTONU */}
            {showDiscountInput ? (
              <div className="discount-input-panel">
                <input 
                  type="number" 
                  className="price-input" 
                  style={{ width: '100%', textAlign: 'left', background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="İndirim (TL)"
                  value={discountInput}
                  onChange={e => setDiscountInput(e.target.value)}
                />
                <button 
                  className="btn btn-success" 
                  style={{ width: 'auto', padding: '0 1rem', height: '40px', fontSize: '0.9rem' }}
                  onClick={() => {
                    const val = parseFloat(discountInput);
                    if (!isNaN(val) && val >= 0) {
                      setDiscount(val);
                      setDiscountInput('');
                      setShowDiscountInput(false);
                      showToast(`Siparişe ${val} TL indirim uygulandı!`);
                    }
                  }}
                >
                  Uygula
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: 'auto', padding: '0 0.5rem', height: '40px', fontSize: '0.9rem' }}
                  onClick={() => setShowDiscountInput(false)}
                >
                  X
                </button>
              </div>
            ) : (
              <button 
                className="discount-btn"
                onClick={() => {
                  setDiscountInput(discount > 0 ? discount.toString() : '');
                  setShowDiscountInput(true);
                }}
              >
                <Receipt size={16} /> İndirim Uygula
              </button>
            )}

            <div className="summary-row total">
              <span>Toplam:</span>
              <motion.span 
                key={finalTotal}
                initial={{ scale: 1.2, color: "#22c55e" }}
                animate={{ scale: 1, color: "#ea580c" }}
              >
                {finalTotal.toFixed(2)} TL
              </motion.span>
            </div>
            
            <motion.button 
              whileHover={{ scale: orderItems.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: orderItems.length > 0 ? 0.95 : 1 }}
              className="btn btn-primary" 
              onClick={saveOrder}
              disabled={orderItems.length === 0}
            >
              <Check size={22} /> Siparişi Kaydet
            </motion.button>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-success end-day-btn" 
          onClick={endDay}
        >
          <FileText size={22} /> Günü Bitir (Rapor)
        </motion.button>
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div 
      key="orders"
      variants={tabVariants}
      initial="hidden" animate="show" exit="exit"
      className="glass-panel" 
      style={{ padding: '2rem' }}
    >
      <h2><History color="#ea580c" /> Bugünün Siparişleri</h2>
      {currentDayOrders.length === 0 ? (
        <div className="empty-state">
          <Clock size={64} opacity={0.3} />
          <p>Bugün henüz sipariş alınmadı.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="history-grid">
          {currentDayOrders.slice().reverse().map((order, idx) => (
            <motion.div variants={itemVariants} key={order.id} className="history-card">
              <div className="history-card-header">
                <span className="order-number">#{currentDayOrders.length - idx}</span>
                <span className="order-time"><Clock size={16} /> {order.time}</span>
              </div>
              <div className="history-items">
                {order.items.map(item => (
                  <div key={item.cartId || item.id} className="history-item">
                    <span>{item.qty}x {item.name}{item.selectedExtras && item.selectedExtras.length > 0 ? ` (+${item.selectedExtras.map(e=>e.name).join(', ')})` : ''}</span>
                    <span>{((item.unitPrice || item.price) * item.qty).toFixed(2)} TL</span>
                  </div>
                ))}
              </div>
              {order.discount > 0 && (
                <div style={{ fontSize: '0.85rem', color: '#ef4444', padding: '0.25rem 0', textAlign: 'right' }}>İndirim: -{order.discount.toFixed(2)} TL</div>
              )}
              <div className="history-total">
                Toplam: {order.total.toFixed(2)} TL
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openOrderEdit(order)}
                style={{ marginTop: '0.75rem', width: '100%', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}
              >
                <Settings size={14} /> Siparişi Düzenle
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

  const renderArchive = () => {
    const filteredArcs = getFilteredArchives();
    const summary = getFilteredArchivesSummary(filteredArcs);

    return (
      <motion.div 
        key="archive"
        variants={tabVariants}
        initial="hidden" animate="show" exit="exit"
        className="glass-panel"
        style={{ padding: '2rem' }}
      >
        <h2><Archive color="#ea580c" /> Arşivlenmiş Günler</h2>
        
        {archives.length > 0 && (
          <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.7)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tarih Seçiciler ve Hızlı Filtre Butonları */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>Başlangıç Tarihi</span>
                  <input 
                    type="date" 
                    value={archiveStartDate} 
                    onChange={e => setArchiveStartDate(e.target.value)} 
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '700', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>Bitiş Tarihi</span>
                  <input 
                    type="date" 
                    value={archiveEndDate} 
                    onChange={e => setArchiveEndDate(e.target.value)} 
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '700', outline: 'none' }}
                  />
                </div>
                {(archiveStartDate || archiveEndDate) && (
                  <button 
                    onClick={() => { setArchiveStartDate(''); setArchiveEndDate(''); }} 
                    style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#cbd5e1', color: '#334155', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* Hızlı Seçim Butonları */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setQuickDateRange('yesterday')} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ea580c', background: 'transparent', color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Dün</button>
                <button onClick={() => setQuickDateRange('today')} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ea580c', background: 'transparent', color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Bugün</button>
                <button onClick={() => setQuickDateRange(7)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ea580c', background: 'transparent', color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Geçmiş 7 Gün</button>
                <button onClick={() => setQuickDateRange(30)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ea580c', background: 'transparent', color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Geçmiş 30 Gün</button>
                <button onClick={() => setQuickDateRange(120)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ea580c', background: 'transparent', color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Geçmiş 120 Gün</button>
                <button onClick={() => setQuickDateRange(365)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'linear-gradient(135deg, #f59e0b, #ea580c)', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>Geçmiş 1 Yıl</button>
              </div>
            </div>

            {/* Özet İstatistik Paneli */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534' }}>TOPLAM SATILAN (ADET)</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#14532d' }}>{summary.totalItems} Adet</span>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fef3c7)', padding: '1rem', borderRadius: '12px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#92400e' }}>TOPLAM CİRO</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#78350f' }}>{summary.totalRevenue.toFixed(2)} TL</span>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#991b1b' }}>TOPLAM GİDER</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#7f1d1d' }}>-{summary.totalExpenses.toFixed(2)} TL</span>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065f46' }}>NET KÂR</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#064e3b' }}>{summary.netProfit.toFixed(2)} TL</span>
              </div>
            </div>
          </div>
        )}

        {archives.length === 0 ? (
          <div className="empty-state">
            <Archive size={64} opacity={0.3} />
            <p>Henüz arşive kaldırılmış bir gün yok.</p>
          </div>
        ) : filteredArcs.length === 0 ? (
          <div className="empty-state">
            <Archive size={64} opacity={0.3} />
            <p>Seçilen tarih aralığında arşivlenmiş gün bulunamadı.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="archive-list">
            {filteredArcs.map(arc => (
              <motion.div variants={itemVariants} key={arc.id} className="archive-item">
                <div className="archive-header">
                  <div className="archive-date">{arc.date}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="archive-stats">
                      <span>Sipariş: <strong>{arc.ordersCount}</strong></span>
                      <span>Satılan: <strong>{arc.totalItems}</strong></span>
                      <span className="archive-total">Ciro: <strong>{arc.totalRevenue.toFixed(2)} TL</strong></span>
                      {arc.totalExpenses > 0 && <span style={{ color: '#ef4444' }}>Gider: <strong>-{arc.totalExpenses.toFixed(2)} TL</strong></span>}
                      {arc.netProfit !== undefined && <span style={{ color: '#10b981', fontWeight: '800' }}>Net Kâr: <strong>{arc.netProfit.toFixed(2)} TL</strong></span>}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteArchive(arc.id)}
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '0.85rem' }}
                      title="Arşiv Kaydını Sil"
                    >
                      <Trash2 size={14} /> Sil
                    </motion.button>
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                  <table className="report-table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Ürün</th>
                        <th>Adet</th>
                        <th>Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arc.summaryItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{item.total.toFixed(2)} TL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {arc.expenses && arc.expenses.length > 0 && (
                    <div style={{ marginTop: '1rem', background: '#fef2f2', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: '800', color: '#ef4444', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📉 Giderler</div>
                      {arc.expenses.map(exp => (
                        <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '2px 0' }}>
                          <span>{exp.name}</span>
                          <span style={{ color: '#ef4444', fontWeight: '700' }}>-{exp.amount.toFixed(2)} TL</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const saveThemeSettings = async () => {
    setThemeSaving(true);
    try {
      await supabase.from('kafana_gore_settings').upsert({
        id: 'main',
        theme_color1: '#06b6d4',
        theme_color2: '#2563eb',
        auto_cycle: autoCycle,
        updated_at: new Date().toISOString()
      });
      showToast('Tema ayarlari kaydedildi!');
    } catch (err) {
      console.error('Tema kaydetme hatası:', err);
      showToast('Tema kaydedilemedi!');
    } finally {
      setThemeSaving(false);
    }
  };

  const renderSettings = () => (
    <motion.div 
      key="settings"
      variants={tabVariants}
      initial="hidden" animate="show" exit="exit"
      className="settings-view glass-panel"
      style={{ padding: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2><Settings color="#ea580c" /> Ayarlar & Menü Yönetimi</h2>
      </div>

      {/* ── Arayüz Tema Ayarları ── */}
      {/* ── Arayüz Tema Ayarları ── */}
      <div className="settings-category" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(37,99,235,0.08))', border: '1px solid rgba(6,182,212,0.2)' }}>
        <h3 style={{ border: 'none', marginBottom: '1rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Otomatik Renk Donusumu
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: '500' }}>
          Sistem renkleri <strong>Cam Göbeği</strong> ve <strong>Mavi</strong> olarak sabitlenmiştir. Aşağıdaki seçeneği aktif ederek menüde bu iki renk arasında yumuşak geçişli otomatik bir döngü başlatabilirsiniz.
        </p>

        {/* Otomatik Değiştirme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>Otomatik Renk Dongusu</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Renkler 4 saniyede bir yumuşak geçiş yapar</div>
          </div>
          <button
            type="button"
            onClick={() => setAutoCycle(!autoCycle)}
            style={{
              width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: autoCycle ? '#06b6d4' : '#cbd5e1',
              position: 'relative', transition: 'background 0.3s'
            }}
          >
            <div style={{
              width: '22px', height: '22px', borderRadius: '11px', background: 'white',
              position: 'absolute', top: '3px',
              left: autoCycle ? '27px' : '3px',
              transition: 'left 0.3s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
            }}></div>
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveThemeSettings}
          disabled={themeSaving}
          style={{
            width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '800',
            border: 'none', borderRadius: '12px', cursor: themeSaving ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 15px rgba(6,182,212,0.3)'
          }}
        >
          <Save size={18} /> {themeSaving ? 'Kaydediliyor...' : 'Otomatik Renk Ayarını Kaydet'}
        </motion.button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Yeni Kategori Ekle */}
        <div className="settings-category" style={{ margin: 0 }}>
          <h3 style={{ border: 'none', marginBottom: '0.5rem' }}><Plus size={18} /> Yeni Kategori Ekle</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="price-input" 
              style={{ width: '100%', textAlign: 'left', background: 'white' }} 
              placeholder="Kategori Adı..." 
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-success" style={{ width: 'auto', padding: '0 1.5rem' }} onClick={addCategory}>Ekle</motion.button>
          </div>
        </div>

        {/* Yeni Ürün Ekle */}
        <div className="settings-category" style={{ margin: 0 }}>
          <h3 style={{ border: 'none', marginBottom: '0.5rem' }}><Plus size={18} /> Yeni Ürün Ekle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <select 
              className="price-input" 
              style={{ width: '100%', textAlign: 'left', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem' }}
              value={newItemCategory}
              onChange={e => setNewItemCategory(e.target.value)}
            >
              {menuCategories.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="price-input" 
                style={{ width: '100%', textAlign: 'left', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem' }} 
                placeholder="Ürün Adı..." 
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
              <input 
                type="number" 
                className="price-input" 
                style={{ width: '120px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }} 
                placeholder="Fiyat (TL)" 
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
              />
            </div>
            
            {/* Açıklama */}
            <input 
              type="text" 
              className="price-input" 
              style={{ width: '100%', textAlign: 'left', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem' }} 
              placeholder="Açıklama / İçindekiler (Opsiyonel)..." 
              value={newItemDescription}
              onChange={e => setNewItemDescription(e.target.value)}
            />

            {/* Cihazdan Resim Seçme */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="file-upload-zone" style={{ padding: '0.75rem', flex: 1, minHeight: '50px', flexDirection: 'row', gap: '6px' }}>
                <Plus className="file-upload-icon" size={18} />
                <span className="file-upload-text" style={{ fontSize: '0.85rem' }}>Cihazdan Görsel Seç</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="file-upload-input" 
                  onChange={(e) => handleImageChange(e, setNewItemImage)}
                />
              </div>
              {newItemImage && (
                <div style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={newItemImage} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    className="image-preview-badge-delete"
                    style={{ width: '20px', height: '20px', top: '2px', right: '2px' }}
                    onClick={() => setNewItemImage('')}
                    title="Görseli Kaldır"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="btn btn-success" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.25rem' }} 
              onClick={addItem}
            >
              <Plus size={18} /> Ürünü Ekle
            </motion.button>
          </div>
        </div>
      </div>

      <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '1.1rem' }}>Mevcut menüyü düzenleyebilir, ürünlerin yanındaki çöp kutusu ikonu ile ürünü silebilir veya kategori isminin yanındaki çöp kutusu ile kategoriyi komple silebilirsiniz.</p>
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="settings-grid">
        {menuCategories.map(cat => (
          <motion.div variants={itemVariants} key={cat.category} className="settings-category">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: '0.5rem' }}>
              <h3 style={{ border: 'none', margin: 0, padding: 0 }}>{cat.category}</h3>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteCategory(cat.category)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                title="Kategoriyi Komple Sil"
              >
                <Trash2 size={20} />
              </motion.button>
            </div>

            <div className="settings-items">
              {cat.items.map(item => (
                <div key={item.id} className="settings-item">
                  <span className="settings-item-name">{item.name}</span>
                  <div className="price-input-wrapper">
                    <input 
                      type="number" 
                      className="price-input" 
                      value={item.price}
                      onChange={(e) => updateItemPrice(cat.category, item.id, e.target.value)}
                    />
                    <span className="currency">TL</span>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteItem(cat.category, item.id)}
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Ürünü Sil"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  // Zengin Dijital Menü Render Edici
  const renderMenu = () => {
    const currentCatName = activeMenuCategory || (menuCategories.length > 0 ? menuCategories[0].category : '');
    const currentCategory = menuCategories.find(c => c.category === currentCatName);

    return (
      <motion.div
        key="menu"
        variants={tabVariants}
        initial="hidden" animate="show" exit="exit"
        className="glass-panel"
        style={{ padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2><UtensilsCrossed color="#ea580c" /> Müşteri Dijital Menüsü</h2>
        </div>

        <div className="nav-tabs" style={{ marginBottom: '2rem', justifyContent: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
          {menuCategories.map((cat) => (
            <motion.button
              key={cat.category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`nav-tab ${currentCatName === cat.category ? 'active' : ''}`}
              onClick={() => setActiveMenuCategory(cat.category)}
              style={{ minWidth: '130px', padding: '0.6rem 1rem', fontSize: '0.95rem' }}
            >
              {cat.category}
            </motion.button>
          ))}
        </div>

        {currentCategory && (
          <div className="digital-menu-grid">
            {currentCategory.items.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden" animate="show"
                className={`digital-menu-card ${item.active === false ? 'opacity-60' : ''}`}
              >
                {/* Rozetler */}
                <div className="menu-card-badges">
                  {item.chefRecommend && <span className="badge-custom badge-chef">⭐ Şefin Tavsiyesi</span>}
                  {item.vegan && <span className="badge-custom badge-vegan">🌱 Vegan</span>}
                  {item.spicy && <span className="badge-custom badge-spicy">🌶️ Acı</span>}
                  {item.hasAllergen && <span className="badge-custom badge-allergen">⚠️ Alerjen</span>}
                  {item.active === false && <span className="badge-custom bg-slate-500" style={{background: '#64748b'}}>Pasif</span>}
                </div>

                {/* Düzenle Butonu */}
                <button 
                  className="menu-card-edit-btn"
                  onClick={() => handleEditClick(currentCategory.category, item)}
                >
                  <Settings size={14} /> Düzenle
                </button>

                {item.image && (
                  <div className="menu-card-image-wrapper">
                    <img src={item.image} alt={item.name} className="menu-card-image" loading="lazy" />
                  </div>
                )}

                <div className="menu-card-body">
                  <div className="menu-card-header">
                    <h4 className="menu-card-title">{item.name}</h4>
                    <span className="menu-card-price">{item.price.toFixed(2)} TL</span>
                  </div>

                  {item.description && (
                    <p className="menu-card-description" title={item.description}>
                      {item.description}
                    </p>
                  )}

                  {item.extras && item.extras.length > 0 && (
                    <div className="menu-card-extras-section">
                      <div className="menu-card-extras-title">Ekstra Malzemeler & Soslar</div>
                      <div className="menu-card-extras-list">
                        {item.extras.map((extra, eIdx) => (
                          <span key={eIdx} className="menu-card-extra-pill">
                            {extra.name} (+{extra.price} TL)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // Düzenleme Tıklama ve Şifre Yönetimi
  const handleEditClick = (categoryName, item) => {
    setPasswordTarget({ categoryName, item });
    setPasswordInput('');
    setPasswordError(false);
    setPasswordModalOpen(true);
  };

  const handleVerifyPassword = () => {
    if (passwordInput === 'menüdüzenle123') {
      setPasswordModalOpen(false);
      openEditModal(passwordTarget.categoryName, passwordTarget.item);
      setPasswordInput('');
    } else {
      setPasswordError(true);
      showToast("Hatalı Şifre!");
      setTimeout(() => setPasswordError(false), 500);
    }
  };

  // Ürünü Düzenleme Modalını Açma
  const openEditModal = (categoryName, item) => {
    setEditingItem(item);
    setEditCategory(categoryName);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditDescription(item.description || '');
    setEditImage(item.image || '');
    setEditActive(item.active !== false);
    setEditChefRecommend(item.chefRecommend || false);
    setEditVegan(item.vegan || false);
    setEditSpicy(item.spicy || false);
    setEditHasAllergen(item.hasAllergen || false);
    setEditExtras(item.extras ? item.extras.map(e => ({ ...e })) : []);
  };

  // Düzenleme Değişikliklerini Kaydetme
  const saveEditedItem = () => {
    const parsedPrice = parseFloat(editPrice);
    if (!editName.trim() || isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Lütfen geçerli bir ürün adı ve fiyatı girin.");
      return;
    }

    setMenuCategories(prev => {
      const newMenu = prev.map(cat => {
        if (cat.category !== editCategory) return cat;
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id !== editingItem.id) return item;
            return {
              ...item,
              name: editName.trim(),
              price: parsedPrice,
              description: editDescription.trim(),
              image: editImage.trim(),
              active: editActive,
              chefRecommend: editChefRecommend,
              vegan: editVegan,
              spicy: editSpicy,
              hasAllergen: editHasAllergen,
              extras: editExtras.filter(e => e.name.trim() !== '')
            };
          })
        };
      });
      return newMenu;
    });

    setEditingItem(null);
    showToast("Ürün başarıyla güncellendi.");
  };

  // Ekstra Ekleme & Silme Fonksiyonları (Düzenleme ekranında)
  const addExtraToEditList = () => {
    setEditExtras(prev => [...prev, { name: '', price: 0 }]);
  };

  const removeExtraFromEditList = (idx) => {
    setEditExtras(prev => prev.filter((_, i) => i !== idx));
  };

  const updateExtraInEditList = (idx, field, value) => {
    setEditExtras(prev => prev.map((extra, i) => {
      if (i !== idx) return extra;
      if (field === 'price') {
        const val = parseFloat(value);
        return { ...extra, price: isNaN(val) ? 0 : val };
      }
      return { ...extra, [field]: value };
    }));
  };

  return (
    <>
      <div id="root">
        {/* Yükleniyor Ekranı */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(255,255,255,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader size={48} color="#ea580c" />
              </motion.div>
              <p style={{ color: '#ea580c', fontWeight: '800', fontSize: '1.2rem' }}>Veriler yükleniyor...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="header-container glass-panel"
        >
          <h1><Coffee size={44} color="#ea580c" /> Kafana Göre Kahvaltı</h1>
          {/* Bağlantı Durumu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: isOnline ? '#10b981' : '#ef4444', background: isOnline ? '#d1fae5' : '#fee2e2', padding: '4px 12px', borderRadius: '20px', marginBottom: '0.5rem' }}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Bulut Bağlı' : 'Çevrimdışı'}
          </div>
          
          <div className="nav-tabs">
            {['pos', 'menu', 'orders', 'archive', 'settings'].map(tab => {
              const icons = {
                pos: <Store size={20} />,
                menu: <UtensilsCrossed size={20} />,
                orders: <History size={20} />,
                archive: <Archive size={20} />,
                settings: <Settings size={20} />
              };
              const titles = {
                pos: 'Satış Ekranı',
                menu: 'Müşteri Menüsü',
                orders: 'Geçmiş Siparişler',
                archive: 'Arşiv',
                settings: 'Ayarlar'
              };
              
              return (
                <motion.button 
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`nav-tab ${activeTab === tab ? 'active' : ''}`} 
                  onClick={() => setActiveTab(tab)}
                >
                  {icons[tab]} {titles[tab]}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
 
        <div className="main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'pos' && renderPOS()}
            {activeTab === 'menu' && renderMenu()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'archive' && renderArchive()}
            {activeTab === 'settings' && renderSettings()}
          </AnimatePresence>
        </div>
      </div>
 
      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setShowReport(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title"><Receipt color="#10b981" size={36} /> Gün Sonu Raporu</div>
                <button className="close-btn" onClick={() => setShowReport(false)}><X size={24} /></button>
              </div>
              
              {currentDayOrders.length === 0 ? (
                <div className="empty-state">
                  <UtensilsCrossed size={64} opacity={0.3} />
                  <p>Bugün henüz satış yapılmadı.</p>
                </div>
              ) : (
                <>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Ürün Adı</th>
                        <th>Adet</th>
                        <th>Toplam Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateDailySummary().summaryItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{item.total.toFixed(2)} TL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {generateDailySummary().totalDiscount > 0 && (
                    <div className="report-total" style={{ marginBottom: '1rem', backgroundColor: '#fef2f2', color: '#ef4444' }}>
                      <span>Toplam Yapılan İndirim:</span>
                      <span>-{generateDailySummary().totalDiscount.toFixed(2)} TL</span>
                    </div>
                  )}

                  <div className="report-total" style={{ marginBottom: '1rem' }}>
                    <span>Toplam Satılan Ürün:</span>
                    <span>{generateDailySummary().totalItems} Adet</span>
                  </div>
 
                  <div className="report-total">
                    <span>Genel Toplam Net Ciro:</span>
                    <span>{generateDailySummary().totalRevenue.toFixed(2)} TL</span>
                  </div>

                  {/* GİDERLER BÖLÜMÜ */}
                  <div style={{ marginTop: '1.5rem', background: '#fef2f2', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '800', color: '#ef4444', fontSize: '1rem' }}>📉 Günlük Giderler</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowExpenseForm(v => !v)}
                        style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0.3rem 0.8rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Gider Ekle
                      </motion.button>
                    </div>

                    {showExpenseForm && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="Gider Adı (örn: Doğalgaz)"
                          value={newExpenseName}
                          onChange={e => setNewExpenseName(e.target.value)}
                          style={{ flex: 2, padding: '0.5rem', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.9rem', minWidth: '140px' }}
                        />
                        <input
                          type="number"
                          placeholder="Tutar (TL)"
                          value={newExpenseAmount}
                          onChange={e => setNewExpenseAmount(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addExpense()}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.9rem', minWidth: '100px' }}
                        />
                        <button onClick={addExpense} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: '700', cursor: 'pointer' }}>Ekle</button>
                        <button onClick={() => setShowExpenseForm(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}

                    {dayExpenses.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0' }}>Henüz gider eklenmedi.</p>
                    ) : (
                      dayExpenses.map(exp => (
                        <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.95rem' }}>
                          <span>{exp.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#ef4444', fontWeight: '700' }}>-{exp.amount.toFixed(2)} TL</span>
                            <button onClick={() => removeExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}><X size={14}/></button>
                          </div>
                        </div>
                      ))
                    )}

                    {dayExpenses.length > 0 && (
                      <div style={{ borderTop: '1px solid #fca5a5', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#ef4444' }}>
                        <span>Toplam Gider:</span>
                        <span>-{dayExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)} TL</span>
                      </div>
                    )}
                  </div>

                  {dayExpenses.length > 0 && (
                    <div className="report-total" style={{ marginTop: '0.75rem', background: '#d1fae5', color: '#065f46' }}>
                      <span style={{ fontWeight: '800' }}>Net Kâr (Ciro - Gider):</span>
                      <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>
                        {(generateDailySummary().totalRevenue - dayExpenses.reduce((s, e) => s + e.amount, 0)).toFixed(2)} TL
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, minWidth: '120px' }} 
                      onClick={() => setShowReport(false)}
                    >
                      Vazgeç (Geri Dön)
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} 
                      className="btn btn-danger" 
                      style={{ flex: 1, minWidth: '120px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                      onClick={handleAddExpensePrompt}
                    >
                      <Plus size={18} /> Gider Ekle (-)
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} 
                      className="btn btn-success" 
                      style={{ flex: 1.5, minWidth: '180px' }} 
                      onClick={finalizeDay}
                    >
                      <Save size={22} /> Günü Bitir & Arşivle
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* POS Ekstra Seçim Modalı */}
      <AnimatePresence>
        {extrasModalItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setExtrasModalItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title"><Plus color="#ea580c" size={30} /> Ekstra Malzeme Seçin</div>
                <button className="close-btn" onClick={() => setExtrasModalItem(null)}><X size={24} /></button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ border: 'none', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>{extrasModalItem.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>{extrasModalItem.description}</p>
              </div>

              <div className="extras-modal-grid">
                {extrasModalItem.extras.map((extra, idx) => {
                  const isSelected = selectedExtras.some(e => e.name === extra.name);
                  return (
                    <div 
                      key={idx} 
                      className={`extra-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedExtras(prev => prev.filter(e => e.name !== extra.name));
                        } else {
                          setSelectedExtras(prev => [...prev, extra]);
                        }
                      }}
                    >
                      <div className="extra-select-info">
                        <span className="extra-select-name">{extra.name}</span>
                        <span className="extra-select-price">+{extra.price.toFixed(2)} TL</span>
                      </div>
                      <div className="extra-checkbox-indicator">
                        {isSelected && <Check size={16} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setExtrasModalItem(null)}>Vazgeç</button>
                <button 
                  className="btn btn-primary"
                  onClick={() => addToOrderWithExtras(extrasModalItem, selectedExtras)}
                >
                  Siparişe Ekle (+{selectedExtras.reduce((sum, e) => sum + e.price, 0).toFixed(2)} TL)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ürünü Düzenle Modalı */}
      <AnimatePresence>
        {editingItem && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setEditingItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content" 
              style={{ maxWidth: '650px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title"><Settings color="#ea580c" size={30} /> Ürünü Düzenle</div>
                <button className="close-btn" onClick={() => setEditingItem(null)}><X size={24} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Kategori Adı */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '8px', fontWeight: '800', color: '#475569' }}>
                  <Archive size={18} /> {editCategory}
                </div>

                {/* Ürün Adı */}
                <div className="form-group">
                  <label>Ürün Adı</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>

                {/* Fiyat */}
                <div className="form-group">
                  <label>Fiyat (TL)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editPrice} 
                    onChange={e => setEditPrice(e.target.value)}
                  />
                </div>

                {/* Açıklama */}
                <div className="form-group">
                  <label>Açıklama (İçindekiler)</label>
                  <textarea 
                    className="form-input form-textarea" 
                    value={editDescription} 
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Ürün içindekilerini yazın..."
                  />
                </div>

                {/* Görsel Cihazdan Seçme */}
                <div className="form-group">
                  <label>Ürün Görseli</label>
                  <div className="file-upload-zone">
                    <Plus className="file-upload-icon" size={32} />
                    <span className="file-upload-text">Cihazınızdan Görsel Seçin</span>
                    <span className="file-upload-subtext">PNG, JPG, WEBP veya GIF (Maksimum 2MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="file-upload-input" 
                      onChange={(e) => handleImageChange(e, setEditImage)}
                    />
                  </div>
                  {editImage && (
                    <div style={{ marginTop: '1rem', position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={editImage} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        className="image-preview-badge-delete"
                        onClick={() => setEditImage('')}
                        title="Görseli Kaldır"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Durum Checkbox'ları */}
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editActive} 
                      onChange={e => setEditActive(e.target.checked)}
                    />
                    <span>Aktif Ürün</span>
                  </label>

                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editChefRecommend} 
                      onChange={e => setEditChefRecommend(e.target.checked)}
                    />
                    <span>⭐ Şefin Tavsiyesi</span>
                  </label>

                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editVegan} 
                      onChange={e => setEditVegan(e.target.checked)}
                    />
                    <span>🌱 Vegan</span>
                  </label>

                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editSpicy} 
                      onChange={e => setEditSpicy(e.target.checked)}
                    />
                    <span>🌶️ Acı</span>
                  </label>

                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editHasAllergen} 
                      onChange={e => setEditHasAllergen(e.target.checked)}
                    />
                    <span>⚠️ Alerjen İçerir</span>
                  </label>
                </div>

                {/* Ekstra / Sos Düzenleme Bölümü */}
                <div className="extras-editor-section">
                  <div className="extras-editor-header">
                    <h3 style={{ border: 'none', margin: 0, padding: 0, fontSize: '1.1rem', fontWeight: '800' }}>EKSTRA / SOS YÖNETİMİ</h3>
                    <button 
                      className="btn btn-success" 
                      style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      onClick={addExtraToEditList}
                    >
                      <Plus size={16} /> + Yeni Ekstra
                    </button>
                  </div>

                  <div className="extras-editor-list">
                    {editExtras.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>Hiç ekstra malzeme yok.</p>
                    ) : (
                      editExtras.map((extra, idx) => (
                        <div key={idx} className="extra-editor-item">
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ flex: 2, padding: '0.4rem' }} 
                            placeholder="Malzeme Adı"
                            value={extra.name}
                            onChange={e => updateExtraInEditList(idx, 'name', e.target.value)}
                          />
                          <input 
                            type="number" 
                            className="form-input" 
                            style={{ flex: 1, padding: '0.4rem' }} 
                            placeholder="Fiyat"
                            value={extra.price || ''}
                            onChange={e => updateExtraInEditList(idx, 'price', e.target.value)}
                          />
                          <button 
                            className="btn btn-danger" 
                            style={{ width: 'auto', padding: '0.4rem', background: '#fee2e2', color: '#ef4444', height: '36px' }}
                            onClick={() => removeExtraFromEditList(idx)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setEditingItem(null)}>Vazgeç</button>
                <button className="btn btn-success" onClick={saveEditedItem}><Save size={20} /> Kaydet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Şifre Giriş Modalı */}
      <AnimatePresence>
        {passwordModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setPasswordModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`password-box ${passwordError ? 'shake-anim' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="lock-icon-container">
                <Settings size={44} />
              </div>
              <h3 style={{ border: 'none', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>Yönetici Doğrulaması</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ürünü düzenlemek için menü düzenleme şifresini girin.</p>
              
              <input 
                type="password" 
                className="password-input-styled" 
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyPassword()}
                autoFocus
              />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.75rem' }} onClick={() => setPasswordModalOpen(false)}>Vazgeç</button>
                <button className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={handleVerifyPassword}>Doğrula</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Splash Screen (Hoşgeldin Ekranı) */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.96 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="splash-overlay"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
              className="splash-card"
              style={{ maxWidth: '380px', padding: '2.5rem 2rem' }}
            >
              <h1 className="splash-title-brand" style={{ fontSize: '2.6rem', margin: 0, letterSpacing: '-1px' }}>Hoş Geldiniz</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sipariş Düzenleme Modalı */}
      <AnimatePresence>
        {editingOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setEditingOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content" 
              style={{ maxWidth: '600px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title"><Settings color="#ea580c" size={30} /> Siparişi Düzenle</div>
                <button className="close-btn" onClick={() => setEditingOrder(null)}><X size={24} /></button>
              </div>

              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Sipariş Zamanı: <strong>{editingOrder.time}</strong></span>
                  <span>Mevcut İndirim: <strong>{editingOrder.discount || 0} TL</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>İndirim Tutarı Düzenle:</span>
                  <input 
                    type="number" 
                    value={editOrderDiscount} 
                    onChange={e => setEditOrderDiscount(e.target.value)} 
                    style={{ width: '90px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '700', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>TL</span>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {editOrderItems.map((item) => (
                  <div key={item.cartId || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{item.name}</span>
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: '700' }}>
                          +{item.selectedExtras.map(e => e.name).join(', ')}
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{(item.unitPrice || item.price).toFixed(2)} TL</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="qty-btn" onClick={() => updateEditOrderItemQty(item.cartId || item.id, -1)}><Minus size={14} /></button>
                      <span style={{ fontWeight: '700', fontSize: '1rem', width: '24px', textAlign: 'center' }}>{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateEditOrderItemQty(item.cartId || item.id, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Yeni Ürün Ekleme Alanı */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem', background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setShowAddItemToOrder(v => !v)}
                >
                  <Plus size={16} /> {showAddItemToOrder ? 'Ürün Ekleme Listesini Kapat' : 'Siparişe Yeni Ürün Ekle'}
                </button>

                {showAddItemToOrder && (
                  <div style={{ marginTop: '0.75rem', maxHeight: '180px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '4px' }}>
                    {menuCategories.flatMap(c => c.items).filter(i => i.active !== false).map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => addItemToEditOrder(item)}
                        style={{ padding: '0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{item.name}</span>
                        <span style={{ color: '#ea580c' }}>{item.price} TL</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                <span>Yeni Toplam (İndirim Dahil):</span>
                <span style={{ color: '#ea580c' }}>
                  {Math.max(0, editOrderItems.reduce((sum, i) => sum + (i.unitPrice || i.price) * i.qty, 0) - (parseFloat(editOrderDiscount) || 0)).toFixed(2)} TL
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setEditingOrder(null)}>Vazgeç</button>
                <button className="btn btn-success" onClick={saveOrderEdit}><Save size={20} /> Değişiklikleri Kaydet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="toast-container"
          >
            <div className="toast" style={{ background: '#10b981', color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '700' }}>
              <Check size={24} /> {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
