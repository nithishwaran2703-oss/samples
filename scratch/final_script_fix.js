                
                setTimeout(() => {
                    window.dispatchEvent(new Event('scroll'));
                }, 100);
            };
        });
    };

    // 13. Global listener for 'Contact for Purchase' buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-primary');
        if (btn && btn.innerText.includes('Contact for Purchase')) {
            const productName = btn.closest('.product-info')?.querySelector('h3')?.innerText || 'Product';
            const whatsappUrl = `https://wa.me/919788742627?text=${encodeURIComponent('Hello, I am interested in purchasing: ' + productName)}`;
            window.open(whatsappUrl, '_blank');
        }
    });

    // Initial call to set up filters for static items
    updateFilterListeners();
    fetchDynamicProducts();
});
