/**
 * 그린NGO 선언문 만들기 - 메인 스크립트
 */

const DeclarationApp = {
    // 앱 초기화
    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updateProgress();
        this.startAutoSave();
    },

    /**
     * XSS 방어: HTML 이스케이프
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 모드 변경
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', this.handleModeChange.bind(this));
        });

        // 입력 필드 변경 시 진행도 업데이트 및 자동 저장
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('input', this.debounce(() => {
                this.updateProgress();
            }, 300));
            element.addEventListener('change', this.updateProgress.bind(this));
        });

        // 키보드 접근성
        document.querySelectorAll('.radio-option label, .checkbox-option label').forEach(label => {
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    label.click();
                }
            });
        });
    },

    /**
     * 모드 변경 처리
     */
    handleModeChange(event) {
        const isGroup = event.target.value === 'group';
        const nameLabel = document.getElementById('nameLabel');
        const teamNameInput = document.getElementById('teamName');
        const membersLabel = document.getElementById('membersLabel');
        const membersInput = document.getElementById('members');
        const studentNameLabel = document.getElementById('studentNameLabel');

        if (nameLabel && teamNameInput) {
            nameLabel.textContent = isGroup ? '모둠 이름' : 'NGO 이름';
            teamNameInput.placeholder = isGroup ? '예: 지구지킴이' : '예: 환경지킴이';
        }

        if (membersLabel && membersInput) {
            membersLabel.textContent = isGroup ? '모둠원 (선택)' : '함께하는 친구 (선택)';
            membersInput.placeholder = isGroup ? '예: 홍길동, 김영희, 이철수' : '예: 김영희, 이철수';
        }
        
        if (studentNameLabel) {
            studentNameLabel.textContent = isGroup ? '대표 이름' : '이름';
        }
    },

    /**
     * 진행도 업데이트
     */
    updateProgress() {
        try {
            const totalFields = 8;
            let filledFields = 0;

            const fields = [
                'teamName',
                'problemDetail',
                'coreMessage',
                'targetStrategy',
                'action1',
                'action2',
                'declaration'
            ];

            fields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element && element.value.trim()) {
                    filledFields++;
                }
            });

            // 대상 선택 확인
            const targetRadio = document.querySelector('input[name="target"]:checked');
            if (targetRadio) {
                filledFields++;
            }

            const progress = (filledFields / totalFields) * 100;
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            
            // Zone 2 업데이트
            this.updateCompletionSection();
        } catch (error) {
            console.error('진행도 업데이트 오류:', error);
        }
    },
    
    /**
     * Zone 2A: 학습 과정 섹션 업데이트 (1-5단계)
     */
    updateLearningSection() {
        const learningFields = [
            { id: 'teamName', label: 'NGO 이름' },
            { id: 'problemDetail', label: '환경 문제 설명' },
            { id: 'coreMessage', label: '핵심 메시지' },
            { id: 'targetStrategy', label: '설득 대상' },
            { ids: ['action1', 'action2'], label: '실천 방안', checkId: 'check-actions' }
        ];
        
        let allComplete = true;
        let completedCount = 0;
        
        learningFields.forEach(field => {
            if (field.ids) {
                // 실천 방안: action1과 action2가 모두 있어야 함
                const el1 = document.getElementById(field.ids[0]);
                const el2 = document.getElementById(field.ids[1]);
                const checkItem = document.getElementById(field.checkId);
                
                if (el1 && el2 && el1.value.trim() && el2.value.trim()) {
                    completedCount++;
                    if (checkItem) {
                        checkItem.classList.add('completed');
                        checkItem.querySelector('.icon').textContent = '✅';
                    }
                } else {
                    allComplete = false;
                    if (checkItem) {
                        checkItem.classList.remove('completed');
                        checkItem.querySelector('.icon').textContent = '◯';
                    }
                }
            } else {
                const element = document.getElementById(field.id);
                const checkItem = document.getElementById(`check-${field.id}`);
                
                if (element && element.value.trim()) {
                    completedCount++;
                    if (checkItem) {
                        checkItem.classList.add('completed');
                        checkItem.querySelector('.icon').textContent = '✅';
                    }
                } else {
                    allComplete = false;
                    if (checkItem) {
                        checkItem.classList.remove('completed');
                        checkItem.querySelector('.icon').textContent = '◯';
                    }
                }
            }
        });
        
        const learningSection = document.getElementById('learningSection');
        const learningStatus = document.getElementById('learningStatus');
        const btnLearning = document.getElementById('btnLearning');
        
        if (learningSection && learningStatus && btnLearning) {
            if (allComplete) {
                learningSection.classList.add('ready');
                learningStatus.textContent = `✅ 학습 과정 완료! 저장할 수 있어요!`;
                btnLearning.disabled = false;
            } else {
                learningSection.classList.remove('ready');
                learningStatus.textContent = `필수 항목 ${completedCount}/${learningFields.length} 완료`;
                btnLearning.disabled = true;
            }
        }
    },
    
    /**
     * Zone 2B: 선언문 섹션 업데이트 (6단계)
     */
    updateDeclarationSection() {
        const declaration = document.getElementById('declaration');
        const checkItem = document.getElementById('check-declaration');
        const declarationSection = document.getElementById('declarationSection');
        const declarationStatus = document.getElementById('declarationStatus');
        const btnDeclaration = document.getElementById('btnDeclaration');
        const btnPreview = document.getElementById('btnPreview');
        
        const isComplete = declaration && declaration.value.trim();
        
        if (checkItem) {
            if (isComplete) {
                checkItem.classList.add('completed');
                checkItem.querySelector('.icon').textContent = '✅';
            } else {
                checkItem.classList.remove('completed');
                checkItem.querySelector('.icon').textContent = '◯';
            }
        }
        
        if (declarationSection && declarationStatus && btnDeclaration && btnPreview) {
            if (isComplete) {
                declarationSection.classList.add('ready');
                declarationStatus.textContent = `✅ 선언문 완료! 저장하거나 미리보기를 확인하세요!`;
                btnDeclaration.disabled = false;
                btnPreview.disabled = false;
            } else {
                declarationSection.classList.remove('ready');
                declarationStatus.textContent = `선언문을 작성하면 저장할 수 있어요!`;
                btnDeclaration.disabled = true;
                btnPreview.disabled = true;
            }
        }
    },
    
    /**
     * Zone 2 완료 섹션 업데이트 (통합)
     */
    updateCompletionSection() {
        this.updateLearningSection();
        this.updateDeclarationSection();
    },

    /**
     * 디바운스 함수
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 자동 저장 시작
     */
    startAutoSave() {
        // 5초마다 자동 저장
        setInterval(() => {
            this.autoSave();
        }, 5000);
    },

    /**
     * 자동 저장
     */
    autoSave(showMessage = false) {
        try {
            const formData = this.getFormData();
            formData.timestamp = new Date().toISOString();
            localStorage.setItem('greenDeclaration', JSON.stringify(formData));
            console.log('자동 저장 완료:', new Date().toLocaleTimeString());
            
            if (showMessage) {
                this.showNotification('✅ 임시 저장되었습니다!', 'success');
            }
        } catch (error) {
            console.error('자동 저장 오류:', error);
            if (showMessage) {
                this.showNotification('❌ 저장 중 오류가 발생했습니다.', 'error');
            }
        }
    },

    /**
     * 폼 데이터 가져오기
     */
    getFormData() {
        return {
            mode: document.querySelector('input[name="mode"]:checked')?.value || 'group',
            grade: document.getElementById('grade')?.value || '',
            classNum: document.getElementById('classNum')?.value || '',
            studentName: document.getElementById('studentName')?.value || '',
            teamName: document.getElementById('teamName')?.value || '',
            members: document.getElementById('members')?.value || '',
            problems: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
            otherProblem: document.getElementById('otherProblem')?.value || '',
            problemDetail: document.getElementById('problemDetail')?.value || '',
            coreMessage: document.getElementById('coreMessage')?.value || '',
            target: document.querySelector('input[name="target"]:checked')?.value || '',
            targetStrategy: document.getElementById('targetStrategy')?.value || '',
            action1: document.getElementById('action1')?.value || '',
            action2: document.getElementById('action2')?.value || '',
            action3: document.getElementById('action3')?.value || '',
            declaration: document.getElementById('declaration')?.value || ''
        };
    },

    /**
     * 저장된 데이터 불러오기
     */
    loadSavedData() {
        try {
            const saved = localStorage.getItem('greenDeclaration');
            if (saved) {
                const data = JSON.parse(saved);
                const date = new Date(data.timestamp);
                
                // 1시간 이내 데이터만 자동 로드 제안
                const hoursSince = (Date.now() - date.getTime()) / (1000 * 60 * 60);
                
                if (hoursSince < 1) {
                    setTimeout(() => {
                        if (confirm(`${date.toLocaleString('ko-KR')}에 저장된 내용이 있습니다. 불러오시겠습니까?`)) {
                            this.restoreFormData(data);
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
        }
    },

    /**
     * 저장된 내용 불러오기 (버튼 클릭)
     */
    loadSaved() {
        try {
            const saved = localStorage.getItem('greenDeclaration');
            if (!saved) {
                alert('저장된 내용이 없습니다.');
                return;
            }

            const data = JSON.parse(saved);
            this.restoreFormData(data);
            this.showNotification('✅ 저장된 내용을 불러왔습니다!', 'success');
        } catch (error) {
            console.error('불러오기 오류:', error);
            alert('내용을 불러오는 중 오류가 발생했습니다.');
        }
    },

    /**
     * 폼 데이터 복원
     */
    restoreFormData(data) {
        // 모드 선택
        const modeRadio = document.querySelector(`input[name="mode"][value="${data.mode}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
            modeRadio.dispatchEvent(new Event('change'));
        }

        // 텍스트 필드
        const textFields = [
            'grade', 'classNum', 'studentName', 'teamName', 'members', 
            'problemDetail', 'coreMessage', 'targetStrategy', 
            'action1', 'action2', 'action3', 'declaration'
        ];
        textFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && data[field]) {
                element.value = data[field];
            }
        });

        // 기타 환경 문제
        const otherProblemElement = document.getElementById('otherProblem');
        if (otherProblemElement && data.otherProblem) {
            otherProblemElement.value = data.otherProblem;
            }

            // 체크박스
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = data.problems && data.problems.includes(cb.value);
            });

        // 대상 선택
        const targetRadio = document.querySelector(`input[name="target"][value="${data.target}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
        }

        this.updateProgress();
    },

    /**
     * 선언문 미리보기 생성
     */
    generatePreview() {
        try {
            // 필수 필드 검증
            const requiredFields = [
                { id: 'teamName', name: 'NGO 이름' },
                { id: 'problemDetail', name: '문제 상황 설명' },
                { id: 'coreMessage', name: '핵심 메시지' },
                { id: 'action1', name: '실천 방안 1' },
                { id: 'action2', name: '실천 방안 2' },
                { id: 'declaration', name: '선언문' }
            ];

            for (const field of requiredFields) {
                const element = document.getElementById(field.id);
                if (!element || !element.value.trim()) {
                    alert(`${field.name}을(를) 입력해주세요.`);
                    if (element) element.focus();
                    return;
                }
            }

            // 값 가져오기 (XSS 방어)
            const grade = this.escapeHtml(document.getElementById('grade')?.value || '');
            const classNum = this.escapeHtml(document.getElementById('classNum')?.value || '');
            const studentName = this.escapeHtml(document.getElementById('studentName')?.value || '');
            const teamName = this.escapeHtml(document.getElementById('teamName').value) || '우리 NGO';
            const members = this.escapeHtml(document.getElementById('members').value);
            
            const problems = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                problems.push(this.escapeHtml(cb.value));
            });
            const otherProblem = this.escapeHtml(document.getElementById('otherProblem').value);
            if (otherProblem) {
                problems.push(otherProblem);
            }
            const problemDetail = this.escapeHtml(document.getElementById('problemDetail').value);
            
            const coreMessage = this.escapeHtml(document.getElementById('coreMessage').value);
            const target = document.querySelector('input[name="target"]:checked')?.value || '';
            const targetStrategy = this.escapeHtml(document.getElementById('targetStrategy').value);
            
            const action1 = this.escapeHtml(document.getElementById('action1').value);
            const action2 = this.escapeHtml(document.getElementById('action2').value);
            const action3 = this.escapeHtml(document.getElementById('action3').value);
            
            const declaration = this.escapeHtml(document.getElementById('declaration').value);

            // 미리보기 HTML 생성
            let previewHTML = this.buildPreviewHTML({
                grade, classNum, studentName, teamName, members, problems, problemDetail,
                coreMessage, target, targetStrategy,
                action1, action2, action3, declaration
            });

            // 미리보기 표시
            document.getElementById('previewContent').innerHTML = previewHTML;
            document.getElementById('preview').style.display = 'block';
            
            // 미리보기로 스크롤
            document.getElementById('preview').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });

            this.showNotification('✅ 선언문이 생성되었습니다!', 'success');
        } catch (error) {
            console.error('미리보기 생성 오류:', error);
            alert('선언문을 생성하는 중 오류가 발생했습니다.');
        }
    },

    /**
     * 미리보기 HTML 생성
     */
    buildPreviewHTML(data) {
        let html = '';
        
        // 헤더
        html += `<div class="preview-section" style="text-align: center; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 20px;">`;
        html += `<div style="font-size: 36px; margin-bottom: 10px;">🌍</div>`;
        html += `<h2 style="font-size: 28px; margin-bottom: 10px;">${data.teamName}</h2>`;
        
        // 학년, 반, 이름 표시
        const studentInfo = [];
        if (data.grade) studentInfo.push(`${data.grade}학년`);
        if (data.classNum) studentInfo.push(`${data.classNum}반`);
        if (data.studentName) studentInfo.push(data.studentName);
        
        if (studentInfo.length > 0) {
            html += `<div style="font-size: 15px; opacity: 0.95; margin-bottom: 8px;">${studentInfo.join(' ')}</div>`;
        }
        
        if (data.members) {
            html += `<div style="font-size: 14px; opacity: 0.9;">${data.members}</div>`;
        }
        html += `<div style="margin-top: 15px; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">그린NGO 홍보대사</div>`;
        html += `</div>`;

        // 환경 문제
        if (data.problems.length > 0 || data.problemDetail) {
            html += `<div class="preview-section">`;
            html += `<div class="preview-label">🎯 우리가 해결하고 싶은 문제</div>`;
            if (data.problems.length > 0) {
                html += `<div style="margin: 10px 0;"><strong>${data.problems.join(', ')}</strong></div>`;
            }
            if (data.problemDetail) {
                html += `<div style="white-space: pre-wrap;">${data.problemDetail}</div>`;
            }
            html += `</div>`;
        }

        // 핵심 메시지
        if (data.coreMessage) {
            html += `<div class="preview-section" style="background: #e8f5e9; border-left: 5px solid #2ecc71;">`;
            html += `<div class="preview-label">💬 우리의 메시지</div>`;
            html += `<div style="font-size: 20px; font-weight: bold; color: #2ecc71; margin-top: 10px;">"${data.coreMessage}"</div>`;
            html += `</div>`;
        }

        // 대상
        if (data.target) {
            html += `<div class="preview-section">`;
            html += `<div class="preview-label">👥 우리가 설득하고 싶은 대상</div>`;
            html += `<div><strong>${data.target}</strong></div>`;
            if (data.targetStrategy) {
                html += `<div style="margin-top: 10px; white-space: pre-wrap;">${data.targetStrategy}</div>`;
            }
            html += `</div>`;
        }

        // 실천 방안
        const actions = [data.action1, data.action2, data.action3].filter(a => a);
        if (actions.length > 0) {
            html += `<div class="preview-section">`;
            html += `<div class="preview-label">✅ 우리의 실천 방안</div>`;
            actions.forEach((action, index) => {
                html += `<div style="margin: 8px 0; padding-left: 20px;">`;
                html += `${index + 1}. ${action}`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        // 선언문
        if (data.declaration) {
            html += `<div class="preview-section" style="background: #fff9e6; border-left: 5px solid #f39c12;">`;
            html += `<div class="preview-label">📜 우리의 선언문</div>`;
            html += `<div style="white-space: pre-wrap; line-height: 1.8; margin-top: 10px;">${data.declaration}</div>`;
            html += `</div>`;
        }

        // 날짜
        const today = new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        html += `<div style="text-align: right; margin-top: 30px; color: #7f8c8d; font-size: 14px;">`;
        html += `${today}`;
        html += `</div>`;

        return html;
    },

    /**
     * 클립보드에 복사
     */
    copyToClipboard() {
        try {
            const previewContent = document.getElementById('previewContent');
            if (!previewContent) {
                throw new Error('미리보기 내용을 찾을 수 없습니다.');
            }
            
            const text = previewContent.innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('✅ 선언문이 복사되었습니다!', 'success');
            }).catch(err => {
                // 폴백: textarea 사용
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    this.showNotification('✅ 선언문이 복사되었습니다!', 'success');
                } catch (e) {
                    alert('복사에 실패했습니다. 수동으로 복사해주세요.');
                }
                document.body.removeChild(textarea);
            });
        } catch (error) {
            console.error('복사 오류:', error);
            alert('복사 중 오류가 발생했습니다.');
        }
    },

    /**
     * 알림 표시
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
    },
    
    /**
     * 초기화 기능
     */
    resetForm() {
        // 1차 확인
        if (!confirm('⚠️ 정말 초기화하시겠습니까?\n\n작성한 내용이 모두 사라집니다.')) {
            return;
        }
        
        // 2차 확인 - 다운로드 권유
        const hasContent = localStorage.getItem('greenDeclaration');
        if (hasContent) {
            const formData = this.getFormData();
            const hasSignificantContent = formData.teamName || formData.declaration;
            
            if (hasSignificantContent) {
                const result = confirm('💾 초기화하기 전에 다운로드하시겠습니까?\n\n(취소를 누르면 초기화가 취소됩니다)');
                if (result) {
                    // 다운로드 후 초기화
                    this.showNotification('💾 다운로드를 먼저 진행해주세요!', 'success');
                    return;
                }
            }
        }
        
        this.performReset();
    },
    
    /**
     * 실제 초기화 수행
     */
    performReset() {
        try {
            // localStorage 삭제
            localStorage.removeItem('greenDeclaration');
            
            // 폼 초기화
            document.querySelectorAll('input[type="text"], textarea').forEach(el => {
                el.value = '';
            });
            
            document.querySelectorAll('input[type="checkbox"]').forEach(el => {
                el.checked = false;
            });
            
            document.querySelectorAll('input[type="radio"]').forEach(el => {
                el.checked = el.defaultChecked;
            });
            
            // 미리보기 숨기기
            const preview = document.getElementById('preview');
            if (preview) {
                preview.style.display = 'none';
            }
            
            // 진행도 초기화
            this.updateProgress();
            
            // 페이지 맨 위로
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            this.showNotification('✅ 새로 작성할 준비가 되었습니다!', 'success');
        } catch (error) {
            console.error('초기화 오류:', error);
            alert('초기화 중 오류가 발생했습니다.');
        }
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    DeclarationApp.init();
});

// 전역 함수로 노출 (HTML 인라인 이벤트 핸들러용)
window.generatePreview = () => DeclarationApp.generatePreview();
window.loadSaved = () => DeclarationApp.loadSaved();
window.copyToClipboard = () => DeclarationApp.copyToClipboard();