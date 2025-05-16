const addEventForm = {
    modal: null,
    form: null,
    saveButton: null,

    init() {
        this.modal = new bootstrap.Modal(document.getElementById('addEventModal'));
        this.form = document.getElementById('addEventForm');
        this.saveButton = document.getElementById('saveEventBtn');
        
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => this.saveEvent());
        }

        this.setDefaultValues();
    },

    setDefaultValues() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const startDateInput = document.getElementById('eventStartDate');
        const deadlineInput = document.getElementById('eventDeadline');
        
        if (startDateInput) {
            startDateInput.value = this.formatDateForInput(tomorrow);
        }
        
        if (deadlineInput) {
            deadlineInput.value = this.formatDateForInput(today);
        }
    },

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    
    validateForm() {
        const title = document.getElementById('eventTitle').value.trim();
        const venue = document.getElementById('eventVenue').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const startDate = new Date(document.getElementById('eventStartDate').value);
        const deadline = new Date(document.getElementById('eventDeadline').value);
        
        if (!title || !venue || !description) {
            this.showError("All required fields must be filled");
            return false;
        }
        
        if (isNaN(startDate.getTime()) || isNaN(deadline.getTime())) {
            this.showError("Invalid date format");
            return false;
        }
        
        if (startDate < deadline) {
            this.showError("Registration deadline must be before the event start date");
            return false;
        }
        
        
        const imageFile = document.getElementById('eventImageUpload').files[0];
        if (imageFile) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(imageFile.type)) {
                this.showError("Please select a valid image file (JPG, PNG, GIF, WEBP)");
                return false;
            }
            
            
            if (imageFile.size > 5 * 1024 * 1024) {
                this.showError("Image file size must be less than 5MB");
                return false;
            }
        }
        
        return true;
    },
    
    showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.insertBefore(alertDiv, modalBody.firstChild);
            
            setTimeout(() => {
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 300);
            }, 5000);
        }
    },
    
    collectFormData() {
        const formData = new FormData();
        formData.append('title', document.getElementById('eventTitle').value.trim());
        formData.append('category', document.getElementById('eventCategory').value.trim());
        formData.append('venue', document.getElementById('eventVenue').value.trim());
        formData.append('price', document.getElementById('eventPrice').value);
        formData.append('start_date', document.getElementById('eventStartDate').value);
        formData.append('deadline', document.getElementById('eventDeadline').value);
        formData.append('description', document.getElementById('eventDescription').value.trim());
        
        const imageFile = document.getElementById('eventImageUpload').files[0];
        if (imageFile) {
            formData.append('image_upload', imageFile);
            console.log('Image file added:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
        } else {
            console.log('No image file selected');
        }
        
        
        console.log('Form data keys:');
        for (const key of formData.keys()) {
            console.log('- ' + key + ': ' + (key === 'image_upload' ? '[FILE]' : formData.get(key)));
        }
        
        return formData;
    },
    
    async saveEvent() {
        if (!this.validateForm()) {
            return;
        }
        
        const eventData = this.collectFormData();
        const saveBtn = document.getElementById('saveEventBtn');
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            
            const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.DASHBOARD_ACCESS);
            if (!accessToken) {
                throw new Error('No access token found');
            }
            
            const apiUrl = `${CONFIG.API_BASE_URL}/events/`;
            console.log('Submitting event to API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    
                },
                body: eventData
            });
            
            if (!response.ok) {
                let errorMsg = 'Failed to create event';
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch (e) {
                        console.error('Error parsing JSON error response:', e);
                    }
                } else {
                    
                    const text = await response.text();
                    console.error('Server returned non-JSON response:', text.substring(0, 200) + '...');
                }
                
                throw new Error(errorMsg);
            }
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.log('Response was successful but not JSON. Event may have been created.');
            }
            
            this.modal.hide();
            this.resetForm();
            fetchDashboardEvents();
            
            this.showSuccessToast('Event created successfully!');
            
        } catch (error) {
            const errorMsg = error.message || 'An error occurred while saving the event';
            this.showError(errorMsg);
            console.error('Error creating event:', error);
            
            
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                config: {
                    apiBase: CONFIG.API_BASE_URL
                }
            });
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Event';
        }
    },
    
    resetForm() {
        const form = document.getElementById('addEventForm');
        if (form) {
            form.reset();
            this.setDefaultValues();
        }
    },
    
    showSuccessToast(message) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        
        const toastEl = document.createElement('div');
        toastEl.className = 'toast align-items-center text-white bg-success border-0';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastEl);
        document.body.appendChild(toastContainer);
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        
        setTimeout(() => {
            toastContainer.remove();
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const isDashboardPage = document.getElementById('addEventModal');
    if (isDashboardPage) {
        addEventForm.init();
    }
});
