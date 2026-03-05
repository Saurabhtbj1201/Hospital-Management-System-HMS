import { Heart, Stethoscope, Building2, Award } from 'lucide-react';
import CountUp from '../ui/CountUp';
import { STATS } from '../../lib/constants';

// Map icon names to components
const iconMap = {
  Heart,
  Stethoscope,
  Building2,
  Award,
};

export default function StatsCounter() {
  return (
    <section className="relative -mt-2 z-10">
      <div className="container-custom">
        <div className="bg-hero-gradient rounded-2xl md:rounded-3xl shadow-purple-lg overflow-hidden">
          {/* Decorative */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 py-10 md:px-12 md:py-14">
            {STATS.map((stat) => {
              const Icon = iconMap[stat.icon] || Heart;
              return (
                <CountUp
                  key={stat.label}
                  end={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={Icon}
                  textClassName="text-white"
                  labelClassName="text-white/60"
                  iconClassName="bg-white/10 text-white/90"
                  duration={2.5}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
