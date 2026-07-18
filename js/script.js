/* ==========================================================================
   그린테이블 (Green Table) 인터랙션 및 제어 스크립트
   제작일: 2026.07.18
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 헤더 스크롤 효과 (Sticky GNB)
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 로드 시점 스크롤 체크


    // 2. 모바일 네비게이션 (햄버거 메뉴 및 사이드 모달)
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = document.getElementById('close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const stickyCta = document.getElementById('mobile-sticky-cta');

    const openMobileNav = () => {
        mobileNav.classList.add('open');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // 바디 스크롤 차단
        if (stickyCta) stickyCta.style.display = 'none'; // 메뉴 오픈 시 Sticky CTA 일시 숨김
    };

    const closeMobileNav = () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = ''; // 바디 스크롤 복구
        if (window.innerWidth <= 768 && stickyCta) {
            stickyCta.style.display = 'block';
        }
    };

    hamburgerBtn.addEventListener('click', () => {
        if (mobileNav.classList.contains('open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    closeBtn.addEventListener('click', closeMobileNav);

    // 모바일 메뉴 클릭 시 닫기 및 부드러운 스크롤 이동
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            closeMobileNav();
            
            if (targetSection) {
                setTimeout(() => {
                    const offsetPosition = targetSection.offsetTop - header.offsetHeight;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 300); // 모바일 창이 닫히는 모션 시간(300ms) 고려
            }
        });
    });


    // 3. 네비게이션 부드러운 스크롤 (PC GNB)
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetPosition = targetSection.offsetTop - header.offsetHeight;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // 4. 스크롤 영역에 따른 네비게이션 액티브 표시 (Intersection Observer)
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // 화면 중앙 뷰포트 기준 감지
        threshold: 0
    };
    
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // PC 메뉴 활성화
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                // 모바일 메뉴 활성화
                mobileLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    
    const navObserver = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => navObserver.observe(section));


    // 5. 인기 베스트 메뉴 캐러셀 슬라이더
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');
    const slides = Array.from(track.children);
    
    let currentIndex = 0;
    let autoSlideInterval;

    const updateSlidePosition = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Dot 상태 업데이트
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlidePosition();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlidePosition();
    };

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlidePosition();
            resetAutoSlide();
        });
    });

    // 자동 슬라이드 설정 (5초)
    const startAutoSlide = () => {
        autoSlideInterval = setInterval(nextSlide, 5000);
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    };

    startAutoSlide();

    // 마우스 호버 시 일시 정지
    const carouselContainer = document.querySelector('.best-menu-container');
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    carouselContainer.addEventListener('mouseleave', startAutoSlide);


    // 6. 이미지 레이지 로딩 & 스켈레톤 로더 해제
    const lazyImages = document.querySelectorAll('.lazy-image');

    const imageObserverOptions = {
        root: null,
        rootMargin: '50px 0px', // 이미지가 뷰포트에 나타나기 50px 전 미리 로드
        threshold: 0.01
    };

    const loadImage = (image) => {
        const src = image.getAttribute('data-src');
        if (!src) return;
        
        image.src = src;
        image.onload = () => {
            image.classList.add('loaded');
            // 부모 스켈레톤 클래스 해제
            const parent = image.closest('.skeleton-container');
            if (parent) {
                parent.classList.remove('skeleton-container');
            }
        };
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target); // 한 번 로드된 이미지는 관찰 종료
            }
        });
    }, imageObserverOptions);

    lazyImages.forEach(img => imageObserver.observe(img));


    // 7. 스크롤 인터랙션 애니메이션 (Fade-in on scroll)
    const animElements = document.querySelectorAll('.animate-on-scroll');
    
    const animObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // 화면 밑에서 10% 위로 올라올 때 애니메이션 시작
        threshold: 0.1
    };

    const animObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 성능을 위해 최초 1회 작동 후 관찰 해제
            }
        });
    };

    const animObserver = new IntersectionObserver(animObserverCallback, animObserverOptions);
    animElements.forEach(el => animObserver.observe(el));


    // 8. 주문 문의 폼 유효성 검사 및 제출 (Contact Form Validation)
    const form = document.getElementById('inquiryForm');
    
    const showError = (inputElement, errorElement, show = true) => {
        const formGroup = inputElement.closest('.form-group') || inputElement.closest('.form-privacy-check');
        if (show) {
            formGroup.classList.add('has-error');
            errorElement.style.display = 'block';
        } else {
            formGroup.classList.remove('has-error');
            errorElement.style.display = 'none';
        }
    };

    // 실시간 필드 변경 시 에러 지우기
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => {
            const formGroup = field.closest('.form-group') || field.closest('.form-privacy-check');
            if (formGroup.classList.contains('has-error')) {
                formGroup.classList.remove('has-error');
                const errorMsg = formGroup.querySelector('.error-msg');
                if (errorMsg) errorMsg.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // 1) 이름 검사
        const nameInput = document.getElementById('userName');
        const nameError = document.getElementById('name-error');
        if (!nameInput.value.trim()) {
            showError(nameInput, nameError, true);
            isValid = false;
        } else {
            showError(nameInput, nameError, false);
        }

        // 2) 연락처 검사 (정규식 검사 010-XXXX-XXXX 또는 숫자만 9-11자리)
        const phoneInput = document.getElementById('userPhone');
        const phoneError = document.getElementById('phone-error');
        const phoneRegex = /^(01[016789]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
        if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value.trim())) {
            showError(phoneInput, phoneError, true);
            isValid = false;
        } else {
            showError(phoneInput, phoneError, false);
        }

        // 3) 이메일 검사 (정규식)
        const emailInput = document.getElementById('userEmail');
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, emailError, true);
            isValid = false;
        } else {
            showError(emailInput, emailError, false);
        }

        // 4) 주문 유형 선택 검사
        const orderSelect = document.getElementById('orderType');
        const orderError = document.getElementById('order-error');
        if (!orderSelect.value) {
            showError(orderSelect, orderError, true);
            isValid = false;
        } else {
            showError(orderSelect, orderError, false);
        }

        // 5) 문의 내용 검사
        const messageTextarea = document.getElementById('message');
        const messageError = document.getElementById('message-error');
        if (!messageTextarea.value.trim()) {
            showError(messageTextarea, messageError, true);
            isValid = false;
        } else {
            showError(messageTextarea, messageError, false);
        }

        // 6) 개인정보 동의 검사
        const privacyCheckbox = document.getElementById('privacyAgree');
        const privacyError = document.getElementById('privacy-error');
        if (!privacyCheckbox.checked) {
            privacyError.style.display = 'block';
            isValid = false;
        } else {
            privacyError.style.display = 'none';
        }

        // 전체 유효성 통과 시 처리
        if (isValid) {
            const selectedText = orderSelect.options[orderSelect.selectedIndex].text;
            
            // alert 메시지 출력
            const successMessage = `🌱 그린테이블 문의가 성공적으로 접수되었습니다! 🌱\n\n` +
                                   `• 이름: ${nameInput.value.trim()}\n` +
                                   `• 연락처: ${phoneInput.value.trim()}\n` +
                                   `• 이메일: ${emailInput.value.trim()}\n` +
                                   `• 주문 유형: ${selectedText}\n\n` +
                                   `작성하신 문의 내용은 내부 담당자에게 전달되었으며,\n` +
                                   `영업일 기준 24시간 내에 기재해주신 연락처/이메일로 빠르게 답변드리겠습니다. 감사합니다!`;
            
            alert(successMessage);
            
            // 폼 리셋
            form.reset();
            
            // 에러 표시 전체 초기화
            form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
            form.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
        } else {
            // 유효하지 않은 첫 에러 필드로 스크롤 포커싱
            const firstErrorField = form.querySelector('.has-error input, .has-error select, .has-error textarea');
            if (firstErrorField) {
                const offset = firstErrorField.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 40);
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
                setTimeout(() => firstErrorField.focus(), 800);
            } else if (!privacyCheckbox.checked) {
                privacyCheckbox.focus();
            }
        }
    });

    // 9. 창 크기 변경에 따른 모바일 예외 복구 처리
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // 모바일 메뉴가 열려 있었을 경우 초기화
            if (mobileNav.classList.contains('open')) {
                closeMobileNav();
            }
            if (stickyCta) {
                stickyCta.style.display = 'none';
            }
        } else {
            if (!mobileNav.classList.contains('open') && stickyCta) {
                stickyCta.style.display = 'block';
            }
        }
    });

});
