import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Button } from 'antd';

const slides = [
  {
    id: 1,
    image: 'https://esmee.qodeinteractive.com/wp-content/uploads/revslider/Esmee--Dijana/Main-home-img.jpg',
    title: 'Our latest collection',
    description: 'Discover our new Fall/Winter 2024 collection with timeless designs and premium quality.',
  },
  {
    id: 2,
    image: 'https://esmee.qodeinteractive.com/wp-content/uploads/2021/08/h1-rev-img1.jpg',
    title: 'Exclusive Fashion Trends',
    description: 'Upgrade your wardrobe with our latest arrivals and stylish outfits.',
  },
  {
    id: 3,
    image: 'https://esmee.qodeinteractive.com/wp-content/uploads/2021/07/main-home-rev-img-2.jpg',
    title: 'Luxury & Comfort',
    description: 'Experience high-end fashion combined with ultimate comfort and elegance.',
  },
];

const HomeSlider = () => {
  return (
    <div className='home-slider w-full h-[80vh] md:h-[90vh] relative'>
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className='w-full h-full'
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className='relative w-full h-full bg-cover bg-center flex items-center justify-center text-white px-6 md:px-12'
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className='max-w-2xl text-center'>
                <h2 className='text-4xl md:text-6xl font-bold mb-4'>{slide.title}</h2>
                <p className='text-lg md:text-xl mb-6'>{slide.description}</p>
                <Button type='primary' size='large' className='bg-black border-none px-6 py-3 text-lg'>
                  View More
                </Button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HomeSlider;
