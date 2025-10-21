/**
 * 선언문 내보내기 모듈
 * PDF 및 이미지 다운로드 기능 제공
 */

const ExportModule = {
    /**
     * PDF로 다운로드
     */
    async downloadPDF() {
        const preview = document.getElementById('preview');
        if (!preview || preview.style.display === 'none') {
            alert('먼저 선언문 미리보기를 생성해주세요.');
            return;
        }

        try {
            // 버튼 비활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = true);

            // jsPDF 라이브러리 확인
            if (typeof window.jspdf === 'undefined') {
                throw new Error('PDF 라이브러리를 불러오지 못했습니다.');
            }

            const { jsPDF } = window.jspdf;
            
            // html2canvas로 미리보기를 이미지로 변환
            const canvas = await html2canvas(preview, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 190; // A4 width in mm (210mm - 20mm margins)
            const pageHeight = 277; // A4 height in mm (297mm - 20mm margins)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF({
                orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            let heightLeft = imgHeight;
            let position = 10; // 상단 여백

            // 첫 페이지 추가
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // 필요시 추가 페이지
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // 파일명 생성
            const teamName = document.getElementById('teamName')?.value || '선언문';
            const fileName = `${this.sanitizeFileName(teamName)}_${this.getDateString()}.pdf`;
            
            // PDF 저장
            pdf.save(fileName);

            this.showNotification('✅ PDF 다운로드 완료!', 'success');
        } catch (error) {
            console.error('PDF 생성 오류:', error);
            alert('PDF를 생성하는 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 버튼 활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = false);
        }
    },

    /**
     * PNG 이미지로 다운로드
     */
    async downloadImage() {
        const preview = document.getElementById('preview');
        if (!preview || preview.style.display === 'none') {
            alert('먼저 선언문 미리보기를 생성해주세요.');
            return;
        }

        try {
            // 버튼 비활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = true);

            // html2canvas로 이미지 생성
            const canvas = await html2canvas(preview, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // 파일명 생성
            const teamName = document.getElementById('teamName')?.value || '선언문';
            const fileName = `${this.sanitizeFileName(teamName)}_${this.getDateString()}.png`;

            // 다운로드
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();

            this.showNotification('✅ 이미지 다운로드 완료!', 'success');
        } catch (error) {
            console.error('이미지 생성 오류:', error);
            alert('이미지를 생성하는 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 버튼 활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = false);
        }
    },

    /**
     * 파일명 정리 (특수문자 제거)
     */
    sanitizeFileName(name) {
        return name
            .replace(/[^a-zA-Z0-9가-힣\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    },

    /**
     * 날짜 문자열 생성 (YYYYMMDD)
     */
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    /**
     * 알림 메시지 표시
     */
    showNotification(message, type = 'success') {
        const existing = document.querySelector('.save-status');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `save-status ${type} show`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// 전역으로 내보내기
window.ExportModule = ExportModule;