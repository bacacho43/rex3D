document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const loadingLine = document.getElementById('loadingLine');
    const header = document.getElementById('main-header');
    const heroTitle = document.querySelector('.hero-title');
    const revealElements = document.querySelectorAll('.reveal');
    const stickyQuoteBtn = document.getElementById('stickyQuoteBtn');
    const quoteModal = document.getElementById('modal-cotizacion');
    const quoteBackdrop = document.querySelector('.quote-modal-backdrop');
    const closeModalButton = document.querySelector('.modal-close');
    const cotizarBtn = document.querySelector('.quote-action');
    const whatsappContactBtn = document.getElementById('whatsappContactBtn');
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    const modalSteps = Array.from(document.querySelectorAll('.modal-step'));
    const acabadoSelect = document.getElementById('acabadoSelect');
    const primerColors = document.getElementById('primerColors');
    const estimateResult = document.getElementById('estimateResult');
    let currentStep = 0;
    let ticking = false;

    function finishLoading() {
        body.classList.add('loaded');
        setTimeout(() => {
            body.classList.add('loading-done');
            loadingLine.style.opacity = '0';
        }, 300);
    }

    requestAnimationFrame(() => {
        loadingLine.style.width = '100%';
        setTimeout(finishLoading, 1400);
    });

    function updateHeader() {
        if (window.scrollY > 20) {
            header.classList.add('scroll-active');
        } else {
            header.classList.remove('scroll-active');
        }
    }

    function updateHeroParallax() {
        if (!heroTitle) return;
        const offset = window.scrollY * 0.18;
        heroTitle.style.transform = `translateY(${offset * -1}px)`;
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeader();
                updateHeroParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader();

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });

    revealElements.forEach((element) => revealObserver.observe(element));

    function setModalVisibility(open) {
        quoteModal.classList.toggle('active', open);
        quoteModal.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : 'auto';
        if (open) {
            setModalStep(0);
            estimateResult.style.display = 'none';
            whatsappContactBtn.style.display = 'none';
        }
    }

    function setModalStep(index) {
        currentStep = Math.max(0, Math.min(index, modalSteps.length - 1));
        modalSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep);
        });
    }

    function togglePrimerOptions() {
        const show = acabadoSelect.value.includes('Primer');
        primerColors.style.display = show ? 'grid' : 'none';
    }

    function getBaseTypeMultiplier(tipoBase) {
        const map = {
            'Filamento Directo': 1.0,
            'Primer Universal': 1.15,
            'Primer Rellenador': 1.25,
            'Acabado Plus': 1.3,
        };
        return map[tipoBase] || 1.0;
    }

    function getFinishMultiplier(acabadoEspecial) {
        const map = {
            'Mate': 1.0,
            'Satinado': 1.15,
            'Brillante': 1.25,
            'Tornasol': 2.8,
            'MC00': 2.9,
            'Hidrocromo': 3.0,
            'Metalizado Oro': 2.4,
            'Metalizado Plata': 2.3,
            'Metalizado Bronce': 2.3,
        };
        return map[acabadoEspecial] || 1.0;
    }

    function formatCurrency(value) {
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    }

    function calculateQuote() {
        const alto = parseFloat(document.querySelector('[name="alto"]').value) || 0;
        const ancho = parseFloat(document.querySelector('[name="ancho"]').value) || 0;
        const profundidad = parseFloat(document.querySelector('[name="profundidad"]').value) || 0;
        const tipoBase = document.querySelector('[name="tipoBase"]').value;
        const acabadoEspecial = document.querySelector('[name="acabadoEspecial"]').value;
        const especificaciones = document.querySelector('[name="especificaciones"]').value.trim();

        if (!alto || !ancho || !profundidad) {
            estimateResult.innerHTML = '<p>Por favor ingresa Alto, Ancho y Profundidad para obtener tu estimado.</p>';
            estimateResult.style.display = 'block';
            whatsappContactBtn.style.display = 'none';
            return;
        }

        const volumen = alto * ancho * profundidad;
        const baseMultiplier = getBaseTypeMultiplier(tipoBase);
        const finishMultiplier = getFinishMultiplier(acabadoEspecial);
        const baseRate = 4.2;
        const precioEstimado = volumen * baseRate * baseMultiplier * finishMultiplier;
        const minimo = Math.round(precioEstimado * 0.92);
        const maximo = Math.round(precioEstimado * 1.18);
        const precioTexto = `${formatCurrency(minimo)} - ${formatCurrency(maximo)}`;

        estimateResult.innerHTML = `
            <p>Tu estimado es <strong>${precioTexto}</strong>.</p>
            <p>El precio final depende de la complejidad del modelo y el acabado.</p>
        `;
        estimateResult.style.display = 'block';
        whatsappContactBtn.style.display = 'inline-flex';

        const medidas = `${alto} x ${ancho} x ${profundidad}`;
        const mensaje = `Hola REX 3D STUDIO, coticé en la web. Pieza de ${medidas} cm, Acabado: ${tipoBase}, Efecto: ${acabadoEspecial}. Estimado: ${precioTexto}. Notas: ${especificaciones || 'Sin especificaciones adicionales.'}`;
        whatsappContactBtn.href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    }

    stickyQuoteBtn.addEventListener('click', () => setModalVisibility(true));
    quoteBackdrop.addEventListener('click', () => setModalVisibility(false));
    closeModalButton.addEventListener('click', () => setModalVisibility(false));

    nextStepButtons.forEach((button) => button.addEventListener('click', () => setModalStep(currentStep + 1)));
    prevStepButtons.forEach((button) => button.addEventListener('click', () => setModalStep(currentStep - 1)));

    cotizarBtn.addEventListener('click', calculateQuote);
    acabadoSelect.addEventListener('change', togglePrimerOptions);

    togglePrimerOptions();
});
