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
     * 선언문만 PNG 이미지로 다운로드
     */
    async downloadDeclarationOnly() {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent || !previewContent.innerHTML) {
            alert('먼저 선언문 미리보기를 생성해주세요.');
            return;
        }

        try {
            // 버튼 비활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = true);

            // html2canvas 라이브러리 확인
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas 라이브러리를 불러오지 못했습니다.');
            }

            // 임시 컨테이너 생성
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                padding: 50px;
                background: white;
                width: 800px;
                position: fixed;
                left: -10000px;
                top: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            `;
            
            // 헤더 정보 가져오기
            const grade = document.getElementById('grade')?.value || '';
            const classNum = document.getElementById('classNum')?.value || '';
            const studentName = document.getElementById('studentName')?.value || '';
            const teamName = document.getElementById('teamName')?.value || '';
            const declaration = document.getElementById('declaration')?.value || '';
            
            // 학생 정보 조합
            const studentInfo = [];
            if (grade) studentInfo.push(`${grade}학년`);
            if (classNum) studentInfo.push(`${classNum}반`);
            if (studentName) studentInfo.push(studentName);
            const studentInfoText = studentInfo.join(' ');
            
            // 날짜
            const today = new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // HTML 생성
            tempContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🌍</div>
                    <h1 style="font-size: 36px; color: #2ecc71; margin: 20px 0; font-weight: 700;">${teamName}</h1>
                    ${studentInfoText ? `<div style="font-size: 18px; color: #7f8c8d; margin: 15px 0;">${studentInfoText}</div>` : ''}
                    <div style="width: 100px; height: 5px; background: linear-gradient(90deg, #2ecc71, #27ae60); margin: 25px auto; border-radius: 3px;"></div>
                    <div style="font-size: 14px; color: #95a5a6; letter-spacing: 2px; margin-top: 20px;">지속가능한 미래 선언문</div>
                </div>
                
                <div style="background: #fff9e6; padding: 30px; border-radius: 15px; border-left: 5px solid #f39c12; margin: 30px 0;">
                    <div style="font-size: 16px; font-weight: 600; color: #f39c12; margin-bottom: 20px;">📜 우리의 선언문</div>
                    <div style="font-size: 16px; line-height: 2; color: #2c3e50; white-space: pre-wrap;">${declaration}</div>
                </div>
                
                <div style="text-align: right; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <div style="color: #95a5a6; font-size: 14px;">${today}</div>
                </div>
            `;
            
            document.body.appendChild(tempContainer);

            // 약간의 딜레이를 주어 DOM이 완전히 렌더링되도록 함
            await new Promise(resolve => setTimeout(resolve, 100));

            // html2canvas로 이미지 생성
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 800,
                windowWidth: 800
            });

            // 임시 컨테이너 제거
            document.body.removeChild(tempContainer);

            // 파일명 생성
            const fileName = `${this.sanitizeFileName(teamName)}_선언문_${this.getDateString()}.png`;

            // 다운로드
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();

            this.showNotification('✅ 선언문 이미지 다운로드 완료!', 'success');
        } catch (error) {
            console.error('선언문 이미지 생성 오류:', error);
            alert('선언문 이미지를 생성하는 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 버튼 활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = false);
        }
    },

    /**
     * 학습 결과(1~5단계) PNG 이미지로 다운로드
     */
    async downloadLearningResult() {
        try {
            // 버튼 비활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = true);

            // html2canvas 라이브러리 확인
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas 라이브러리를 불러오지 못했습니다.');
            }

            // 데이터 수집
            const grade = document.getElementById('grade')?.value || '';
            const classNum = document.getElementById('classNum')?.value || '';
            const studentName = document.getElementById('studentName')?.value || '';
            const teamName = document.getElementById('teamName')?.value || '';
            const members = document.getElementById('members')?.value || '';
            
            // 환경 문제
            const problems = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                problems.push(cb.value);
            });
            const otherProblem = document.getElementById('otherProblem')?.value || '';
            if (otherProblem) {
                problems.push(otherProblem);
            }
            const problemDetail = document.getElementById('problemDetail')?.value || '';
            
            // 핵심 메시지
            const coreMessage = document.getElementById('coreMessage')?.value || '';
            
            // 설득 대상
            const target = document.querySelector('input[name="target"]:checked')?.value || '';
            const targetStrategy = document.getElementById('targetStrategy')?.value || '';
            
            // 실천 방안
            const action1 = document.getElementById('action1')?.value || '';
            const action2 = document.getElementById('action2')?.value || '';
            const action3 = document.getElementById('action3')?.value || '';

            // 필수 필드 확인
            if (!teamName || !problemDetail || !coreMessage || !action1 || !action2) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

            // 학생 정보 조합
            const studentInfo = [];
            if (grade) studentInfo.push(`${grade}학년`);
            if (classNum) studentInfo.push(`${classNum}반`);
            if (studentName) studentInfo.push(studentName);
            const studentInfoText = studentInfo.join(' ');
            
            // 날짜
            const today = new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            // 임시 컨테이너 생성
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                padding: 50px;
                background: white;
                width: 900px;
                position: fixed;
                left: -10000px;
                top: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            `;
            
            // HTML 생성
            let html = `
                <!-- 헤더 -->
                <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #2ecc71;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🌍</div>
                    <h1 style="font-size: 32px; color: #2ecc71; margin: 15px 0; font-weight: 700;">${teamName}</h1>
                    ${studentInfoText ? `<div style="font-size: 16px; color: #7f8c8d; margin: 10px 0;">${studentInfoText}</div>` : ''}
                    ${members ? `<div style="font-size: 14px; color: #95a5a6; margin: 10px 0;">함께한 친구: ${members}</div>` : ''}
                    <div style="font-size: 13px; color: #bdc3c7; margin-top: 15px; letter-spacing: 1px;">환경 프로젝트 학습 결과</div>
                </div>

                <!-- 1. 환경 문제 -->
                <div style="margin-bottom: 30px; background: #e8f5e9; padding: 25px; border-radius: 12px; border-left: 5px solid #2ecc71;">
                    <div style="font-size: 18px; font-weight: 700; color: #2ecc71; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="background: #2ecc71; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">1</span>
                        우리가 해결하고 싶은 환경 문제
                    </div>
                    ${problems.length > 0 ? `
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #27ae60;">선택한 문제:</strong>
                            <span style="color: #2c3e50; margin-left: 8px;">${problems.join(', ')}</span>
                        </div>
                    ` : ''}
                    <div style="line-height: 1.8; color: #2c3e50; white-space: pre-wrap; background: white; padding: 15px; border-radius: 8px;">${problemDetail}</div>
                </div>

                <!-- 2. 핵심 메시지 -->
                <div style="margin-bottom: 30px; background: #fff9e6; padding: 25px; border-radius: 12px; border-left: 5px solid #f39c12;">
                    <div style="font-size: 18px; font-weight: 700; color: #f39c12; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="background: #f39c12; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">2</span>
                        우리의 핵심 메시지
                    </div>
                    <div style="font-size: 20px; font-weight: 600; color: #f39c12; text-align: center; padding: 20px; background: white; border-radius: 8px;">
                        "${coreMessage}"
                    </div>
                </div>

                <!-- 3. 설득 대상 -->
                <div style="margin-bottom: 30px; background: #e3f2fd; padding: 25px; border-radius: 12px; border-left: 5px solid #3498db;">
                    <div style="font-size: 18px; font-weight: 700; color: #3498db; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="background: #3498db; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">3</span>
                        우리가 설득하고 싶은 대상
                    </div>
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #2980b9;">대상:</strong>
                        <span style="color: #2c3e50; margin-left: 8px; font-size: 18px;">${target}</span>
                    </div>
                    ${targetStrategy ? `
                        <div style="line-height: 1.8; color: #2c3e50; white-space: pre-wrap; background: white; padding: 15px; border-radius: 8px; margin-top: 10px;">${targetStrategy}</div>
                    ` : ''}
                </div>

                <!-- 4. 실천 방안 -->
                <div style="margin-bottom: 30px; background: #fce4ec; padding: 25px; border-radius: 12px; border-left: 5px solid #e91e63;">
                    <div style="font-size: 18px; font-weight: 700; color: #e91e63; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="background: #e91e63; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">4</span>
                        구체적인 실천 방안
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <div style="margin-bottom: 12px; padding: 12px; background: #fff; border-left: 3px solid #e91e63;">
                            <strong style="color: #c2185b;">실천 1:</strong>
                            <span style="color: #2c3e50; margin-left: 8px;">${action1}</span>
                        </div>
                        <div style="margin-bottom: 12px; padding: 12px; background: #fff; border-left: 3px solid #e91e63;">
                            <strong style="color: #c2185b;">실천 2:</strong>
                            <span style="color: #2c3e50; margin-left: 8px;">${action2}</span>
                        </div>
                        ${action3 ? `
                            <div style="padding: 12px; background: #fff; border-left: 3px solid #e91e63;">
                                <strong style="color: #c2185b;">실천 3:</strong>
                                <span style="color: #2c3e50; margin-left: 8px;">${action3}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- 푸터 -->
                <div style="text-align: right; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <div style="color: #95a5a6; font-size: 14px;">${today}</div>
                    <div style="color: #bdc3c7; font-size: 12px; margin-top: 5px;">그린NGO 홍보대사 프로젝트</div>
                </div>
            `;
            
            tempContainer.innerHTML = html;
            document.body.appendChild(tempContainer);

            // DOM 렌더링 대기
            await new Promise(resolve => setTimeout(resolve, 100));

            // html2canvas로 이미지 생성
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 900,
                windowWidth: 900
            });

            // 임시 컨테이너 제거
            document.body.removeChild(tempContainer);

            // 파일명 생성
            const fileName = `${this.sanitizeFileName(teamName)}_학습결과_${this.getDateString()}.png`;

            // 다운로드
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();

            this.showNotification('✅ 학습 결과 이미지 다운로드 완료!', 'success');
        } catch (error) {
            console.error('학습 결과 이미지 생성 오류:', error);
            alert('학습 결과 이미지를 생성하는 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 버튼 활성화
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => btn.disabled = false);
        }
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