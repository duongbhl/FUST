# PLAN: Tích hợp Leaflet Map vào NodeBB

## Tổng quan tính năng

Thêm 2 chức năng vào forum:

1. **Location Picker trong Composer** — Khi tạo topic, người dùng có thể nhấn nút "Chọn vị trí" → mở modal bản đồ Leaflet → tìm kiếm địa chỉ hoặc click chọn điểm → tọa độ lưu vào topic
2. **Map Toàn cảnh trên Navbar** — Nút bản đồ trên thanh điều hướng → mở modal map → hiển thị tất cả topics có tọa độ dưới dạng markers → click marker → sidebar danh sách topics tại vị trí đó

---

## Thư viện sử dụng

| Thư viện | Mục đích | Ghi chú |
|---|---|---|
| Leaflet.js 1.9.4 | Render bản đồ | CDN, miễn phí |
| OpenStreetMap tiles | Bản đồ nền | Miễn phí, không cần API key |
| Nominatim API | Tìm kiếm địa chỉ + reverse geocode | Miễn phí, giới hạn 1 req/s |
| Leaflet.markercluster | Gộp nhiều markers | CDN, miễn phí |

---

## Luồng dữ liệu

```
[Composer UI]
  → User chọn vị trí trên map picker
  → Lưu {lat, lng, address} vào hidden field của form
  → Submit topic → POST /api/topics { ..., location: {lat, lng, address} }
  → src/api/topics.js nhận payload
  → src/topics/create.js lưu location vào topic:{tid} hash (JSON string)
  → Thêm tid vào set "topics:with:location"

[Map Modal trên Navbar]
  → User click nút Map
  → Modal mở, fetch GET /api/topics/locations
  → Server đọc set "topics:with:location" → lấy data từng topic
  → Trả về [{tid, title, slug, lat, lng, address}, ...]
  → Client render markers trên Leaflet
  → Click marker → sidebar hiện danh sách topics
```

---

## Cấu trúc dữ liệu

### Lưu trong Redis/MongoDB

```
topic:{tid} (hash)
  ├── tid: "42"
  ├── title: "Quán cà phê góc phố"
  ├── location: '{"lat":21.0285,"lng":105.8542,"address":"Phố Huế, Hà Nội"}'
  └── ... (các field hiện có)

topics:with:location (sorted set)
  → thành viên: các tid có location, score = timestamp
```

### API Request/Response

```json
POST /api/topics
{
  "cid": 1,
  "title": "Quán cà phê hay ở Hoàn Kiếm",
  "content": "...",
  "location": {
    "lat": 21.0285,
    "lng": 105.8542,
    "address": "Phố Huế, Hai Bà Trưng, Hà Nội"
  }
}

GET /api/topics/locations
→ [
    {
      "tid": 42,
      "title": "Quán cà phê hay ở Hoàn Kiếm",
      "slug": "42/quan-ca-phe-hay-o-hoan-kiem",
      "lat": 21.0285,
      "lng": 105.8542,
      "address": "Phố Huế, Hai Bà Trưng, Hà Nội",
      "postcount": 5,
      "timestamp": 1749550000000
    }
  ]
```

---

## Danh sách file thay đổi

| File | Thao tác | Mục đích |
|---|---|---|
| `src/topics/create.js` | Sửa | Lưu location vào topicData khi tạo topic |
| `src/topics/data.js` | Sửa | Parse JSON location khi đọc topic |
| `src/api/topics.js` | Sửa | Nhận location trong payload API |
| `src/routes/write/topics.js` | Sửa | Thêm route GET /api/topics/locations |
| `src/controllers/write/topics.js` | Sửa | Handler cho endpoint locations |
| `node_modules/nodebb-plugin-composer-default/static/lib/composer.js` | Sửa | Gửi location trong POST payload |
| `node_modules/nodebb-plugin-composer-default/static/templates/compose.tpl` | Sửa | Thêm UI location picker |
| `node_modules/nodebb-theme-harmony/templates/partials/topic/header.tpl` | Sửa | Hiển thị badge địa chỉ dưới tiêu đề topic |
| `public/src/client/map-view.js` | Tạo mới | JS cho map toàn cảnh + sidebar |
| `public/src/client/location-picker.js` | Tạo mới | JS cho location picker trong composer |
| `views/partials/modals/map-view.tpl` | Tạo mới | HTML template cho modal map toàn cảnh |
| `node_modules/nodebb-theme-harmony/templates/partials/header/navigation.tpl` | Sửa | Thêm nút Map vào navbar |

---

## Các bước thực hiện chi tiết

---

### Bước 1 — Backend: Lưu location khi tạo topic

**File:** `src/topics/create.js`

Tìm hàm `Topics.create()`, phần khởi tạo `topicData` (khoảng dòng 28-40). Sau khi định nghĩa `topicData`, thêm đoạn lưu location:

```javascript
// Thêm vào sau khi khởi tạo topicData object
if (data.location &&
    typeof data.location.lat === 'number' &&
    typeof data.location.lng === 'number' &&
    data.location.lat >= -90 && data.location.lat <= 90 &&
    data.location.lng >= -180 && data.location.lng <= 180) {
    topicData.location = JSON.stringify({
        lat: data.location.lat,
        lng: data.location.lng,
        address: String(data.location.address || '').substring(0, 200),
    });
}
```

Sau khi lưu topic (`db.setObject(...)`), thêm vào sorted set để có thể truy vấn nhanh:

```javascript
// Thêm sau dòng db.setObject(`topic:${tid}`, topicData)
if (topicData.location) {
    await db.sortedSetAdd('topics:with:location', topicData.timestamp, topicData.tid);
}
```

---

### Bước 2 — Backend: Parse location khi đọc topic

**File:** `src/topics/data.js`

Tìm hàm `modifyTopic()`. Thêm vào cuối hàm, trước `return topic`:

```javascript
// Parse location từ JSON string về object
if (topic.location) {
    try {
        topic.location = JSON.parse(topic.location);
    } catch (e) {
        topic.location = null;
    }
} else {
    topic.location = null;
}
```

---

### Bước 3 — Backend: API nhận location

**File:** `src/api/topics.js`

Tìm hàm `topicsAPI.create()`. Trước dòng gọi `topics.post(...)`, đảm bảo `data.location` được truyền qua. Kiểm tra đoạn code hiện tại có loại bỏ các field không mong muốn không — nếu có `delete data.location` thì bỏ dòng đó.

Thêm validation nhẹ:

```javascript
// Trước khi gọi topics.post()
if (data.location) {
    const loc = data.location;
    if (!loc.lat || !loc.lng || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
        delete data.location; // bỏ qua nếu không hợp lệ
    }
}
```

---

### Bước 4 — Backend: Endpoint GET /api/topics/locations

**File:** `src/controllers/write/topics.js`

Thêm hàm mới vào cuối file:

```javascript
Topics.getLocations = async function (req, res) {
    const tids = await db.getSortedSetRange('topics:with:location', 0, -1);
    if (!tids.length) {
        return res.json([]);
    }

    const topicsData = await topics.getTopicsFields(tids, [
        'tid', 'title', 'slug', 'location', 'postcount', 'timestamp', 'deleted'
    ]);

    const result = topicsData
        .filter(t => t && !t.deleted && t.location)
        .map(t => {
            let loc;
            try {
                loc = typeof t.location === 'string' ? JSON.parse(t.location) : t.location;
            } catch (e) {
                return null;
            }
            if (!loc || !loc.lat || !loc.lng) return null;
            return {
                tid: t.tid,
                title: t.title,
                slug: t.slug,
                lat: loc.lat,
                lng: loc.lng,
                address: loc.address || '',
                postcount: t.postcount,
                timestamp: t.timestamp,
            };
        })
        .filter(Boolean);

    res.json(result);
};
```

**File:** `src/routes/write/topics.js`

Thêm route mới:

```javascript
router.get('/topics/locations', middleware.authenticate, controllers.write.topics.getLocations);
```

---

### Bước 5 — Frontend: Location Picker JS

**File tạo mới:** `public/src/client/location-picker.js`

```javascript
'use strict';

const LocationPicker = {
    map: null,
    marker: null,
    selectedLocation: null,
    HANOI: [21.0285, 105.8542],
    ZOOM: 13,

    init(containerId) {
        if (this.map) {
            this.map.remove();
        }
        this.map = L.map(containerId).setView(this.HANOI, this.ZOOM);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(this.map);

        this.map.on('click', (e) => this._onMapClick(e));
    },

    _onMapClick(e) {
        const { lat, lng } = e.latlng;
        this._setMarker(lat, lng);
        this._reverseGeocode(lat, lng);
    },

    _setMarker(lat, lng) {
        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng]).addTo(this.map);
        }
        this.selectedLocation = { lat, lng, address: '' };
    },

    // Debounce để không gọi Nominatim quá 1 req/s
    _reverseGeocode: debounce(async function (lat, lng) {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                { headers: { 'Accept-Language': 'vi' } }
            );
            const data = await res.json();
            const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            this.selectedLocation.address = address;
            document.getElementById('location-address-display').textContent = address;
        } catch (e) {
            this.selectedLocation.address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, 600),

    search: debounce(async function (query) {
        if (!query.trim()) return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=vn&format=json&limit=1`,
                { headers: { 'Accept-Language': 'vi' } }
            );
            const results = await res.json();
            if (results.length) {
                const { lat, lon, display_name } = results[0];
                const latNum = parseFloat(lat);
                const lngNum = parseFloat(lon);
                this.map.setView([latNum, lngNum], 16);
                this._setMarker(latNum, lngNum);
                this.selectedLocation.address = display_name;
                document.getElementById('location-address-display').textContent = display_name;
            }
        } catch (e) {
            console.error('Geocode error:', e);
        }
    }, 600),

    getLocation() {
        return this.selectedLocation;
    },

    clear() {
        if (this.marker) {
            this.map.removeLayer(this.marker);
            this.marker = null;
        }
        this.selectedLocation = null;
        document.getElementById('location-address-display').textContent = '';
    },
};

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

window.LocationPicker = LocationPicker;
```

---

### Bước 6 — Frontend: Thêm UI vào Composer

**File:** `node_modules/nodebb-plugin-composer-default/static/templates/compose.tpl`

Tìm khu vực footer của composer (nơi có nút submit). Thêm nút và modal trước nút Submit:

```html
<!-- Nút chọn vị trí -->
<button type="button" class="btn btn-sm btn-outline-secondary" id="btn-pick-location" title="Chọn vị trí">
    <i class="fa fa-map-marker"></i> <span id="location-label">Thêm vị trí</span>
</button>

<!-- Hidden inputs lưu dữ liệu -->
<input type="hidden" id="topic-location-lat" name="location_lat">
<input type="hidden" id="topic-location-lng" name="location_lng">
<input type="hidden" id="topic-location-address" name="location_address">

<!-- Modal Location Picker -->
<div class="modal fade" id="location-picker-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa fa-map-marker"></i> Chọn vị trí</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
                <!-- Search bar -->
                <div class="p-3 border-bottom d-flex gap-2">
                    <input type="text" id="location-search-input" class="form-control"
                           placeholder="Tìm kiếm địa chỉ... (vd: Phố Huế, Hà Nội)">
                    <button class="btn btn-primary" id="btn-location-search">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
                <!-- Map container -->
                <div id="location-picker-map" style="height: 380px;"></div>
                <!-- Address display -->
                <div class="p-3 bg-light border-top">
                    <small class="text-muted">Địa chỉ đã chọn:</small>
                    <div id="location-address-display" class="fw-semibold mt-1" style="min-height:1.5em">
                        (Chưa chọn — click vào bản đồ để chọn)
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-danger btn-sm" id="btn-clear-location">
                    <i class="fa fa-times"></i> Xóa vị trí
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="button" class="btn btn-primary" id="btn-confirm-location">
                    <i class="fa fa-check"></i> Xác nhận
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Leaflet CSS/JS (load 1 lần) -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

**File:** `node_modules/nodebb-plugin-composer-default/static/lib/composer.js`

Thêm script khởi động location picker vào cuối file hoặc vào hàm init của composer:

```javascript
// Khởi tạo location picker
(function initLocationPicker() {
    const modal = document.getElementById('location-picker-modal');
    if (!modal) return;

    // Mở modal → init map
    modal.addEventListener('shown.bs.modal', () => {
        if (!window.LocationPicker.map) {
            window.LocationPicker.init('location-picker-map');
        } else {
            // Fix: invalidate map size khi modal show
            window.LocationPicker.map.invalidateSize();
        }
    });

    // Search
    document.getElementById('btn-location-search').addEventListener('click', () => {
        const q = document.getElementById('location-search-input').value;
        window.LocationPicker.search(q);
    });
    document.getElementById('location-search-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') window.LocationPicker.search(e.target.value);
    });

    // Confirm
    document.getElementById('btn-confirm-location').addEventListener('click', () => {
        const loc = window.LocationPicker.getLocation();
        if (!loc) return;
        document.getElementById('topic-location-lat').value = loc.lat;
        document.getElementById('topic-location-lng').value = loc.lng;
        document.getElementById('topic-location-address').value = loc.address;
        document.getElementById('location-label').textContent =
            loc.address ? loc.address.substring(0, 30) + '…' : `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
        document.getElementById('btn-pick-location').classList.add('btn-success');
        document.getElementById('btn-pick-location').classList.remove('btn-outline-secondary');
        bootstrap.Modal.getInstance(modal).hide();
    });

    // Clear
    document.getElementById('btn-clear-location').addEventListener('click', () => {
        window.LocationPicker.clear();
        document.getElementById('topic-location-lat').value = '';
        document.getElementById('topic-location-lng').value = '';
        document.getElementById('topic-location-address').value = '';
        document.getElementById('location-label').textContent = 'Thêm vị trí';
        document.getElementById('btn-pick-location').classList.remove('btn-success');
        document.getElementById('btn-pick-location').classList.add('btn-outline-secondary');
        bootstrap.Modal.getInstance(modal).hide();
    });
}());
```

Trong phần submit topic (hàm `post()`), thêm location vào composerData:

```javascript
// Thêm vào trong composerData khi action === 'topics.post'
const lat = parseFloat(document.getElementById('topic-location-lat')?.value);
const lng = parseFloat(document.getElementById('topic-location-lng')?.value);
const address = document.getElementById('topic-location-address')?.value || '';
if (!isNaN(lat) && !isNaN(lng)) {
    composerData.location = { lat, lng, address };
}
```

---

### Bước 7 — Frontend: Hiển thị địa chỉ trên trang topic

**File:** `node_modules/nodebb-theme-harmony/templates/partials/topic/header.tpl`

Sau dòng tiêu đề topic (`<h1>` hoặc title), thêm badge địa chỉ:

```html
{{{ if topic.location }}}
<div class="topic-location mb-2">
    <a href="#topic-location-map" class="badge bg-light text-dark border text-decoration-none">
        <i class="fa fa-map-marker text-danger"></i>
        {topic.location.address}
    </a>
</div>
{{{ end }}}
```

Và thêm mini-map ở cuối nội dung (trong `topic.tpl` hoặc `footer.tpl`):

```html
{{{ if topic.location }}}
<div id="topic-location-map" class="mt-3 mb-3 rounded overflow-hidden" style="height:200px;">
</div>
<script>
require(['leaflet'], function () {
    var map = L.map('topic-location-map', { zoomControl: true, scrollWheelZoom: false })
        .setView([{topic.location.lat}, {topic.location.lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([{topic.location.lat}, {topic.location.lng}])
        .addTo(map)
        .bindPopup('{topic.location.address}')
        .openPopup();
});
</script>
{{{ end }}}
```

---

### Bước 8 — Frontend: Map toàn cảnh (Modal từ Navbar)

**File tạo mới:** `public/src/client/map-view.js`

```javascript
'use strict';

const MapView = {
    map: null,
    markersLayer: null,
    sidebar: null,

    HANOI: [21.0285, 105.8542],

    async open() {
        const modal = document.getElementById('global-map-modal');
        bootstrap.Modal.getOrCreateInstance(modal).show();

        modal.addEventListener('shown.bs.modal', async () => {
            if (!this.map) {
                this.map = L.map('global-map-container').setView(this.HANOI, 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                }).addTo(this.map);
                this.markersLayer = L.layerGroup().addTo(this.map);
            }
            this.map.invalidateSize();
            await this.loadMarkers();
        }, { once: true });
    },

    async loadMarkers() {
        try {
            const res = await fetch('/api/topics/locations');
            const locations = await res.json();
            this.markersLayer.clearLayers();

            // Gộp các topics cùng vị trí
            const clusters = {};
            for (const loc of locations) {
                const key = `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`;
                if (!clusters[key]) clusters[key] = { lat: loc.lat, lng: loc.lng, topics: [] };
                clusters[key].topics.push(loc);
            }

            for (const cluster of Object.values(clusters)) {
                const marker = L.marker([cluster.lat, cluster.lng]);
                marker.on('click', () => this.showSidebar(cluster.topics));
                marker.addTo(this.markersLayer);
            }
        } catch (e) {
            console.error('Failed to load locations:', e);
        }
    },

    showSidebar(topics) {
        const sidebar = document.getElementById('map-sidebar');
        const list = document.getElementById('map-sidebar-list');
        list.innerHTML = '';

        for (const t of topics) {
            const item = document.createElement('a');
            item.href = `/topic/${t.slug}`;
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="fw-semibold">${t.title}</div>
                <small class="text-muted">
                    <i class="fa fa-comment"></i> ${t.postcount} bài viết
                    &nbsp;·&nbsp;
                    <i class="fa fa-map-marker"></i> ${t.address || 'Không có địa chỉ'}
                </small>`;
            list.appendChild(item);
        }

        sidebar.classList.remove('d-none');
    },
};

window.MapView = MapView;
```

**File tạo mới:** `views/partials/modals/map-view.tpl`

```html
<!-- Modal Map Toàn cảnh -->
<div class="modal fade" id="global-map-modal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-fullscreen-md-down">
        <div class="modal-content" style="height: 80vh;">
            <div class="modal-header py-2">
                <h5 class="modal-title">
                    <i class="fa fa-map"></i> Bản đồ địa điểm
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0 d-flex" style="overflow:hidden; height:100%;">
                <!-- Map chiếm phần lớn -->
                <div id="global-map-container" style="flex:1; height:100%;"></div>

                <!-- Sidebar danh sách topics -->
                <div id="map-sidebar" class="d-none border-start" style="width:320px; overflow-y:auto;">
                    <div class="p-3 border-bottom fw-semibold bg-light">
                        <i class="fa fa-list"></i> Bài viết tại vị trí này
                    </div>
                    <div id="map-sidebar-list" class="list-group list-group-flush"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="/assets/src/client/map-view.js"></script>
```

---

### Bước 9 — Frontend: Nút Map trên Navbar

**File:** `node_modules/nodebb-theme-harmony/templates/partials/header/navigation.tpl`

Tìm dòng chứa các navigation links, thêm nút Map:

```html
<li class="nav-item">
    <a class="nav-link" href="#" onclick="MapView.open(); return false;" title="Bản đồ địa điểm">
        <i class="fa fa-map-o"></i>
        <span class="visible-xs-inline">Bản đồ</span>
    </a>
</li>
```

Thêm include modal vào base layout (`node_modules/nodebb-theme-harmony/templates/base.tpl` hoặc tương đương), trước `</body>`:

```html
<!-- IMPORT partials/modals/map-view.tpl -->
```

---

## Thứ tự thực hiện

```
Sprint 1 — Backend (ưu tiên)
├── [ ] Bước 1: src/topics/create.js — lưu location
├── [ ] Bước 2: src/topics/data.js — parse location
├── [ ] Bước 3: src/api/topics.js — nhận location trong API
└── [ ] Bước 4: Endpoint GET /api/topics/locations

Sprint 2 — Location Picker
├── [ ] Bước 5: Tạo public/src/client/location-picker.js
└── [ ] Bước 6: Sửa composer (template + submit logic)

Sprint 3 — Map Toàn cảnh
├── [ ] Bước 7: Badge địa chỉ + mini-map trên trang topic
├── [ ] Bước 8: Tạo map-view.js + modal template
└── [ ] Bước 9: Nút Map trên navbar
```

---

## Kiểm thử

| Test case | Kết quả mong đợi |
|---|---|
| Tạo topic có chọn vị trí | `topic:{tid}` có field `location` là JSON string |
| Tạo topic không chọn vị trí | `topic:{tid}` không có field `location`, không lỗi |
| GET /api/topics/locations | Trả về array topics có tọa độ hợp lệ |
| Mở trang topic có location | Hiện badge địa chỉ + mini-map |
| Mở trang topic không có location | Không hiện gì, không lỗi |
| Mở modal map từ navbar | Map load, markers hiển thị đúng vị trí |
| Click marker | Sidebar mở, danh sách topics hiển thị |
| Click topic trong sidebar | Navigate đến trang topic |
| Xóa location trong composer | Hidden inputs rỗng, không gửi location |

---

## Lưu ý quan trọng

1. **Nominatim rate limit**: Luôn dùng `debounce` tối thiểu 600ms trước mỗi request geocode
2. **Composer plugin là node_modules**: Các thay đổi trong `node_modules/` sẽ mất khi `npm install` lại — cần commit hoặc patch
3. **Leaflet CSS**: Phải load CSS của Leaflet **trước** JS, nếu không markers sẽ bị vỡ layout
4. **map.invalidateSize()**: Bắt buộc gọi sau khi modal hiển thị xong, nếu không map render sai kích thước
5. **Benchpress template**: NodeBB dùng `{{{ if variable }}}` (3 dấu ngoặc) cho conditionals, **không phải** Handlebars 2 dấu
6. **Không dùng `{topic.location.lat}` trực tiếp trong JS**: Escape để tránh XSS — dùng data attribute hoặc JSON.parse từ hidden element
