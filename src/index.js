const API_KEY = 'AIzaSyC_kxFx9EMlcwaNtjUFvFFZVmikvIWRIPg';

class Locator {
  constructor() {
    this.apiReady = false;
    this.destinationList = [
      'Rosenstraße 1 80331 München',
      'Königsallee 2 40212 Düsseldorf',
      'Kurfürstendamm 26 10719 Berlin',
      'Alstertal-Einkaufszentrum Poppenbüttel 22391 Hamburg',
      'Kö-Bogen Königsallee 2 40212 Düsseldorf',
    ];
    this.renderDestinationsList();
    window.initMap = this.onApiLoad.bind(this);
  }

  toggleApiState() {
    this.apiReady = !this.apiReady;
    if ( this.apiReady ) {
      document.querySelector('#loader').classList.add('mui--hide');
    }
  }

  initMap() {
    this.bounds = new google.maps.LatLngBounds;
    this.markersArray = [];
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 48.01, lng: 7.2},
      zoom: 5,
      scrollwheel: false,
      navigationControl: false,
      mapTypeControl: false,
      scaleControl: false,
      draggable: false,
      disableDefaultUI: true,
    });
  }

  sortByDist(a, b) {
    try {
      return (a.distance.value - b.distance.value)
    } catch (e) {
      return false;
    }
  }

  setResultMessage( result ) {
    let message = document.querySelector('#distanceResult');
    message.classList.remove('mui--invisible');
    switch (result.status) {
      case 'OK':
        message.innerHTML = `Closest route from ${result.origin} is ${result.location}`;
        break;
      case 'ZERO_RESULTS':
        message.innerHTML = `Not possible to drive from ${result.origin}`;
        break;
      case 'NOT_FOUND':
        message.innerHTML = `Origin not recognized or does not exist`;
        break;
      default:
        message.innerHTML = `error occurred`;
        break;
    }
  }

  calculateDistanceMatrix( origin ) {
    this.bounds = new google.maps.LatLngBounds;
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
          origins: [ origin ],
          destinations: this.destinationList,
          travelMode: 'DRIVING',
        }, (response, status) => {
          console.log(response, status);
          let results = response.rows[0].elements.map((item, index) => {
            let res = item;
            res.location = response.destinationAddresses[index];
            res.origin = response.originAddresses[0];
            return res;
          });
          results.sort(this.sortByDist);
          this.setResultMessage(results[0]);
          console.log(results[0]);
          const originList = response.originAddresses;
          const destinationList = response.destinationAddresses;
          for ( const origin of originList ) {
            this.geocoder.geocode({'address': origin},
                this.renderPinOnMap.bind(this, false));
          }
          for ( const destination of destinationList ) {
            this.geocoder.geocode({'address': destination},
                this.renderPinOnMap.bind(this, true));
          }
        });
  }

  renderPinOnMap(isDest, results, status) {
    const destinationIcon = 'https://mt.google.com/vt/icon/psize=16&font=fonts/arialuni_t.ttf&color=ff330000&name=icons/spotlight/spotlight-waypoint-a.png&ax=44&ay=48&scale=1';
    const originIcon = 'https://mt.google.com/vt/icon/psize=16&font=fonts/arialuni_t.ttf&color=ff330000&name=icons/spotlight/spotlight-waypoint-b.png&ax=44&ay=48&scale=1';
    const icon = ( isDest ) ? destinationIcon : originIcon;
    if (status === 'OK') {
      this.map.fitBounds(this.bounds.extend(results[0].geometry.location));
      this.markersArray.push(new google.maps.Marker({
        map: this.map,
        position: results[0].geometry.location,
        icon,
      }));
    } else {
      console.error('Geocode was not successful due to: ' + status);
    }
  }

  renderDestinationsList() {
    const list = document.querySelector('#destination-list');
    for ( const destination of this.destinationList ) {
      let place = document.createElement('input');
      place.type = 'text';
      place.value = destination;
      place.disabled = true;
      list.appendChild(place);
    }
  }

  clearPins() {
    for ( const marker of this.markersArray ) {
      marker.setMap(null);
    }
    this.markersArray = [];
  }

  onApiLoad() {
    this.geocoder = new google.maps.Geocoder;
    this.initMap();
    this.toggleApiState();
  }

  loadMapsApi() {
    let s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
    document.body.appendChild(s);
  }

  onSubmit() {
    let message = document.querySelector('#distanceResult');
    const origin = document.querySelector('#originPoint').value;
    if ( !origin.length ) {
      message.classList.remove('mui--invisible');
      message.innerHTML = `Please specify origin point`;
      return null;
    } else {
      message.innerHTML = ``;
    }
    this.clearPins();
    this.calculateDistanceMatrix( origin );
  }
}

window.loc = new Locator();
loc.loadMapsApi();
