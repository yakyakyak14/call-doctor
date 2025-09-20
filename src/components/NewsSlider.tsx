import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Stethoscope } from "lucide-react";

interface NewsItem {
  id: number;
  type: 'news' | 'doctor-signup';
  title: string;
  subtitle?: string;
  location?: string;
  specialty?: string;
  timestamp: string;
}

const mockNews: NewsItem[] = [
  {
    id: 1,
    type: 'news',
    title: 'Revolutionary AI Diagnostic Tool Approved by FDA',
    subtitle: 'New technology shows 95% accuracy in early cancer detection',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    type: 'doctor-signup',
    title: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    location: 'Lagos',
    timestamp: '30 minutes ago'
  },
  {
    id: 3,
    type: 'news',
    title: 'Breakthrough in Alzheimer\'s Treatment Shows Promise',
    subtitle: 'Clinical trials demonstrate significant memory improvement',
    timestamp: '4 hours ago'
  },
  {
    id: 4,
    type: 'doctor-signup',
    title: 'Dr. Michael Okafor',
    specialty: 'Pediatrician',
    location: 'Abuja',
    timestamp: '1 hour ago'
  },
  {
    id: 5,
    type: 'news',
    title: 'Telemedicine Adoption Increases by 300% in Rural Areas',
    subtitle: 'Digital healthcare bridging the gap in underserved communities',
    timestamp: '6 hours ago'
  },
];

const NewsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mockNews.length);
    }, 10000); // 10 seconds per slide

    return () => clearInterval(interval);
  }, []);

  const currentNews = mockNews[currentSlide];

  return (
    <div className="bg-primary-light/30 border border-primary/20 rounded-lg p-4 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Medical Updates
        </h3>
        <div className="flex space-x-1">
          {mockNews.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="min-h-[60px] flex items-center">
        {currentNews.type === 'news' ? (
          <div>
            <h4 className="font-medium text-foreground text-sm leading-tight">
              {currentNews.title}
            </h4>
            {currentNews.subtitle && (
              <p className="text-muted-foreground text-xs mt-1">
                {currentNews.subtitle}
              </p>
            )}
            <span className="text-xs text-muted-foreground">{currentNews.timestamp}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">{currentNews.title}</span>
                <Badge variant="secondary" className="text-xs">New Doctor</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{currentNews.specialty}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{currentNews.location}</span>
                <span>•</span>
                <span>{currentNews.timestamp}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSlider;