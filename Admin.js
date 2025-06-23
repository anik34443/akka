// Admin credentials
const ADMIN_USERNAME = 'anik203';
const ADMIN_PASSWORD = 'anik@203';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin.js: DOMContentLoaded event fired'); // Debug log
    
    // Check login status
    checkLoginStatus();

    // Setup event listeners
    setupEventListeners();
    
    // Setup homepage event listeners
    setupHomepageEventListeners();

    // Load existing data when page loads
    loadExistingData();

    // Add event listener to save button
    const saveButton = document.getElementById('saveHomepageBtn');
    if (saveButton) {
        console.log('Admin.js: Found save button, adding click listener'); // Debug log
        saveButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default form submission
            saveData();
        });
    } else {
        console.error('Admin.js: Save button not found!'); // Debug log
    }
});

// Setup all event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.querySelector('#loginForm form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('a').getAttribute('href').replace('#', '');
            showSection(section);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }

    // Settings save button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }


}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadDashboard();
        loadRegistrations();
        showNotification('সফলভাবে লগইন হয়েছে', 'success');
    } else {
        showNotification('ভুল ইউজারনেম অথবা পাসওয়ার্ড!', 'error');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
    showNotification('সফলভাবে লগআউট হয়েছে', 'success');
}

// Show login form
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
}

// Check login status
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showAdminPanel();
        loadDashboard();
        loadRegistrations();
    } else {
        showLoginForm();
    }
}

// Show section
function showSection(sectionId) {
    // Update section title
    const sectionTitles = {
        dashboard: 'ড্যাশবোর্ড',
        registrations: 'রেজিস্ট্রেশন',
        homepage: 'হোম পেজ',
        settings: 'সেটিংস'
    };
    document.getElementById('sectionTitle').textContent = sectionTitles[sectionId] || sectionTitles.dashboard;

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
    }

    // Update navigation active state
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    const activeNavItem = document.querySelector(`a[href="#${sectionId}"]`)?.parentElement;
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Load section data
    if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'registrations') {
        loadRegistrations();
    } else if (sectionId === 'settings') {
        loadSettings();
    } else if (sectionId === 'homepage') {
        loadHomepageContent();
        setupHomepageEventListeners(); // Re-setup event listeners when showing homepage
    }
}

// Load dashboard data
function loadDashboard() {
    const registrations = getRegistrations();
    
    // Update total registrations
    document.getElementById('totalRegistrations').textContent = registrations.length;
    
    // Calculate total t-shirts and guests
    let totalTshirts = 0;
    let totalGuests = 0;
    let totalAmount = 0;

    registrations.forEach(reg => {
        // Count t-shirts (1 for main participant + guests)
        totalTshirts += 1; // Main participant
        if (reg.guestCount) {
            const guestCount = parseInt(reg.guestCount) || 0;
            totalTshirts += guestCount;
            totalGuests += guestCount;
        }

        // Calculate total amount from paid registrations
        if (reg.status === 'paid') {
            try {
                let amount = 0;
                // Handle new payment format
                if (reg.payment && reg.payment.amount) {
                    amount = parseFloat(reg.payment.amount);
                }
                // Handle old payment format
                else if (reg.paymentInfo) {
                    amount = parseFloat(reg.paymentInfo.toString().replace(/[^\d.]/g, ''));
                }
                totalAmount += amount || 0;
            } catch (error) {
                console.error('Error parsing payment amount:', error);
            }
        }
    });

    // Update the stats in the dashboard
    document.getElementById('totalTshirts').textContent = totalTshirts;
    document.getElementById('totalGuests').textContent = totalGuests;
    
    // Format and display total amount in Bengali
    const formattedAmount = totalAmount.toLocaleString('bn-BD');
    document.getElementById('totalAmount').textContent = `${formattedAmount} টাকা`;
}

// Load registrations data
function loadRegistrations() {
    const tableBody = document.getElementById('registrationTableBody');
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Get all registrations
    const registrations = getRegistrations();

    // Sort registrations by timestamp (newest first)
    registrations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Create table rows
    registrations.forEach((registration, index) => {
        const row = document.createElement('tr');
        const paymentStatus = registration.status === 'paid' ? 
            '<span class="status-badge paid">পরিশোধিত</span>' : 
            '<span class="status-badge pending">অপরিশোধিত</span>';
        
        // Format payment info
        let paymentInfo = '';
        if (registration.status === 'paid') {
            if (registration.payment) {
                paymentInfo = `
                    <div class="payment-info">
                        <div>মেথড: ${registration.payment.method}</div>
                        <div>ট্রানজেকশন: ${registration.payment.transactionId}</div>
                        <div>নম্বর: ${registration.payment.phone}</div>
                        <div>পরিমাণ: ৳${registration.payment.amount}</div>
                    </div>
                `;
            } else if (registration.paymentInfo) {
                paymentInfo = `<div class="payment-info">পরিমাণ: ৳${registration.paymentInfo}</div>`;
            }
        }
            
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${registration.name || ''}</td>
            <td>${registration.batch || ''}</td>
            <td>${registration.phone || ''}</td>
            <td>${registration.email || ''}</td>
            <td>${registration.tshirtSize || ''}</td>
            <td>${registration.guestCount || 0}</td>
            <td>
                ${registration.guest1TshirtSize ? `অতিথি ১: ${registration.guest1TshirtSize}<br>` : ''}
                ${registration.guest2TshirtSize ? `অতিথি ২: ${registration.guest2TshirtSize}` : ''}
            </td>
            <td>${formatDate(registration.timestamp)}</td>
            <td>${paymentStatus}</td>
            <td>${paymentInfo}</td>
            <td>
                <button onclick="deleteRegistration('${registration.id}')" class="delete-btn" title="মুছে ফেলুন">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get registrations
function getRegistrations() {
    try {
        return Object.entries(localStorage)
            .filter(([key]) => key.startsWith('registration_'))
            .map(([_, value]) => JSON.parse(value));
    } catch (error) {
        console.error('Error loading registrations:', error);
        return [];
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#registrationTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Handle export
function handleExport() {
    const registrations = getRegistrations();
    const csv = convertToCSV(registrations);
    downloadCSV(csv, 'registrations.csv');
    showNotification('রেজিস্ট্রেশন তথ্য ডাউনলোড হয়েছে', 'success');
}

// Delete registration
function deleteRegistration(id) {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই রেজিস্ট্রেশনটি মুছে ফেলতে চান?')) {
        localStorage.removeItem(id);
        loadRegistrations();
        loadDashboard();
        showNotification('রেজিস্ট্রেশন সফলভাবে মুছে ফেলা হয়েছে', 'success');
    }
}

// Load settings
function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        // Get input elements
        const siteTitleInput = document.getElementById('siteTitle');
        const contactEmailInput = document.getElementById('contactEmail');
        const contactPhoneInput = document.getElementById('contactPhone');
        
        // Set values if they exist
        if (siteTitleInput) siteTitleInput.value = settings.siteTitle || '';
        if (contactEmailInput) contactEmailInput.value = settings.contactEmail || '';
        if (contactPhoneInput) contactPhoneInput.value = settings.contactPhone || '';
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('সেটিংস লোড করতে সমস্যা হয়েছে', 'error');
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format (allows +880 and spaces)
function isValidPhone(phone) {
    const phoneRegex = /^(?:\+?880)?[-\s]?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Update iframe content
function refreshIframe() {
    try {
        const mainPage = document.querySelector('iframe[name="mainPage"]');
        if (mainPage && mainPage.contentWindow) {
            mainPage.contentWindow.location.reload();
        }
    } catch (error) {
        console.error('Error updating main page:', error);
    }
}

// Save settings
function saveSettings() {
    try {
        // Get input elements
        const siteTitleInput = document.getElementById('siteTitle');
        const contactEmailInput = document.getElementById('contactEmail');
        const contactPhoneInput = document.getElementById('contactPhone');
        
        // Validate inputs
        if (!siteTitleInput || !contactEmailInput || !contactPhoneInput) {
            showNotification('সেটিংস ফর্ম এলিমেন্টস খুঁজে পাওয়া যায়নি', 'error');
            return;
        }
        
        // Get values
        const settings = {
            siteTitle: siteTitleInput.value.trim(),
            contactEmail: contactEmailInput.value.trim(),
            contactPhone: contactPhoneInput.value.trim()
        };
        
        // Validate required fields
        if (!settings.siteTitle) {
            showNotification('ওয়েবসাইট টাইটেল প্রয়োজন', 'error');
            return;
        }
        
        if (!settings.contactEmail) {
            showNotification('যোগাযোগের ইমেইল প্রয়োজন', 'error');
            return;
        }
        
        if (!settings.contactPhone) {
            showNotification('যোগাযোগের ফোন প্রয়োজন', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(settings.contactEmail)) {
            showNotification('সঠিক ইমেইল ঠিকানা দিন', 'error');
            return;
        }
        
        // Validate phone format
        if (!isValidPhone(settings.contactPhone)) {
            showNotification('সঠিক ফোন নম্বর দিন', 'error');
            return;
        }

        // Save to localStorage
        localStorage.setItem('settings', JSON.stringify(settings));
        
        // Update iframe
        refreshIframe();
        
        // Update the website content
        updateWebsiteContent(settings);
        
        showNotification('সেটিংস সফলভাবে সেভ করা হয়েছে', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('সেটিংস সেভ করতে সমস্যা হয়েছে', 'error');
    }
}

// Update website content with new settings
function updateWebsiteContent(settings) {
    try {
        // Update contact info in the footer
        const contactPhone = document.querySelector('.contact-info p:first-child');
        const contactEmail = document.querySelector('.contact-info p:last-child');
        
        if (contactPhone) {
            contactPhone.innerHTML = `<i class="fas fa-phone"></i> ${settings.contactPhone}`;
        }
        
        if (contactEmail) {
            contactEmail.innerHTML = `<i class="fas fa-envelope"></i> ${settings.contactEmail}`;
        }
        
        // Update page title
        document.title = settings.siteTitle;
        
    } catch (error) {
        console.error('Error updating website content:', error);
    }
}

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Convert data to CSV
function convertToCSV(data) {
    const headers = ['নাম', 'ব্যাচ', 'ফোন', 'ইমেইল', 'টি-শার্ট', 'অতিথি সংখ্যা', 'অতিথি টি-শার্ট', 'সময়'];
    const rows = data.map(item => [
        item.name,
        item.batch,
        item.phone,
        item.email,
        item.tshirtSize,
        item.guestCount,
        `${item.guest1TshirtSize || ''} ${item.guest2TshirtSize || ''}`.trim(),
        formatDate(item.timestamp)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Download CSV file
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load homepage content for editing
function loadHomepageContent() {
    try {
        const content = JSON.parse(localStorage.getItem('homepageContent') || '{}');
        
        // Set event date/time
        const eventDateTime = document.getElementById('eventDateTime');
        if (eventDateTime) {
            eventDateTime.value = content.eventDateTime || 'ডিসেম্বর ৩১, ২০২৪ | বিদ্যালয় প্রাঙ্গণ';
        }
        
        // Set about description
        const aboutDescription = document.getElementById('aboutDescription');
        if (aboutDescription) {
            aboutDescription.value = content.aboutDescription || 'আমাদের প্রিয় বিদ্যালয়ের সোনালী ছাত্রীদের স্মৃতিগুলোকে আবারও সজীব করতে আমরা আয়োজন করছি গ্র্যান্ড রিইউনিয়ন। এই অনুষ্ঠানে আপনাদের সবার উপস্থিতি আমাদের জন্য অত্যন্ত গুরুত্বপূর্ণ।';
        }
        
        // Set social links
        const facebookLink = document.getElementById('facebookLink');
        const twitterLink = document.getElementById('twitterLink');
        const instagramLink = document.getElementById('instagramLink');
        
        if (facebookLink) facebookLink.value = content.socialLinks?.facebook || '';
        if (twitterLink) twitterLink.value = content.socialLinks?.twitter || '';
        if (instagramLink) instagramLink.value = content.socialLinks?.instagram || '';
        
        // Load highlights
        loadHighlights(content.highlights || [
            { icon: 'fas fa-music', title: 'সাংস্কৃতিক অনুষ্ঠান' },
            { icon: 'fas fa-camera', title: 'ফটো সেশন' },
            { icon: 'fas fa-trophy', title: 'পুরস্কার বিতরণ' },
            { icon: 'fas fa-utensils', title: 'গ্র্যান্ড ডিনার' }
        ]);
        
    } catch (error) {
        console.error('Error loading homepage content:', error);
        showNotification('হোম পেজের তথ্য সেভ হয়েছে', 'error');
    }
}

// Create a new highlight element
function createHighlightElement(highlight = {}) {
    const template = document.getElementById('highlightTemplate');
    if (!template) {
        console.error('Highlight template not found');
        return null;
    }

    // Clone the template
    const highlightElement = template.content.cloneNode(true).querySelector('.highlight-item-edit');
    
    // Set values if provided
    if (highlight.icon) {
        highlightElement.querySelector('.icon-select').value = highlight.icon;
    }
    if (highlight.title) {
        highlightElement.querySelector('.highlight-title').value = highlight.title;
    }
    if (highlight.description) {
        highlightElement.querySelector('.highlight-description').value = highlight.description;
    }

    // Add event listener for remove button
    highlightElement.querySelector('.remove-highlight').addEventListener('click', function() {
        highlightElement.remove();
    });

    return highlightElement;
}

// Load highlights into the form
function loadHighlights(highlights = []) {
    const container = document.getElementById('highlightsContainer');
    if (!container) {
        console.error('Highlights container not found');
        return;
    }
    
    // Clear existing highlights
    container.innerHTML = '';
    
    // Add default highlights if none exist
    if (!highlights || highlights.length === 0) {
        highlights = [
            {
                icon: 'fas fa-users',
                title: 'বন্ধু মিলন',
                description: 'পুরনো বন্ধুদের সাথে মিলিত হওয়ার সুবর্ণ সুযোগ'
            },
            {
                icon: 'fas fa-utensils',
                title: 'দাওয়াত',
                description: 'সুস্বাদু খাবার ও আড্ডার আয়োজন'
            },
            {
                icon: 'fas fa-music',
                title: 'সাংস্কৃতিক অনুষ্ঠান',
                description: 'মনোজ্ঞ সাংস্কৃতিক পরিবেশনা'
            }
        ];
    }
    
    // Add each highlight
    highlights.forEach(highlight => {
        const highlightElement = createHighlightElement(highlight);
        if (highlightElement) {
            container.appendChild(highlightElement);
        }
    });
}

// Setup event listeners for homepage editing
function setupHomepageEventListeners() {
    // Add highlight button
    const addHighlightBtn = document.getElementById('addHighlight');
    if (addHighlightBtn) {
        addHighlightBtn.addEventListener('click', function() {
            const container = document.getElementById('highlightsContainer');
            if (container) {
                const highlightElement = createHighlightElement();
                if (highlightElement) {
                    container.appendChild(highlightElement);
                }
            }
        });
    }
    
    // Save homepage button
    const saveHomepageBtn = document.getElementById('saveHomepageBtn');
    if (saveHomepageBtn) {
        saveHomepageBtn.addEventListener('click', saveHomepageContent);
    }
}

// Save homepage content
function saveHomepageContent() {
    try {
        console.log('Starting to save homepage content...'); // Debug line
        
        // Get form values
        const mainTitle = document.getElementById('mainTitleInput').value;
        const subTitle = document.getElementById('subTitleInput').value;
        const aboutDescription = document.getElementById('aboutDescription').value;
        
        // Get highlights
        const highlights = [];
        document.querySelectorAll('.highlight-item-edit').forEach(item => {
            const icon = item.querySelector('.icon-select').value;
            const title = item.querySelector('.highlight-title').value;
            const description = item.querySelector('.highlight-description').value;
            
            if (title.trim()) {
                highlights.push({ icon, title, description: description.trim() });
            }
        });
        console.log('Highlights:', highlights); // Debug line
        
        // Get social links
        const socialLinks = {
            facebook: document.getElementById('facebookLink').value.trim(),
            twitter: document.getElementById('twitterLink').value.trim(),
            instagram: document.getElementById('instagramLink').value.trim()
        };
        
        // Validate required fields
        if (!mainTitle.trim()) {
            showNotification('মূল শিরোনাম প্রয়োজন', 'error');
            return;
        }
        
        if (!subTitle.trim()) {
            showNotification('সাব শিরোনাম প্রয়োজন', 'error');
            return;
        }
        
        if (!aboutDescription.trim()) {
            showNotification('ইভেন্ট সম্পর্কে বিবরণ প্রয়োজন', 'error');
            return;
        }
        
        if (highlights.length === 0) {
            showNotification('কমপক্ষে একটি হাইলাইট প্রয়োজন', 'error');
            return;
        }
        
        // Create content object
        const content = {
            mainTitle,
            subTitle,
            aboutDescription,
            highlights,
            socialLinks
        };
        
        // Save to localStorage
        localStorage.setItem('homepageContent', JSON.stringify(content));
        
        // Update preview if available
        updatePreview(content);
        
        showNotification('হোম পেজের তথ্য সফলভাবে সেভ করা হয়েছে', 'success');
        
    } catch (error) {
        console.error('Error saving homepage content:', error);
        showNotification('হোম পেজের তথ্য সেভ করতে সমস্যা হয়েছে', 'error');
    }
}

// Update preview
function updatePreview(content) {
    try {
        // Dispatch event to current window
        window.dispatchEvent(new CustomEvent('homepageContentUpdated', { 
            detail: content 
        }));
        
        // Update preview iframe if it exists
        const previewIframe = document.querySelector('iframe[name="preview"]');
        if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.location.reload();
            
            // After reload, update the content
            setTimeout(() => {
                previewIframe.contentWindow.dispatchEvent(
                    new CustomEvent('homepageContentUpdated', { 
                        detail: content 
                    })
                );
            }, 1000);
        }
        
        // Force storage event for other tabs
        const tempKey = 'temp_' + Date.now();
        localStorage.setItem(tempKey, 'temp');
        localStorage.removeItem(tempKey);
        
    } catch (error) {
        console.error('Error updating preview:', error);
    }
}

// Load existing data when page loads
function loadExistingData() {
    try {
        console.log('Admin.js: Loading existing data...'); // Debug log
        
        // Load main title and subtitle
        const mainTitleInput = document.getElementById('mainTitleInput');
        const subTitleInput = document.getElementById('subTitleInput');
        
        const savedMainTitle = localStorage.getItem('mainTitle');
        const savedSubTitle = localStorage.getItem('subTitle');
        
        console.log('Admin.js: Saved data:', { savedMainTitle, savedSubTitle }); // Debug log
        
        if (mainTitleInput) {
            mainTitleInput.value = savedMainTitle || 'আমাদের বিদ্যালয় পুনর্মিলনী ২০২৪';
        } else {
            console.error('Admin.js: mainTitleInput element not found!'); // Debug log
        }
        if (subTitleInput) {
            subTitleInput.value = savedSubTitle || 'ডিসেম্বর ৩১, ২০২৪ | বিদ্যালয় প্রাঙ্গণ';
        } else {
            console.error('Admin.js: subTitleInput element not found!'); // Debug log
        }

        // Load about description
        const aboutDescription = document.getElementById('aboutDescriptionInput');
        if (aboutDescription) {
            aboutDescription.value = localStorage.getItem('aboutDescription') || '';
        }

        // Load highlights
        for (let i = 1; i <= 4; i++) {
            const iconInput = document.getElementById(`highlight${i}IconInput`);
            const titleInput = document.getElementById(`highlight${i}TitleInput`);
            
            if (iconInput) {
                iconInput.value = localStorage.getItem(`highlight${i}Icon`) || '';
            }
            if (titleInput) {
                titleInput.value = localStorage.getItem(`highlight${i}Title`) || '';
            }
        }

        // Load social media links
        const facebookLink = document.getElementById('facebookLinkInput');
        const twitterLink = document.getElementById('twitterLinkInput');
        const instagramLink = document.getElementById('instagramLinkInput');

        if (facebookLink) {
            facebookLink.value = localStorage.getItem('facebookLink') || '';
        }
        if (twitterLink) {
            twitterLink.value = localStorage.getItem('twitterLink') || '';
        }
        if (instagramLink) {
            instagramLink.value = localStorage.getItem('instagramLink') || '';
        }
    } catch (error) {
        console.error('Admin.js: Error in loadExistingData:', error);
    }
}

function saveData() {
    try {
        // Save main title and subtitle
        const mainTitleInput = document.getElementById('mainTitleInput');
        const subTitleInput = document.getElementById('subTitleInput');
        
        if (!mainTitleInput || !subTitleInput) {
            return;
        }

        // Save the values to localStorage
        const mainTitle = mainTitleInput.value.trim();
        const subTitle = subTitleInput.value.trim();

        localStorage.setItem('mainTitle', mainTitle);
        localStorage.setItem('subTitle', subTitle);

        // Save about description
        const aboutDescription = document.getElementById('aboutDescriptionInput');
        if (aboutDescription) {
            localStorage.setItem('aboutDescription', aboutDescription.value.trim());
        }

        // Save highlights
        for (let i = 1; i <= 4; i++) {
            const iconInput = document.getElementById(`highlight${i}IconInput`);
            const titleInput = document.getElementById(`highlight${i}TitleInput`);
            
            if (iconInput) {
                localStorage.setItem(`highlight${i}Icon`, iconInput.value.trim());
            }
            if (titleInput) {
                localStorage.setItem(`highlight${i}Title`, titleInput.value.trim());
            }
        }

        // Save social media links
        const facebookLink = document.getElementById('facebookLinkInput');
        const twitterLink = document.getElementById('twitterLinkInput');
        const instagramLink = document.getElementById('instagramLinkInput');

        if (facebookLink) {
            localStorage.setItem('facebookLink', facebookLink.value.trim());
        }
        if (twitterLink) {
            localStorage.setItem('twitterLink', twitterLink.value.trim());
        }
        if (instagramLink) {
            localStorage.setItem('instagramLink', instagramLink.value.trim());
        }

        // Verify the saved data
        const savedMainTitle = localStorage.getItem('mainTitle');
        const savedSubTitle = localStorage.getItem('subTitle');
        
        if (savedMainTitle !== mainTitle || savedSubTitle !== subTitle) {
            return;
        }

        // Try to update the content immediately in this window
        try {
            const mainTitleElement = document.querySelector('iframe[name="mainPage"]').contentWindow.document.getElementById('mainTitle');
            const subTitleElement = document.querySelector('iframe[name="mainPage"]').contentWindow.document.getElementById('subTitle');
            
            if (mainTitleElement) mainTitleElement.textContent = mainTitle;
            if (subTitleElement) subTitleElement.textContent = subTitle;
        } catch (e) {
            console.log('Could not update preview iframe directly:', e);
        }

        // Dispatch events to notify content update
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'mainTitle',
            newValue: mainTitle,
            oldValue: null,
            storageArea: localStorage
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'subTitle',
            newValue: subTitle,
            oldValue: null,
            storageArea: localStorage
        }));

        window.dispatchEvent(new CustomEvent('contentUpdated'));

        // Show confirmation text next to the save button
        const saveButton = document.getElementById('saveHomepageBtn');
        if (saveButton) {
            const confirmText = document.createElement('span');
            confirmText.textContent = 'হোম পেজের তথ্য সফলভাবে সেভ করা হয়েছে!';
            confirmText.className = 'confirm-text';
            confirmText.style.marginLeft = '10px';
            confirmText.style.color = '#4CAF50';
            
            // Remove any existing confirm text
            const existingConfirm = document.querySelector('.confirm-text');
            if (existingConfirm) {
                existingConfirm.remove();
            }
            
            // Add new confirm text after the save button
            saveButton.parentNode.insertBefore(confirmText, saveButton.nextSibling);
            
            // Remove the confirmation text after 3 seconds
            setTimeout(() => {
                confirmText.remove();
            }, 3000);
        }
        
        // Reload the preview iframe
        const previewFrame = document.querySelector('iframe[name="mainPage"]');
        if (previewFrame) {
            previewFrame.src = previewFrame.src;
        }
    } catch (error) {
        // Just log the error to console, don't show any error message to user
        console.error('Error:', error);
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('messageDiv');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
} 