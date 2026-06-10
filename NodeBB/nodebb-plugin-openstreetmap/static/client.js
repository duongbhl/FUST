'use strict';

$(document).ready(function () {
	// Chờ module composer/formatting của NodeBB sẵn sàng
	require(['composer/formatting'], function (formatting) {
		// Thêm nút Bản đồ vào thanh định dạng
		formatting.addButton('fa fa-map-marker', function (textarea, selectionStart, selectionEnd) {
			const width = 680;
			const height = 750;
			const left = (screen.width - width) / 2;
			const top = (screen.height - height) / 2;
			
			const basePath = config.relative_path || '';
			
			// Mở trang bản đồ độc lập ở chế độ chọn địa điểm (mode=pick)
			const popup = window.open(
				basePath + '/assets/map.html?mode=pick',
				'FUSTMapPicker',
				`width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
			);

			// Lắng nghe kết quả từ popup gửi về
			const handleMessage = function (event) {
				if (event.origin !== window.location.origin) return;
				
				if (event.data && event.data.type === 'map-location-selected') {
					const { lat, lng, address } = event.data;
					
					// Rút ngắn địa chỉ để link không quá dài trong bài viết
					let shortAddress = address;
					if (shortAddress && shortAddress.length > 50) {
						shortAddress = shortAddress.substring(0, 47) + '...';
					}
					
					// Định dạng liên kết Markdown trỏ tới trang map.html
					const linkText = shortAddress ? `📍 ${shortAddress}` : `📍 Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
					const linkUrl = basePath + `/assets/map.html?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address || '')}`;
					const markdown = `[${linkText}](${linkUrl})`;

					// Chèn liên kết vào vị trí con trỏ của bài viết đang viết
					const val = textarea.value;
					const before = val.substring(0, selectionStart);
					const after = val.substring(selectionEnd);
					textarea.value = before + markdown + after;
					
					// Kích hoạt sự kiện để NodeBB cập nhật live preview
					$(textarea).trigger('input');

					// Hủy lắng nghe sự kiện
					window.removeEventListener('message', handleMessage);
				}
			};

			window.addEventListener('message', handleMessage);
		}, 'Thêm vị trí bản đồ', 'map-marker');
	});
});
