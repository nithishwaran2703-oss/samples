// 12. Dynamic Product Fetching from Supabase
const fetchDynamicProducts = async () => {
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid) return;

    const SUPABASE_URL = 'https://ekolvgrvqgpvedmoyzbb.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2x2Z3J2cWdwdmVkbW95emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDE1NzEsImV4cCI6MjA5MzUxNzU3MX0.3OEV5MOyWXHY4smVxkp3RngKBlQ9KkJ-N_j2K_vY_BA';

    // Add a simple loading state
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'dynamic-loading';
    loadingMsg.className = 'text-center py-10 w-full';
    loadingMsg.innerHTML = '<p style="color: var(--primary-maroon); font-size: 1.2rem; font-weight: 500;">✨ Loading our exclusive collection...</p>';
    grid.appendChild(loadingMsg);

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const products = await response.json();

        if (document.getElementById('dynamic-loading')) {
            document.getElementById('dynamic-loading').remove();
        }

        if (products && products.length > 0) {
            // Get the currently active filter
            const activeBtn = document.querySelector('.filter-btn.active');
            const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card dynamic-card reveal-on-scroll visible';
                card.setAttribute('data-category', product.category);

                // Check if this card matches the active filter
                if (activeFilter !== 'all' && product.category !== activeFilter) {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                } else {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                }

                card.innerHTML = `
                        <div class="product-img">
                            <img loading="lazy" decoding="async" src="${product.image_url}" alt="${product.name}" width="400" height="400" style="object-fit: cover; opacity: 1;">
                        </div>
                        <div class="product-info">
                            <div class="product-rating">⭐ 5.0</div>
                            <h3 class="font-serif">${product.name}</h3>
                            <p>${product.description}</p>
                            <button class="btn-primary w-full magnetic" data-strength="20">Contact for Purchase</button>
                        </div>
                    `;
                grid.appendChild(card);
            });

            // Update filter buttons to recognize new cards
            updateFilterListeners();

            // Refresh layout
            window.dispatchEvent(new Event('scroll'));
        } else {
            const noProductsMsg = document.createElement('div');
            noProductsMsg.className = 'text-center py-10 w-full';
            noProductsMsg.innerHTML = '<p style="color: var(--text-light);">No dynamic products found. Add some in the Admin Panel!</p>';
            grid.appendChild(noProductsMsg);
        }
    } catch (error) {
        console.error('Error fetching dynamic products:', error);
        if (document.getElementById('dynamic-loading')) {
            document.getElementById('dynamic-loading').innerHTML = '<p style="color: #ff4d4d;">Failed to connect to the collection. Please refresh the page.</p>';
        }
    }
};
