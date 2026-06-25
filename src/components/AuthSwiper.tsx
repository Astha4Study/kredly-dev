import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useAuthSwiperStore } from '@/stores/authSwiperStore';

import 'swiper/css';
import 'swiper/css/effect-fade';

import AuthSwiperImg from '@/assets/images/auth-swiper.jpg';
import AuthSwiperImg2 from '@/assets/images/auth-swiper2.jpg';
import AuthSwiperImg3 from '@/assets/images/auth-swiper3.jpg';

const slides = [
  {
    image: AuthSwiperImg,
    quote:
      'Platform yang sangat membantu dalam memvalidasi skill saya. Proses assessment-nya profesional dan kredensial yang dihasilkan sangat bermanfaat.',
    author: 'Budi Santoso',
    role: 'Software Engineer',
  },
  {
    image: AuthSwiperImg2,
    quote:
      'Kredly memberikan cara yang mudah dan terpercaya untuk menunjukkan kemampuan saya kepada calon employer. Sangat direkomendasikan!',
    author: 'Sarah Wijaya',
    role: 'Product Designer',
  },
  {
    image: AuthSwiperImg3,
    quote:
      'Assessment yang komprehensif dan kredensial digital yang dapat langsung saya share. Ini adalah game-changer untuk portfolio saya.',
    author: 'Andi Prasetyo',
    role: 'Data Analyst',
  },
];

export default function AuthSwiper() {
  const { activeIndex, setActiveIndex } = useAuthSwiperStore();
  const swiperRef = useRef<SwiperType | null>(null);
  const testimonialSwiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex) {
      swiperRef.current.slideToLoop(activeIndex, 0);
    }
  }, [activeIndex]);

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.realIndex;
    setActiveIndex(newIndex);

    // Sync testimonial swiper immediately
    if (
      testimonialSwiperRef.current &&
      testimonialSwiperRef.current.realIndex !== newIndex
    ) {
      testimonialSwiperRef.current.slideToLoop(newIndex, 1000);
    }
  };

  return (
    <div className="relative w-full h-full">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        speed={1000}
        loop={true}
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          swiper.slideToLoop(activeIndex, 0);
        }}
        onSlideChange={handleSlideChange}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={`Kredly testimonial ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Testimonial overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <Swiper
          modules={[EffectFade]}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          speed={1000}
          loop={true}
          allowTouchMove={false}
          onSwiper={(swiper) => {
            testimonialSwiperRef.current = swiper;
            swiper.slideToLoop(activeIndex, 0);
          }}
          className="w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="max-w-xl">
                <svg
                  className="w-10 h-10 text-primary mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-white text-lg font-medium mb-4 leading-relaxed">
                  "{slide.quote}"
                </blockquote>
                <div className="text-white">
                  <div className="font-semibold">{slide.author}</div>
                  <div className="text-sm text-white/80">{slide.role}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
