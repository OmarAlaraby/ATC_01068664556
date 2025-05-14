let events = [];

let filters = {
    search: "",
    booking: "",
    availability: ""
};

async function fetchEvents() {
    try {
        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/events/`, {
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
            throw new Error('Failed to fetch events');
        }

        const responseData = await response.json();

        if (responseData.status !== 'success') {
            throw new Error(responseData.message || 'Failed to fetch events');
        }

        events = responseData.data.map(event => ({
            id: event.id,
            name: event.title || '',
            description: event.description || '',
            price: event.price || 0,
            venue: event.venue || '',
            image: event.image || '',
            starts_at: event.start_date || new Date().toISOString(),
            deadline: event.deadline || new Date().toISOString(),
            created_at: event.created_at || new Date().toISOString(),
            is_booked: Boolean(event.booked),
            is_available: Boolean(event.available),
            category: event.category || '',
            tags: Array.isArray(event.tags) ? event.tags : []
        }));

        renderEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-circle display-1 text-danger mb-3"></i>
                <h3 class="text-danger">Error Loading Events</h3>
                <p class="text-muted">${error.message}</p>
                <button class="btn btn-primary mt-3" onclick="fetchEvents()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                </button>
            </div>
        `;
    }
}

function renderEvents(eventsToRender) {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';

    if (!eventsToRender.length) {
        eventsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-calendar-x display-1 text-muted mb-3"></i>
                <h3 class="text-muted">No Events Found</h3>
                <p class="text-muted">Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    eventsToRender.forEach(event => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-img-wrapper">
                    <img src="${event.image || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${event.name}">
                    <div class="card-img-overlay">
                        <span class="status ${event.is_booked ? 'status-red' : event.is_available ? 'status-green' : 'status-red'}">
                            ${event.is_booked ? 'Booked' : event.is_available ? 'Available' : 'Not Available'}
                        </span>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title mb-3">${event.name}</h5>
                    <div class="card-info mb-2">
                        <i class="bi bi-geo-alt me-2"></i>
                        <span>${event.venue}</span>
                    </div>
                    <div class="card-info mb-2">
                        <i class="bi bi-calendar-event me-2"></i>
                        <span>${new Date(event.starts_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                    </div>
                    <div class="card-info mb-3">
                        <i class="bi bi-tag me-2"></i>
                        <span>${event.category}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div class="price">$${event.price}</div>
                        <a href="event-details.html?id=${event.id}" class="btn btn-primary" style="z-index: 2;">View Details</a>
                    </div>
                </div>
            </div>
        `;
        eventsGrid.appendChild(card);
    });
}

function filterEvents() {
    let filteredEvents = [...events];

    const searchTerm = filters.search.toLowerCase().trim();
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
            event.name.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.venue.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm)
        );
    }

    if (filters.booking === 'booked') {
        filteredEvents = filteredEvents.filter(event => event.is_booked);
    } else if (filters.booking === 'not_booked') {
        filteredEvents = filteredEvents.filter(event => !event.is_booked);
    }

    if (filters.availability === 'available') {
        filteredEvents = filteredEvents.filter(event => event.is_available);
    } else if (filters.availability === 'not_available') {
        filteredEvents = filteredEvents.filter(event => !event.is_available);
    }

    renderEvents(filteredEvents);
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

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filters.search = e.target.value;
            filterEvents();
        });
    }

    const bookingFilter = document.getElementById('bookingFilter');
    if (bookingFilter) {
        bookingFilter.addEventListener('change', (e) => {
            filters.booking = e.target.value;
            filterEvents();
        });
    }

    const availabilityFilter = document.getElementById('availabilityFilter');
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', (e) => {
            filters.availability = e.target.value;
            filterEvents();
        });
    }

    fetchEvents();
});
