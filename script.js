document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.getElementById('gallery');
    const loadingElement = document.getElementById('loading');
    const loadedCountElement = document.getElementById('loaded-count');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const layoutSelect = document.getElementById('layout-select');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeModal = document.getElementById('close-modal');
    
    const totalImages = 147;
    const batchSize = 24;
    let allImages = [];
    let loadedImages = 0;
    let isLoading = false;
    let currentBatch = 0;
    
    // Generate image data
    function generateImageData() {
        const images = [];
        for (let i = 1; i <= totalImages; i++) {
            images.push({
                id: i,
                url: `images/zeus (${i}).jpg`,
                alt: `Zuez image ${i}`,
                title: `Zuez Image #${i}`,
                description: `Explicit designs of Zuez ${i}`
            });
        }
        return images;
    }
    
    // Load images in batches
    async function loadNextBatch() {
        if (isLoading || loadedImages >= totalImages) return;
        
        isLoading = true;
        loadingElement.style.display = 'flex';
        
        const startIdx = currentBatch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, totalImages);
        const batch = allImages.slice(startIdx, endIdx);
        
        try {
            const fragment = document.createDocumentFragment();
            
            for (const imgData of batch) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'img-container';
                
                const img = document.createElement('img');
                img.src = imgData.url;
                img.alt = imgData.alt;
                img.loading = 'lazy';
                img.dataset.id = imgData.id;
                img.dataset.title = imgData.title;
                img.dataset.description = imgData.description;
                
                if (layoutSelect.value === 'masonry') {
                    img.style.aspectRatio = 'auto';
                } else {
                    img.style.objectFit = 'contain';
                }
                
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                
                img.onload = () => {
                    loadedImages++;
                    loadedCountElement.textContent = loadedImages;
                    img.style.opacity = '1';
                    
                    if (loadedImages === totalImages) {
                        loadingElement.style.display = 'none';
                    }
                };
                
                img.onerror = () => {
                    console.error(`Failed to load image: ${imgData.url}`);
                    loadedImages++;
                    loadedCountElement.textContent = loadedImages;
                    img.style.opacity = '1';
                    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23222"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%23fff" text-anchor="middle" dominant-baseline="middle">Image missing</text></svg>';
                };
                
                imgContainer.appendChild(img);
                fragment.appendChild(imgContainer);
            }
            
            gallery.appendChild(fragment);
            currentBatch++;
            
            // Load next batch if we're near the bottom
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                setTimeout(loadNextBatch, 300);
            }
        } catch (error) {
            console.error('Error loading batch:', error);
        } finally {
            isLoading = false;
        }
    }
    
    // Shuffle images
    async function shuffleImages() {
        gallery.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 300));
        
        gallery.innerHTML = '';
        loadedImages = 0;
        currentBatch = 0;
        loadedCountElement.textContent = '0';
        
        // Fisher-Yates shuffle
        for (let i = allImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
        }
        
        gallery.style.opacity = '1';
        loadNextBatch();
    }
    
    // Change layout
    function changeLayout() {
        const isMasonry = layoutSelect.value === 'masonry';
        gallery.classList.toggle('masonry', isMasonry);
        gallery.classList.toggle('grid', !isMasonry);
        
        document.querySelectorAll('.gallery img').forEach(img => {
            img.style.objectFit = isMasonry ? 'cover' : 'contain';
            img.style.aspectRatio = isMasonry ? 'auto' : 'initial';
        });
    }
    
    // Modal functions
    function openModal(imgElement) {
        modal.classList.add('show');
        modalImg.src = imgElement.src;
        modalCaption.textContent = imgElement.dataset.title || imgElement.alt;
        document.body.style.overflow = 'hidden';
    }
    
    function closeModalHandler() {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    // Event listeners
    shuffleBtn.addEventListener('click', shuffleImages);
    layoutSelect.addEventListener('change', changeLayout);
    closeModal.addEventListener('click', closeModalHandler);
    modal.addEventListener('click', (e) => e.target === modal && closeModalHandler());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && modal.classList.contains('show') && closeModalHandler());
    
    gallery.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            openModal(e.target);
        }
    });
    
    // Scroll handling with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                loadNextBatch();
            }
        }, 100);
    });
    
    // Initialize
    allImages = generateImageData();
    loadNextBatch();
});