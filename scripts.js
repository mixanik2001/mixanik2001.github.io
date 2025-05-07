var colors = [

    [111, 66, 193],   

    [60, 255, 60],    

    [214, 51, 132],   

    [45, 175, 230],   

    [255, 0, 255],    

    [253, 126, 20]    

];

var step = 0;

var colorIndices = [0, 1, 2, 3];

var gradientSpeed = 0.002;

function updateGradient() {

    if ($ === undefined) return;

    var c0_0 = colors[colorIndices[0]];

    var c0_1 = colors[colorIndices[1]];

    var c1_0 = colors[colorIndices[2]];

    var c1_1 = colors[colorIndices[3]];

    var istep = 1 - step;

    var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);

    var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);

    var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);

    var color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";

    var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);

    var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);

    var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);

    var color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";

    $('#gradient').css({

        background: "-webkit-gradient(linear, left top, right top, from(" + color1 + "), to(" + color2 + "))"

    }).css({

        background: "-moz-linear-gradient(left, " + color1 + " 0%, " + color2 + " 100%)"

    });

    step += gradientSpeed;

    if (step >= 1) {

        step %= 1;

        colorIndices[0] = colorIndices[1];

        colorIndices[2] = colorIndices[3];

        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;

        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;

    }

}

setInterval(updateGradient, 10);

document.addEventListener('DOMContentLoaded', function() {

    function checkScroll() {

        const cards = document.querySelectorAll('.value-card, .benefit-card, .education-card, .story-card, .career-step');

        cards.forEach(card => {

            const cardTop = card.getBoundingClientRect().top;

            const triggerBottom = window.innerHeight * 0.8;

            if (cardTop < triggerBottom) {

                card.classList.add('show');

                card.style.opacity = '1';

                card.style.transform = 'translateY(0)';

            }

        });

    }

    const cards = document.querySelectorAll('.value-card, .benefit-card, .education-card, .story-card, .career-step');

    cards.forEach(card => {

        card.style.opacity = '0';

        card.style.transform = 'translateY(20px)';

        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    });

    checkScroll();

    window.addEventListener('scroll', checkScroll);

    function setEqualMinHeight(elements) {

        if (!elements || elements.length === 0) {

            if (elements && elements.length > 0) {

                elements.forEach(el => {

                    if (el.classList.contains('career-step')) {

                         const mainContent = el.querySelector('.career-main');

                         if (mainContent) {

                             mainContent.style.minHeight = 'auto';

                         }

                    }

                    el.style.minHeight = 'auto';

                });

            }

            return;

        }

        let originalDisplays = new Map();

        let isCareerStep = elements[0] && elements[0].classList.contains('career-step');

        if (isCareerStep) {

            let mainElements = [];

            elements.forEach(el => {

                const details = el.querySelector('.career-details');

                const mainContent = el.querySelector('.career-main');

                if (details) {

                    originalDisplays.set(el, details.style.display);

                    details.style.display = 'none';

                }

                if (mainContent) {

                    mainContent.style.minHeight = 'auto';

                    mainElements.push(mainContent);

                }

                el.style.minHeight = 'auto';

            });

            let maxMainHeight = 0;

            mainElements.forEach(mainEl => {

                const currentHeight = mainEl.offsetHeight;

                if (currentHeight > maxMainHeight) {

                    maxMainHeight = currentHeight;

                }

            });

            if (maxMainHeight > 0) {

                mainElements.forEach(mainEl => {

                    mainEl.style.minHeight = `${maxMainHeight}px`;

                });

            }

            let maxCardHeight = 0;

            elements.forEach(el => {

                const currentCardHeight = el.offsetHeight;

                if (currentCardHeight > maxCardHeight) {

                    maxCardHeight = currentCardHeight;

                }

            });

            if (maxCardHeight > 0) {

                elements.forEach(el => {

                    el.style.minHeight = `${maxCardHeight}px`;

                });

            }

            elements.forEach(el => {

                const details = el.querySelector('.career-details');

                if (details && originalDisplays.has(el)) {

                    const originalState = originalDisplays.get(el);

                    details.style.display = originalState === 'block' ? 'block' : 'none';

                }

            });

        } else {

            let maxHeight = 0;

            elements.forEach(el => {

                el.style.minHeight = 'auto';

            });

            elements.forEach(el => {

                const currentHeight = el.offsetHeight;

                if (currentHeight > maxHeight) {

                    maxHeight = currentHeight;

                }

            });

            if (maxHeight > 0) {

                elements.forEach(el => {

                    el.style.minHeight = `${maxHeight}px`;

                });

            }

        }

    }

    const valueCards = document.querySelectorAll('.value-card');

    const careerSteps = document.querySelectorAll('.career-step');

    const benefitCards = document.querySelectorAll('.benefit-card');

    const storyCards = document.querySelectorAll('.story-card');

    const educationCards = document.querySelectorAll('.education-card');

    function applyAllEqualHeight() {

        setEqualMinHeight(valueCards);

        setEqualMinHeight(benefitCards);

        setEqualMinHeight(storyCards);

        setEqualMinHeight(educationCards);

        setEqualMinHeight(careerSteps);

    }

    applyAllEqualHeight();

    let resizeTimer;

    window.addEventListener('resize', () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

            applyAllEqualHeight();

        }, 250);

    });

    const toggleButtons = document.querySelectorAll('.btn-toggle');

    toggleButtons.forEach(button => {

        button.addEventListener('click', function() {

            const stepElement = this.closest('.career-step');

            const details = stepElement.querySelector('.career-details');

            if (details) {

                const isHidden = details.style.display === 'none' || details.style.display === '';

                if (isHidden) {

                    details.style.display = 'block';

                    this.textContent = 'Скрыть';

                } else {

                    details.style.display = 'none';

                    this.textContent = 'Подробнее';

                }

            }

        });

    });

    const navLinks = document.querySelectorAll('header nav a, .hero-buttons a, .mobile-nav-toggle + nav a, .btn-join-header'); 

    navLinks.forEach(link => {

        link.addEventListener('click', function(e) {

            const targetId = this.getAttribute('href');

            if (targetId && targetId.startsWith('#')) {

                 e.preventDefault();

                const targetSection = document.querySelector(targetId);

                if (targetSection) { 

                     const offsetTop = targetSection.offsetTop - 80; 

                    window.scrollTo({

                        top: offsetTop,

                        behavior: 'smooth'

                    });

                    const navMenu = document.querySelector('header nav');

                    const toggleButton = document.querySelector('.mobile-nav-toggle i');

                    if (navMenu.classList.contains('active')) {

                        navMenu.classList.remove('active');

                        toggleButton.classList.remove('fa-times');

                        toggleButton.classList.add('fa-bars');

                         document.body.style.overflow = ''; 

                    }

                }

            }

        });

    });

    const applicationForm = document.getElementById('application-form');
    const formContainer = document.querySelector('.join-form');

    if (applicationForm && formContainer) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const scriptURL = 'https://script.google.com/macros/s/AKfycbyCruSI7CeyVODNLT7Ja7l_-3vPFrGCvPy7OzjkCXmhoXEl964zsjZpVWc5P04d6h3i_w/exec';

            const submitButton = applicationForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';

            const formData = new FormData(applicationForm);

            fetch(scriptURL, { method: 'POST', body: formData})
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        formContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><h3>Спасибо за заявку!</h3><p>Мы получили ваши данные и скоро свяжемся с вами.</p></div>';
                        console.log('Success!', data);
                    } else {
                        throw new Error(data.error || 'Неизвестная ошибка при отправке.');
                    }
                })
                .catch(error => {
                    alert('Ошибка при отправке формы. Пожалуйста, попробуйте еще раз.\n\nДетали: ' + error.message);
                    console.error('Error!', error.message);
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                });
        });
    }

     window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if(header) {
             if (window.scrollY > 50) {
                header.style.padding = '15px 0';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)'; 
                header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.08)';
            } else {
                header.style.padding = '20px 0';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
            }
        }
    });

    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');

    const navMenu = document.querySelector('header nav'); 

    const toggleIcon = mobileNavToggle ? mobileNavToggle.querySelector('i') : null; 

    if (mobileNavToggle && navMenu && toggleIcon) {

        mobileNavToggle.addEventListener('click', function() {

            navMenu.classList.toggle('active'); 

            if (navMenu.classList.contains('active')) {

                toggleIcon.classList.remove('fa-bars');

                toggleIcon.classList.add('fa-times'); 

                document.body.style.overflow = 'hidden'; 

            } else {

                toggleIcon.classList.remove('fa-times');

                toggleIcon.classList.add('fa-bars');

                document.body.style.overflow = ''; 

            }

        });

        const mobileNavLinks = navMenu.querySelectorAll('a');

        mobileNavLinks.forEach(link => {

            link.addEventListener('click', () => {

                if (navMenu.classList.contains('active')) {

                     navMenu.classList.remove('active');

                     toggleIcon.classList.remove('fa-times');

                     toggleIcon.classList.add('fa-bars');

                     document.body.style.overflow = ''; 

                }

            });

        });

    }

    const sliderContainer = document.querySelector('#gallery .slider-container'); 

    const slider = document.querySelector('#gallery .slider');

    const slides = document.querySelectorAll('#gallery .slide');

    const prevBtn = document.querySelector('#gallery .prev-btn');

    const nextBtn = document.querySelector('#gallery .next-btn');

    const navigationContainer = document.querySelector('#gallery .slider-navigation'); 

    if (sliderContainer && slider && slides.length > 0 && prevBtn && nextBtn && navigationContainer) { 

        let currentIndex = 0;

        const totalSlides = slides.length;

        const dotsContainer = document.createElement('div');

        dotsContainer.className = 'slider-dots';

        navigationContainer.insertBefore(dotsContainer, nextBtn); 

        for (let i = 0; i < totalSlides; i++) {

            const dot = document.createElement('div');

            dot.className = 'slider-dot';

            if (i === 0) dot.classList.add('active');

            dot.addEventListener('click', () => {

                goToSlide(i);

            });

            dotsContainer.appendChild(dot);

        }

        function updateActiveStates() {

            slides.forEach((slide, index) => {

                if (index === currentIndex) {

                    slide.classList.add('active');

                } else {

                    slide.classList.remove('active');

                }

            });

            const dots = dotsContainer.querySelectorAll('.slider-dot');

            dots.forEach((dot, index) => {

                if (index === currentIndex) {

                    dot.classList.add('active');

                } else {

                    dot.classList.remove('active');

                }

            });

        }

        slides[0].classList.add('active');

        function updateSliderSizeAndPosition() {

            const currentSlide = slides[currentIndex];

            if (!currentSlide) {

                console.error(`Slide not found for index: ${currentIndex}`);

                return;

            }

            const currentImage = currentSlide.querySelector('img');

            if (!currentImage) {

                console.warn(`Image not found in slide index: ${currentIndex}.`);

                return;

            }

            function applySizeAndPosition(imgWidth, imgHeight) {

                if (!imgWidth || !imgHeight || imgWidth <= 0 || imgHeight <= 0) {

                    console.error("Invalid image dimensions received:", imgWidth, imgHeight, ". Using fallback.");

                    imgWidth = 300;

                    imgHeight = 200;

                }

                const maxWidth = window.innerWidth * 0.9;

                const displayWidth = Math.min(imgWidth, maxWidth);

                const containerWidth = sliderContainer.offsetWidth;

                if (containerWidth <= 0) {

                    console.error("Container width is zero or invalid!");

                    return;

                }

                slides.forEach(slide => {

                    slide.style.width = containerWidth + 'px';

                });

                const totalSliderWidth = containerWidth * totalSlides;

                slider.style.width = totalSliderWidth + 'px';

                const translateValue = -(currentIndex * containerWidth);

                slider.style.transform = `translateX(${translateValue}px)`;

                updateActiveStates();

            }

            if (currentImage.complete && currentImage.naturalWidth > 0) {

                applySizeAndPosition(currentImage.naturalWidth, currentImage.naturalHeight);

            } else {

                currentImage.onload = null;

                currentImage.onerror = null;

                currentImage.onload = () => {

                    applySizeAndPosition(currentImage.naturalWidth, currentImage.naturalHeight);

                };

                currentImage.onerror = () => {

                    applySizeAndPosition(300, 200);

                };

                if (!currentImage.src) {

                    applySizeAndPosition(300, 200);

                }

            }

        }

        function goToSlide(index) {

            currentIndex = index;

            updateSliderSizeAndPosition();

        }

        nextBtn.addEventListener('click', () => {

            if (currentIndex < totalSlides - 1) {

                currentIndex++;

            } else {

                currentIndex = 0;

            }

            updateSliderSizeAndPosition();

        });

        prevBtn.addEventListener('click', () => {

            if (currentIndex > 0) {

                currentIndex--;

            } else {

                currentIndex = totalSlides - 1;

            }

            updateSliderSizeAndPosition();

        });

        document.addEventListener('keydown', (e) => {

            const rect = sliderContainer.getBoundingClientRect();

            const isVisible = (

                rect.top >= 0 &&

                rect.left >= 0 &&

                rect.bottom <= window.innerHeight &&

                rect.right <= window.innerWidth

            );

            if (isVisible) {

                if (e.key === 'ArrowRight') {

                    nextBtn.click();

                } else if (e.key === 'ArrowLeft') {

                    prevBtn.click();

                }

            }

        });

        updateSliderSizeAndPosition();

        let resizeTimerSlider;

        window.addEventListener('resize', () => {

            clearTimeout(resizeTimerSlider);

            resizeTimerSlider = setTimeout(() => {

                updateSliderSizeAndPosition();

            }, 250);

        });

    }

}); 

window.addEventListener('scroll', function() {

    const hero = document.querySelector('.hero');

    const scrollValue = window.scrollY;

    if (scrollValue < window.innerHeight) {

        hero.style.backgroundPositionY = scrollValue * 0.5 + 'px';

    }

});

const inputs = document.querySelectorAll('input, textarea');

inputs.forEach(input => {

    input.addEventListener('blur', function() {

        if (this.value.trim() === '' && this.hasAttribute('required')) {

            this.style.borderColor = '#dc3545';

        } else {

            this.style.borderColor = '#ddd';

        }

    });

    input.addEventListener('focus', function() {

        this.style.borderColor = '#6f42c1';

    });

}); 