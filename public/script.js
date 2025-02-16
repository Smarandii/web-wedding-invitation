const WEDDING_DATE = new Date('2025-07-02T14:00:00');

function initCountdown() {
    const countdownElement = document.querySelector('.countdown');
    const countdownLabel = document.querySelector('.countdown-label');

    function updateCountdown() {
        const now = new Date();
        
        if (isWeddingInProgress(now)) {
            updateCountdownDisplay('Праздник в самом разгаре!', true);
            return;
        }

        if (now > WEDDING_DATE) {
            updateCountdownDisplay('Праздник уже прошел, спасибо за присутствие', true);
            return;
        }

        const timeRemaining = calculateTimeRemaining(WEDDING_DATE, now);
        updateCountdownDisplay(formatTimeRemaining(timeRemaining), false);
    }

    // Start countdown
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60); // Update every minute
}

// Helper functions moved to module scope
function isWeddingInProgress(now) {
    return now.getFullYear() === WEDDING_DATE.getFullYear() && 
           now.getMonth() === WEDDING_DATE.getMonth() && 
           now.getDate() === WEDDING_DATE.getDate() && 
           now.getHours() >= WEDDING_DATE.getHours() && 
           now.getHours() < 23;
}

function calculateTimeRemaining(weddingDate, now) {
    const diff = weddingDate - now;
    return {
        weeks: Math.floor(diff / (1000 * 60 * 60 * 24 * 7)),
        days: Math.floor((diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    };
}

function formatTimeRemaining(time) {
    const weeksText = time.weeks === 1 ? 'неделя' : (time.weeks > 1 && time.weeks < 5) ? 'недели' : 'недель';
    const daysText = time.days === 1 ? 'день' : (time.days > 1 && time.days < 5) ? 'дня' : 'дней';
    const hoursText = time.hours === 1 ? 'час' : (time.hours > 1 && time.hours < 5) ? 'часа' : 'часов';
    const minutesText = time.minutes === 1 ? 'минута' : (time.minutes > 1 && time.minutes < 5) ? 'минуты' : 'минут';

    return `${time.weeks} ${weeksText} ${time.days} ${daysText} ${time.hours} ${hoursText} ${time.minutes} ${minutesText}`;
}

function updateCountdownDisplay(text, isSpecialMessage) {
    const countdownElement = document.querySelector('.countdown');
    const countdownLabel = document.querySelector('.countdown-label');
    
    countdownElement.textContent = text;
    countdownLabel.style.display = isSpecialMessage ? 'none' : 'block';
} 


const ATTENDANCE_TYPES = {
    SINGLE: 'single',
    CANNOT_ATTEND: 'no'
};

class RSVPForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.mainFields = document.querySelectorAll('.form-group:not(.attendance-group)');
        this.formSection = document.querySelector('.rsvp-section');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: this.form.name.value,
            surname: this.form.surname.value,
            attendance: this.form.attendance.value,
            alcohol: this.form.alcohol?.value
        };

        // Show loading indicator
        this.formSection.innerHTML = `<p class="loading-message">Загрузка...</p>`;

        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Clear loading message
            

            if (response.ok) {
                this.formSection.innerHTML = `
                    <h2 class="section-title">Спасибо за ответ!</h2>
                    <p class="thank-you-message" style="text-align: center; font-size: 24px;">
                    Мы очень рады, что вы приняли решение. 
                    До встречи на празднике! 
                    Для того, чтобы быть вкурсе событий вступите в телеграмм группу:
                    https://t.me/+HdLC4c5tWzRlODMy
                    </p>
                `;
            } else {
                alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
            }
        } catch (error) {
            alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
        }
    }
} 

// Carousel functionality
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let currentIndex = 0;

    // Initialize dots
    const dots = createDots(carousel, items);

    // Slide control functions
    function goToSlide(index) {
        items[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = index;
        if (currentIndex >= items.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = items.length - 1;
        
        items[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // Set up event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Auto advance setup
    const autoAdvance = setInterval(nextSlide, 5000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoAdvance));
}

function createDots(carousel, items) {
    const dotsContainer = carousel.querySelector('.carousel-dots');
    dotsContainer.innerHTML = '';
    
    const dots = [];
    items.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
        dots.push(dot);
    });
    return dots;
}

document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initCountdown();
    new RSVPForm('rsvpForm');
});