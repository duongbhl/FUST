'use strict';

$(document).ready(function () {
	// Helper để escape các ký tự đặc biệt của Markdown tránh làm vỡ định dạng thẻ thông tin
	function escapeMarkdown(text) {
		if (!text) return '';
		return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
	}

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
				// Bảo mật: Chỉ xử lý tin nhắn từ cùng origin
				if (event.origin !== window.location.origin) return;
				// Bảo mật: Chỉ xử lý tin nhắn từ đúng cửa sổ popup vừa mở
				if (event.source !== popup) return;
				
				if (event.data && event.data.type === 'map-location-selected') {
					const { lat, lng, address, name, rating } = event.data;
					
					const escapedName = escapeMarkdown(name);
					const escapedAddress = escapeMarkdown(address);
					
					// 1. Tạo tiêu đề thông tin cửa hàng
					let markdown = `> ### 🍽️ THÔNG TIN CỬA HÀNG`;
					if (name) {
						markdown = `> ### 🍽️ THÔNG TIN CỬA HÀNG: **${escapedName}**`;
					}
					
					// 2. Thêm thông tin địa chỉ
					markdown += `\n> *   **Địa chỉ:** ${escapedAddress}`;
					
					// 3. Thêm đánh giá sao nếu có
					if (rating && rating >= 1 && rating <= 5) {
						const starsFilled = '⭐'.repeat(rating);
						const starsEmpty = '☆'.repeat(5 - rating);
						markdown += `\n> *   **Đánh giá:** ${starsFilled}${starsEmpty} (${rating}/5)`;
					}
					
					// 4. Xây dựng đường dẫn xem bản đồ với đầy đủ tham số (đã được url-encode)
					let viewUrl = basePath + `/assets/map.html?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`;
					if (name) {
						viewUrl += `&name=${encodeURIComponent(name)}`;
					}
					if (rating) {
						viewUrl += `&rating=${rating}`;
					}
					
					// 5. Thêm liên kết bản đồ vào Markdown
					markdown += `\n> *   **Bản đồ:** [📍 Xem trên bản đồ](${viewUrl})\n\n`;

					// Chèn liên kết Markdown/Thẻ thông tin vào vị trí con trỏ của bài viết đang viết
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
