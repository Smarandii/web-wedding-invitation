const WEDDING_DATE = new Date('2025-07-02T14:00:00');

document.addEventListener('DOMContentLoaded', function() {
    setupFormHandlers();
    initPlaceGallery();
    calculateCalendarTimeTillWedding();
});

/**
 * Returns the correct word form for Russian nouns
 * based on numeric value, e.g.:
 *   getWordForm(1, ["день", "дня", "дней"]) => "день"
 *   getWordForm(2, ["день", "дня", "дней"]) => "дня"
 *   getWordForm(5, ["день", "дня", "дней"]) => "дней"
 *
 * @param {number} value - The numeric value to check
 * @param {string[]} forms - An array of 3 forms:
 *   [ "singular", "genitiveSingular", "plural" ]
 *   e.g. [ "день", "дня", "дней" ]
 * @returns {string} - The correct form for that number
 */
function getWordForm(value, forms) {
    // Russian language rule:
    // 1) If last two digits are 11..14 => use plural (forms[2])
    // 2) Else, look at last digit:
    //    - 1 => forms[0]
    //    - 2..4 => forms[1]
    //    - everything else => forms[2]
    
    const lastTwo = value % 100;
    if (lastTwo >= 11 && lastTwo <= 14) {
      return forms[2];
    }
  
    const lastDigit = value % 10;
    switch (lastDigit) {
      case 1:
        return forms[0];
      case 2:
      case 3:
      case 4:
        return forms[1];
      default:
        return forms[2];
    }
  }
  
  function calculateCalendarTimeTillWedding() {
    const weddingDate = new Date('2025-07-02T14:00:00');
    let current = new Date(); // "Now"
  
    let months = 0;
    // 1) Count how many full calendar months remain
    while (true) {
      let nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1); 
      if (nextMonth > weddingDate) {
        break;
      }
      months++;
      current = nextMonth;
    }
  
    let days = 0;
    // 2) Count how many full days remain
    while (true) {
      let nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);
      if (nextDay > weddingDate) {
        break;
      }
      days++;
      current = nextDay;
    }
  
    // 3) Whatever is left is hours/minutes/seconds
    const hours = Math.floor((weddingDate - current) / (1000 * 60 * 60));
  
    // 4) Determine correct word forms in Russian
    const monthsLabel = getWordForm(months, ["месяц", "месяца", "месяцев"]);
    const daysLabel   = getWordForm(days,   ["день",   "дня",    "дней"]);
    const hoursLabel  = getWordForm(hours,  ["час",    "часа",   "часов"]);
    
    console.log(`${months} ${monthsLabel} ${days} ${daysLabel} ${hours} ${hoursLabel}`)

    // 5) Update numeric elements
    document.querySelectorAll('.how_much_months_until_wedding_text')
      .forEach(element => {
        element.textContent = months;
      });
    document.querySelectorAll('.how_much_days_until_wedding_text')
      .forEach(element => {
        element.textContent = days;
      });
    document.querySelectorAll('.how_much_hours_until_wedding_text')
      .forEach(element => {
        element.textContent = hours;
      });
  
    // 6) Update label elements
    document.querySelectorAll('.how_much_months_until_wedding_text_label')
      .forEach(element => {
        element.textContent = monthsLabel;
      });
    document.querySelectorAll('.how_much_days_until_wedding_text_label')
      .forEach(element => {
        element.textContent = daysLabel;
      });
    document.querySelectorAll('.how_much_hours_until_wedding_text_label')
      .forEach(element => {
        element.textContent = hoursLabel;
      });
  }  

function setupFormHandlers() {
    const form = document.getElementById('rsvpForm');
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) {
        console.error('Form element not found');
        return;
    }
    
    // Apply styles to bullet points based on selection state
    attendanceRadios.forEach(radio => {
        // Initialize the bullet point styling
        updateBulletPoint(radio);
        
        radio.addEventListener('change', () => {
            // Update all radio buttons in the group
            attendanceRadios.forEach(updateBulletPoint);
            
            // Show/hide alcohol options
            const alcoholSection = document.querySelector('.alcohol-options').closest('div');
            if (radio.value === 'no') {
                alcoholSection.style.opacity = '0.5';
                alcoholSection.style.pointerEvents = 'none';
                alcoholCheckboxes.forEach(cb => {
                    cb.checked = false;
                    updateBulletPoint(cb);
                });
            } else {
                alcoholSection.style.opacity = '1';
                alcoholSection.style.pointerEvents = 'auto';
            }
        });
    });
    
    // Set up checkbox style handling
    alcoholCheckboxes.forEach(checkbox => {
        // Initialize the bullet point styling
        updateBulletPoint(checkbox);
        
        checkbox.addEventListener('change', () => {
            updateBulletPoint(checkbox);
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const nameInput = form.querySelector('input[name="name"]');
        const selectedAttendance = document.querySelector('input[name="attendance"]:checked');
        const selectedAlcohol = Array.from(document.querySelectorAll('input[name="alcohol"]:checked'))
            .map(cb => cb.value);
            
        if (!nameInput.value || !selectedAttendance) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        // Split name into name and surname
        const nameParts = nameInput.value.trim().split(' ');
        const name = nameParts[0] || '';
        const surname = nameParts.slice(1).join(' ') || '';
        
        const formData = {
            name: name,
            surname: surname,
            attendance: selectedAttendance.value,
            alcohol: selectedAlcohol.join(',')
        };

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Отправка...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Update class names for layout adjustments
                const elementsToUpdate = [
                    { selector: '.section-heading-text', newClass: 'section-heading-text-on-success-form-submission' },
                    { selector: '.contact-right', newClass: 'contact-right-on-success-form-submission' },
                    { selector: '.contact-left', newClass: 'contact-left-on-success-form-submission' },
                    { selector: '.polaroid-photos-composition', newClass: 'polaroid-photos-composition-on-success-form-submission' },
                    { selector: '.wait-for-you-section', newClass: 'wait-for-you-section-on-success-form-submission'},
                    { selector: '.attendance-form-section', newClass: 'attendance-form-section-on-success-form-submission' },
                    { selector: '.root', newClass: 'root-on-success-form-submission' },
                    { selector: '.image-3', newClass: 'image-3-on-success-form-submission' }  
                ];
                
                elementsToUpdate.forEach(item => {
                    const element = document.querySelector(item.selector);
                    if (element) {
                        // Remove the old class and add the new one
                        element.classList.remove(item.selector.substring(1));
                        element.classList.add(item.newClass);
                    }
                });
                
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
            } else {
                alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Helper function to update bullet point styling
function updateBulletPoint(input) {
    const bullet = input.nextElementSibling.querySelector('.attendance-form-bullet-point');
    if (bullet) {
        bullet.style.backgroundColor = input.checked ? '#fe4475' : 'transparent';
        bullet.style.border = input.checked ? 'none' : '2px solid #fe4475';
    }
}

// Updated function without animations
function updateImage(direction) {
    const placeImage = document.querySelector('.place-image img');
    const totalImages = 5;
    let currentIndex = parseInt(placeImage.dataset.currentIndex, 10);
    
    // Calculate the new index without animation
    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % totalImages;
    } else {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    }

    placeImage.src = `/images/place_of_gathering_${currentIndex}.jpg`;
    placeImage.dataset.currentIndex = currentIndex;
}

function initPlaceGallery() {
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    
    // Simplified click handlers without transition delay
    arrowLeft.addEventListener('click', () => updateImage('prev'));
    arrowRight.addEventListener('click', () => updateImage('next'));
    
    // Optional: Keep keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') updateImage('prev');
        if (e.key === 'ArrowRight') updateImage('next');
    });
}