const AUTH_UTILS = {
    hasAdminPrivileges: function(role) {
        if (!role) return false;
        
        const userRole = role.toLowerCase();
        return userRole === 'admin' || userRole === 'superadmin';
    },
    
    verifyAdminAccess: function(userData, redirectUrl = 'index.html') {
        if (!userData || !userData.role) {
            window.location.href = redirectUrl;
            return false;
        }
        
        if (!this.hasAdminPrivileges(userData.role)) {
            localStorage.removeItem('isDashboardLoggedIn');
            window.location.href = redirectUrl;
            return false;
        }
        
        return true;
    },
    
    dashboardLogout: function() {
        localStorage.removeItem('isDashboardLoggedIn');
        localStorage.removeItem(CONFIG.TOKEN_NAMES.DASHBOARD_ACCESS);
        localStorage.removeItem(CONFIG.TOKEN_NAMES.DASHBOARD_REFRESH);
        localStorage.removeItem(CONFIG.TOKEN_NAMES.DASHBOARD_USER_DATA);
        window.location.href = 'dashboard-login.html';
    }
};


Object.freeze(AUTH_UTILS);
