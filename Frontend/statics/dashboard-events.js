let dashboardEvents = {
    events: [],
    pagination: {
        currentPage: 1,
        nextUrl: null,
        prevUrl: null,
        totalCount: 0
    },
    stats: {
        totalEvents: 0,
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0
    }
};

async function fetchDashboardEvents(url = null) {
    try {
        showDashboardLoading(true);
        
        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.DASHBOARD_ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const apiUrl = url || `${CONFIG.API_BASE_URL}/events/?page_size=100&page=1`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
    
                AUTH_UTILS.dashboardLogout();
                return;
            }
            throw new Error(`HTTP error: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Dashboard Events API Response:', responseData);

        if (responseData.status !== 'success') {
            throw new Error(responseData.message || 'Failed to fetch events');
        }

        const paginatedData = responseData.data;
        dashboardEvents.pagination.nextUrl = paginatedData.next;
        dashboardEvents.pagination.prevUrl = paginatedData.previous;
        dashboardEvents.pagination.totalCount = paginatedData.count;
        
        if (url) {
            try {
                const urlObj = new URL(url);
                const page = urlObj.searchParams.get('page');
                if (page) {
                    dashboardEvents.pagination.currentPage = parseInt(page);
                }
            } catch (e) {
                console.warn('Could not parse page from URL:', e);
            }
        }

        const eventResults = paginatedData.results || [];
        dashboardEvents.events = eventResults.map(event => ({
            id: event.id,
            name: event.title || '',
            description: event.description || '',
            price: event.price || 0,
            venue: event.venue || '',
            image: event.image || '',
            startsAt: event.start_date || new Date().toISOString(),
            deadline: event.deadline || new Date().toISOString(),
            createdAt: event.created_at || new Date().toISOString(),
            isBooked: Boolean(event.booked),
            isAvailable: Boolean(event.available),
            category: event.category || '',
            tags: Array.isArray(event.tags) ? event.tags : [],
            status: getEventStatus(event)
        }));

        updateDashboardEventsTable();
        
        updateDashboardStats();
        
    } catch (error) {
        console.error('Error fetching dashboard events:', error);
        showDashboardError(error.message);
    } finally {
        showDashboardLoading(false);
    }
}

function getEventStatus(event) {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const deadline = new Date(event.deadline || startDate);

    if (deadline < now) {
        return 'completed';
    }
    else if (startDate.toDateString() === now.toDateString()) {
        return 'active';
    }
    else if (event.booked && event.available) {
        return 'booked';
    }
    else if (!event.available) {
        return 'unavailable';
    }
    else {
        return 'upcoming';
    }
}

function updateDashboardEventsTable() {
    const tableBody = document.querySelector('#dashboardEventsTable tbody');
    if (!tableBody) {
        console.warn('Dashboard events table not found');
        return;
    }

    if (dashboardEvents.events.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="bi bi-calendar-x text-muted"></i>
                    <p class="mb-0 mt-2">No events found</p>
                </td>
            </tr>
        `;
        
        updatePaginationControls();
        return;
    }
    tableBody.innerHTML = '';
    dashboardEvents.events.forEach(event => {
        const row = document.createElement('tr');
        
        const eventDate = new Date(event.startsAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        let statusBadgeClass = '';
        switch(event.status) {
            case 'active':
                statusBadgeClass = 'bg-success';
                break;
            case 'upcoming':
                statusBadgeClass = 'bg-warning';
                break;
            case 'completed':
                statusBadgeClass = 'bg-secondary';
                break;
            case 'booked':
                statusBadgeClass = 'bg-primary';
                break;
            case 'unavailable':
                statusBadgeClass = 'bg-danger';
                break;
            default:
                statusBadgeClass = 'bg-light text-dark';
        }

        const tags = event.tags.map(tag => tag.name).join(', ') || 'No tags';

        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="event-image-small me-2">
                        <img src="${event.image || 'https://placehold.co/50x50'}" alt="${event.name}" class="rounded" width="50">
                    </div>
                    <div>
                        <div class="fw-semibold">${event.name}</div>
                        <div class="text-muted small">${event.category}</div>
                    </div>
                </div>
            </td>
            <td>${eventDate}</td>
            <td>${event.venue}</td>
            <td><span class="badge ${statusBadgeClass}">${event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span></td>
            <td>
                <div class="d-flex flex-column">
                    <span class="badge ${event.isBooked ? 'bg-primary' : 'bg-light text-dark'} mb-1">
                        ${event.isBooked ? 'Booked' : 'Not Booked'}
                    </span>
                    <span class="badge ${event.isAvailable ? 'bg-success' : 'bg-danger'}">
                        ${event.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                </div>
            </td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton-${event.id}" data-bs-toggle="dropdown" aria-expanded="false">
                        Actions
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${event.id}">
                        <li><a class="dropdown-item" href="event-details.html?id=${event.id}" target="_blank"><i class="bi bi-eye me-2"></i>View Details</a></li>
                        <li><a class="dropdown-item edit-event-btn" href="#" data-bs-toggle="modal" data-bs-target="#editEventModal" data-id="${event.id}"><i class="bi bi-pencil me-2"></i>Edit Event</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger delete-event-btn" data-id="${event.id}"><i class="bi bi-trash me-2"></i>Delete Event</a></li>
                    </ul>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    addEventButtonListeners();

    updatePaginationControls();
}

function addEventButtonListeners() {
    document.querySelectorAll('.edit-event-btn').forEach(button => {
        button.addEventListener('click', () => {
            const eventId = button.dataset.id;
            editEvent(eventId);
        });
    });
    document.querySelectorAll('.delete-event-btn').forEach(button => {
        button.addEventListener('click', () => {
            const eventId = button.dataset.id;
            openDeleteEventModal(eventId);
        });
    });
    document.querySelectorAll('.view-event-btn').forEach(button => {
        button.addEventListener('click', () => {
            const eventId = button.dataset.id;
            console.log(`View event ${eventId}`);

            window.open(`event-details.html?id=${eventId}`, '_blank');
        });
    });
}

function updateDashboardStats() {
    dashboardEvents.stats.totalEvents = dashboardEvents.pagination.totalCount || 0;
    updateStatCards();
}

function updateStatCards() {
    const eventsCountElement = document.querySelector('.events-count-number');
    if (eventsCountElement) {
        eventsCountElement.textContent = dashboardEvents.stats.totalEvents || dashboardEvents.pagination.totalCount || 0;
    }
}


function formatCurrency(value) {
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
}


function showDashboardLoading(show) {
    const tableContainer = document.querySelector('.table-responsive');
    if (!tableContainer) return;
    
    if (show) {
        let loadingOverlay = document.getElementById('dashboardLoadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'dashboardLoadingOverlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            `;
            tableContainer.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    } else {
        const loadingOverlay = document.getElementById('dashboardLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

function showDashboardError(message) {
    const tableBody = document.querySelector('#dashboardEventsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="text-danger mb-2">
                    <i class="bi bi-exclamation-circle"></i>
                </div>
                <p class="text-danger mb-0">${message}</p>
                <button class="btn btn-sm btn-outline-primary mt-3" onclick="fetchDashboardEvents()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Try Again
                </button>
            </td>
        </tr>
    `;
}

function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    let bgClass = 'bg-info';
    let icon = '<i class="bi bi-info-circle me-2"></i>';
    
    switch (type) {
        case 'success':
            bgClass = 'bg-success';
            icon = '<i class="bi bi-check-circle me-2"></i>';
            break;
        case 'error':
            bgClass = 'bg-danger';
            icon = '<i class="bi bi-exclamation-circle me-2"></i>';
            break;
        case 'warning':
            bgClass = 'bg-warning';
            icon = '<i class="bi bi-exclamation-triangle me-2"></i>';
            break;
    }

    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = `toast show ${bgClass} text-white`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="toast-header ${bgClass} text-white">
            ${icon}
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            toastElement.remove();
        }
    }, 5000);
}

async function editEvent(eventId) {
    const event = dashboardEvents.events.find(e => e.id === parseInt(eventId));
    if (!event) {
        console.error('Event not found:', eventId);
        return;
    }

    // Clean up any existing modal backdrops and classes
    document.body.classList.remove('modal-open');
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());
    
    // Populate form fields
    document.getElementById('editEventId').value = event.id;
    document.getElementById('editEventTitle').value = event.name;
    document.getElementById('editEventCategory').value = event.category;
    document.getElementById('editEventVenue').value = event.venue;
    document.getElementById('editEventPrice').value = event.price;
    document.getElementById('editEventDescription').value = event.description;
    
    const startDate = new Date(event.startsAt);
    document.getElementById('editEventStartDate').value = startDate.toISOString().slice(0, 16);
    
    const deadline = new Date(event.deadline);
    document.getElementById('editEventDeadline').value = deadline.toISOString().slice(0, 16);
    
    const currentImageElement = document.getElementById('currentEventImage');
    if (currentImageElement) {
        currentImageElement.src = event.image || 'https://placehold.co/150x100';
    }

    // Handle modal cleanup when it's hidden
    const editEventModalElement = document.getElementById('editEventModal');
    editEventModalElement.addEventListener('hidden.bs.modal', function () {
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    });

    // Remove existing event listener if any
    const updateEventBtn = document.getElementById('updateEventBtn');
    const newUpdateBtn = updateEventBtn.cloneNode(true);
    updateEventBtn.parentNode.replaceChild(newUpdateBtn, updateEventBtn);
    
    // Add new event listener
    newUpdateBtn.addEventListener('click', () => updateEvent(event.id));
    
    // Show the modal
    const editEventModal = new bootstrap.Modal(document.getElementById('editEventModal'));
    editEventModal.show();
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function updateEvent(eventId) {
    try {
        showDashboardLoading(true);
        
        const form = document.getElementById('editEventForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            showDashboardLoading(false);
            return;
        }
        
        const title = document.getElementById('editEventTitle').value;
        const category = document.getElementById('editEventCategory').value;
        const venue = document.getElementById('editEventVenue').value;
        const price = parseFloat(document.getElementById('editEventPrice').value);
        const startDate = document.getElementById('editEventStartDate').value;
        const deadline = document.getElementById('editEventDeadline').value;
        const description = document.getElementById('editEventDescription').value;
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('venue', venue);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('start_date', new Date(startDate).toISOString());
        formData.append('deadline', new Date(deadline).toISOString());
        
        const imageFile = document.getElementById('editEventImageUpload').files[0];
        if (imageFile) {
            formData.append('image_upload', imageFile);
        }
        
        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.DASHBOARD_ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                AUTH_UTILS.dashboardLogout();
                return;
            }
            
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update event. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Update event response:', data);
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to update event');
        }
        
        const editEventModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
        if (editEventModal) {
            editEventModal.hide();
        }
        
        fetchDashboardEvents();
        
        showSuccessToast('Event updated successfully');
        
    } catch (error) {
        console.error('Error updating event:', error);
        showErrorToast(`Failed to update event: ${error.message}`);
    } finally {
        showDashboardLoading(false);
    }
}

function openDeleteEventModal(eventId) {
    console.log(`Open delete modal for event ${eventId}`);

    const event = dashboardEvents.events.find(event => event.id.toString() === eventId.toString());
    if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return;
    }

    const eventDate = new Date(event.startsAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    document.getElementById('deleteEventName').textContent = event.name;
    document.getElementById('deleteEventDate').textContent = eventDate;
    
    const deleteEventImage = document.getElementById('deleteEventImage');
    if (deleteEventImage) {
        deleteEventImage.src = event.image || 'https://via.placeholder.com/50x50';
        deleteEventImage.alt = event.name;
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    const newConfirmBtn = confirmDeleteBtn.cloneNode(true);
    confirmDeleteBtn.parentNode.replaceChild(newConfirmBtn, confirmDeleteBtn);

    newConfirmBtn.addEventListener('click', () => deleteEvent(event.id));

    const deleteEventModal = new bootstrap.Modal(document.getElementById('deleteEventModal'));
    deleteEventModal.show();
}

/**
 * Delete an event
 * @param {number} eventId - Event ID to delete
 */
async function deleteEvent(eventId) {
    try {
        showDashboardLoading(true);
        
        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.DASHBOARD_ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                AUTH_UTILS.dashboardLogout();
                return;
            }
            
            const errorText = await response.text();
            throw new Error(`Failed to delete event. Status: ${response.status}. ${errorText}`);
        }
        
        const deleteEventModal = bootstrap.Modal.getInstance(document.getElementById('deleteEventModal'));
        if (deleteEventModal) {
            deleteEventModal.hide();
        }
        
        fetchDashboardEvents();
        
        showSuccessToast('Event deleted successfully');
        
    } catch (error) {
        console.error('Error deleting event:', error);
        showErrorToast(`Failed to delete event: ${error.message}`);
    } finally {
        showDashboardLoading(false);
    }
}

function updatePaginationControls() {
    const { currentPage, nextUrl, prevUrl, totalCount } = dashboardEvents.pagination;
    const eventsPerPage = dashboardEvents.events.length;

    const paginationInfoEl = document.getElementById('paginationInfo');
    if (paginationInfoEl) {
        const startItem = totalCount > 0 ? (currentPage - 1) * eventsPerPage + 1 : 0;
        const endItem = Math.min(currentPage * eventsPerPage, totalCount);
        paginationInfoEl.textContent = `Showing ${startItem} to ${endItem} of ${totalCount} events`;
    }

    const currentPageEl = document.getElementById('currentPageDisplay');
    if (currentPageEl) {
        currentPageEl.textContent = currentPage;
    }

    const prevPageItem = document.getElementById('prevPageItem');
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageItem && prevPageBtn) {
        if (prevUrl) {
            prevPageItem.classList.remove('disabled');
            prevPageBtn.disabled = false;
        } else {
            prevPageItem.classList.add('disabled');
            prevPageBtn.disabled = true;
        }
    }

    const nextPageItem = document.getElementById('nextPageItem');
    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageItem && nextPageBtn) {
        if (nextUrl) {
            nextPageItem.classList.remove('disabled');
            nextPageBtn.disabled = false;
        } else {
            nextPageItem.classList.add('disabled');
            nextPageBtn.disabled = true;
        }
    }
}

function goToPreviousPage() {
    if (dashboardEvents.pagination.prevUrl) {
        fetchDashboardEvents(dashboardEvents.pagination.prevUrl);
    }
}

function goToNextPage() {
    if (dashboardEvents.pagination.nextUrl) {
        fetchDashboardEvents(dashboardEvents.pagination.nextUrl);
    }
}

function initPagination() {
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPreviousPage);
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPage);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const isDashboardPage = document.getElementById('dashboardEventsTable');
    const isDashboardLoggedIn = localStorage.getItem('isDashboardLoggedIn') === 'true';
    
    if (isDashboardPage && isDashboardLoggedIn) {
        fetchDashboardEvents();
        initPagination();
        
        // Set up refresh button handler
        const refreshBtn = document.getElementById('refreshEventsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                fetchDashboardEvents();
            });
        }
    }
});
