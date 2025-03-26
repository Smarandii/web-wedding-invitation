const WEDDING_DATE = new Date('2025-07-02T14:00:00');

document.addEventListener('DOMContentLoaded', function() {
    setupFormHandlers();
    initPlaceGallery();
});

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

function updateImage(direction) {
    const placeImage = document.querySelector('.place-image img');
    const totalImages = 8; // 0 through 7
    let currentIndex = parseInt(placeImage.dataset.currentIndex);
    
    // Add transitioning class for fade out
    placeImage.classList.add('transitioning');
    
    // Wait for fade out to complete
    setTimeout(() => {
        // Calculate new index
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalImages;
        } else {
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        }
        
        // Update image source and data attribute
        const extension = currentIndex === 0 ? 'png' : 'jpg';
        placeImage.src = `/images/place_of_gathering_${currentIndex}.${extension}`;
        placeImage.dataset.currentIndex = currentIndex;
        
        // Remove transitioning class for fade in
        placeImage.classList.remove('transitioning');
    }, 300); // Half of the transition duration
}

function initPlaceGallery() {
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    
    // Add click event listeners with debounce to prevent rapid clicking
    let isTransitioning = false;
    
    function handleClick(direction) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        updateImage(direction);
        
        // Reset transitioning flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 600); // Full transition duration
    }
    
    arrowLeft.addEventListener('click', () => handleClick('prev'));
    arrowRight.addEventListener('click', () => handleClick('next'));
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') handleClick('prev');
        if (e.key === 'ArrowRight') handleClick('next');
    });
}