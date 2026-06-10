import { MapPin, Flag, ArrowUpDown, Shield, Navigation, CreditCard, Headset } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button, Card } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const features = [
  { title: 'Live Tracking', icon: Navigation, desc: 'Real-time location sharing' },
  { title: 'Trusted Drivers', icon: Shield, desc: 'Verified professionals only' },
  { title: 'Secure Payments', icon: CreditCard, desc: 'Encrypted transactions' },
  { title: '24/7 Support', icon: Headset, desc: 'Always here to help' },
];

export default function Home() {
  const navigate = useNavigate();
  const { selectedPickup, selectedDrop, swapTrip } = useAppStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <p className="text-primary font-bold tracking-wider uppercase text-sm">Welcome to NQTaxi</p>
        <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tight">
          Book Your Ride <span className="text-primary">Instantly.</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Fast, safe and affordable rides across 50+ cities. Experience the next generation of urban mobility.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Card */}
        <Card className="lg:col-span-2 space-y-6 border-primary/10 shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Plan your ride</h2>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Drivers nearby</span>
            </div>
          </div>

          <div className="space-y-4 relative">
            <div className="flex items-center gap-4 bg-surface-elevated p-4 rounded-xl border border-white/5 group transition-all hover:border-primary/30">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">Pickup Location</p>
                <p className="font-semibold">{selectedPickup}</p>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button 
                onClick={swapTrip}
                className="p-2 bg-surface-secondary border border-white/10 rounded-full text-text-secondary hover:text-primary hover:border-primary transition-all shadow-lg"
              >
                <ArrowUpDown size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-surface-elevated p-4 rounded-xl border border-white/5 group transition-all hover:border-primary/30">
              <div className="p-2 bg-info/10 rounded-lg text-info">
                <Flag size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">Drop Location</p>
                <p className="font-semibold">{selectedDrop}</p>
              </div>
            </div>
          </div>

          <Button className="w-full py-4 text-lg" onClick={() => navigate('/tracking')}>
            Find a Ride
          </Button>
        </Card>

        {/* Quick Stats/Info */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/10">
            <h3 className="text-sm font-bold text-primary mb-1">PROMOTION</h3>
            <p className="text-lg font-bold">Get 20% off on your first airport ride!</p>
            <Button variant="outline" className="mt-4 py-2 px-4 text-sm border-primary/30">Claim Now</Button>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            {features.slice(0, 2).map((f) => (
              <Card key={f.title} className="p-4 flex flex-col items-center text-center gap-2 hover:bg-surface-elevated transition-colors cursor-default">
                <f.icon className="text-primary" size={24} />
                <span className="text-xs font-bold">{f.title}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
        {features.map((item) => (
          <Card key={item.title} className="group hover:border-primary/50 transition-all">
            <div className="p-3 bg-primary/5 rounded-xl w-fit group-hover:bg-primary/20 transition-colors">
              <item.icon className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-bold mt-4 mb-1">{item.title}</h3>
            <p className="text-text-secondary text-sm">{item.desc}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
