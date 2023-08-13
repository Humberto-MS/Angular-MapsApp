import { Component, ElementRef, ViewChild } from '@angular/core';
import { LngLat, Map, Marker } from 'mapbox-gl';

interface MarkerAndColor {
  color : string;
  marker : Marker;
}

interface PlainMarker {
  color : string;
  lngLat : number [];
}

@Component({
  templateUrl: './markers-page.component.html',
  styleUrls: ['./markers-page.component.css']
})
export class MarkersPageComponent {
  @ViewChild ( 'map' ) divMap? : ElementRef;

  public markers : MarkerAndColor [] = [];

  public map? : Map;
  public currentLngLat : LngLat = new LngLat ( -74.5, 40 );

  ngAfterViewInit() : void {
    if ( !this.divMap ) throw ( 'El elemento HTML no fue encontrado' );

    this.map = new Map ( {
      container : this.divMap.nativeElement, // container ID
      style : 'mapbox://styles/mapbox/streets-v12', // style URL
      center : this.currentLngLat, // starting position [lng, lat]
      zoom : 13, // starting zoom
    } );

    this.readFromLocalStorage();

    // const markerHTML : HTMLDivElement = document.createElement ( 'div' );
    // markerHTML.innerHTML = 'palabra cualquiera';

    // const marker = new Marker ( {
    //   color : 'red',
    //   element : markerHTML
    // } )
    //   .setLngLat ( this.currentLngLat )
    //   .addTo ( this.map );
  }

  createMarker() {
    if ( !this.map ) return;

    const color = '#xxxxxx'.replace ( /x/g, y => ( Math.random() * 16 | 0 ).toString ( 16 ) );
    const lngLat = this.map.getCenter();

    this.addMarker ( lngLat, color );
  }

  addMarker ( lngLat : LngLat, color : string ) : void {
    if ( !this.map ) return;

    const marker = new Marker ( {
      color : color,
      draggable : true
    } )
      .setLngLat ( lngLat )
      .addTo ( this.map );

    this.markers.push ( { color, marker } );
    this.saveToLocalStorage();

    marker.on ( 'dragend', () => { this.saveToLocalStorage() } );
  }

  deleteMarker ( index : number ) : void {
    this.markers [ index ].marker.remove();
    this.markers.splice ( index, 1 );
  }

  flyTo ( marker : Marker ) {
    this.map?.flyTo ( {
      zoom : 14,
      center : marker.getLngLat()
    } );
  }

  saveToLocalStorage() : void {
    const plainMarkers : PlainMarker [] = this.markers.map ( ( { color, marker } ) => {
      return {
        color,
        lngLat : marker.getLngLat().toArray()
      };
    } );

    localStorage.setItem ( 'plainMarkers', JSON.stringify ( plainMarkers ) );
  }

  readFromLocalStorage() : void {
    const plainMarkersString = localStorage.getItem ( 'plainMarkers' ) ?? '[]';
    const plainMarkers : PlainMarker [] = JSON.parse ( plainMarkersString );  // ! OJO !

    plainMarkers.forEach ( ( { color, lngLat } ) => {
      const [ lng, lat ] = lngLat;
      const coords = new LngLat ( lng, lat );
      this.addMarker ( coords, color );
    } );
  }
}
