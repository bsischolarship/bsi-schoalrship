async function loadJson(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Gagal load ${path}: ${res.status}`);
    }
    return await res.json();
}

let mahasiswaData = [];
let formConfig = null;

async function initCekPage() {
    const resultEl = document.getElementById("cek-result");
    try {
        mahasiswaData = await loadJson("data/mahasiswa.json");
        formConfig = await loadJson("config/form.json");
    } catch (err) {
        console.error(err);
        if (resultEl) {
            resultEl.innerHTML = `
                <div class="error">
                    Terjadi kesalahan saat memuat data awal.<br/>
                    Pastikan <code>data/mahasiswa.json</code> dan <code>config/form.json</code> tersedia.
                </div>
            `;
        }
    }
}

function handleCek(event) {
    event.preventDefault();

    const nimInput = document.getElementById("nim");
    const resultEl = document.getElementById("cek-result");

    if (!nimInput || !resultEl) return false;

    const nim = (nimInput.value || "").trim();

    if (!nim) {
        resultEl.innerHTML = `
            <div class="error">
                Nomor Induk tidak boleh kosong.
            </div>
        `;
        return false;
    }

    if (!Array.isArray(mahasiswaData) || !formConfig) {
        resultEl.innerHTML = `
            <div class="error">
                Data belum siap. Coba muat ulang halaman (refresh).
            </div>
        `;
        return false;
    }

    const found = mahasiswaData.find((m) => String(m.nim) === nim);

    if (!found) {
        resultEl.innerHTML = `
            <div class="error">
                NIM <strong>${nim}</strong> tidak ditemukan dalam database.
                Pastikan NIM sudah benar atau hubungi administrator.
            </div>
        `;
        return false;
    }

    const baseUrl = formConfig.form_url || "";
    const fields = formConfig.prefill || {};

    if (!baseUrl || !fields.nim || !fields.nama || !fields.kampus || !fields.email) {
        resultEl.innerHTML = `
            <div class="error">
                Konfigurasi Form belum lengkap.<br/>
                Pastikan <code>config/form.json</code> sudah diisi:
                <code>form_url</code> dan semua <code>entry.*</code>.
            </div>
        `;
        return false;
    }

    const params = new URLSearchParams();
    params.set(fields.nim, found.nim || "");
    params.set(fields.nama, found.nama || "");
    params.set(fields.kampus, found.kampus || "");
    params.set(fields.email, found.email || "");

    const finalUrl =
        baseUrl.includes("?") ? `${baseUrl}&${params.toString()}` : `${baseUrl}?${params.toString()}`;

    resultEl.innerHTML = `
        <div class="result-card">
            <p><strong>Data ditemukan:</strong></p>
            <p>NIM: <strong>${found.nim}</strong></p>
            <p>Nama: <strong>${found.nama || "-"}</strong></p>
            <p>Kampus: <strong>${found.kampus || "-"}</strong></p>
            <p>Email: <strong>${found.email || "-"}</strong></p>
            <br/>
            <a class="btn btn-primary" href="${finalUrl}" target="_blank" rel="noopener">
                Lanjut ke Form Beasiswa
            </a>
        </div>
    `;

    return false;
}

window.handleCek = handleCek;
window.initCekPage = initCekPage;
