const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

async function fetchEventDetails() {
    try {
        const metaContainer = document.getElementById('eventMeta');
        const existingCategory = metaContainer.querySelector('.category-info');
        const existingTags = metaContainer.querySelector('.tags-info');
        if (existingCategory) existingCategory.remove();
        if (existingTags) existingTags.remove();

        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Failed to fetch event details');
        }

        const responseData = await response.json();

        if (responseData.status !== 'success') {
            throw new Error(responseData.message || 'Failed to fetch event details');
        }

        const event = responseData.data;
        if (!event) {
            throw new Error('No event data received');
        }

        document.getElementById('eventImage').src = event.image || 'https://via.placeholder.com/1200x400';
        document.getElementById('eventTitle').textContent = event.title || 'Untitled Event';
        document.getElementById('eventDescription').textContent = event.description || 'No description available';
        document.getElementById('eventVenue').textContent = event.venue || 'Location TBD';
        document.getElementById('eventDate').textContent = new Date(event.start_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('eventDeadline').textContent = `Register by ${new Date(event.deadline).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })}`;
        document.getElementById('eventPrice').textContent = `$${event.price || 0}`;

        const statusElem = document.getElementById('eventStatus');
        statusElem.classList.remove('status-red', 'status-green', 'status-yellow');
        
        if (event.booked) {
            statusElem.textContent = 'Booked';
            statusElem.classList.add('status-red');
            document.getElementById('bookBtn').disabled = true;
        } else if (!event.available) {
            statusElem.textContent = 'Not Available';
            statusElem.classList.add('status-yellow');
            document.getElementById('bookBtn').disabled = true;
        } else {
            statusElem.textContent = 'Available';
            statusElem.classList.add('status-green');
            document.getElementById('bookBtn').disabled = false;
        }

        if (event.category) {
            const categoryElem = document.createElement('div');
            categoryElem.className = 'card-info mb-2 category-info';
            categoryElem.innerHTML = `
                <i class="bi bi-tag me-2"></i>
                <span>${event.category}</span>
            `;
            document.getElementById('eventMeta').appendChild(categoryElem);
        }

        if (event.tags && Array.isArray(event.tags) && event.tags.length > 0) {
            const tagsElem = document.createElement('div');
            tagsElem.className = 'card-info mb-2 tags-info';
            tagsElem.innerHTML = `
                <i class="bi bi-tags me-2"></i>
                <span>${Array.isArray(event.tags) ? 
                    event.tags.map(tag => typeof tag === 'string' ? tag : tag.name || '').filter(t => t).join(', ') : 
                    ''}</span>
            `;
            document.getElementById('eventMeta').appendChild(tagsElem);
        }

    } catch (error) {
        console.error('Error fetching event details:', error);
        const container = document.querySelector('.details');
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-circle display-1 text-danger mb-3"></i>
                <h3 class="text-danger">Error Loading Event Details</h3>
                <p class="text-muted">${error.message}</p>
                <a href="events.html" class="btn btn-primary mt-3">
                    <i class="bi bi-arrow-left me-2"></i>Back to Events
                </a>
            </div>
        `;
    }
}

async function bookEvent() {
    let response = null;
    try {
        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        response = await fetch(`${CONFIG.API_BASE_URL}/book/event/${eventId}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            try {
                const responseData = await response.json();
                console.log('Booking response:', responseData);
            } catch (jsonError) {
                console.warn('Could not parse JSON response:', jsonError);
            }
            
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            
            document.getElementById('bookBtn').disabled = true;
            const statusElem = document.getElementById('eventStatus');
            statusElem.textContent = 'Booked';
            statusElem.classList.remove('status-green', 'status-yellow');
            statusElem.classList.add('status-red');
            return;
        } else {
            let errorMsg = 'Failed to book event';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || errorMsg;
            } catch (e) {
            }
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Error booking event:', error);
        alert('Failed to book event: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(localStorage.getItem(CONFIG.TOKEN_NAMES.USER_DATA) || '{}');
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userData.username || 'User';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem(CONFIG.TOKEN_NAMES.ACCESS);
            localStorage.removeItem(CONFIG.TOKEN_NAMES.REFRESH);
            localStorage.removeItem(CONFIG.TOKEN_NAMES.USER_DATA);
            window.location.href = 'login.html';
        });
    }

    if (eventId) {
        fetchEventDetails();
    } else {
        window.location.href = 'events.html';
    }
});
