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
    const stickyQuoteBtn = document.getElementById('btn-cotizar-flotante');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const steps = Array.from(document.querySelectorAll('.modal-step'));
    const selectBase = document.getElementById('acabadoSelect');
    const selectEffect = document.getElementById('efectoSelect');
    const estimateResult = document.getElementById('estimateResult');
    const estimateSummary = document.getElementById('estimateSummary');
    const quoteError = document.getElementById('quoteError');
    const inputLargo = document.querySelector('[name="largo"]');
    const inputAncho = document.querySelector('[name="ancho"]');
    const inputAlto = document.querySelector('[name="alto"]');
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

    const abrirCotizador = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
        setStep(0);
        if (estimateResult) estimateResult.style.display = 'none';
        if (estimateSummary) estimateSummary.textContent = '';
        if (quoteError) quoteError.textContent = '';
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
            'Satinado': 1.1,
            'Brillante': 1.2,
            'Tornasol': 1.4,
            'MC00': 1.5,
            'Hidrocromo': 1.6,
            'Metalizado Oro': 1.7,
            'Metalizado Plata': 1.6,
            'Metalizado Bronce': 1.5,
        };
        return map[effect] || 1.0;
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    };

    const validateStep1 = () => {
        const tipoBase = selectBase.value;
        const efecto = selectEffect.value;

        if (!tipoBase || !efecto) {
            if (quoteError) {
                quoteError.textContent = 'Debes elegir una base y un efecto antes de continuar.';
            }
            return false;
        }

        if (quoteError) {
            quoteError.textContent = '';
        }
        return true;
    };

    const calculateEstimate = () => {
        const largo = parseFloat(inputLargo.value) || 0;
        const ancho = parseFloat(inputAncho.value) || 0;
        const alto = parseFloat(inputAlto.value) || 0;
        const tipoBase = selectBase.value;
        const efecto = selectEffect.value;

        if (!largo || !ancho || !alto) {
            if (estimateResult) {
                estimateResult.innerHTML = '<p>Ingresa Largo, Ancho y Alto en mm para calcular el estimado.</p>';
                estimateResult.style.display = 'block';
            }
            return 0;
        }

        const volumen = largo * ancho * alto;
        const baseRate = 0.00018;
        const total = volumen * baseRate * getBaseMultiplier(tipoBase) * getEffectMultiplier(efecto);
        const rounded = Math.round(total);

        if (estimateResult) {
            estimateResult.innerHTML = `
                <p>Precio Estimado: <strong>${formatCurrency(rounded)}</strong></p>
                <p class="estimate-note">Basado en volumen y acabado seleccionado.</p>
            `;
            estimateResult.style.display = 'block';
        }
        return rounded;
    };

    const buildSummary = (precio) => {
        const tipoBase = selectBase.value;
        const efecto = selectEffect.value;
        const largo = parseFloat(inputLargo.value) || 0;
        const ancho = parseFloat(inputAncho.value) || 0;
        const alto = parseFloat(inputAlto.value) || 0;

        if (estimateSummary) {
            estimateSummary.innerHTML = `
                <p>Base: <strong>${tipoBase}</strong></p>
                <p>Efecto: <strong>${efecto}</strong></p>
                <p>Dimensiones: <strong>${largo} x ${ancho} x ${alto} mm</strong></p>
                <p><strong>${formatCurrency(precio)}</strong> estimado final</p>
            `;
        }
    };

    const launchWhatsApp = () => {
        const largo = parseFloat(inputLargo.value) || 0;
        const ancho = parseFloat(inputAncho.value) || 0;
        const alto = parseFloat(inputAlto.value) || 0;
        const tipoBase = selectBase.value;
        const efecto = selectEffect.value;
        const precio = calculateEstimate();

        if (!tipoBase || !efecto || !largo || !ancho || !alto) {
            if (estimateResult) {
                estimateResult.innerHTML = '<p>Completa todas las etapas antes de confirmar por WhatsApp.</p>';
                estimateResult.style.display = 'block';
            }
            return;
        }

        const mensaje = `Hola REX 3D, me interesa una pieza ${tipoBase} con acabado ${efecto} de ${largo}x${ancho}x${alto} mm. El estimado es ${formatCurrency(precio)}. ¿Podemos agendarlo?`;
        const whatsappUrl = `https://wa.me/tu_numero?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (headerCotizar) {
        headerCotizar.addEventListener('click', (event) => {
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            abrirCotizador();
        });
    }

    if (stickyQuoteBtn) {
        stickyQuoteBtn.addEventListener('click', abrirCotizador);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

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
        button.addEventListener('click', () => {
            if (currentStep === 0) {
                if (!validateStep1()) return;
                setStep(1);
                calculateEstimate();
            } else if (currentStep === 1) {
                const precio = calculateEstimate();
                if (precio <= 0) return;
                buildSummary(precio);
                setStep(2);
            }
        });
    });

    prevButtons.forEach((button) => {
        button.addEventListener('click', () => setStep(currentStep - 1));
    });

    [selectBase, selectEffect, inputLargo, inputAncho, inputAlto].forEach((input) => {
        if (input) {
            input.addEventListener('input', () => {
                if (currentStep === 1) {
                    calculateEstimate();
                }
            });
        }
    });

    const quoteActionButton = document.querySelector('.quote-action');
    if (quoteActionButton) {
        quoteActionButton.textContent = 'Confirmar Cotización por WhatsApp';
        quoteActionButton.addEventListener('click', launchWhatsApp);
    }

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
