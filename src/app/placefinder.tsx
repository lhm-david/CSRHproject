'use client';

import { useState, useEffect } from 'react';

interface PlaceFinderProps {
  placeId: string;
  onReviewsLoaded: (reviews: number) => void;
}

const PlaceFinder: React.FC<PlaceFinderProps> = ({ placeId, onReviewsLoaded }) => {
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      const request = {
        placeId: placeId,
        fields: ['reviews'],
      };

      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.reviews) {
          onReviewsLoaded(place.reviews.length);
        } else {
          console.error('Could not fetch Google Places details:', status);
          onReviewsLoaded(0);
        }
      });
    };

    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      fetchPlaceDetails();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = fetchPlaceDetails;
      document.head.appendChild(script);
    }
  }, [placeId, onReviewsLoaded]);

  return null;
};

export default PlaceFinder;
