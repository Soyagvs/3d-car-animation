/* VARIABLES */
const page = document.getElementById('page');
const loading = document.getElementById('loading');
const slider = document.querySelector('.swiper');
const inner1 = document.getElementById('inner-1');
const inner2 = document.getElementById('inner-2');
const inner3 = document.getElementById('inner-3');
const car = document.querySelector('model-viewer');
const slideToButtons = document.querySelectorAll('[data-slide-to]');
const colorButtons = document.querySelectorAll('[data-color]');
const titles = document.querySelectorAll('.title');
const bgImage = document.querySelector('picture');

/* Animaciones GSAP */
const innerAnimationActive = {
  duration: 1,
  delay: 0.5,
  ease: Power4.easeOut,
  autoAlpha: 1,
  yPercent: 0,
};
const innerAnimationHidden = {
  duration: 1,
  ease: Power4.easeOut,
  autoAlpha: 0,
  yPercent: -20,
};

/* Función para configurar la posición del automóvil */
function setCarPosition() {
  let target1, target2, target3;
  if (window.innerWidth <= 900) {
    target1 = '-9.5m -11.9m 4.2m';
    target2 = '-8.8m -12.7m 4.8m';
    target3 = '-9.8m -10m 3.8m';
  } else {
    target1 = '-9.5m -12.9m 2.2m';
    target2 = '-5.8m -12.5m 3.8m';
    target3 = '-12m -10.7m 1.7m';
  }
  return { target1, target2, target3 };
}

/* Función para animar la posición del automóvil */
function animateCarPosition(exposure, orbit, target) {
  return {
    duration: 1.5,
    ease: Power4.easeOut,
    attr: {
      exposure,
      'camera-orbit': orbit,
      'camera-target': target,
    },
  };
}

/* Inicialización de Swiper */
const swiper = new Swiper(slider, {
  direction: 'vertical',
  speed: 1500,
  grabCursor: true,
  touchRatio: 2,
  threshold: 1,
  preventInteractionOnTransition: true,
  mousewheel: {
    forceToAxis: true,
  },
  keyboard: {
    enabled: true,
  },
  on: {
    init: () => {
      /* Animación de aparición del slider y los títulos */
      gsap.to(slider, {
        duration: 1,
        ease: Power4.easeOut,
        autoAlpha: 1,
      });
      gsap.to(titles, innerAnimationActive);

      /* Título con animación infinita */
      titles.forEach((title, index) => {
        const rowWidth = title.getBoundingClientRect().width;
        const rowItemWidth = title.children[0].getBoundingClientRect().width;
        const offset = ((2 * rowItemWidth) / rowWidth) * 100 * -1;
        const duration = 30 * (index + 1);

        gsap.set(title, {
          xPercent: 0,
        });

        gsap.to(title, {
          duration,
          ease: 'none',
          xPercent: offset,
          repeat: -1,
        });
      });
    },
  },
});

/* Evento cuando el modelo 3D se carga */
car.addEventListener('load', async () => {
  try {
    /* Ocultar pantalla de carga */
    gsap.to(loading, {
      duration: 1,
      ease: Power4.easeOut,
      autoAlpha: 0,
    });

    /* Configurar características del automóvil 3D */
    const materials = car.model.materials;
    const paint = materials.find(mat => mat.name === 'paint');
    if (paint) {
      paint.pbrMetallicRoughness.setBaseColorFactor('#CBD5E1');
    }

    /* Configurar posición inicial del automóvil */
    const { target1, target2, target3 } = setCarPosition();
    gsap.to(car, animateCarPosition('1', '0deg 50deg 50%', target1));

    /* Manejar cambio de diapositiva */
    swiper.on('slideChange', function () {
      switch (swiper.activeIndex) {
        case 0:
          gsap.to(car, animateCarPosition('1', '0deg 50deg 50%', target1));
          page.classList.remove('bg-zinc-900');
          page.classList.add('bg-slate-200');
          break;
        case 1:
          gsap.to(car, animateCarPosition('0.4', '-60deg 60deg 50%', target2));
          page.classList.remove('bg-slate-200');
          page.classList.add('bg-zinc-900');
          break;
        case 2:
          gsap.to(car, animateCarPosition('1', '44deg 83deg 50%', target3));
          page.classList.remove('bg-zinc-900');
          page.classList.add('bg-slate-200');
          break;
      }

      /* Animaciones de elementos internos */
      [inner1, inner2, inner3].forEach((inner, index) => {
        if (index === swiper.activeIndex) {
          gsap.to(inner, innerAnimationActive);
        } else {
          gsap.to(inner, innerAnimationHidden);
        }
      });

      /* Animación de imagen de fondo */
      gsap.to(bgImage, {
        duration: swiper.activeIndex === 2 ? 1 : 0.5,
        ease: Power4.easeOut,
        autoAlpha: swiper.activeIndex === 2 ? 1 : 0,
        yPercent: swiper.activeIndex === 2 ? -50 : 0,
      });
    });

    /* Manejar cambio de tamaño de ventana */
    swiper.on('resize', function () {
      const { target1, target2, target3 } = setCarPosition();
      switch (swiper.activeIndex) {
        case 0:
          gsap.to(car, animateCarPosition('1', '0deg 50deg 50%', target1));
          break;
        case 1:
          gsap.to(car, animateCarPosition('0.4', '-60deg 60deg 50%', target2));
          break;
        case 2:
          gsap.to(car, animateCarPosition('1', '44deg 83deg 50%', target3));
          break;
      }
    });

    /* Manejar clics en botones de diapositiva */
    slideToButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const index = e.target.dataset.slideTo;
        if (index !== undefined) {
          swiper.slideTo(index);
        }
      });
    });

    /* Manejar clics en botones de color */
    colorButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        if (color && paint) {
          paint.pbrMetallicRoughness.setBaseColorFactor(color);
        }
        colorButtons.forEach((btn) => btn.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

  } catch (error) {
    console.error('Error en el manejo del modelo 3D:', error);
    // Aquí puedes manejar el error de manera adecuada, como mostrar un mensaje al usuario o registrar el error en algún servicio de seguimiento.
  }
});
