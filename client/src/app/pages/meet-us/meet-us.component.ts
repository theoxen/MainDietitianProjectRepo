import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener  } from '@angular/core';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";

interface Photo {
  imageUrl: string;
  caption: string;
}

@Component({
  selector: 'app-meet-us',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './meet-us.component.html',
  styleUrl: './meet-us.component.css'
})
export class MeetUsComponent {

  @ViewChild('carouselTrack') carouselTrack!: ElementRef;

  photos: Photo[] = [
    { imageUrl: 'images/dietitian.jpg', caption: 'Your Dedicated Nutrition Professional' },
    { imageUrl: 'images/specialEquipment.jpg', caption: 'State-of-the-Art Assessment Equipment' },
    { imageUrl: 'images/diets.jpg', caption: 'Personalized Nutrition Consultations' },
    { imageUrl: 'images/relaxingRoom.jpg', caption: 'Comfortable and Inviting Waiting Area' },
    { imageUrl: 'images/dietitianSign.jpg', caption: 'Welcome to Our Nutrition Practice' }
  ];

  currentIndex = 0;
  slideWidth = 0;
  autoRotateInterval: any;
  autoRotationPaused = false;
  touchStartX = 0;
  
  ngAfterViewInit(): void {
    // Call this after your existing AfterViewInit code if any
    this.calculateSlideWidth();
    this.startAutoRotation();
    
    // Add event listeners for touch events
    const trackElement = this.carouselTrack.nativeElement;
    trackElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    trackElement.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
  }

  ngOnDestroy(): void {
    // Call this before your existing OnDestroy code if any
    this.stopAutoRotation();
    
    // Remove event listeners
    if (this.carouselTrack && this.carouselTrack.nativeElement) {
      const trackElement = this.carouselTrack.nativeElement;
      trackElement.removeEventListener('touchstart', this.onTouchStart.bind(this));
      trackElement.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculateSlideWidth();
    this.updatePosition();
  }


calculateSlideWidth(): void {
  if (this.carouselTrack && this.carouselTrack.nativeElement) {
    const carousel = this.carouselTrack.nativeElement.parentElement;
    this.slideWidth = carousel.getBoundingClientRect().width;
  }
}

updatePosition(): void {
  if (this.carouselTrack && this.carouselTrack.nativeElement) {
    this.carouselTrack.nativeElement.style.transform = 
      `translateX(${-this.currentIndex * this.slideWidth}px)`;
  }
}

nextSlide(): void {
  this.currentIndex = (this.currentIndex + 1) % this.photos.length;
  this.updatePosition();
  this.resetAutoRotation();
}

prevSlide(): void {
  this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
  this.updatePosition();
  this.resetAutoRotation();
}

goToSlide(index: number): void {
  this.currentIndex = index;
  this.updatePosition();
  this.resetAutoRotation();
}

startAutoRotation(): void {
  this.autoRotateInterval = setInterval(() => {
    if (!this.autoRotationPaused) {
      this.nextSlide();
    }
  }, 5000); // Auto rotate every 5 seconds
}

stopAutoRotation(): void {
  if (this.autoRotateInterval) {
    clearInterval(this.autoRotateInterval);
  }
}

resetAutoRotation(): void {
  this.stopAutoRotation();
  this.startAutoRotation();
}

pauseAutoRotation(): void {
  this.autoRotationPaused = true;
}

resumeAutoRotation(): void {
  this.autoRotationPaused = false;
}

onTouchStart(e: TouchEvent): void {
  this.touchStartX = e.touches[0].clientX;
  this.pauseAutoRotation();
}

onTouchEnd(e: TouchEvent): void {
  const touchEndX = e.changedTouches[0].clientX;
  const difference = this.touchStartX - touchEndX;
  const threshold = 50; // Minimum swipe distance
  
  if (difference > threshold) {
    // Swipe left - go to next slide
    this.nextSlide();
  } else if (difference < -threshold) {
    // Swipe right - go to previous slide
    this.prevSlide();
  }
  
  this.resumeAutoRotation();
  }
}