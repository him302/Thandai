import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // 1. Showcase Horizontal Scroll
  const showcase = document.querySelector('.showcase-container');
  if (showcase) {
    gsap.to(showcase, {
      xPercent: -66.66,
      ease: "none",
      scrollTrigger: {
        trigger: "#showcase",
        pin: true,
        scrub: 1,
        end: () => "+=" + showcase.offsetWidth
      }
    });
  }

  // 2. Stats Counters
  const statNums = document.querySelectorAll('.stat-num');
  statNums.forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    gsap.to(num, {
      innerText: target,
      duration: 2,
      snap: { innerText: 1 },
      scrollTrigger: {
        trigger: "#stats",
        start: "top center",
      },
      onUpdate: function() {
        num.innerHTML = Math.ceil(num.innerText).toLocaleString();
      }
    });
  });

  // 3. Flavor Explosion Parallax
  gsap.to("#slice1", {
    y: 200,
    rotation: 45,
    scrollTrigger: {
      trigger: "#flavors",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
    }
  });
  gsap.to("#slice2", {
    y: -300,
    rotation: -90,
    scrollTrigger: {
      trigger: "#flavors",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.5
    }
  });
  gsap.to("#slice3", {
    scale: 2,
    opacity: 0,
    scrollTrigger: {
      trigger: "#flavors",
      start: "center center",
      end: "bottom top",
      scrub: 1
    }
  });

  // 4. Ice Experience Parallax text
  gsap.from(".ice-text h2", {
    y: 100,
    opacity: 0,
    scale: 0.8,
    scrollTrigger: {
      trigger: "#ice-experience",
      start: "top center",
      end: "center center",
      scrub: 1
    }
  });

  // 5. Lifestyle Splits
  gsap.from(".split-left h2", {
    x: -100,
    opacity: 0,
    scrollTrigger: {
      trigger: "#lifestyle",
      start: "top 60%",
      end: "center center",
      scrub: 1
    }
  });
  gsap.from(".lifestyle-video", {
    x: 100,
    opacity: 0,
    scrollTrigger: {
      trigger: "#lifestyle",
      start: "top 60%",
      end: "center center",
      scrub: 1
    }
  });

  // 7. Timeline Reveal
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, i) => {
    gsap.from(item, {
      x: -50,
      opacity: 0,
      scrollTrigger: {
        trigger: item,
        start: "top 80%"
      }
    });
  });

  // Footer pulse
  gsap.to("footer h3", {
    textShadow: "0 0 20px rgba(164, 255, 0, 1)",
    repeat: -1,
    yoyo: true,
    duration: 1.5
  });
}
