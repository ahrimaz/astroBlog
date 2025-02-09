class Lightbox {
    constructor() {
        // Add console log to verify initialization
        console.log('Lightbox initialized');
        this.images = [
            { element: document.getElementById('mainImage') },
            ...Array.from(document.querySelectorAll('.preview-thumb img')).map(img => ({ element: img }))
        ];
        this.currentIndex = 0;
        // Add spinner property
        this.spinner = null;
    }

    start(imageElement) {
        // Clear any existing lightbox first
        const existingLightbox = document.querySelector('.lightbox-overlay');
        if (existingLightbox) {
            document.body.removeChild(existingLightbox);
        }

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'lightbox-overlay fixed inset-0 z-[999] flex items-center justify-center';
        this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';

        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'relative max-w-[80vw] max-h-[80vh]';

        // Create close button with semi-transparent background and no border
        const closeButton = document.createElement('button');
        closeButton.className = 'absolute -top-12 right-0 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors z-[1002]';
        closeButton.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>`;

        // Create image
        this.displayImage = document.createElement('img');
        this.displayImage.className = 'max-w-full max-h-full object-contain';
        
        // Add click handlers
        closeButton.onclick = (e) => {
            e.stopPropagation();
            this.overlay.remove();
        };

        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) {
                this.overlay.remove();
            }
        };

        // Assemble the lightbox
        mainContainer.appendChild(closeButton);
        mainContainer.appendChild(this.displayImage);
        this.overlay.appendChild(mainContainer);
        document.body.appendChild(this.overlay);

        // Load the image
        this.currentIndex = this.findImageIndex(imageElement);
        this.loadImage(this.images[this.currentIndex].element.getAttribute('data-full'));
    }

    loadImage(src) {
        if (!src) return;
        
        // Show spinner
        if (this.spinner) {
            this.spinner.style.display = 'flex';
        }
        
        // Hide current image while loading
        this.displayImage.style.display = 'none';
        
        // Load new image
        this.displayImage.onload = () => {
            // Hide spinner
            if (this.spinner) {
                this.spinner.style.display = 'none';
            }
            // Show image
            this.displayImage.style.display = 'block';
            this.updateCounter();
        };
        
        this.displayImage.src = src;
    }

    navigate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
        this.loadImage(this.images[this.currentIndex].element.getAttribute('data-full'));
    }

    updateCounter() {
        if (this.images[this.currentIndex].isCover) {
            this.counter.style.display = 'none';
        } else {
            const total = this.images.filter(img => !img.isCover).length;
            const current = this.images.filter((img, idx) => !img.isCover && idx <= this.currentIndex).length;
            this.counter.style.display = 'block';
            this.counter.textContent = `${current} / ${total}`;
        }
    }

    setupEventListeners() {
        // Close on background click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Prevent clicks inside the main container from closing the lightbox
        this.overlay.querySelector('.relative.z-[1000]').addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Touch swipe navigation
        let touchStartX = 0;
        this.overlay.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        this.overlay.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                this.navigate(diff > 0 ? 1 : -1);
            }
        });
    }

    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.navigate(-1);
                break;
            case 'ArrowRight':
                this.navigate(1);
                break;
            case 'Escape':
                this.close();
                break;
        }
    }

    findImageIndex(imageElement) {
        return this.images.findIndex(img => 
            img.element.getAttribute('data-full') === imageElement.getAttribute('data-full')
        );
    }

    showPrevious() {
        this.navigate(-1);
    }

    showNext() {
        this.navigate(1);
    }
}

// Initialize lightbox and event listeners - modified to prevent double initialization
document.addEventListener('DOMContentLoaded', function() {
    // Create a single lightbox instance
    const lightbox = new Lightbox();
    
    // Remove any existing event listeners first
    const mainImage = document.getElementById('mainImage');
    const previewThumbs = document.querySelectorAll('.preview-thumb img');
    
    // Clean up old listeners if they exist
    const oldClone = mainImage.cloneNode(true);
    mainImage.parentNode.replaceChild(oldClone, mainImage);
    
    // Add listener to main image
    oldClone.addEventListener('click', function() {
        lightbox.start(this);
    });

    // Clean up and re-add listeners to previews
    previewThumbs.forEach(thumb => {
        const newThumb = thumb.cloneNode(true);
        thumb.parentNode.replaceChild(newThumb, thumb);
        newThumb.addEventListener('click', function() {
            lightbox.start(this);
        });
    });
}); 