(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("nav-links");
  var navToggle = document.getElementById("navToggle");
  var soundToggle = document.getElementById("soundToggle");
  var alienAudio = document.getElementById("alienSound");
  var scrollProgress = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav scrolled state ---------- */

  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- mobile navigation ---------- */

  function closeMobileMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }

  function openMobileMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.add("open");
    body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      if (navLinks.classList.contains("open")) closeMobileMenu();
      else openMobileMenu();
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMobileMenu();
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.classList.contains("open")) return;
      if (!nav.contains(event.target)) closeMobileMenu();
    });
  }

  /* ---------- scroll reveal ---------- */

  var revealElements = document.querySelectorAll(".reveal");

  if (reducedMotion) {
    revealElements.forEach(function (el) { el.classList.add("in"); });
  } else if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = Number(entry.target.dataset.delay || 0);
        if (delay) entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("in");
        entry.target.addEventListener("transitionend", function () {
          entry.target.style.transitionDelay = "";
        }, { once: true });
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealElements.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- active nav link ---------- */

  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[data-nav]"));

  if ("IntersectionObserver" in window && navAnchors.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (link) {
          link.classList.toggle("active", link.dataset.nav === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- year ---------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- marquee duplication ---------- */

  document.querySelectorAll(".marquee-track").forEach(function (track) {
    var group = track.querySelector(".marquee-group");
    if (!group) return;

    var widthTarget = Math.max(window.innerWidth, 1024) * 1.15;
    var items = Array.prototype.slice.call(group.children);
    var safety = 0;

    while (group.scrollWidth < widthTarget && items.length && safety < 8) {
      items.forEach(function (item) {
        var copy = item.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        group.appendChild(copy);
      });
      safety += 1;
    }

    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  /* ---------- ambient audio ---------- */

  function AmbientAudioEngine() {
    this.ctx = null;
    this.master = null;
    this.ready = false;
    // Sound on by default (only a stored "true" turns it off)
    this.muted = localStorage.getItem("sound_muted") === "true";
  }

  AmbientAudioEngine.prototype.unlock = function () {
    if (!this.ctx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return Promise.resolve(false);
      try {
        this.ctx = new AudioCtx();
      } catch (error) {
        return Promise.resolve(false);
      }
    }

    if (!this.master) {
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }

    var context = this.ctx;
    var resume = context.state === "suspended" ? context.resume() : Promise.resolve();

    return resume.then(function () {
      this.ready = context.state === "running";
      return this.ready;
    }.bind(this)).catch(function () {
      return false;
    });
  };

  AmbientAudioEngine.prototype.canPlay = function () {
    return !this.muted && this.ready && this.ctx && this.master && !document.hidden;
  };

  AmbientAudioEngine.prototype.tone = function (frequency, endFrequency, duration, volume, type) {
    if (!this.canPlay()) return;
    try {
      var t = this.ctx.currentTime;
      var oscillator = this.ctx.createOscillator();
      var gain = this.ctx.createGain();

      oscillator.type = type || "triangle";
      oscillator.frequency.setValueAtTime(frequency, t);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), t + duration);

      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(t);
      oscillator.stop(t + duration + 0.01);
    } catch (error) {
      /* audio is enhancement only */
    }
  };

  AmbientAudioEngine.prototype.playHoverPop = function (pitch) {
    // Short sci-fi blip, Omnitrix-style
    this.tone(360 * pitch, 820 * pitch, 0.055, 0.05, "triangle");
  };

  AmbientAudioEngine.prototype.playBubble = function (pitch, volume) {
    var self = this;
    if (!this.canPlay()) return;
    this.tone(300 * pitch, 720 * pitch, 0.06, volume || 0.11, "triangle");
    window.setTimeout(function () {
      self.tone(680 * pitch, 980 * pitch, 0.07, (volume || 0.11) * 0.7, "sine");
    }, 55);
  };

  AmbientAudioEngine.prototype.playToggle = function (on) {
    var self = this;
    if (!this.canPlay()) return;
    // Omnitrix button-press sound: quick high beep then lower beep
    var notes = on ? [1180, 820] : [820, 560];
    notes.forEach(function (frequency, index) {
      window.setTimeout(function () {
        self.tone(frequency, frequency * 0.92, index === 0 ? 0.06 : 0.09, 0.09, "square");
      }, index * 70);
    });
  };

  AmbientAudioEngine.prototype.playScrollTick = function (direction) {
    var base = direction > 0 ? 520 : 600;
    this.tone(base, base * 0.5, 0.025, 0.026, "sine");
  };

  AmbientAudioEngine.prototype.toggle = function () {
    this.muted = !this.muted;
    localStorage.setItem("sound_muted", String(this.muted));
    return this.muted;
  };

  var audio = new AmbientAudioEngine();

  function syncSoundToggle() {
    if (!soundToggle) return;
    soundToggle.classList.toggle("muted", audio.muted);
    soundToggle.setAttribute("aria-pressed", String(!audio.muted));
    soundToggle.setAttribute("aria-label", audio.muted ? "Enable interaction sounds" : "Disable interaction sounds");
  }

  syncSoundToggle();

  if (soundToggle) {
    soundToggle.addEventListener("click", function () {
      var isMuted = audio.toggle();
      syncSoundToggle();
      if (!isMuted) {
        audio.unlock().then(function () {
          audio.playToggle(true);
          playAlien();
        });
      }
    });
  }

  var primed = false;
  function primeAudio() {
    if (primed) return;
    primed = true;
    audio.unlock().catch(function () {});
  }

  ["pointerdown", "keydown", "touchstart"].forEach(function (eventName) {
    window.addEventListener(eventName, primeAudio, { passive: true, once: true });
  });

  /* ---------- alien sound (Ben 10 scroll) ---------- */

  function playAlien() {
    if (!alienAudio || audio.muted) return;
    try {
      alienAudio.volume = 0.55;
      alienAudio.currentTime = 0;
      if (alienAudio._stopTimer) clearTimeout(alienAudio._stopTimer);
      var p = alienAudio.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
      alienAudio._stopTimer = setTimeout(function () {
        alienAudio.pause();
        alienAudio.currentTime = 0;
      }, 800);
    } catch (error) {
      /* audio is enhancement only */
    }
  }

  function spawnBubble(x, y) {
    if (reducedMotion) return;
    var bubble = document.createElement("div");
    var size = Math.floor(11 + Math.random() * 13);
    bubble.className = "micro-bubble";
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = x + "px";
    bubble.style.top = y + "px";
    body.appendChild(bubble);
    window.setTimeout(function () { bubble.remove(); }, 760);
  }

  window.addEventListener("click", function (event) {
    var interactive = event.target.closest("a, button, .card, .tool, .chips li");
    if (!interactive) return;
    spawnBubble(event.clientX, event.clientY);
    playAlien();
  }, { passive: true });

  /* ---------- subtle hover feedback ---------- */

  var lastHover = 0;
  var hoverIndex = 0;

  document.addEventListener("pointerover", function (event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    var target = event.target.closest("a, button, .card, .tool, .chips li");
    if (!target || target.dataset.hoverActive === "true") return;

    target.dataset.hoverActive = "true";
    target.addEventListener("mouseleave", function () {
      target.dataset.hoverActive = "false";
    }, { once: true });

    var now = performance.now();
    if (now - lastHover > 70) {
      hoverIndex = (hoverIndex + 1) % 6;
      audio.playHoverPop(0.92 + hoverIndex * 0.07);
      lastHover = now;
    }
  }, { passive: true });

  /* ---------- scroll progress + tactile ticks + back to top ---------- */

  var lastTickY = window.scrollY;
  var lastTickAt = 0;

  function onScroll() {
    var currentY = window.scrollY;

    if (currentY < 120 && navAnchors.length) {
      navAnchors.forEach(function (link) { link.classList.remove("active"); });
    }

    if (scrollProgress) {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var progress = maxScroll > 0 ? (currentY / maxScroll) * 100 : 0;
      scrollProgress.style.width = progress + "%";
    }

    if (backToTop) {
      backToTop.classList.toggle("show", currentY > 640);
    }

    var delta = Math.abs(currentY - lastTickY);
    var now = performance.now();
    if (delta >= 80 && now - lastTickAt > 90) {
      audio.playScrollTick(currentY >= lastTickY ? 1 : -1);
      lastTickY = currentY;
      lastTickAt = now;
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- neural hero canvas ---------- */

  (function initNeuralCanvas() {
    var canvas = document.getElementById("neuralCanvas");
    var wrapper = document.getElementById("heroNeural");
    if (!canvas || !wrapper || reducedMotion) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var maxDistance = 165;
    var nodeCount = window.innerWidth < 700 ? 34 : 58;
    var width = 0;
    var height = 0;
    var nodes = [];
    var frame = 0;

    function color(alpha) {
      return "rgba(74,222,128," + alpha + ")";
    }

    function resize() {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function seed() {
      nodes = Array.from({ length: nodeCount }, function () {
        return {
          x: Math.random() * width * 0.58,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 1.2 + Math.random() * 1.8
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i += 1) {
        var a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > width * 0.58) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        for (var j = i + 1; j < nodes.length; j += 1) {
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            var alpha = (1 - distance / maxDistance) * 0.24;
            var fade = 1 - Math.max(0, (a.x - width * 0.3) / (width * 0.26));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = color(alpha * fade);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        var nodeFade = 1 - Math.max(0, (a.x - width * 0.3) / (width * 0.26));
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = color(0.55 * nodeFade);
        ctx.fill();
      }

      frame = window.requestAnimationFrame(draw);
    }

    function start() {
      resize();
      seed();
      wrapper.classList.add("in");
      if (frame) window.cancelAnimationFrame(frame);
      draw();
    }

    window.addEventListener("resize", function () {
      resize();
      seed();
    });

    window.setTimeout(start, 600);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
      } else {
        window.cancelAnimationFrame(frame);
        draw();
      }
    });
  })();
})();
