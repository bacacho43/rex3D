document.addEventListener('DOMContentLoaded', () => {
    const quoteModal = document.getElementById('modal-cotizacion');
    const cotizarBtn = document.getElementById('cotizar-btn');
    const openQuoteButtons = document.querySelectorAll('.open-quote');
    const closeQuoteButton = document.querySelector('.modal-close');
    const quoteBackdrop = document.querySelector('.quote-modal-backdrop');
    const acabadoSelect = document.getElementById('acabadoSelect');
    const primerColors = document.getElementById('primerColors');
    const quoteActionBtn = document.querySelector('.quote-action');
    const estimateResult = document.getElementById('estimateResult');
    const whatsappContactBtn = document.getElementById('whatsappContactBtn');
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    const modalSteps = Array.from(document.querySelectorAll('.modal-step'));
    let currentStep = 0;

    function setModalOpen(open) {
        quoteModal.classList.toggle('active', open);
        quoteModal.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : 'auto';
        if (open) {
            setStep(0);
            estimateResult.style.display = 'none';
            whatsappContactBtn.style.display = 'none';
        }
    }

    function setStep(index) {
        currentStep = Math.max(0, Math.min(index, modalSteps.length - 1));
        modalSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep);
        });
    }

    function handleTipoBaseChange() {
        const value = acabadoSelect.value;
        const showPrimer = value.includes('Primer');
        primerColors.style.display = showPrimer ? 'grid' : 'none';
    }

    function getBaseTypeMultiplier(tipoBase) {
        const multipliers = {
            'Filamento Directo': 1.0,
            'Primer Universal': 1.15,
            'Primer Rellenador': 1.25,
            'Acabado Plus': 1.3,
        };
        return multipliers[tipoBase] || 1.0;
    }

    function getFinishMultiplier(acabadoEspecial) {
        const multipliers = {
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
        return multipliers[acabadoEspecial] || 1.0;
    }

    function formatCurrency(value) {
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    }

    function calculateQuote() {
        const altura = parseFloat(document.querySelector('[name="alto"]').value) || 0;
        const ancho = parseFloat(document.querySelector('[name="ancho"]').value) || 0;
        const profundidad = parseFloat(document.querySelector('[name="profundidad"]').value) || 0;
        const tipoBase = document.querySelector('[name="tipoBase"]').value;
        const acabadoEspecial = document.querySelector('[name="acabadoEspecial"]').value;
        const especificaciones = document.querySelector('[name="especificaciones"]').value.trim();

        if (!altura || !ancho || !profundidad) {
            estimateResult.innerHTML = '<p class="result-error">Por favor ingresa Alto, Ancho y Profundidad para obtener tu estimado.</p>';
            estimateResult.style.display = 'block';
            whatsappContactBtn.style.display = 'none';
            return;
        }

        const volumen = altura * ancho * profundidad;
        const baseMultiplier = getBaseTypeMultiplier(tipoBase);
        const finishMultiplier = getFinishMultiplier(acabadoEspecial);
        const baseRate = 4.2;
        const precioEstimado = volumen * baseRate * baseMultiplier * finishMultiplier;
        const minimo = Math.round(precioEstimado * 0.92);
        const maximo = Math.round(precioEstimado * 1.18);
        const precioTexto = `${formatCurrency(minimo)} - ${formatCurrency(maximo)}`;

        estimateResult.innerHTML = `
            <p class="estimate-copy">Tu estimado es <strong>${precioTexto}</strong>.</p>
            <p class="estimate-copy">El precio final depende de la complejidad del modelo 3D, el material y el acabado seleccionado.</p>
        `;
        estimateResult.style.display = 'block';
        whatsappContactBtn.style.display = 'inline-flex';

        const medidas = `${altura} x ${ancho} x ${profundidad}`;
        const mensaje = `Hola REX 3D STUDIO, coticé en la web. Pieza de ${medidas} cm, Acabado: ${tipoBase}, Efecto: ${acabadoEspecial}. Estimado: ${precioTexto}. Notas: ${especificaciones || 'Sin especificaciones adicionales.'}`;
        whatsappContactBtn.href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    }

    cotizarBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        setModalOpen(true);
    });

    openQuoteButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            setModalOpen(true);
        });
    });

    closeQuoteButton?.addEventListener('click', () => setModalOpen(false));
    quoteBackdrop?.addEventListener('click', () => setModalOpen(false));

    nextStepButtons.forEach((button) => {
        button.addEventListener('click', () => setStep(currentStep + 1));
    });

    prevStepButtons.forEach((button) => {
        button.addEventListener('click', () => setStep(currentStep - 1));
    });

    quoteActionBtn?.addEventListener('click', calculateQuote);
    acabadoSelect?.addEventListener('change', handleTipoBaseChange);

    handleTipoBaseChange();
});
