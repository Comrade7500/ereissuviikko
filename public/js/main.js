// Main JavaScript file for eReissuvihko

document.addEventListener('DOMContentLoaded', function() {
    // Auto-mark messages as read when viewed
    const messageCards = document.querySelectorAll('.message-card[data-message-id]');
    messageCards.forEach(card => {
        if (!card.classList.contains('unread')) return;
        
        // Mark as read when scrolled into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const messageId = entry.target.dataset.messageId;
                    markMessageAsRead(messageId);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(card);
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#dc3545';
                    isValid = false;
                } else {
                    field.style.borderColor = '#e9ecef';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showAlert('Täytä kaikki pakolliset kentät', 'error');
            }
        });
    });
    
    // Auto-focus on first input in forms
    const firstInputs = document.querySelectorAll('form input[type="text"], form input[type="email"], form select');
    if (firstInputs.length > 0) {
        firstInputs[0].focus();
    }
});

// Mark message as read
function markMessageAsRead(messageId) {
    fetch(`/student/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove unread styling
            const messageCard = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageCard) {
                messageCard.classList.remove('unread');
                const unreadBadge = messageCard.querySelector('.unread-badge');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
            }
        }
    })
    .catch(error => {
        console.error('Error marking message as read:', error);
    });
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Format time input to HH:MM
function formatTimeInput(input) {
    input.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + ':' + value.substring(2, 4);
        }
        this.value = value;
    });
}

// Initialize time inputs
document.addEventListener('DOMContentLoaded', function() {
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(formatTimeInput);
});

// Confirm delete actions
function confirmDelete(message, url) {
    if (confirm(message)) {
        window.location.href = url;
    }
}

// Toggle password visibility (for future use)
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.querySelector(`[onclick="togglePasswordVisibility('${inputId}')"] i`);
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Auto-save form data to localStorage (for draft functionality)
function autoSaveForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Load saved data
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(`${formId}_${input.name}`);
        if (savedValue && !input.value) {
            input.value = savedValue;
        }
    });
    
    // Save data on input
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            localStorage.setItem(`${formId}_${this.name}`, this.value);
        });
    });
    
    // Clear saved data on successful submit
    form.addEventListener('submit', function() {
        inputs.forEach(input => {
            localStorage.removeItem(`${formId}_${input.name}`);
        });
    });
}

// Initialize auto-save for forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[id]');
    forms.forEach(form => {
        autoSaveForm(form.id);
    });
});
