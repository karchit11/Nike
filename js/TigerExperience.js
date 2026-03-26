/**
 * TigerExperience - Dual-Canvas Frame Sequence Renderer
 * Handles preloading, drawing, and scroll-scrubbing of the cheetah animation
 */
class TigerExperience {
    constructor(options = {}) {
        this.heroSection = document.getElementById('hero');
        this.tigerCanvas = document.getElementById('tiger-canvas');
        this.ambientCanvas = document.getElementById('ambient-canvas');
        this.ctxTiger = this.tigerCanvas.getContext('2d');
        this.ctxAmbient = this.ambientCanvas.getContext('2d');

        // Config
        this.frameCount = options.frameCount || 242;
        this.basePath = options.basePath || 'assets/frames/ezgif-frame-';
        this.images = [];
        this.currentFrame = { value: 0 };
        this.renderedFrame = 0;
        this.lastDrawnFrame = -1;

        // Preloader elements
        this.preloader = document.getElementById('preloader');
        this.preloaderBar = document.getElementById('preloader-bar');
        this.preloaderCount = document.getElementById('preloader-count');

        // Sizing
        this._resizeHandler = this._debounce(this._onResize.bind(this), 200);
        window.addEventListener('resize', this._resizeHandler);

        // Boot
        this._preload();
    }

    /**
     * Preload all frame images with progress tracking
     */
    _preload() {
        let loaded = 0;

        for (let i = 1; i <= this.frameCount; i++) {
            const img = new Image();
            const padded = String(i).padStart(3, '0');
            img.src = `${this.basePath}${padded}.jpg`;
            this.images.push(img);

            const onComplete = () => {
                loaded++;
                const pct = Math.round((loaded / this.frameCount) * 100);

                // Update preloader UI
                if (this.preloaderBar) this.preloaderBar.style.width = `${pct}%`;
                if (this.preloaderCount) this.preloaderCount.textContent = `${pct}%`;

                // Draw first frame as soon as it loads
                if (i === 1 && img.complete && img.naturalWidth > 0) {
                    this._sizeCanvases(img);
                    this._drawFrame(0);
                }

                // All loaded
                if (loaded === this.frameCount) {
                    this._onAllLoaded();
                }
            };

            img.onload = onComplete;
            img.onerror = onComplete;
        }
    }

    /**
     * Called when all frames finish loading
     */
    _onAllLoaded() {
        // Hide preloader
        if (this.preloader) {
            setTimeout(() => {
                this.preloader.classList.add('hidden');
            }, 600);
        }

        // Initialize scroll scrubbing
        this._initScrollScrub();
    }

    /**
     * Set canvas internal resolution to match the first image
     */
    _sizeCanvases(img) {
        if (!img || !img.naturalWidth) return;
        this.tigerCanvas.width = img.naturalWidth;
        this.tigerCanvas.height = img.naturalHeight;
        this.ambientCanvas.width = img.naturalWidth;
        this.ambientCanvas.height = img.naturalHeight;
    }

    /**
     * Draw a specific frame index onto both canvases
     */
    _drawFrame(index) {
        index = Math.max(0, Math.min(this.frameCount - 1, Math.floor(index)));
        if (index === this.lastDrawnFrame) return;

        const img = this.images[index];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        // Ensure canvas resolution matches
        if (this.tigerCanvas.width !== img.naturalWidth) {
            this._sizeCanvases(img);
        }

        const w = img.naturalWidth;
        const h = img.naturalHeight;

        // Foreground: sharp frame
        this.ctxTiger.clearRect(0, 0, w, h);
        this.ctxTiger.drawImage(img, 0, 0, w, h);

        // Ambient: same frame (CSS handles blur + scale)
        this.ctxAmbient.clearRect(0, 0, w, h);
        this.ctxAmbient.drawImage(img, 0, 0, w, h);

        this.lastDrawnFrame = index;
    }

    /**
     * Connect GSAP ScrollTrigger to frame scrubbing
     */
    _initScrollScrub() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('[TigerExperience] GSAP/ScrollTrigger not found.');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        gsap.to(this.currentFrame, {
            value: this.frameCount - 1,
            snap: 'value',
            ease: 'none',
            scrollTrigger: {
                trigger: this.heroSection,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.0,
            },
            onUpdate: () => {
                requestAnimationFrame(() => {
                    this._drawFrame(Math.floor(this.currentFrame.value));
                });
            }
        });

        // Fade out the scroll cue when user starts scrolling
        const scrollCue = document.getElementById('scroll-cue');
        if (scrollCue) {
            gsap.to(scrollCue, {
                opacity: 0,
                scrollTrigger: {
                    trigger: this.heroSection,
                    start: 'top top',
                    end: '+=300',
                    scrub: true,
                }
            });
        }

        // Hero title parallax
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            gsap.to(heroTitle, {
                y: -200,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: this.heroSection,
                    start: 'top top',
                    end: '+=2000',
                    scrub: 1.5,
                }
            });
        }
    }

    /**
     * Handle viewport resize
     */
    _onResize() {
        const currentIdx = Math.floor(this.currentFrame.value);
        const img = this.images[currentIdx];
        if (img && img.complete && img.naturalWidth > 0) {
            this.lastDrawnFrame = -1; // Force redraw
            this._drawFrame(currentIdx);
        }
        ScrollTrigger.refresh();
    }

    /**
     * Simple debounce utility
     */
    _debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
    }
}
