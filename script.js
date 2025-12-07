 class CampaignApp {
        constructor() {
            this.config = {
                // electionDate: new Date('June 30, 2025 00:00:00 GMT+0530').getTime(), 
                // electionVoteStartDate: new Date('2025-06-30T00:00:00'), 
                preloaderTaglines: [
                    "Niraj",  
                    "Data Science Enthusiast", 
                    "Eyes to Analyze",
                    "Passionate about Technology",
                ],
                magneticForce: 0.3,
                particleCount: 80, 
                isMobile: window.innerWidth < 768,
                // New: Slider commitments and settings
                sliderCommitments: [
                    "Empowering Tomorrow with Data",
                    "Innovating with Machine Learning",
                    "Transforming Data into Actionable Insights",
                    "Leading with Data-Driven Solutions",
                    "Crafting Intelligent Systems",
                    "Pioneering Data Science Solutions",
                    "Revolutionizing Technology with Data",
                    "Data Science for a Smarter Future",
                    "Building Tomorrow's Technology Today",
                    "Harnessing ML for Real-World Impact",
                    "Driving Innovation through AI & Analytics",
                    "Converting Complex Data into Simple Solutions"
                ],
                sliderInterval: 3500 // Time in ms for each commitment
            };

            this.state = {
                mouse: { x: 0, y: 0 },
                particles: [],
                cursorRing: null,
                cursorDot: null,
                magneticElements: [],
                scrollElements: [],
                preloaderTaglineInterval: null,
                webgl: {},
                particleCanvas: null,
                ctx: null,
                // New: Slider state
                sliderTextWrapper: null,
                currentCommitmentIndex: 0,
                commitmentSliderIntervalId: null,
                // New: Navigation state
                mainNavbar: null,
                navToggleButton: null,
                navLinkList: null,
                navLinks: [],
                sections: [],
                scrollToTopButton: null
            };

            // Bind methods
            this.animateCursor = this.animateCursor.bind(this);
            this.animateParticles = this.animateParticles.bind(this);
            this.handleScrollReveal = this.handleScrollReveal.bind(this);
            this.initPreloaderTaglineAnimation = this.initPreloaderTaglineAnimation.bind(this);
            this.animateWebGLBackground = this.animateWebGLBackground.bind(this);
            this.updateSlider = this.updateSlider.bind(this); // New
            this.handleScroll = this.handleScroll.bind(this); // New
            this.toggleMobileMenu = this.toggleMobileMenu.bind(this); // New
        }

        init() {
            document.addEventListener('DOMContentLoaded', () => {
                this.initPreloader();
                this.initCountdown();
                this.initScrollReveal();
                this.initWebGLBackground();
                this.initParticleSystem();
                this.initCommitmentsSlider(); // New
                this.initNavigation(); // New
                this.initScrollToTop(); // New
                this.addEventListeners();

                if (!this.config.isMobile) {
                    this.initCursor();
                    this.initMagneticElements();
                }
                this.initPreloaderTaglineAnimation();

                // Initial check for nav scroll and active links
                this.handleScroll(); 
            });
        }

        addEventListeners() {
            window.addEventListener('resize', () => {
                const oldIsMobile = this.config.isMobile;
                this.config.isMobile = window.innerWidth < 768;

                if (oldIsMobile !== this.config.isMobile) {
                    if (!this.config.isMobile) {
                        this.initCursor();
                        this.initMagneticElements();
                    } else {
                        if (this.state.cursorDot) this.state.cursorDot.style.display = 'none';
                        if (this.state.cursorRing) this.state.cursorRing.style.display = 'none';
                        if (this.state.navLinkList && this.state.navLinkList.classList.contains('active')) {
                            this.toggleMobileMenu();
                        }
                    }
                }

                if (this.state.webgl.renderer) {
                    this.state.webgl.renderer.setSize(window.innerWidth, window.innerHeight);
                    this.state.webgl.camera.aspect = window.innerWidth / window.innerHeight;
                    this.state.webgl.camera.updateProjectionMatrix();
                }

                if (this.state.particleCanvas) {
                    this.state.particleCanvas.width = window.innerWidth;
                    this.state.particleCanvas.height = window.innerHeight;
                    this.state.particles = []; 
                    this.createParticles(); 
                }
            });

            window.addEventListener('scroll', this.handleScroll);

            // Mouse tracking for card hover effects
            document.addEventListener('mousemove', (e) => {
                const cards = document.querySelectorAll('.glass-card');
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    card.style.setProperty('--mouse-x', `${x}%`);
                    card.style.setProperty('--mouse-y', `${y}%`);
                });
            });

            // Parallax scroll effect for hero section
            if (!this.config.isMobile) {
                window.addEventListener('scroll', () => {
                    const scrolled = window.pageYOffset;
                    const hero = document.getElementById('hero');
                    if (hero && scrolled < window.innerHeight) {
                        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                        hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
                    }
                });
            }

            const voteBtn = document.getElementById('vote-btn');
            const votePopup = document.getElementById('vote-popup');
            const popupMessageEl = document.getElementById('popup-message');
            const popupCloseBtn = document.getElementById('popup-close-btn');

            if (voteBtn && votePopup && popupMessageEl && popupCloseBtn) {
                const electionRedirectUrl = 'https://elections.iitmbs.org';
                voteBtn.addEventListener('click', () => {
                    const currentDate = new Date();
                    if (currentDate < this.config.electionVoteStartDate) {
                        popupMessageEl.textContent = `Voting starts ${this.config.electionVoteStartDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.`;
                        votePopup.classList.add('show');
                    } else {
                        window.location.href = electionRedirectUrl;
                    }
                });
                popupCloseBtn.addEventListener('click', () => votePopup.classList.remove('show'));
                votePopup.addEventListener('click', (event) => { 
                    if (event.target === votePopup) votePopup.classList.remove('show');
                });
            }
        }
        
        initPreloader() {
            const preloader = document.querySelector('.preloader');
            if(!preloader) return;
            document.body.style.overflow = 'hidden'; 
            setTimeout(() => {
                preloader.classList.add('loaded');
                document.body.style.overflow = ''; 
                if (this.state.preloaderTaglineInterval) {
                    clearInterval(this.state.preloaderTaglineInterval);
                }
            }, 3800); 
        }

        initPreloaderTaglineAnimation() {
            const taglineElement = document.getElementById('preloader-animated-tagline');
            if (!taglineElement) return;
            const taglines = this.config.preloaderTaglines;
            let currentIndex = 0;
            taglineElement.textContent = taglines[currentIndex];
            taglineElement.style.opacity = 1;
            this.state.preloaderTaglineInterval = setInterval(() => {
                taglineElement.style.opacity = 0;
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % taglines.length;
                    taglineElement.textContent = taglines[currentIndex];
                    taglineElement.style.opacity = 1;
                }, 400); 
            }, 2000); 
        }

        initCursor() {
            this.state.cursorDot = document.getElementById('cursor-dot');
            this.state.cursorRing = document.getElementById('cursor-ring');
            if(!this.state.cursorDot || !this.state.cursorRing) return;
            
            this.state.cursorDot.style.display = 'block';
            this.state.cursorRing.style.display = 'block';

            window.addEventListener('mousemove', e => {
                this.state.mouse.x = e.clientX;
                this.state.mouse.y = e.clientY;
            });

            const hoverables = document.querySelectorAll('a, button, .magnetic-wrap, .tab-btn, .glass-card, summary, .faq-item summary, .cta-btn, .scroll-to-top');
            hoverables.forEach(el => {
                el.addEventListener('mouseenter', () => this.state.cursorRing.classList.add('cursor-ring-hover'));
                el.addEventListener('mouseleave', () => this.state.cursorRing.classList.remove('cursor-ring-hover'));
            });
            requestAnimationFrame(this.animateCursor);
        }

        animateCursor() {
            if (this.config.isMobile || !this.state.cursorDot || !this.state.cursorRing) return;
            this.state.cursorDot.style.transform = `translate3d(${this.state.mouse.x - 3}px, ${this.state.mouse.y - 3}px, 0)`;
            this.state.cursorRing.style.transform = `translate3d(${this.state.mouse.x - 16}px, ${this.state.mouse.y - 16}px, 0)`;
            requestAnimationFrame(this.animateCursor);
        }

        initMagneticElements() {
            if (this.config.isMobile) return;
            this.state.magneticElements = document.querySelectorAll('.magnetic-wrap');
            this.state.magneticElements.forEach(el => {
                el.addEventListener('mousemove', e => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    el.style.transform = `translate(${x * this.config.magneticForce}px, ${y * this.config.magneticForce}px)`;
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'translate(0, 0)';
                });
            });
        }
                
        initScrollReveal() {
            this.state.scrollElements = document.querySelectorAll('.scroll-reveal');
            if (this.state.scrollElements.length === 0) return;
            const observerOptions = {
                root: null,
                threshold: this.config.isMobile ? 0.05 : 0.1, 
                rootMargin: this.config.isMobile ? '0px 0px -20px 0px' : '0px 0px -40px 0px'
            };
            const observer = new IntersectionObserver(this.handleScrollReveal, observerOptions);
            this.state.scrollElements.forEach(el => observer.observe(el));

            // Stagger animation for grid children
            this.state.scrollElements.forEach(section => {
                const cards = section.querySelectorAll('.glass-card, .skill-card, .project-card, .value-card, .achievement-card');
                cards.forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.1}s`;
                });
            });
        }

        handleScrollReveal(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Animate skill bars when visible
                    const skillBars = entry.target.querySelectorAll('.skill-progress');
                    skillBars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.animation = 'fill-bar 1.5s ease-out forwards';
                        }, index * 100);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }
        
        initCountdown() {
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const statusEl = document.getElementById('countdown-status-text');
            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

            const countdownInterval = setInterval(() => {
                const now = new Date().getTime();
                const distance = this.config.electionDate - now;
                if (distance < 0) {
                    clearInterval(countdownInterval);
                    daysEl.textContent = '00'; hoursEl.textContent = '00';
                    minutesEl.textContent = '00'; secondsEl.textContent = '00';
                    if (statusEl) statusEl.innerHTML = "The election period has begun! <strong class='text-accent-emerald'>Cast your vote!</strong>";
                    return;
                }
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                daysEl.textContent = String(days).padStart(2, '0');
                hoursEl.textContent = String(hours).padStart(2, '0');
                minutesEl.textContent = String(minutes).padStart(2, '0');
                secondsEl.textContent = String(seconds).padStart(2, '0');
            }, 1000);
        }
        
        initWebGLBackground() {
            const canvas = document.getElementById('webgl-canvas');
            if(!canvas || typeof THREE === 'undefined') return; 
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !this.config.isMobile });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            const geometry = new THREE.PlaneGeometry(20, 20, (this.config.isMobile ? 25 : 50), (this.config.isMobile ? 25 : 50)); 
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uColor1: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-cyan')) },
                    uColor2: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-violet')) }
                },
                vertexShader: `
                    uniform float uTime; varying vec2 vUv;
                    void main() {
                        vUv = uv; vec3 pos = position;
                        float waveX = sin(pos.x * 1.0 + uTime * 0.3) * 0.2;
                        float waveY = cos(pos.y * 1.5 + uTime * 0.2) * 0.2;
                        pos.z += waveX + waveY;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }`,
                fragmentShader: `
                    uniform float uTime; uniform vec3 uColor1; uniform vec3 uColor2; varying vec2 vUv;
                    void main() {
                        float Hgrid = step(0.985, fract(vUv.x * (sin(uTime * 0.05) * 3.0 + 10.0) ));
                        float Vgrid = step(0.985, fract(vUv.y * (cos(uTime * 0.05) * 3.0 + 10.0) ));
                        float grid = max(Hgrid, Vgrid);
                        vec3 mixedColor = mix(uColor1, uColor2, smoothstep(0.0, 1.0, sin(uTime * 0.1 + vUv.x * 3.14)));
                        float alpha = (1.0 - length(vUv - 0.5) * 1.8) * 0.25; 
                        gl_FragColor = vec4(mixedColor, grid * alpha);
                    }`,
                transparent: true, wireframe: false, 
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2.3; 
            scene.add(mesh);
            camera.position.set(0, 1.5, 3.0); 
            this.state.webgl = { renderer, scene, camera, material, mesh };
            this.animateWebGLBackground();
        }

        animateWebGLBackground() {
            if (!this.state.webgl.material) return;
            this.state.webgl.material.uniforms.uTime.value += 0.015;
            this.state.webgl.renderer.render(this.state.webgl.scene, this.state.webgl.camera);
            requestAnimationFrame(this.animateWebGLBackground);
        }

        createParticles() {
            if (!this.state.ctx) return;
            const numParticles = this.config.isMobile ? this.config.particleCount / 3 : this.config.particleCount; 
            const colors = [getComputedStyle(document.documentElement).getPropertyValue('--accent-cyan'), 
                            getComputedStyle(document.documentElement).getPropertyValue('--accent-violet'),
                            getComputedStyle(document.documentElement).getPropertyValue('--accent-fuchsia')];
            for (let i = 0; i < numParticles; i++) {
                let size = (Math.random() * 1.5) + 0.5; 
                let x = Math.random() * this.state.particleCanvas.width;
                let y = Math.random() * this.state.particleCanvas.height;
                let opacity = Math.random() * 0.4 + 0.1; 
                let colorBase = colors[Math.floor(Math.random() * colors.length)];
                let r = parseInt(colorBase.slice(1,3), 16);
                let g = parseInt(colorBase.slice(3,5), 16);
                let b = parseInt(colorBase.slice(5,7), 16);
                let color = `rgba(${r}, ${g}, ${b}, ${opacity})`; 
                this.state.particles.push(new Particle(x, y, size, color, this.state.ctx));
            }
        }

        initParticleSystem() {
            this.state.particleCanvas = document.getElementById('particle-canvas');
            if (!this.state.particleCanvas) return;
            this.state.ctx = this.state.particleCanvas.getContext('2d');
            this.state.particleCanvas.width = window.innerWidth;
            this.state.particleCanvas.height = window.innerHeight;
            this.createParticles(); 
            if(!this.config.isMobile || (this.config.isMobile && this.config.particleCount > 0)) {
               requestAnimationFrame(this.animateParticles);
            }
        }

        animateParticles() {
            if(!this.state.ctx) return; 
            this.state.ctx.clearRect(0, 0, this.state.particleCanvas.width, this.state.particleCanvas.height);
            for (let i = 0; i < this.state.particles.length; i++) {
                this.state.particles[i].update(this.state.mouse, this.state.particleCanvas.width, this.state.particleCanvas.height, this.config.isMobile);
                this.state.particles[i].draw();
            }
            if (!this.config.isMobile || (this.config.isMobile && this.config.particleCount > 0 && Math.random() < 0.1) ) { 
               requestAnimationFrame(this.animateParticles);
            }
        }

        // --- New Methods for Slider, Navigation, ScrollToTop ---

        initCommitmentsSlider() {
            this.state.sliderTextWrapper = document.getElementById('slider-text-wrapper');
            if (!this.state.sliderTextWrapper || this.config.sliderCommitments.length === 0) return;

            this.config.sliderCommitments.forEach((commitment, index) => {
                const p = document.createElement('p');
                p.classList.add('slider-commitment');
                p.textContent = commitment;
                if (index === 0) p.classList.add('active');
                this.state.sliderTextWrapper.appendChild(p);
            });

            this.state.commitmentSliderIntervalId = setInterval(this.updateSlider, this.config.sliderInterval);
        }

        updateSlider() {
            const commitments = this.state.sliderTextWrapper.children;
            if (commitments.length === 0) return;

            commitments[this.state.currentCommitmentIndex].classList.remove('active');
            this.state.currentCommitmentIndex = (this.state.currentCommitmentIndex + 1) % commitments.length;
            commitments[this.state.currentCommitmentIndex].classList.add('active');
        }

        initNavigation() {
            this.state.mainNavbar = document.getElementById('main-navbar');
            this.state.navToggleButton = document.getElementById('nav-toggle-button');
            this.state.navLinkList = document.getElementById('nav-link-list');
            this.state.navLinks = Array.from(this.state.navLinkList.querySelectorAll('a[href^="#"]'));
            
            this.state.sections = this.state.navLinks.map(link => {
                const id = link.getAttribute('href').substring(1);
                return document.getElementById(id);
            }).filter(section => section !== null);


            if (this.state.navToggleButton) {
                this.state.navToggleButton.addEventListener('click', this.toggleMobileMenu);
            }
            
            // Close mobile menu when a link is clicked
            this.state.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.state.navLinkList.classList.contains('active')) {
                        this.toggleMobileMenu();
                    }
                });
            });
        }
        
        toggleMobileMenu() {
            this.state.navLinkList.classList.toggle('active');
            this.state.navToggleButton.classList.toggle('active');
            const isExpanded = this.state.navLinkList.classList.contains('active');
            this.state.navToggleButton.setAttribute('aria-expanded', isExpanded.toString());
            document.body.style.overflow = isExpanded && this.config.isMobile ? 'hidden' : '';
        }

        handleScroll() {
            // Navbar style on scroll
            if (this.state.mainNavbar) {
                if (window.scrollY > 50) {
                    this.state.mainNavbar.classList.add('scrolled');
                } else {
                    this.state.mainNavbar.classList.remove('scrolled');
                }
            }

            // Scroll to top button visibility
            if (this.state.scrollToTopButton) {
                if (window.scrollY > 300) {
                    this.state.scrollToTopButton.classList.add('visible');
                } else {
                    this.state.scrollToTopButton.classList.remove('visible');
                }
            }

            // Active nav link highlighting
            let currentSectionId = '';
            const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 70;

            this.state.sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight - 50; // Adjusted offset
                if (window.scrollY >= sectionTop) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            this.state.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
        
        initScrollToTop() {
            this.state.scrollToTopButton = document.getElementById('scroll-to-top-button');
            // Event listener for click is handled by the <a> tag's href="#hero"
        }

    } // End of CampaignApp class

    class Particle { 
        constructor(x, y, size, color, ctx) {
            this.x = x; this.y = y; this.size = size; this.color = color; this.ctx = ctx;
            this.baseX = this.x; this.baseY = this.y;
            this.density = (Math.random() * 25) + 10; 
            this.vx = (Math.random() - 0.5) * 0.15; 
            this.vy = (Math.random() - 0.5) * 0.15;
            this.maxDistMouse = 100; 
        }
        draw() {
            this.ctx.fillStyle = this.color; this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            this.ctx.closePath(); this.ctx.fill();
        }
        update(mouse, canvasWidth, canvasHeight, isMobile) {
            if (!isMobile) { 
                let dxMouse = mouse.x - this.x; let dyMouse = mouse.y - this.y;
                let distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distanceMouse < this.maxDistMouse) {
                    let forceDirectionX = dxMouse / distanceMouse; let forceDirectionY = dyMouse / distanceMouse;
                    let force = (this.maxDistMouse - distanceMouse) / this.maxDistMouse;
                    let directionX = forceDirectionX * force * this.density * 0.05; 
                    let directionY = forceDirectionY * force * this.density * 0.05;
                    this.x -= directionX; this.y -= directionY;
                } else { this.returnToBase(); }
            } else { this.returnToBase(); }
            if (this.x > canvasWidth + this.size * 2) { this.x = -this.size * 2; this.baseX = this.x; }
            if (this.x < -this.size * 2) { this.x = canvasWidth + this.size * 2; this.baseX = this.x; }
            if (this.y > canvasHeight + this.size * 2) { this.y = -this.size * 2; this.baseY = this.y; }
            if (this.y < -this.size * 2) { this.y = canvasHeight + this.size * 2; this.baseY = this.y; }
        }
        returnToBase() {
            if (this.x !== this.baseX) { this.x -= (this.x - this.baseX) / 20; }
            if (this.y !== this.baseY) { this.y -= (this.y - this.baseY) / 20; }
            this.x += this.vx; this.y += this.vy;
            this.baseX += this.vx * 0.1; this.baseY += this.vy * 0.1;
        }
    }

    const app = new CampaignApp();
    app.init();