/* ==========================================================================
   ABERIA v5 — Site Interactions
   Scroll reveals, count-up animation, nav scroll state, intelligence build
   
   Vanilla JS. No dependencies. Respects prefers-reduced-motion.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* === SCROLL REVEAL ===
     Elements with [data-reveal] fade in on viewport entry.
     Elements with [data-reveal="whisper"] scale-in from center.
     Parent with [data-reveal-stagger] staggers children by 100ms.
     ----------------------------------------------------------------- */

  if (!reducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    // Direct reveal elements
    document.querySelectorAll('[data-reveal]').forEach(el => {
      revealObserver.observe(el);
    });

    // Staggered children: set CSS custom property for delay
    document.querySelectorAll('[data-reveal-stagger]').forEach(parent => {
      const children = parent.querySelectorAll('[data-reveal]');
      children.forEach((child, i) => {
        child.style.setProperty('--reveal-index', i);
      });
    });
  } else {
    // Reduced motion: make everything visible immediately
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('revealed');
    });
  }


  /* === MONUMENT NUMBER COUNT-UP ===
     Elements with [data-countup] animate from 0 to their text value.
     Supports integers, decimals, and values with prefix/suffix.
     
     Usage:
       <span data-countup data-countup-value="200" data-countup-suffix="%">0%</span>
       <span data-countup data-countup-value="50" data-countup-prefix="$" data-countup-suffix="M+">$0M+</span>
     ----------------------------------------------------------------- */

  const countupElements = document.querySelectorAll('[data-countup]');

  if (countupElements.length && !reducedMotion) {
    const countupObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCountup(entry.target);
          countupObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    countupElements.forEach(el => countupObserver.observe(el));
  } else {
    // Reduced motion or no elements: show final values immediately
    countupElements.forEach(el => {
      const prefix = el.dataset.countupPrefix || '';
      const suffix = el.dataset.countupSuffix || '';
      const value = el.dataset.countupValue;
      el.textContent = prefix + value + suffix;
    });
  }

  function animateCountup(el) {
    const target = parseFloat(el.dataset.countupValue);
    const prefix = el.dataset.countupPrefix || '';
    const suffix = el.dataset.countupSuffix || '';
    const duration = 1200; // ms
    const startTime = performance.now();
    const isInteger = Number.isInteger(target);

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Deceleration easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      el.textContent = prefix + (isInteger ? Math.round(current) : current.toFixed(1)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }


  /* === NAVIGATION SCROLL STATE ===
     Adds .nav-scrolled when page is scrolled past 60px.
     Removes it when back at top.
     ----------------------------------------------------------------- */

  const nav = document.querySelector('.nav');

  if (nav) {
    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
      if (window.scrollY > 60) {
        nav.classList.add('nav-scrolled');
        nav.classList.remove('nav-transparent');
      } else {
        nav.classList.remove('nav-scrolled');
        nav.classList.add('nav-transparent');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state
    updateNav();
  }


  /* === INTELLIGENCE BUILD ===
     The meeting prep card that assembles line by line.
     Triggered by button click.
     
     Expected HTML structure:
       <button class="btn btn-primary intel-build-trigger">BUILD THE BRIEF</button>
       .intel-row, .intel-insight, .intel-strategy — hidden by default
       <span class="intel-timer"></span>
     ----------------------------------------------------------------- */

  const buildTrigger = document.querySelector('.intel-build-trigger');

  if (buildTrigger) {
    let built = false;

    buildTrigger.addEventListener('click', () => {
      if (built) return;
      built = true;

      buildTrigger.textContent = 'BUILDING...';
      buildTrigger.style.opacity = '0.6';
      buildTrigger.style.pointerEvents = 'none';

      const rows = document.querySelectorAll('.intel-row, .intel-insight, .intel-strategy');
      const delays = [400, 1200, 2200, 3400];
      const timer = document.querySelector('.intel-timer');
      const startTime = Date.now();

      // Reveal rows sequentially
      rows.forEach((row, i) => {
        if (reducedMotion) {
          row.classList.add('visible');
        } else {
          setTimeout(() => {
            row.classList.add('visible');
          }, delays[i] || delays[delays.length - 1] + (i - delays.length + 1) * 800);
        }
      });

      // Timer display
      if (timer && !reducedMotion) {
        const interval = setInterval(() => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          timer.textContent = elapsed + 's';

          if (Date.now() - startTime > 4200) {
            clearInterval(interval);
            timer.textContent = '4.2s — ready to walk in.';
            buildTrigger.textContent = 'BRIEF COMPLETE';
            buildTrigger.style.opacity = '1';
            buildTrigger.style.background = 'var(--petrol)';
          }
        }, 100);
      } else if (timer) {
        timer.textContent = 'Brief complete.';
        buildTrigger.textContent = 'BRIEF COMPLETE';
        buildTrigger.style.opacity = '1';
        buildTrigger.style.background = 'var(--petrol)';
      }
    });
  }


  /* === GAP VISUALIZATION ===
     Toggle between 20% and 80% states.
     
     Expected HTML:
       <button class="gap-toggle-btn active" data-gap="20">Without ABERIA</button>
       <button class="gap-toggle-btn" data-gap="80">With ABERIA</button>
       <div class="gap-bar-fill" id="gapFill"></div>
       <span class="gap-bar-label" id="gapLabel"></span>
     ----------------------------------------------------------------- */

  const gapButtons = document.querySelectorAll('.gap-toggle-btn[data-gap]');

  if (gapButtons.length) {
    gapButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.gap, 10);
        const fill = document.getElementById('gapFill');
        const label = document.getElementById('gapLabel');
        const desc = document.getElementById('gapDesc');
        const whisper = document.querySelector('.gap-whisper');

        // Update active state
        gapButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (pct === 80) {
          fill.style.width = '80%';
          fill.style.background = 'var(--copper)';
          label.textContent = '80%';
          if (desc) desc.textContent = 'With expert curation — structured workflows built by sellers who carry quota — output quality reaches 60–80%. Meeting briefs with asymmetric intelligence. Financial models the CFO believes. Proposals that sound like you on your best day.';
          if (whisper) whisper.classList.add('visible');
        } else {
          fill.style.width = '20%';
          fill.style.background = 'var(--petrol)';
          label.textContent = '20%';
          if (desc) desc.textContent = 'Left alone, most sellers use AI at 20% of its capacity. Generic prompts. Surface-level output. The kind of work you could have done yourself.';
          if (whisper) whisper.classList.remove('visible');
        }
      });
    });
  }


  /* === CONVERGENCE SVG PATH DRAW ===
     Animates the convergence paths using stroke-dasharray.
     Triggered on viewport entry.
     
     Expected: SVG paths with class .convergence-path
     ----------------------------------------------------------------- */

  const convergencePaths = document.querySelectorAll('.convergence-path');

  if (convergencePaths.length && !reducedMotion) {
    convergencePaths.forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.transition = 'none';
    });

    const convergenceContainer = document.querySelector('.convergence-diagram');
    if (convergenceContainer) {
      const convObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            convergencePaths.forEach((path, i) => {
              setTimeout(() => {
                path.style.transition = 'stroke-dashoffset 1500ms ease-in-out';
                path.style.strokeDashoffset = '0';
              }, i * 100);
            });

            // Fade in the output box after paths complete
            const outputBox = document.querySelector('.convergence-output');
            if (outputBox) {
              setTimeout(() => {
                outputBox.classList.add('revealed');
              }, 2000);
            }

            convObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      convObserver.observe(convergenceContainer);
    }
  }
});
