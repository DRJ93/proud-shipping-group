  /* ================================================================
       SECURITY UTILS
       ================================================================ */
    // Sanitize text: strip HTML tags and dangerous chars before use
    function sanitize(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
        .slice(0, 500);
    }

    // Validate email with RFC-compliant regex (no eval)
    function isValidEmail(email) {
      var re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      return re.test(String(email).toLowerCase());
    }

    // Generate a pseudo-random session token (CSRF-like, client-side)
    function generateToken() {
      var arr = new Uint8Array(24);
      crypto.getRandomValues(arr);
      return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }

    // Initialize CSRF token
    (function initToken() {
      var t = document.getElementById('formToken');
      if (t) t.value = generateToken();
    })();

    /* ================================================================
       RATE LIMITING (client-side, additional layer)
       ================================================================ */
    var RATE_LIMIT = { max: 3, window: 300000 }; // 3 submissions per 5 min
    function checkRateLimit() {
      var now = Date.now();
      var key = 'psg_rl';
      var raw = '[]';
      try { raw = sessionStorage.getItem(key) || '[]'; } catch (e) { }
      var times = JSON.parse(raw).filter(function (t) { return now - t < RATE_LIMIT.window; });
      if (times.length >= RATE_LIMIT.max) {
        var wait = Math.ceil((RATE_LIMIT.window - (now - times[0])) / 60000);
        return { allowed: false, wait: wait };
      }
      times.push(now);
      try { sessionStorage.setItem(key, JSON.stringify(times)); } catch (e) { }
      return { allowed: true };
    }

    /* ================================================================
       NAVBAR
       ================================================================ */
    var navbar = document.getElementById('navbar');
    var burger = document.getElementById('navBurger');
    var mobileNav = document.getElementById('mobileNav');
    var isMenuOpen = false;
    var sloganBar = document.getElementById('slogan_bar');
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('nav--scrolled', window.scrollY > 30);
      sloganBar.classList.toggle('slogan--scrolled', window.scrollY > 30);
    }, { passive: true });

    burger.addEventListener('click', function () {
      isMenuOpen = !isMenuOpen;
      mobileNav.classList.toggle('open', isMenuOpen);
      burger.setAttribute('aria-expanded', String(isMenuOpen));
      mobileNav.setAttribute('aria-hidden', String(!isMenuOpen));
      var spans = burger.querySelectorAll('span');
      spans[0].style.transform = isMenuOpen ? 'rotate(45deg) translate(5px,5px)' : '';
      spans[1].style.opacity = isMenuOpen ? '0' : '1';
      spans[2].style.transform = isMenuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        isMenuOpen = false;
        mobileNav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        burger.querySelectorAll('span').forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      });
    });

    /* ================================================================
       SCROLL REVEAL (IntersectionObserver)
       ================================================================ */
    var srEls = document.querySelectorAll('.sr');
    var srObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('show'); srObs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    srEls.forEach(function (el) { srObs.observe(el); });

    /* ================================================================
       COUNTER ANIMATION
       ================================================================ */
    function animateCount(el, target) {
      var dur = 1800, step = target / (dur / 16), cur = 0;
      var timer = setInterval(function () {
        cur += step;
        if (cur >= target) { el.textContent = '+' + target; clearInterval(timer); return; }
        el.textContent = '+' + Math.floor(cur);
      }, 16);
    }
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.cov-stat__num[data-target]').forEach(function (n) {
            animateCount(n, parseInt(n.dataset.target));
            n.removeAttribute('data-target');
          });
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    var statsGrid = document.querySelector('.coverage__stats');
    if (statsGrid) counterObs.observe(statsGrid);

    /* ================================================================
       ACTIVE NAV LINK ON SCROLL
       ================================================================ */
    var sectionIds = ['inicio', 'nosotros', 'servicios', 'cobertura', 'equipo', 'contacto'];
    var navLinks = document.querySelectorAll('.nav__link');
    window.addEventListener('scroll', function () {
      var scrollPos = window.scrollY + 100;
      var current = '';
      sectionIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) current = id;
      });
      navLinks.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
      });
    }, { passive: true });

    /* ================================================================
       EMAILJS FORM SUBMISSION
       NOTE: Replace 'YOUR_PUBLIC_KEY', 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID'
       with your actual EmailJS credentials from emailjs.com.
       Never commit real keys to public repos — use environment variables
       in your backend instead.
       ================================================================ */
    var EMAILJS_CONFIG = {
      publicKey: 'TIMPJrxzo5Hlv3b7W',    // ← Reemplazá con tu Public Key de EmailJS
      serviceId: 'service_8vyngro',   // ← Reemplazá con tu Service ID
      templateId: 'template_ktfai4e'   // ← Reemplazá con tu Template ID
    };

    document.addEventListener('DOMContentLoaded', function () {
      if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
      }
    });

    var form = document.getElementById('quoteForm');
    var submitBtn = document.getElementById('submitBtn');
    var btnText = document.getElementById('btnText');
    var btnLoader = document.getElementById('btnLoader');
    var formStatus = document.getElementById('formStatus');
    var rateInfo = document.getElementById('rateInfo');

    function setField(id, valid) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('error', !valid);
    }

    function validateForm(data) {
      var valid = true;
      if (!data.from_name || data.from_name.length < 2) { setField('userName', false); valid = false; } else { setField('userName', true); }
      if (!isValidEmail(data.reply_to)) { setField('userEmail', false); valid = false; } else { setField('userEmail', true); }
      if (!data.origin || data.origin.length < 2) { setField('userOrigin', false); valid = false; } else { setField('userOrigin', true); }
      if (!data.cargo_type) { setField('cargoType', false); valid = false; } else { setField('cargoType', true); }
      return valid;
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot check
        var hp = form.querySelector('input[name="_hp"]');
        if (hp && hp.value !== '') { return; }

        // Rate limit
        var rl = checkRateLimit();
        if (!rl.allowed) {
          rateInfo.textContent = 'Demasiadas solicitudes. Esperá ' + rl.wait + ' min antes de reenviar.';
          rateInfo.style.color = '#FCA5A5';
          return;
        }

        // Gather and sanitize data (NEVER trust raw user input)
        var rawData = {
          from_name: sanitize(document.getElementById('userName').value),
          reply_to: sanitize(document.getElementById('userEmail').value),
          company: sanitize(document.getElementById('userCompany').value),
          origin: sanitize(document.getElementById('userOrigin').value),
          cargo_type: sanitize(document.getElementById('cargoType').value),
          message: sanitize(document.getElementById('userMessage').value),
          to_email: 'delfi0212@gmail.com',
          sent_at: new Date().toLocaleString('es-AR')
        };

        // Validate
        if (!validateForm(rawData)) {
          rateInfo.textContent = '';
          return;
        }

        // UI: loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        formStatus.className = 'form-status';
        formStatus.textContent = '';

        // Send via EmailJS
        if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'TIMPJrxzo5Hlv3b7W') {
          emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, rawData)
            .then(function () {
              onSuccess();
            })
            .catch(function (err) {
              console.error('EmailJS error:', err.status, err.text);
              onError();
            });
        } else {
          // Demo mode: simulate success when keys not set
          setTimeout(function () {
            console.info('[Demo] Datos sanitizados que se enviarían:', rawData);
            onSuccess();
          }, 1200);
        }
      });
    }

    function onSuccess() {
      resetBtn();
      formStatus.className = 'form-status success';
      formStatus.textContent = '✓ ¡Solicitud enviada! Te contactamos en menos de 24 horas.';
      form.reset();
      document.getElementById('formToken').value = generateToken();
      rateInfo.textContent = '';
    }

    function onError() {
      resetBtn();
      formStatus.className = 'form-status error-status';
      formStatus.textContent = '✗ Error al enviar. Por favor escribinos a ar.sales@proudshipping.com';
    }

    function resetBtn() {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }

    /* ================================================================
       MAP IMAGES — injected from uploaded files
       The artifact preview can't load uploaded binary files via src,
       so we show styled placeholder cards that replicate the look.
       In production, replace the src with your hosted image URLs.
       ================================================================ */
    (function injectMapPlaceholders() {
      var worldEl = document.getElementById('worldMapImg');
      var saEl = document.getElementById('saMapImg');

      function makePlaceholder(label, el) {
        if (!el) return;
        // If src is the placeholder string, swap with styled div
        if (el.src && el.src.includes('WORLD_MAP_IMAGE') || el.src && el.src.includes('SOUTH_AMERICA_MAP')) {
          var wrap = el.parentElement;
          var div = document.createElement('div');
          div.style.cssText = [
            'background:linear-gradient(135deg,#0B1F3A 0%,#0f2a4a 50%,#0B1F3A 100%)',
            'border-radius:16px', 'width:100%', 'aspect-ratio:16/7',
            'display:flex', 'align-items:center', 'justify-content:center',
            'position:relative', 'overflow:hidden', 'border:1px solid rgba(30,78,216,0.3)'
          ].join(';');
          div.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.5);font-family:Inter,sans-serif">'
            + '<div style="font-size:2rem;margin-bottom:8px">🗺️</div>'
            + '<div style="font-size:.85rem;font-weight:600">' + label + '</div>'
            + '<div style="font-size:.72rem;margin-top:4px;opacity:.6">Reemplazá el src con tu URL de imagen hosteada</div>'
            + '</div>';
          wrap.replaceChild(div, el);
        }
      }

      makePlaceholder('Mapa Mundial de Cobertura Global', worldEl);
      var saParent = saEl ? saEl.parentElement : null;
      if (saEl && saEl.src && (saEl.src.includes('SOUTH_AMERICA_MAP') || saEl.src.includes('data:image/jpeg;base64,S'))) {
        makePlaceholder('Mapa Multimodal – Sudamérica', saEl);
      }
    })();

    /* ================================================================
       LANGUAGE SWITCHER – i18n
       ================================================================ */
    var currentLang = 'es';

    var translations = {
      es: {
        'seafreight.title': 'Transporte Marítimo',
        'airfreight.title': 'Transporte Aéreo',
        'inlandfreight.title': 'Transporte Terrestre',
        'multimodal.title': 'Servicio Multimodal',
        'airfreight.t4h': 'Carga Sobredimensionada',
        'airfreight.t3h':'Carga Peligrosa',
        'nav.home': 'Home',
        'nav.about': 'Nosotros',
        'nav.services': 'Servicios',
        'nav.coverage': 'Cobertura',
        'nav.team': 'Equipo',
        'nav.cta': 'Solicitar cotización',
        'hero.sub': 'Conectamos tu carga con el mundo con eficiencia, confiabilidad y un equipo dedicado a cada operación.<br><strong style="color:rgba(255,255,255,.85)">We Make It Happen.</strong>',
        'hero.explore': 'Explorar servicios →',
        'hero.stat1': 'Agentes globales',
        'hero.stat2': 'Países activos',
        'hero.stat3': 'Puertos conectados',
        'about.label': 'Quiénes somos',
        'about.title': 'Una empresa global con raíces en Latinoamérica',
        'about.p1': 'Somos una empresa de soluciones logísticas con base en Buenos Aires, Argentina, y nuestra casa matriz en la Ciudad de México. Proud Shipping Group, una compañía en crecimiento y expansión constante a nivel mundial.',
        'about.p2': 'Nuestro servicio logístico integral gestiona eficientemente todos los procesos de operatividad y comercialidad en materia de exportación e importación, adaptándonos a las necesidades de cada cliente. Nos especializamos en logística estratégica y carga multimodal, además de flete aéreo, marítimo y terrestre.',
        'about.goal1t': 'Optimizar recursos', 'about.goal1s': 'Eficiencia en cada operación',
        'about.goal2t': 'Reducir costos', 'about.goal2s': 'Soluciones competitivas',
        'about.goal3t': 'Respuesta rápida', 'about.goal3s': 'Atención en menos de 2hs',
        'about.goal4t': 'Superar expectativas', 'about.goal4s': 'Nuestro compromiso real',
        'mvv.label': 'Nuestros pilares', 'mvv.title': 'Misión, Visión y Valores',
        'mvv.m.title': 'Misión', 'mvv.m.text': 'Brindar soluciones logísticas integrales, eficientes y personalizadas que conecten a nuestros clientes con el mundo, optimizando tiempos, recursos y costos operativos sin comprometer la calidad del servicio.',
        'mvv.v.title': 'Visión', 'mvv.v.text': 'Ser un operador logístico global de referencia en Latinoamérica, reconocido por nuestra confiabilidad, tecnología aplicada y la excelencia en el servicio al cliente a nivel internacional.',
        'mvv.val.title': 'Valores', 'mvv.val.1': 'Compromiso con cada operación', 'mvv.val.2': 'Integridad en cada decisión', 'mvv.val.3': 'Innovación constante', 'mvv.val.4': 'Enfoque total en el cliente',
        'svc.label': 'Lo que ofrecemos', 'svc.title': 'Soluciones logísticas completas', 'svc.sub': 'Cubrimos cada modalidad de transporte con procesos optimizados y seguimiento end-to-end para tu carga.',
        'svc.card.sea': 'MARITIMO', 'svc.card.air': 'AEREO', 'svc.card.inland': 'TERRESTRE', 'svc.card.multi': 'MULTIMODAL',
        'svc.detail.label': 'NUESTROS SERVICIOS',
        'sea.li1': 'FCL – Contenedor completo', 'sea.li2': 'LCL – Carga consolidada',
        'air.li1': 'Urgente y Premium', 'air.li2': 'Temperatura controlada',
        'inland.li1': 'FTL – Camión completo', 'inland.li2': 'LTL – Carga parcial', 'inland.li3': 'Refrigerado', 'inland.li4': 'ADR – Mercancías peligrosas',
        'multi.li1': 'Puerta a puerta', 'multi.li2': 'Optimización de rutas', 'multi.li3': 'Grandes volúmenes', 'multi.li4': 'Coordinación integral',
        'cta.detail': 'Ver detalle →',
        'seafreight.desc': 'El transporte marítimo es una de las formas más económicas de trasladar mercaderías a grandes distancias. Gestionamos tanto flete de importación como de exportación, con una red de armadores consolidada y relaciones VIP con las principales líneas navieras del mundo.',
        'seafreight.f1t': 'Capacidad total', 'seafreight.f1s': 'Grandes volúmenes sin límite de escala',
        'seafreight.f2t': 'Salidas semanales', 'seafreight.f2s': 'Servicios regulares 24/7 desde/hacia principales hubs',
        'seafreight.f3t': 'Control de temperatura', 'seafreight.f3s': 'Control de temperatura para carga perecedera y pharma',
        'seafreight.f4t': 'Carga peligrosa',
        'seafreight.f4s': 'Manejo certificado de mercancías peligrosas',
        'seafreight.cta': 'Solicitar cotización marítima →',
        'seafreight.t1': 'Contenedor completo para tu carga. Mayor seguridad y tiempos de tránsito predecibles.',
        'seafreight.t2': 'Consolidamos tu carga con otras, reduciendo costos sin sacrificar tiempos.',
        'seafreight.t3': 'Para carga sobredimensionada, maquinaria pesada y vehículos rodantes.',
        'seafreight.t4': 'Gestión integral de proyectos especiales con equipos dedicados e ingeniería de ruta.',
        'seafreight.b1': 'Tarifa óptima por tonelada', 'seafreight.b2t': 'Seguridad', 'seafreight.b2s': 'Sistemas avanzados en cada buque', 'seafreight.b3t': 'Confiabilidad', 'seafreight.b3s': 'Fechas de salida y llegada predecibles',
        'airfreight.desc': 'Coordinamos envíos de importación, exportación y crosstrade. Nuestro equipo especializado garantiza rapidez, trazabilidad y el cumplimiento de normativas internacionales para cualquier tipo de carga aérea.',
        'airfreight.f1t': 'Entregas urgentes', 'airfreight.f1s': 'Vuelos programados con horarios precisos',
        'airfreight.f2t': 'Temperatura controlada', 'airfreight.f2s': 'Cadena de frio para pharma y perecederos',
        'airfreight.f3s': 'Aeronaves exclusivas para cargas especiales',
        'airfreight.f4t': 'Reporting y trazabilidad', 'airfreight.f4s': 'Tracking en tiempo real y distribución con informes',
        'airfreight.cta': 'Solicitar cotización aérea →',
        'airfreight.t1h': 'General Cargo', 'airfreight.t1p': 'Mercancía estándar gestionada con eficiencia y puntualidad.',
        'airfreight.t2h': 'Temperatura Controlada', 'airfreight.t2p': 'Cadena de frío certificada para farmacéuticos y alimentos perecederos.',
        'airfreight.t3p': 'Transporte de mercancías peligrosas bajo normativa IATA DGR.',
        'airfreight.t4p': 'Carga sobredimensionada o exclusiva con equipos especializados.',
        'airfreight.b1t': 'Velocidad', 'airfreight.b1s': 'Tránsitos internacionales en 24–72hs',
        'airfreight.b2t': 'Flexibilidad', 'airfreight.b2s': 'Alcanzamos cualquier punto del mundo',
        'airfreight.b3t': 'Menor riesgo de daños', 'airfreight.b3s': 'Manipulación especializada en origen y destino',
        'inlandfreight.desc': 'El transporte terrestre internacional entre dos o más países es una herramienta esencial para el comercio global. Trabajamos con una red de transportistas que ofrecen beneficios en costo y disponibilidad, con agentes en puntos clave de cada país para control total de la carga en cada etapa.',
        'inlandfreight.f1t': 'Seguridad total', 'inlandfreight.f1s': 'GPS, monitoreo 24/7 y protocolos ADR certificados',
        'inlandfreight.f2t': 'Cobertura regional', 'inlandfreight.f3t': 'Puntualidad', 'inlandfreight.f3s': 'KPIs de cumplimiento superiores al 97%',
        'inlandfreight.f4t': 'Flexibilidad operativa', 'inlandfreight.f4s': 'Rutas y frecuencias adaptadas a tu operación',
        'inlandfreight.cta': 'Solicitar cotización terrestre →',
        'inlandfreight.t1h': 'FTL – Carga Completa', 'inlandfreight.t1p': 'Exclusividad total del vehículo para mayor seguridad y rapidez en destino.',
        'inlandfreight.t2h': 'LTL – Carga Consolidada', 'inlandfreight.t2p': 'Optimizá costos compartiendo espacio con otras cargas sin perder control.',
        'inlandfreight.t3h': 'Refrigerada', 'inlandfreight.t3p': 'Control de temperatura certificado para alimentos, cosméticos y farmacéuticos.',
        'inlandfreight.t4h': 'ADR – Peligrosa', 'inlandfreight.t4p': 'Transporte de mercancías peligrosas con personal certificado y máxima normativa.',
        'inlandfreight.b1s': 'Red optimizada para tarifas competitivas', 'inlandfreight.b2s': 'Pickup y entrega en cualquier punto de la región', 'inlandfreight.b3s': 'Servicio urgente disponible según disponibilidad',
        'multimodal.desc': 'Esta modalidad nos permite tener otros puertos de salida combinando dos o más medios de transporte. Contamos con salidas vía el Pacífico desde San Antonio o Valparaíso, así como vía Antofagasta o Puerto Coronel, al Norte y Sur respectivamente. También es posible transitar por Argentina desde cualquier país limítrofe por vía terrestre, partiendo del puerto de Buenos Aires por mar.',
        'multimodal.f1t': 'Coordinación integral', 'multimodal.f1s': 'Un solo interlocutor para toda la cadena logística',
        'multimodal.f2t': 'Optimización de rutas', 'multimodal.f2s': 'Ingeniería de rutas para el mejor costo/tiempo',
        'multimodal.f3t': 'Grandes volúmenes', 'multimodal.f3s': 'Capacidad para project cargo y cargas especiales',
        'multimodal.f4t': 'Acceso a más puertos', 'multimodal.f4s': 'Pacífico, Atlántico y conexiones interiores',
        'multimodal.cta': 'Solicitar solución multimodal →',
        'multimodal.routes.title': 'Salidas desde Sudamérica',
        'multimodal.t1h': 'Mar + Tierra', 'multimodal.t1p': 'Combinación marítima y terrestre para llegar a destinos sin salida al mar.',
        'multimodal.t2h': 'Aire + Tierra', 'multimodal.t2p': 'Velocidad aérea con distribución terrestre en última milla.',
        'multimodal.t3h': 'Puerta a Puerta', 'multimodal.t3p': 'Gestión integral de pickup a entrega final sin intermediarios.',
        'multimodal.t4h': 'Grandes Volúmenes', 'multimodal.t4p': 'Soluciones a escala para operaciones de alto volumen y project cargo.',
        'warehouse.title': 'Almacenaje Fiscal & Servicios Logísticos',
        'warehouse.desc': 'Garantizamos la trazabilidad de tu carga para que llegue a destino en perfectas condiciones. Ofrecemos servicios de almacenaje fiscal, transporte doméstico, seguros de carga y gestión de inventarios con control digital y videomonitoreo.',
        'warehouse.f1t': 'Almacén Fiscal', 'warehouse.f1s': 'Import/Export, desconsolidación, palletizado y control digital',
        'warehouse.f2t': 'Transporte Doméstico', 'warehouse.f2s': 'Door to door, tracking online, facturación electrónica',
        'warehouse.f3t': 'Seguros de Carga', 'warehouse.f3s': 'Trabajamos con las mejores aseguradoras del mercado',
        'warehouse.f4t': 'Almacén Doméstico', 'warehouse.f4s': 'Optimización de costos de manejo y acondicionamiento COMEX',
        'warehouse.t1p': 'Cold chain y trazabilidad completa para productos regulados.',
        'warehouse.t2p': 'Manejo especializado de insumos y equipos para la industria energética.',
        'warehouse.t3p': 'Gestión de perecederos con cadena de frío certificada.',
        'warehouse.t4p': 'Autos, motos y repuestos para industria naval y automotriz.',
        'coverage.label': 'Alcance internacional', 'coverage.title': 'Cobertura verdaderamente global',
        'coverage.sub': 'Red de agentes y alianzas estratégicas en los principales hubs logísticos del mundo.',
        'coverage.stat2': 'Países operativos',
        'diff.label': 'Por qué elegirnos', 'diff.title': 'Nuestros diferenciales', 'diff.sub': 'Lo que distingue a Proud Shipping Group de cualquier otro operador del mercado.',
        'diff.c1t': 'Atención personalizada', 'diff.c1p': 'Un ejecutivo dedicado a tu cuenta, disponible para responder en menos de 2 horas hábiles en cualquier operación activa.',
        'diff.c2t': 'Seguimiento en tiempo real', 'diff.c2p': 'Trazabilidad completa de tu carga con actualizaciones proactivas en cada hito del proceso logístico.',
        'diff.c3t': 'Red global consolidada', 'diff.c3p': 'Más de 120 agentes en todos los continentes garantizan operaciones fluidas sin importar el destino.',
        'diff.c4t': 'Optimización de costos', 'diff.c4p': 'Analizamos cada ruta y modalidad para encontrar la opción más eficiente sin sacrificar tiempos ni seguridad.',
        'diff.c5t': 'Experiencia internacional', 'diff.c5p': 'Más de 15 años operando en mercados complejos nos dan el know-how para resolver cualquier desafío logístico.',
        'diff.c6t': 'Compromiso real', 'diff.c6p': 'Tu éxito es nuestro éxito. Construimos relaciones de largo plazo basadas en confianza y resultados concretos.',
        'team.label': 'Nuestro equipo', 'team.title': '¿Quiénes somos?', 'team.sub': 'Profesionales con experiencia internacional y vocación de servicio para cada operación.',
        'cta.final.p': 'Contactanos hoy y recibí una cotización personalizada en menos de 24 horas. Sin compromisos, con total transparencia. <strong style="color:rgba(255,255,255,.9)">We Make It Happen.</strong>',
        'footer.brand': 'Operador logístico internacional con presencia global. <br/>Transport · Logistics · Supply Chain · Warehousing',
        'footer.offices': 'Oficinas', 'footer.copy': '© 2025 Proud Shipping Group – AR. We Make It Happen. Todos los derechos reservados.',
        'form.name': 'Nombre completo *', 'form.name.err': 'Por favor ingresá tu nombre.',
        'form.email': 'Email corporativo *', 'form.email.err': 'Por favor ingresá un email válido.',
        'form.company': 'Empresa', 'form.origin': 'Puerto / Ciudad de origen *', 'form.origin.err': 'Por favor indicá el origen.',
        'form.service': 'Tipo de servicio *', 'form.service.ph': 'Seleccioná un servicio', 'form.service.err': 'Por favor seleccioná el tipo de servicio.',
        'form.air.std': 'Air Freight – Estándar', 'form.air.urg': 'Air Freight – Urgente',
        'form.inland.ref': 'Inland Freight – Refrigerado', 'form.inland.adr': 'Inland Freight – Peligroso (ADR)',
        'form.multi': 'Transporte Multimodal', 'form.wh': 'Almacenaje Fiscal', 'form.other': 'Otro / Consulta general',
        'form.msg': 'Mensaje adicional', 'form.submit': 'Enviar solicitud', 'form.sending': 'Enviando…'
      },
      en: {
        'seafreight.title': 'Ocean Freight',
        'airfreight.title': 'Air Freight',
        'inlandfreight.title': 'Inland Freight',
        'multimodal.title': 'Multimodal Service',
        'airfreight.t4h': 'Oversized Cargo',
        'airfreight.t3h': 'Dangerous Cargo',
        'nav.home': 'Home',
        'nav.about': 'About Us',
        'nav.services': 'Services',
        'nav.coverage': 'Coverage',
        'nav.team': 'Team',
        'nav.cta': 'Request a Quote',
        'hero.sub': 'We connect your cargo with the world with efficiency, reliability and a team dedicated to every operation.<br><strong style="color:rgba(255,255,255,.85)">We Make It Happen.</strong>',
        'hero.explore': 'Explore services →',
        'hero.stat1': 'Global agents',
        'hero.stat2': 'Active countries',
        'hero.stat3': 'Connected ports',
        'about.label': 'Who we are',
        'about.title': 'A global company with roots in Latin America',
        'about.p1': 'We are a logistics solutions company based in Buenos Aires, Argentina, with our headquarter in Mexico City. Proud Shipping Group, a company in constant growth and global expansion.',
        'about.p2': 'Our comprehensive logistics service efficiently manages all operational and commercial processes for exports and imports, adapting to each client\'s needs. We specialize in strategic logistics and multimodal freight, as well as air, sea and land transportation.',
        'about.goal1t': 'Optimize resources', 'about.goal1s': 'Efficiency in every operation',
        'about.goal2t': 'Reduce costs', 'about.goal2s': 'Competitive solutions',
        'about.goal3t': 'Fast answer', 'about.goal3s': 'Feedback in under 24 hours',
        'about.goal4t': 'Exceed expectations', 'about.goal4s': 'Our real commitment',
        'mvv.label': 'OUR CORE VALUES', 'mvv.title': 'Mission, Vision & Values',
        'mvv.m.title': 'Mission', 'mvv.m.text': 'To provide comprehensive, efficient and personalized logistics solutions that connect our clients with the world, optimizing time, resources and operating costs without compromising service quality.',
        'mvv.v.title': 'Vision', 'mvv.v.text': 'To be a reference global logistics operator in Latin America, recognized for our reliability, applied technology and excellence in international customer service.',
        'mvv.val.title': 'Values', 'mvv.val.1': 'Commitment to every operation', 'mvv.val.2': 'Integrity in every decision', 'mvv.val.3': 'Constant innovation', 'mvv.val.4': 'Total client focus',
        'svc.label': 'What we offer', 'svc.title': 'Complete logistics solutions', 'svc.sub': 'We cover every mode of transportation with optimized processes and end-to-end tracking for your cargo.',
        'svc.card.sea': 'OCEAN', 'svc.card.air': 'AIR', 'svc.card.inland': 'LAND', 'svc.card.multi': 'MULTIMODAL',
        'svc.detail.label': 'OUR SERVICES',
        'sea.li1': 'FCL – Full Container Load', 'sea.li2': 'LCL – Consolidated cargo',
        'air.li1': 'Urgent & Premium', 'air.li2': 'Temperature controlled',
        'inland.li1': 'FTL – Full Truck Load', 'inland.li2': 'LTL – Partial cargo', 'inland.li3': 'Refrigerated', 'inland.li4': 'ADR – Dangerous goods',
        'multi.li1': 'Door to door', 'multi.li2': 'Route optimization', 'multi.li3': 'Large volumes', 'multi.li4': 'Comprehensive coordination',
        'cta.detail': 'View details →',
        'seafreight.desc': 'Sea freight is one of the most cost-effective ways to ship goods over long distances. We handle both import and export freight, with a consolidated network of shipowners and VIP relationships with the world\'s leading shipping lines.',
        'seafreight.f1t': 'Full capacity', 'seafreight.f1s': 'Large volumes with no scale limit',
        'seafreight.f2t': 'Weekly departures', 'seafreight.f2s': 'Regular 24/7 services to/from major hubs',
        'seafreight.f3t': 'Reefer containers', 'seafreight.f3s': 'Temperature control for perishable cargo and pharma',
        'seafreight.f4t': 'Certified handling', 'seafreight.f4s': 'Certified handling of dangerous goods',
        'seafreight.cta': 'Request sea freight quote →',
        'seafreight.t1': 'Full container for your cargo. Greater security and predictable transit times.',
        'seafreight.t2': 'We consolidate your cargo with others, reducing costs without sacrificing schedules.',
        'seafreight.t3': 'For oversized cargo, heavy machinery and rolling vehicles.',
        'seafreight.t4': 'Comprehensive management of special projects with dedicated teams and route engineering.',
        'seafreight.b1': 'Optimal rate per ton', 'seafreight.b2t': 'Security', 'seafreight.b2s': 'Advanced systems on every vessel', 'seafreight.b3t': 'Reliability', 'seafreight.b3s': 'Predictable departure and arrival dates',
        'airfreight.desc': 'We coordinate import, export and crosstrade shipments. Our specialized team guarantees speed, traceability and compliance with international regulations for any type of air cargo.',
        'airfreight.f1t': 'Urgent deliveries', 'airfreight.f1s': 'Scheduled flights with precise timetables',
        'airfreight.f2t': 'Temperature controlled', 'airfreight.f2s': 'Cold chain for pharma and perishables',
        'airfreight.f3s': 'Exclusive aircraft for special cargo',
        'airfreight.f4t': 'Reporting & traceability', 'airfreight.f4s': 'Real-time tracking and distribution with reports',
        'airfreight.cta': 'Request air freight quote →',
        'airfreight.t1h': 'General Cargo', 'airfreight.t1p': 'Standard merchandise managed with efficiency and punctuality.',
        'airfreight.t2h': 'Temperature Controlled', 'airfreight.t2p': 'Certified cold chain for pharmaceuticals and perishable food.',
        'airfreight.t3p': 'Dangerous goods transport under IATA DGR regulations.',
        'airfreight.t4p': 'Oversized or exclusive cargo with specialized equipment.',
        'airfreight.b1t': 'Speed', 'airfreight.b1s': 'International transits in 24–72h',
        'airfreight.b2t': 'Flexibility', 'airfreight.b2s': 'We reach any point in the world',
        'airfreight.b3t': 'Lower risk of damage', 'airfreight.b3s': 'Specialized handling at origin and destination',
        'inlandfreight.desc': 'International land transportation between two or more countries is an essential tool for global trade. We work with a carrier network offering cost and availability benefits, with agents at key points in each country for full cargo control at every stage.',
        'inlandfreight.f1t': 'Full security', 'inlandfreight.f1s': 'GPS, 24/7 monitoring and certified ADR protocols',
        'inlandfreight.f2t': 'Regional coverage', 'inlandfreight.f3t': 'On-time delivery', 'inlandfreight.f3s': 'Compliance KPIs above 97%',
        'inlandfreight.f4t': 'Operational flexibility', 'inlandfreight.f4s': 'Routes and frequencies tailored to your operation',
        'inlandfreight.cta': 'Request inland freight quote →',
        'inlandfreight.t1h': 'FTL – Full Truck Load', 'inlandfreight.t1p': 'Full vehicle exclusivity for greater security and speed to destination.',
        'inlandfreight.t2h': 'LTL – Consolidated Load', 'inlandfreight.t2p': 'Optimize costs by sharing space with other cargo without losing control.',
        'inlandfreight.t3h': 'Refrigerated', 'inlandfreight.t3p': 'Certified temperature control for food, cosmetics and pharmaceuticals.',
        'inlandfreight.t4h': 'ADR – Dangerous', 'inlandfreight.t4p': 'Dangerous goods transport with certified personnel and top-level compliance.',
        'inlandfreight.b1s': 'Optimized network for competitive rates', 'inlandfreight.b2s': 'Pickup and delivery at any point in the region', 'inlandfreight.b3s': 'Urgent service available subject to availability',
        'multimodal.desc': 'This mode allows us to access additional departure ports by combining two or more means of transport. We offer Pacific departures from San Antonio or Valparaíso, as well as via Antofagasta or Puerto Coronel to the north and south respectively. We can also transit through Argentina from any bordering country by land, departing from the port of Buenos Aires by sea.',
        'multimodal.f1t': 'Comprehensive coordination', 'multimodal.f1s': 'A single point of contact for the entire logistics chain',
        'multimodal.f2t': 'Route optimization', 'multimodal.f2s': 'Route engineering for the best cost/time ratio',
        'multimodal.f3t': 'Large volumes', 'multimodal.f3s': 'Capacity for project cargo and special loads',
        'multimodal.f4t': 'Access to more ports', 'multimodal.f4s': 'Pacific, Atlantic and inland connections',
        'multimodal.cta': 'Request multimodal solution →',
        'multimodal.routes.title': 'Departures from South America',
        'multimodal.t1h': 'Sea + Land', 'multimodal.t1p': 'Maritime and land combination to reach landlocked destinations.',
        'multimodal.t2h': 'Air + Land', 'multimodal.t2p': 'Air speed with last-mile land distribution.',
        'multimodal.t3h': 'Door to Door', 'multimodal.t3p': 'Full management from pickup to final delivery with no intermediaries.',
        'multimodal.t4h': 'Large Volumes', 'multimodal.t4p': 'Scalable solutions for high-volume operations and project cargo.',
        'warehouse.title': 'Fiscal Warehousing & Logistics Services',
        'warehouse.desc': 'We guarantee the traceability of your cargo so it arrives at its destination in perfect condition. We offer fiscal warehousing, domestic transport, cargo insurance and inventory management with digital control and video monitoring.',
        'warehouse.f1t': 'Fiscal Warehouse', 'warehouse.f1s': 'Import/Export, deconsolidation, palletizing and digital control',
        'warehouse.f2t': 'Domestic Transport', 'warehouse.f2s': 'Door to door, online tracking, electronic invoicing',
        'warehouse.f3t': 'Cargo Insurance', 'warehouse.f3s': 'We work with the best insurers on the market',
        'warehouse.f4t': 'Domestic Warehouse', 'warehouse.f4s': 'Handling cost optimization and COMEX conditioning',
        'warehouse.t1p': 'Complete cold chain and traceability for regulated products.',
        'warehouse.t2p': 'Specialized handling of inputs and equipment for the energy industry.',
        'warehouse.t3p': 'Perishables management with certified cold chain.',
        'warehouse.t4p': 'Cars, motorcycles and spare parts for naval and automotive industries.',
        'coverage.label': 'International reach', 'coverage.title': 'Truly global coverage',
        'coverage.sub': 'Network of agents and strategic alliances at the world\'s major logistics hubs.',
        'coverage.stat2': 'Operating countries',
        'diff.label': 'Why choose us', 'diff.title': 'Our differentials', 'diff.sub': 'What sets Proud Shipping Group apart from any other operator on the market.',
        'diff.c1t': 'Personalized attention', 'diff.c1p': 'A dedicated account executive available to respond within 2 business hours on any active operation.',
        'diff.c2t': 'Real-time tracking', 'diff.c2p': 'Full cargo traceability with proactive updates at every milestone of the logistics process.',
        'diff.c3t': 'Consolidated global network', 'diff.c3p': 'Over 120 agents across all continents ensure smooth operations regardless of the destination.',
        'diff.c4t': 'Cost optimization', 'diff.c4p': 'We analyze every route and mode to find the most efficient option without sacrificing time or safety.',
        'diff.c5t': 'International expertise', 'diff.c5p': 'Over 15 years operating in complex markets give us the know-how to solve any logistics challenge.',
        'diff.c6t': 'Real commitment', 'diff.c6p': 'Your success is our success. We build long-term relationships based on trust and tangible results.',
        'team.label': 'Our team', 'team.title': 'Meet the team', 'team.sub': 'International professionals with a true vocation for service on every operation.',
        'cta.final.p': 'Contact us today and receive a personalized quote within 24 hours. No commitments, full transparency. <strong style="color:rgba(255,255,255,.9)">We Make It Happen.</strong>',
        'footer.brand': 'International logistics operator with global presence. <br/>Transport · Logistics · Supply Chain · Warehousing',
        'footer.offices': 'Offices', 'footer.copy': '© 2025 Proud Shipping Group – AR. We Make It Happen. All rights reserved.',
        'form.name': 'Full name *', 'form.name.err': 'Please enter your name.',
        'form.email': 'Corporate email *', 'form.email.err': 'Please enter a valid email.',
        'form.company': 'Company', 'form.origin': 'Port / City of origin *', 'form.origin.err': 'Please indicate the origin.',
        'form.service': 'Service type *', 'form.service.ph': 'Select a service', 'form.service.err': 'Please select the service type.',
        'form.air.std': 'Air Freight – Standard', 'form.air.urg': 'Air Freight – Urgent',
        'form.inland.ref': 'Inland Freight – Refrigerated', 'form.inland.adr': 'Inland Freight – Dangerous (ADR)',
        'form.multi': 'Multimodal Transport', 'form.wh': 'Fiscal Warehousing', 'form.other': 'Other / General inquiry',
        'form.msg': 'Additional message', 'form.submit': 'Send request', 'form.sending': 'Sending…'
      }
    };

    function applyLang(lang) {
      var dict = translations[lang];
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) {
          el.innerHTML = dict[key];
        }
      });
      document.documentElement.lang = lang;
      currentLang = lang;
      var flag = document.getElementById('langFlag');
      var label = document.getElementById('langLabel');
      if (lang === 'es') {
        
        label.textContent = 'EN';
        document.getElementById('langBtn').title = 'Switch to English';
      } else {
        
        label.textContent = 'ES';
        document.getElementById('langBtn').title = 'Cambiar a Español';
      }
    }

    document.getElementById('langBtn').addEventListener('click', function() {
      applyLang(currentLang === 'es' ? 'en' : 'es');
    });

    /* ================================================================
       HTTPS REDIRECT (runs only in production context)
       ================================================================ */
    if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      location.replace('https:' + location.href.substring(location.protocol.length));
    }