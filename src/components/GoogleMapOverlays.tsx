import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export interface MapPolylineProps {
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolylineOptions;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

export const MapPolyline: React.FC<MapPolylineProps> = ({ path, options, onClick }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path,
      ...options,
      map
    });
    polylineRef.current = polyline;

    let clickListener: google.maps.MapsEventListener | null = null;
    if (onClick) {
      clickListener = polyline.addListener('click', onClick);
    }

    return () => {
      if (clickListener) {
        google.maps.event.removeListener(clickListener);
      }
      polyline.setMap(null);
      polylineRef.current = null;
    };
  }, [map, path, options?.strokeColor, options?.strokeWeight, options?.strokeOpacity]);

  return null;
};

export interface MapCircleProps {
  center: google.maps.LatLngLiteral;
  radius: number;
  options?: google.maps.CircleOptions;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

export const MapCircle: React.FC<MapCircleProps> = ({ center, radius, options, onClick }) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      center,
      radius,
      ...options,
      map
    });
    circleRef.current = circle;

    let clickListener: google.maps.MapsEventListener | null = null;
    if (onClick) {
      clickListener = circle.addListener('click', onClick);
    }

    return () => {
      if (clickListener) {
        google.maps.event.removeListener(clickListener);
      }
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map, center.lat, center.lng, radius, options?.fillColor, options?.fillOpacity, options?.strokeColor, options?.strokeWeight]);

  return null;
};

export interface MapPolygonProps {
  paths: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][];
  options?: google.maps.PolygonOptions;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

export const MapPolygon: React.FC<MapPolygonProps> = ({ paths, options, onClick }) => {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;

    const polygon = new google.maps.Polygon({
      paths,
      ...options,
      map
    });
    polygonRef.current = polygon;

    let clickListener: google.maps.MapsEventListener | null = null;
    if (onClick) {
      clickListener = polygon.addListener('click', onClick);
    }

    return () => {
      if (clickListener) {
        google.maps.event.removeListener(clickListener);
      }
      polygon.setMap(null);
      polygonRef.current = null;
    };
  }, [map, paths, options?.fillColor, options?.fillOpacity, options?.strokeColor, options?.strokeWeight]);

  return null;
};

export const MapCameraPan: React.FC<{ target: google.maps.LatLngLiteral | null; zoom?: number }> = ({ target, zoom = 15 }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, target?.lat, target?.lng, zoom]);

  return null;
};
