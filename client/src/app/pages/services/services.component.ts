// services.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";

interface Service {
  id: number;
  title: string;
  description: string;
  detail: string;
  icon: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  name: string;
  info: string;
  quote: string;
}

interface Faq {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
  imports: [CommonModule, NavBarComponent]
})
export class ServicesComponent implements OnInit {
  showBookingModal = false;
  currentServiceId: number | null = null;
  currentTestimonialIndex = 0;
  
  services: Service[] = [
    {
      id: 1,
      title: 'Nutritional Assessment',
      description: 'A comprehensive evaluation of your current dietary habits, health status, lifestyle factors, and personal goals to create a foundation for nutritional guidance.',
      detail: 'Includes analysis of your dietary patterns, medical history, body composition, nutrient deficiencies, and metabolic health indicators to establish baseline measurements.',
      icon: 'fas fa-clipboard-list'
    },
    {
      id: 2,
      title: 'Personalized Nutrition Planning',
      description: 'Customized nutrition strategies that align with your health goals while respecting your food preferences, schedule, and cultural background.',
      detail: 'Our dietitians work collaboratively with you to develop realistic meal structures, portion guidance, and food selection strategies that fit seamlessly into your lifestyle.',
      icon: 'fas fa-utensils'
    },
    {
      id: 3,
      title: 'Weight Management',
      description: 'Evidence-based approaches to achieving and maintaining a healthy weight through sustainable lifestyle changes rather than restrictive dieting.',
      detail: 'We emphasize building a positive relationship with food, understanding hunger and fullness cues, and making gradual changes that lead to long-term weight stability.',
      icon: 'fas fa-weight'
    },
    {
      id: 4,
      title: 'Sports Nutrition',
      description: 'Specialized nutrition strategies for athletes and active individuals to optimize performance, enhance recovery, and achieve sport-specific goals.',
      detail: 'Guidance on pre-workout fueling, competition nutrition, recovery protocols, hydration strategies, and periodized nutrition planning aligned with training cycles.',
      icon: 'fas fa-running'
    }
  ];
  features: Feature[] = [
    {
      title: 'Evidence-Based Approach',
      description: 'All our nutrition recommendations are based on the latest scientific research and clinical evidence.',
      icon: 'fas fa-microscope'
    },
    {
      title: 'Certified Professionals',
      description: 'Our team consists of registered dietitians with specialized education and clinical experience.',
      icon: 'fas fa-certificate'
    },
    {
      title: 'Personalized Care',
      description: 'We develop individualized nutrition plans tailored to your unique needs, preferences, and lifestyle.',
      icon: 'fas fa-user-check'
    },
    {
      title: 'Ongoing Support',
      description: 'Receive continuous guidance, motivation, and accountability throughout your nutrition journey.',
      icon: 'fas fa-hands-helping'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      info: 'Lost 30 pounds in 6 months',
      quote: "Working with this dietitian changed my relationship with food. I've not only reached my weight goals but learned how to maintain a balanced lifestyle without feeling deprived."
    },
    {
      name: 'Michael Thompson',
      info: 'Athlete, Marathon Runner',
      quote: 'The sports nutrition program helped optimize my training and recovery. I shaved 15 minutes off my marathon time and feel stronger than ever.'
    },
    {
      name: 'Emily Rodriguez',
      info: 'Managing Type 2 Diabetes',
      quote: "Thanks to the medical nutrition therapy, my blood sugar levels are now stable, and I have reduced my medication dosage under my doctor's supervision."
    }
  ];

  faqs: Faq[] = [
    {
      question: 'What happens during the initial consultation?',
      answer: 'During your first appointment, we will discuss your health history, dietary patterns, lifestyle factors, and nutrition goals. We will conduct a comprehensive assessment and collaborate on creating a personalized nutrition plan.',
      isOpen: false
    },
    {
      question: 'Do you accept insurance?',
      answer: 'Yes, many insurance plans cover medical nutrition therapy. We recommend contacting your insurance provider to verify coverage before your appointment. We can provide necessary documentation for reimbursement.',
      isOpen: false
    },
    {
      question: 'How often should I schedule follow-up appointments?',
      answer: 'This varies based on individual needs. Typically, we recommend follow-ups every 2-4 weeks initially, then spacing them out as you progress toward your goals. The frequency can be adjusted based on your specific situation.',
      isOpen: false
    },
    {
      question: 'Do I need a referral from my doctor?',
      answer: 'A referral is not required to see our dietitians unless your insurance plan specifically requires one for coverage. However, we often collaborate with healthcare providers to ensure comprehensive care.',
      isOpen: false
    },
    {
      question: 'Are virtual appointments available?',
      answer: 'Yes, we offer secure virtual consultations that are just as comprehensive as in-person visits. This option provides flexibility and convenience while maintaining the quality of care.',
      isOpen: false
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize any additional data or fetch from API if needed
  }

  scrollToServices(): void {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  bookService(service: Service): void {
    this.currentServiceId = service.id;
    this.openBookingModal();
  }

  openBookingModal(): void {
    this.showBookingModal = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }

  submitBooking(event: Event): void {
    event.preventDefault();
    
    // Here you would typically handle the form submission,
    // such as sending the data to your backend API
    
    // For demonstration purposes, we'll just close the modal
    alert('Thank you! Your booking request has been submitted. We will contact you shortly to confirm your appointment.');
    this.closeBookingModal();
  }

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  nextTestimonial(): void {
    this.currentTestimonialIndex = 
      (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonialIndex = 
      (this.currentTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }


  scrollToContact(): void {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If contact section doesn't exist in the DOM yet
      console.log('Contact section will be displayed soon');
      // You could implement additional logic here like showing a popup
      // or navigating to a contact page
    }
  }
}