// Inisialisasi Database Keranjang Belanja & Sesi Anggota Berbasis Web Storage
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("bitzz_cart")) || [];
} catch (e) {
  cart = [];
}

let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem("bitzz_user")) || null;
} catch (e) {
  currentUser = null;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("BITZZ EXCLUSIVE SYSTEM: Infrastruktur e-commerce siap beroperasi.");
  updateCartCountBadge();
  
  const greetingElem = document.getElementById("userGreeting");
  if (currentUser && greetingElem) {
    greetingElem.innerText = `Selamat Datang, ${currentUser.nama} ✨`;
  }
});

function addToCart(nama, harga, idQty) {
  const qtyInput = document.getElementById(idQty);
  const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

  if (qty < 1) {
    alert("Batas minimum pembelian perangkat adalah 1 unit.");
    return;
  }

  const existingItemIndex = cart.findIndex(item => item.nama === nama);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += qty;
  } else {
    cart.push({ nama, harga, qty });
  }

  localStorage.setItem("bitzz_cart", JSON.stringify(cart));
  if (qtyInput) qtyInput.value = 1; 
  
  updateCartCountBadge();
  alert(`Sukses: Perangkat ${nama} (${qty} Unit) telah ditambahkan ke dalam Tas Belanja.`);
}
window.addToCart = addToCart;

function updateCartCountBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    badge.innerText = totalItems;
  }
}
window.updateCartCountBadge = updateCartCountBadge;

function triggerCheckoutFlow() {
  if (!currentUser) {
    closeModal();
    const authModal = document.getElementById("authModal");
    const wrapper = document.getElementById("mainContentWrapper");
    if (authModal) authModal.style.display = "flex";
    if (wrapper) wrapper.classList.add("blurred");
  } else {
    renderActualCheckoutForm();
  }
}
window.triggerCheckoutFlow = triggerCheckoutFlow;

function handleRegistration(event) {
  event.preventDefault();
  
  const nama = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const alamat = document.getElementById("regAddress").value.trim();
  const noRekening = document.getElementById("regBankNo").value.trim();
  const namaBank = document.getElementById("regBankName").value;

  currentUser = { nama, phone, alamat, noRekening, namaBank };
  localStorage.setItem("bitzz_user", JSON.stringify(currentUser));

  closeAuthModal();
  
  const greetingElem = document.getElementById("userGreeting");
  if (greetingElem) greetingElem.innerText = `Selamat Datang, ${currentUser.nama} ✨`;

  openCartModal();
  renderActualCheckoutForm();
}
window.handleRegistration = handleRegistration;

function closeAuthModal() {
  const authModal = document.getElementById("authModal");
  const wrapper = document.getElementById("mainContentWrapper");
  if (authModal) authModal.style.display = "none";
  if (wrapper) wrapper.classList.remove("blurred");
}
window.closeAuthModal = closeAuthModal;

function searchApp() {
  const input = document.getElementById("mainSearch").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".product-card");
  cards.forEach((card) => {
    const title = card.getAttribute("data-title") ? card.getAttribute("data-title").toLowerCase() : "";
    if (input === "") {
      card.style.display = "block";
    } else {
      card.style.display = title.includes(input) ? "block" : "none";
    }
  });
}
window.searchApp = searchApp;

function openCartModal() {
  renderCartOrCheckoutUI();
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "flex";
}
window.openCartModal = openCartModal;

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}
window.closeModal = closeModal;

window.onclick = function (e) {
  const modal = document.getElementById("modal");
  if (e.target == modal) closeModal();
};

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("bitzz_cart", JSON.stringify(cart));
  updateCartCountBadge();
  renderCartOrCheckoutUI();
}
window.removeFromCart = removeFromCart;

function renderCartOrCheckoutUI() {
  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  if (cart.length === 0) {
    modalContent.innerHTML = `
      <h2 style="text-align:center; font-weight:600; letter-spacing:-0.5px; color:#1d1d1f;">Tas Belanja Anda</h2>
      <hr style="margin: 15px 0; opacity: 0.1" />
      <p style='text-align:center; color:#86868b; padding: 30px 0; font-size:0.9rem;'>Tas Belanja Anda kosong. Silakan pilih perangkat premium yang Anda inginkan.</p>
      <button onclick="closeModal()" style="margin: 10px auto; display:block; padding: 12px 28px; border-radius:25px; border:none; cursor:pointer; background:#00d2ff; color:#000; font-weight:600; font-size:0.85rem;">Kembali Menjelajah</button>
    `;
    return;
  }

  let itemsHtml = "";
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = (item.harga || 0) * (item.qty || 1);
    grandTotal += itemTotal;
    const fmtHarga = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.harga || 0);
    const fmtTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(itemTotal);

    itemsHtml += `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f5f5f7; padding: 14px 0; color:#1d1d1f;">
        <div>
          <strong style="font-size:0.95rem; font-weight:600;">${item.nama}</strong><br>
          <small style="color:#6c757d;">${fmtHarga} &times; ${item.qty} Perangkat</small>
        </div>
        <div style="text-align:right">
          <span style="font-size:0.95rem; font-weight:600; color:#000;">${fmtTotal}</span><br>
          <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#dc3545; cursor:pointer; font-size:0.75rem; font-weight:500; margin-top:4px; text-decoration:underline;">Singkirkan</button>
        </div>
      </div>
    `;
  });

  const fmtGrandTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(grandTotal);

  modalContent.innerHTML = `
    <h2 style="text-align:center; font-weight:600; letter-spacing:-0.5px; color:#1d1d1f;">Ringkasan Belanja</h2>
    <hr style="margin: 15px 0; opacity: 0.1;" />
    
    <div style="max-height: 220px; overflow-y: auto; margin-bottom: 20px; padding-right:5px;">
      ${itemsHtml}
    </div>
    
    <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom: 25px; color:#1d1d1f; font-size:1.1rem; border-top:2px solid #f5f5f7; padding-top:15px;">
      <span>Subtotal Keseluruhan:</span>
      <span style="color:#000;">${fmtGrandTotal}</span>
    </div>

    <button onclick="triggerCheckoutFlow()" class="btn-pay-now">LANJUTKAN KE ALUR CHECKOUT</button>
  `;
}

function renderActualCheckoutForm() {
  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  let grandTotal = cart.reduce((sum, item) => sum + ((item.harga || 0) * (item.qty || 1)), 0);
  const fmtGrandTotal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(grandTotal);

  modalContent.innerHTML = `
    <h2 style="text-align:center; font-weight:600; letter-spacing:-0.5px; color:#1d1d1f;">Metode Pembayaran & Tujuan</h2>
    <hr style="margin: 15px 0; opacity: 0.1" />
    
    <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom: 15px; color:#1d1d1f; font-size:1.1rem;">
      <span>Total Kewajiban Pembayaran:</span>
      <span style="color:#1a1d20;">${fmtGrandTotal}</span>
    </div>

    <form class="form-checkout" id="orderForm" onsubmit="processPaymentGateway(event, '${fmtGrandTotal}')">
      <label>Nama Penerima Konsinyasi (Otomatis Profil)</label>
      <input type="text" value="${currentUser ? currentUser.nama : ''}" readonly style="background: #f8f9fa; color: #6c757d; font-weight:500;" />

      <label>Destinasi Pengiriman Paket (Otomatis Profil)</label>
      <input type="text" value="${currentUser ? currentUser.alamat : ''}" readonly style="background: #f8f9fa; color: #6c757d; font-weight:500;" />

      <label>Akun Keuangan Sumber Terverifikasi</label>
      <input type="text" value="${currentUser ? (currentUser.namaBank + ' — ' + currentUser.noRekening) : ''}" readonly style="background: #f8f9fa; color: #6c757d; font-weight:500;" />

      <label for="paymentMethod">Pilih Opsi Gerbang Pembayaran Safe-Gate *</label>
      <select id="paymentMethod" required>
        <option value="QRIS">QRIS Standar Finansial Dinamis (Bitzz Store)</option>
        <option value="SeaBank">Transfer Rekening SeaBank Corporate</option>
        <option value="DANA">Giro Kilat Saldo DANA Enterprise</option>
      </select>

      <div class="motto-box">
        <strong>MOTO TOKO: Gadget Premium, Pelayanan Bintang Lima!</strong>
      </div>

      <button type="submit" class="btn-pay-now">KONFIRMASI DAN PROSES INVOICE</button>
    </form>
  `;
}

function processPaymentGateway(event, totalFormatted) {
  event.preventDefault();

  const method = document.getElementById("paymentMethod").value;
  const invoiceNo = "INV-" + Math.floor(100000 + Math.random() * 900000);
  const dateNow = new Date().toLocaleString("id-ID");

  let itemsSummaryHtml = "";
  cart.forEach(item => {
    const totalItemHarga = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format((item.harga || 0) * (item.qty || 1));
    itemsSummaryHtml += `<li>${item.nama} (Jumlah: ${item.qty}) &mdash; <strong>${totalItemHarga}</strong></li>`;
  });

  let paymentInstruction = "";
  
  if (method === "QRIS") {
    paymentInstruction = `
      <div style="background: #fff3bf; padding: 12px; border-radius: 10px; border: 1px solid #fab005; font-size: 0.8rem; margin-bottom: 12px; text-align: center; color: #664d03; line-height:1.5;">
        ⚠️ <strong style="text-transform:uppercase;">Sinkronisasi Otomatis Aktif</strong><br>
        Sistem memproses nominal unik senilai <strong>${totalFormatted}</strong> secara presisi.
      </div>
      <p style="font-size:0.85rem; margin-bottom:6px; text-align:center; font-weight:500;">Pindai Kode QRIS Resmi <strong>Bitzz Store</strong>:</p>
      <img src="images/qris.jpeg" alt="QRIS Bitzz Store" class="qris-image" />
      <div style="text-align: center; margin-top: 5px;">
        <span style="font-size:0.75rem; color:#6c757d; display:block;">NMID: ID1026531348849</span>
        <span style="font-size:0.8rem; font-weight: 700; color: #28a745; animation: blink 1.5s infinite; display: inline-block; margin-top: 6px;">
          🔄 Mengintegrasikan mutasi masuk dari akun ${currentUser ? currentUser.noRekening : ''}...
        </span>
      </div>
    `;
  } else if (method === "SeaBank") {
    paymentInstruction = `
      <p>Silakan selesaikan kewajiban pembayaran melalui transfer manual antar-bank:</p>
      <p style="margin-top:6px;">Lembaga Perbankan: <strong>SeaBank</strong></p>
      <p>Nomor Rekening Tujuan: <strong style="font-size:1.1rem; color:#dc3545; letter-spacing:0.5px;">9016 8120 0790</strong></p>
      <p>Atas Nama Pemilik: <strong>ILHAM HIDAYAT</strong></p>
    `;
  } else if (method === "DANA") {
    paymentInstruction = `
      <p>Silakan selesaikan pemindahan saldo elektronik menuju akun merchant:</p>
      <p style="margin-top:6px;">Aplikasi Dompet Digital: <strong>DANA</strong></p>
      <p>ID Transaksi DANA: <strong style="font-size:1.1rem; color:#dc3545; letter-spacing:0.5px;">0856 0086 5191</strong></p>
      <p>Atas Nama Pemilik: <strong>ILHAM HIDAYAT</strong></p>
    `;
  }

  cart = [];
  localStorage.removeItem("bitzz_cart");
  updateCartCountBadge();

  const modalContent = document.getElementById("modalContent");
  if (modalContent) {
    modalContent.innerHTML = `
      <div class="invoice-container">
        <div class="invoice-header">
          <h2 style="font-weight:700; color:#000; letter-spacing:-0.5px;">FAKTUR RESMI Pemesanan</h2>
          <span class="invoice-status">Menunggu Pembayaran</span>
        </div>

        <div style="font-size: 0.85rem; border-bottom: 1px solid #e5e5ea; padding-bottom:14px; margin-bottom:16px; color:#1d1d1f; line-height: 1.6;">
          <p><strong>Nomor Dokumen Faktur:</strong> ${invoiceNo}</p>
          <p><strong>Waktu Pencatatan:</strong> ${dateNow}</p>
          <p><strong>Konsumen Penerima Paket:</strong> ${currentUser ? currentUser.nama : '-'}</p>
          <p><strong>Nomor Kontak WhatsApp:</strong> ${currentUser ? currentUser.phone : '-'}</p>
          <p><strong>Alamat Destinasi Tujuan:</strong> ${currentUser ? currentUser.alamat : '-'}</p>
        </div>

        <div style="color:#000; font-size:0.85rem; margin-bottom:16px;">
          <p style="font-weight:700; margin-bottom:6px;">Rincian Manfaat Barang:</p>
          <ul style="padding-left:18px; line-height:1.6; color:#333;">
            ${itemsSummaryHtml}
          </ul>
        </div>

        <div style="text-align:right; font-weight:700; font-size:1.15rem; color:#000; margin-bottom:22px; border-top:1px solid #eee; padding-top:12px;">
          Total Tagihan Akumulasi: <span style="color:#dc3545;">${totalFormatted}</span>
        </div>

        <div class="payment-details">
          <p style="font-weight:700; border-bottom:1px solid #d2d2d7; padding-bottom:6px; margin-bottom:10px; color:#000;">Instruksi Pembayaran: ${method}</p>
          ${paymentInstruction}
        </div>

        <p style="font-size:0.75rem; color:#6c757d; text-align:center; margin-top:20px; line-height:1.5;">
          Sistem robotik kami akan mencocokkan laporan mutasi dari akun ${currentUser ? currentUser.namaBank : 'Anda'} secara seketika. Terima kasih telah mempercayakan transaksi digital Anda bersama BITZZ PHONE.
        </p>

        <button onclick="closeModal()" style="display:block; width:100%; margin-top:20px; padding:12px; background:#1a1d20; color:#fff; border:none; border-radius:25px; font-weight:600; cursor:pointer; font-size:0.9rem;">
          Selesai & Tutup Halaman Utama
        </button>
      </div>
    `;
  }
}