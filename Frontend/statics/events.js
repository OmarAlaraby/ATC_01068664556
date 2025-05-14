
let isLoading = false;


let pagination = {
    currentPage: 1,
    nextUrl: null,
    prevUrl: null,
    totalCount: 0
};

let events = [];

let filters = {
    search: "",
    booking: "",
    availability: ""
};


let retryCount = 0;
const MAX_RETRIES = 2;

async function fetchWithRetry(url, options, maxRetries = MAX_RETRIES) {
    retryCount = 0;
    let lastError;
    
    while (retryCount <= maxRetries) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 401) {
                    
                    localStorage.removeItem('isLoggedIn');
                    window.location.href = 'login.html';
                    return null;
                }
                
                
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            lastError = error;
            retryCount++;
            
            if (retryCount > maxRetries) {
                break;
            }
            
            
            const waitTime = Math.min(1000 * (2 ** retryCount), 8000);
            console.log(`Retry ${retryCount}/${maxRetries}: Waiting ${waitTime}ms before retrying...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    throw new Error(`Failed after ${retryCount} retries: ${lastError.message}`);
}

async function fetchEvents(url = null) {
    try {
        
        isLoading = true;
        showLoadingState();
        
        const accessToken = localStorage.getItem(CONFIG.TOKEN_NAMES.ACCESS);
        if (!accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        
        const apiUrl = url || `${CONFIG.API_BASE_URL}/events/?page=1`;
        
        const response = await fetchWithRetry(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response) {
            return; 
        }

        const responseData = await response.json();
        console.log('API Response:', responseData);

        if (responseData.status !== 'success') {
            throw new Error(responseData.message || 'Failed to fetch events');
        }

        
        const paginatedData = responseData.data;
        pagination.nextUrl = paginatedData.next;
        pagination.prevUrl = paginatedData.previous;
        pagination.totalCount = paginatedData.count;
        
        
        if (url) {
            try {
                const urlObj = new URL(url);
                const page = urlObj.searchParams.get('page');
                if (page) {
                    pagination.currentPage = parseInt(page);
                }
            } catch (e) {
                console.warn('Could not parse page from URL:', e);
            }
        }

        
        const eventResults = paginatedData.results || [];
        events = eventResults.map(event => ({
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
        updatePaginationControls();
        
        
        hideLoadingState();
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
        
        
        hideLoadingState();
    } finally {
        
        hideLoadingState();
    }
}

function showLoadingState() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    
    if (!eventsGrid.innerHTML || events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h5 class="text-muted">Loading events...</h5>
            </div>
        `;
    } else {
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        
        
        if (!document.getElementById('loadingOverlay')) {
            document.body.appendChild(loadingOverlay);
        }
    }
    
    
    disablePaginationDuringLoading(true);
}

function hideLoadingState() {
    isLoading = false;
    
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
    
    
    disablePaginationDuringLoading(false);
}

function disablePaginationDuringLoading(disable) {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.disabled = disable || !pagination.prevUrl;
    }
    
    if (nextBtn) {
        nextBtn.disabled = disable || !pagination.nextUrl;
    }
}

function updatePaginationControls() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        console.warn('Pagination container not found');
        return;
    }

    
    
    let currentPage = pagination.currentPage;
    
    let pageSize = 10; 
    let totalPages = Math.ceil(pagination.totalCount / pageSize);
    
    
    if (currentPage <= 1) {
        if (pagination.nextUrl) {
            const nextUrlParams = new URL(pagination.nextUrl).searchParams;
            const nextPage = parseInt(nextUrlParams.get('page') || '0');
            
            if (nextPage > 0) {
                currentPage = nextPage - 1;
            }
        } else if (pagination.prevUrl) {
            const prevUrlParams = new URL(pagination.prevUrl).searchParams;
            const prevPage = parseInt(prevUrlParams.get('page') || '0');
            
            if (prevPage > 0) {
                currentPage = prevPage + 1;
            }
        }
    }
    
    
    totalPages = Math.ceil(pagination.totalCount / pageSize);
    
    
    pagination.currentPage = currentPage;

    
    if (!pagination.prevUrl && !pagination.nextUrl && pagination.totalCount <= 0) {
        paginationContainer.innerHTML = '';
        return;
    }

    
    let pageNumbers = '';
    const maxPageLinks = 5; 
    
    if (totalPages > 1) {
        let startPage = Math.max(1, currentPage - Math.floor(maxPageLinks / 2));
        let endPage = Math.min(totalPages, startPage + maxPageLinks - 1);
        
        
        if (endPage - startPage + 1 < maxPageLinks) {
            startPage = Math.max(1, endPage - maxPageLinks + 1);
        }
        
        
        if (startPage > 1) {
            pageNumbers += `
                <li class="page-item">
                    <button class="page-link page-num-btn" data-page="1">1</button>
                </li>
            `;
            
            if (startPage > 2) {
                pageNumbers += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }
        
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button class="page-link page-num-btn" ${i === currentPage ? 'disabled' : ''} data-page="${i}">${i}</button>
                </li>
            `;
        }
        
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
            
            pageNumbers += `
                <li class="page-item">
                    <button class="page-link page-num-btn" data-page="${totalPages}">${totalPages}</button>
                </li>
            `;
        }
    }
    
    paginationContainer.innerHTML = `
        <div class="d-flex flex-column align-items-center">
            <nav aria-label="Event pagination">
                <ul class="pagination">
                    <li class="page-item ${!pagination.prevUrl ? 'disabled' : ''}">
                        <button class="page-link" id="prevPageBtn" ${!pagination.prevUrl ? 'disabled' : ''}>
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                    </li>
                    ${pageNumbers}
                    <li class="page-item ${!pagination.nextUrl ? 'disabled' : ''}">
                        <button class="page-link" id="nextPageBtn" ${!pagination.nextUrl ? 'disabled' : ''}>
                            Next <i class="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
            <div class="pagination-info mt-2">
                <span class="current-page-info">Page ${currentPage} of ${totalPages}</span> · 
                Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(currentPage * 10, pagination.totalCount)} of ${pagination.totalCount} event${pagination.totalCount !== 1 ? 's' : ''}
            </div>
        </div>
    `;

    
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn && pagination.prevUrl) {
        prevBtn.addEventListener('click', () => {
            
            pagination.currentPage = Math.max(1, currentPage - 1);
            fetchEvents(pagination.prevUrl);
        });
    }
    
    if (nextBtn && pagination.nextUrl) {
        nextBtn.addEventListener('click', () => {
            
            pagination.currentPage = currentPage + 1;
            fetchEvents(pagination.nextUrl);
        });
    }
    
    
    const pageNumBtns = document.querySelectorAll('.page-num-btn');
    pageNumBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageNum = parseInt(btn.dataset.page);
            if (isNaN(pageNum)) return;
            
            
            pagination.currentPage = pageNum;
            
            const pageUrl = constructPageUrl(pageNum); 
            fetchEvents(pageUrl);
        });
    });
}

function extractPaginationInfo(url) {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
        
        
        const page = params.has('page') ? parseInt(params.get('page')) : 1;
        
        return { 
            page: page,
            originalUrl: url
        };
    } catch (e) {
        console.error('Error parsing pagination URL:', e);
        return null;
    }
}

function constructPageUrl(page) {
    const apiBaseUrl = CONFIG.API_BASE_URL;
    const queryParams = new URLSearchParams();
    
    
    if (filters.search) {
        queryParams.set('search', filters.search);
    }
    
    if (filters.booking === 'booked') {
        queryParams.set('booked', 'true');
    } else if (filters.booking === 'not_booked') {
        queryParams.set('booked', 'false');
    }
    
    if (filters.availability === 'available') {
        queryParams.set('available', 'true');
    } else if (filters.availability === 'not_available') {
        queryParams.set('available', 'false');
    }
    
    
    queryParams.set('page', page);
    
    return `${apiBaseUrl}/events/?${queryParams.toString()}`;
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
    
    const queryParams = new URLSearchParams();
    
    if (filters.search) {
        queryParams.set('search', filters.search);
    }
    
    if (filters.booking === 'booked') {
        queryParams.set('booked', 'true');
    } else if (filters.booking === 'not_booked') {
        queryParams.set('booked', 'false');
    }
    
    if (filters.availability === 'available') {
        queryParams.set('available', 'true');
    } else if (filters.availability === 'not_available') {
        queryParams.set('available', 'false');
    }
    
    
    pagination.currentPage = 1;
    
    
    queryParams.set('page', 1);
    
    
    const filterUrl = `${CONFIG.API_BASE_URL}/events/?${queryParams.toString()}`;
    
    
    fetchEvents(filterUrl);
    
    
    
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

    
    if (queryParams.toString() === '') {
        renderEvents(filteredEvents);
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
