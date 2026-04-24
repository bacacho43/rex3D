document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const loadingLine = document.getElementById('loadingLine');
    const header = document.getElementById('main-header');
    const heroTitle = document.querySelector('.hero-title');
    const revealElements = document.querySelectorAll('.reveal');
    const modal = document.getElementById('modal-cotizacion');
    const modalBackdrop = document.querySelector('.quote-modal-backdrop');
    const closeButton = document.querySelector('.modal-close');
    const headerCotizar = document.getElementById('cotizar-btn');
    const stickyQuoteBtn = document.getElementById('stickyQuoteBtn');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const steps = Array.from(document.querySelectorAll('.modal-step'));
    const selectBase = document.getElementById('acabadoSelect');
    const selectEffect = document.querySelector('[name="acabadoEspecial"]');
    const estimateResult = document.getElementById('estimateResult');
    const whatsappButton = document.getElementById('whatsappContactBtn');
    const inputAlto = document.querySelector('[name="alto"]');
    const inputAncho = document.querySelector('[name="ancho"]');
    const inputProfundidad = document.querySelector('[name="profundidad"]');
    const textareaSpecs = document.querySelector('[name="especificaciones"]');
    const detailOverlay = document.getElementById('detailOverlay');
    const detailButtons = document.querySelectorAll('.detail-card');
    const detailPanels = document.querySelectorAll('.detail-panel');
    const detailClose = document.querySelector('.detail-close');
    let currentStep = 0;
    let ticking = false;

    const finishLoading = () => {
        body.classList.add('loaded');
        setTimeout(() => {
            body.classList.add('loading-done');
            loadingLine.style.opacity = '0';
        }, 300);
    };

    requestAnimationFrame(() => {
        loadingLine.style.width = '100%';
        setTimeout(finishLoading, 1200);
    });

    const updateHeader = () => {
        if (window.scrollY > 20) {
            header.classList.add('scroll-active');
        } else {
            header.classList.remove('scroll-active');
        }
    };

    const updateParallax = () => {
        if (heroTitle) {
            const offset = window.scrollY * 0.18;
            heroTitle.style.transform = `translateY(${offset * -1}px)`;
        }
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeader();
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader();

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    revealElements.forEach((element) => revealObserver.observe(element));

    const setStep = (index) => {
        currentStep = Math.max(0, Math.min(index, steps.length - 1));
        steps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep);
        });
    };

    const openModal = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
        setStep(0);
        estimateResult.style.display = 'none';
        whatsappButton.style.display = 'none';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        body.style.overflow = 'auto';
    };

    const getBaseMultiplier = (base) => {
        const map = {
            'Filamento Directo': 1.0,
            'Acabado Plus': 1.3,
            'Primer Rellenador': 1.2,
        };
        return map[base] || 1.0;
    };

    const getEffectMultiplier = (effect) => {
        const map = {
            'Mate': 1.0,
            'Hidrocromo': 3.0,
            'MC00': 2.8,
            'Tornasol': 2.6,
        };
        return map[effect] || 1.0;
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    };

    const calculateQuote = () => {
        const alto = parseFloat(inputAlto.value) || 0;
        const ancho = parseFloat(inputAncho.value) || 0;
        const profundidad = parseFloat(inputProfundidad.value) || 0;
        const tipoBase = selectBase.value;
        const efecto = selectEffect.value;
        const notas = textareaSpecs.value.trim();

        if (!alto || !ancho || !profundidad) {
            estimateResult.innerHTML = '<p>Para obtener el estimado, ingresa Alto, Ancho y Profundidad.</p>';
            estimateResult.style.display = 'block';
            whatsappButton.style.display = 'none';
            return;
        }

        const volumen = alto * ancho * profundidad;
        const baseRate = 4.2;
        const total = volumen * baseRate * getBaseMultiplier(tipoBase) * getEffectMultiplier(efecto);
        const minimo = Math.round(total * 0.92);
        const maximo = Math.round(total * 1.18);
        const rango = `${formatCurrency(minimo)} - ${formatCurrency(maximo)}`;

        estimateResult.innerHTML = `
            <p>Estimado: <strong>${rango}</strong></p>
            <p>El precio final se ajusta según el modelo 3D y la complejidad del acabado.</p>
        `;
        estimateResult.style.display = 'block';
        whatsappButton.style.display = 'inline-flex';

        const medidas = `${alto} x ${ancho} x ${profundidad}`;
        const mensaje = `Hola REX 3D STUDIO, coticé en la web. Pieza de ${medidas} cm, Acabado: ${tipoBase}, Efecto: ${efecto}. Estimado: ${rango}. Notas: ${notas || 'Sin especificaciones adicionales.'}`;
        whatsappButton.href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    };

    [headerCotizar, stickyQuoteBtn].forEach((button) => {
        button.addEventListener('click', openModal);
    });

    modalBackdrop.addEventListener('click', closeModal);
    closeButton.addEventListener('click', closeModal);

    detailButtons.forEach((button) => {
        button.addEventListener('click', () => openDetailPanel(button.dataset.panel));
    });

    detailClose.addEventListener('click', closeDetailOverlay);
    detailOverlay.addEventListener('click', (event) => {
        if (event.target === detailOverlay) {
            closeDetailOverlay();
        }
    });

    nextButtons.forEach((button) => {
        button.addEventListener('click', () => setStep(currentStep + 1));
    });

    prevButtons.forEach((button) => {
        button.addEventListener('click', () => setStep(currentStep - 1));
    });

    document.querySelector('.quote-action').addEventListener('click', calculateQuote);

    const openDetailPanel = (panelName) => {
        detailOverlay.classList.add('active');
        detailOverlay.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
        detailPanels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.panel === panelName);
        });
    };

    const closeDetailOverlay = () => {
        detailOverlay.classList.remove('active');
        detailOverlay.setAttribute('aria-hidden', 'true');
        body.style.overflow = 'auto';
    };
});
