import HeroSection from '../components/home/HeroSection';
import StatsCounter from '../components/home/StatsCounter';
import DepartmentsPreview from '../components/home/DepartmentsPreview';
import WhyChooseUs from '../components/home/WhyChooseUs';
import DoctorsPreview from '../components/home/DoctorsPreview';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTABanner from '../components/home/CTABanner';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsCounter />
      <DepartmentsPreview />
      <WhyChooseUs />
      <DoctorsPreview />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
