function initEventSearchAndFilter() {
    const searchInput = document.getElementById('eventsSearch');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterAndSearchEvents();
        }, 300));
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', function() {
            filterAndSearchEvents();
        });
    }
}

function filterAndSearchEvents() {
    const searchInput = document.getElementById('eventsSearch');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (!searchInput || !availabilityFilter) {
        console.warn('Search or filter elements not found');
        return;
    }
    
    const searchQuery = searchInput.value.toLowerCase().trim();
    const availabilityValue = availabilityFilter.value;
    
    
    let filteredEvents = [...dashboardEvents.events];
    
    
    if (availabilityValue) {
        switch(availabilityValue) {
            case 'available':
                filteredEvents = filteredEvents.filter(event => event.isAvailable);
                break;
            case 'not_available':
                filteredEvents = filteredEvents.filter(event => !event.isAvailable);
                break;
        }
    }
    
    
    if (searchQuery) {
        filteredEvents = filteredEvents.filter(event => 
            event.name.toLowerCase().includes(searchQuery) || 
            event.venue.toLowerCase().includes(searchQuery) || 
            event.category.toLowerCase().includes(searchQuery)
        );
    }
    
    
    updateEventsTableWithFiltered(filteredEvents, searchQuery);
}

function updateEventsTableWithFiltered(filteredEvents, searchQuery) {
    const tableBody = document.querySelector('#dashboardEventsTable tbody');
    if (!tableBody) {
        console.warn('Dashboard events table not found');
        return;
    }

    
    tableBody.innerHTML = '';

    
    if (filteredEvents.length === 0) {
        
        if (searchQuery) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="search-empty-state">
                            <i class="bi bi-search"></i>
                            <h5>No matching events</h5>
                            <p class="text-muted">We couldn't find any events matching "${searchQuery}"</p>
                            <button class="btn btn-sm btn-outline-secondary" onclick="resetSearchAndFilters()">
                                <i class="bi bi-x-circle me-1"></i>Clear Search
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="filtered-empty-state">
                            <i class="bi bi-funnel"></i>
                            <h5>No events match the filter</h5>
                            <p class="text-muted">Try changing your filter criteria</p>
                            <button class="btn btn-sm btn-outline-secondary" onclick="resetSearchAndFilters()">
                                <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filters
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        return;
    }

    
    filteredEvents.forEach(event => {
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

        
        let displayName = event.name;
        let displayVenue = event.venue;
        let displayCategory = event.category;
        
        if (searchQuery) {
            displayName = highlightMatch(event.name, searchQuery);
            displayVenue = highlightMatch(event.venue, searchQuery);
            displayCategory = highlightMatch(event.category, searchQuery);
        }

        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="event-image-small me-2">
                        <img src="${event.image || 'https://via.placeholder.com/50x50'}" alt="${event.name}" class="rounded" width="50">
                    </div>
                    <div>
                        <div class="fw-semibold">${displayName}</div>
                        <div class="text-muted small">${displayCategory}</div>
                    </div>
                </div>
            </td>
            <td>${eventDate}</td>
            <td>${displayVenue}</td>
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
                        <li><a class="dropdown-item" href="#" onclick="editEvent(${event.id})"><i class="bi bi-pencil me-2"></i>Edit Event</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteEvent(${event.id})"><i class="bi bi-trash me-2"></i>Delete Event</a></li>
                    </ul>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function resetSearchAndFilters() {
    const searchInput = document.getElementById('eventsSearch');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (searchInput) searchInput.value = '';
    if (availabilityFilter) availabilityFilter.value = '';
    
    
    updateDashboardEventsTable();
}

function highlightMatch(text, query) {
    if (!text || !query) return text || '';
    
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    
    const pattern = new RegExp(`(${escapedQuery})`, 'gi');
    
    
    return text.replace(pattern, '<span class="search-highlight">$1</span>');
}

function debounce(func, delay) {
    let timeout;
    
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


document.addEventListener('DOMContentLoaded', function() {
    
    const isDashboardPage = document.getElementById('dashboardEventsTable');
    
    if (isDashboardPage) {
        initEventSearchAndFilter();
        
        
        const refreshBtn = document.getElementById('refreshEventsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function(e) {
                e.preventDefault();
                fetchDashboardEvents();
                resetSearchAndFilters();
            });
        }
    }
});
