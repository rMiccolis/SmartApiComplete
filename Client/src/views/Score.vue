<template>
  <div class="container">
    <header class="jumbotron"></header>
    <div class="row justify-content-center">
      <div class="col-auto">
        <form class="form-inline" @submit.prevent="handleQuery">
          <gmap-autocomplete
            autofocus
            class="form-control mb-2 mr-sm-2"
            id="inlineFormAutocomplete"
            placeholder="Inserisci l'indirizzo..."
            :select-first-on-enter="true"
            @place_changed="setPlace"
            @keypress.enter="$event.preventDefault()"
            :options="{
              componentRestrictions: { country: 'it' },
              fields: ['address_component']
              }"
          ></gmap-autocomplete>
          <br />
          <label for="radiusInputName">Raggio:</label>
          <input
            type="range"
            name="radiusInputName"
            class="custom-range ml-2"
            id="radiusInputId"
            v-model="radius"
            @change="radiusChanged"
            min="100"
            max="5000"
            step="100"
            oninput="radiusOutputId.value = radiusInputId.value"
          />
          <output name="radiusOutputName" id="radiusOutputId">1000</output>
          <span>m</span>
          <button :disabled="!invia" type="submit" class="btn btn-outline-primary mb-2 ml-2">
            <span v-show="loading" class="spinner-border spinner-border-sm"></span>
            <span>Invia</span>
          </button>
        </form>
      </div>
    </div>
    <!-- Fine row center -->
    <div v-if="message" class="row justify-content-center">
      <div v-if="message" class="alert alert-danger" role="alert">{{message}}</div>
    </div>
    <hr />
    <div class="row" v-if="calcolato">
      <div class="col-sm-8">
        <h6>
          <strong>Raggio:</strong>
          {{fromServer.radius}} metri
        </h6>
        <h6>
          <strong>Popolazione:</strong>
          {{fromServer.population}}
        </h6>
        <h6>
          <strong>Distanza:</strong>
          {{fromServer.distance.toFixed(2)}} Km
        </h6>
        <h6>
          <strong>Coordinate:</strong>
          {{fromServer.coords.lat}},{{fromServer.coords.lng}}
        </h6>
        <h1>
          Punteggio totale:
          <button
            @click="mostra = !mostra"
            class="btn btn-outline-success mb-2"
          >{{fromServer.total_score}}</button>
        </h1>
        <div class="custom-control custom-radio custom-control-inline">
          <input
            class="custom-control-input"
            type="radio"
            id="mappa"
            value="Mappa"
            v-model="picked"
          />
          <label class="custom-control-label" for="mappa">Mappa</label>
        </div>

        <div class="custom-control custom-radio custom-control-inline">
          <input
            class="custom-control-input"
            type="radio"
            id="tabella"
            value="Tabella"
            v-model="picked"
          />
          <label class="custom-control-label" for="tabella">Tabella</label>
        </div>
        <hr />
        <transition name="fade">
          <div v-if="mostra" class="btn-group btn-group-justified">
            <a @click="mostraTabella('bank')" href="#scelta" class="btn btn-bank btn-sm">
              {{fromServer.index.bank.nome}}:
              {{fromServer.index.bank.score}}
            </a>
            <a
              @click="mostraTabella('restaurant')"
              href="#scelta"
              class="btn btn-restaurant btn-sm"
            >
              {{fromServer.index.restaurant.nome}}:
              {{fromServer.index.restaurant.score}}
            </a>
            <a @click="mostraTabella('police')" href="#scelta" class="btn btn-police btn-sm">
              {{fromServer.index.police.nome}}:
              {{fromServer.index.police.score}}
            </a>
            <a @click="mostraTabella('gym')" href="#scelta" class="btn btn-gym btn-sm">
              {{fromServer.index.gym.nome}}:
              {{fromServer.index.gym.score}}
            </a>
            <a @click="mostraTabella('hospital')" href="#scelta" class="btn btn-sm btn-hospital">
              {{fromServer.index.hospital.nome}}:
              {{fromServer.index.hospital.score}}
            </a>
            <a @click="mostraTabella('school')" href="#scelta" class="btn btn-school btn-sm">
              {{fromServer.index.school.nome}}:
              {{fromServer.index.school.score}}
            </a>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="tabella && mostra && picked=='Mappa'" id="scelta">
            <hr />
            <gmap-map ref="gmap" :center="center" :zoom="14" :options="options" class="mappa">
              <gmap-marker
                :key="index"
                v-for="(place, index) in places"
                :position="{lat: place.latitudine, lng: place.longitudine}"
                :icon="icon"
                @click="toggleInfoWindow(place,index)"
              ></gmap-marker>

              <gmap-info-window
                :options="infoOptions"
                :position="infoWindowPos"
                :opened="infoWinOpen"
                @closeclick="infoWinOpen=false"
              >
                <div v-html="infoContent"></div>
              </gmap-info-window>
            </gmap-map>
          </div>

          <div v-if="tabella && mostra && picked=='Tabella'" id="scelta" class="tabella">
            <hr />
            <table id="places" class="table">
              <thead class="thead-dark">
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Indirizzo</th>
                  <th scope="col">Latitudine</th>
                  <th scope="col">Longitudine</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="place in places" :key="place.id">
                  <td>{{ place.nome }}</td>
                  <td>{{ place.indirizzo }}</td>
                  <td>{{ place.latitudine }}</td>
                  <td>{{ place.longitudine }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </transition>
      </div>

      <div class="col-sm-4">
        <GChart
          id="grafico"
          :resizeDebounce="500"
          type="PieChart"
          :settings="{ packages: ['corechart'] }"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>

    <div class="row" v-if="calcolato">
      <div class="col-sm-12"></div>
    </div>
  </div>
</template>



<script>
import UserService from '../services/user.service';
import { GChart } from 'vue-google-charts';
import { gmapApi } from 'vue2-google-maps';

export default {
  components: {
    GChart
  },
  name: 'User',
  data() {
    return {
      places: [],
      picked: 'Mappa',
      options: {
        disableDefaultUI: true,
        scrollwheel: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      },
      //a default center for the map
      //map: null,
      infoContent: '',
      infoWindowPos: {
        lat: 0,
        lng: 0
      },
      infoWinOpen: false,
      currentMidx: null,
      //optional: offset infowindow so it visually sits nicely on top of our marker
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
      indicatore: '',
      other: false,
      tabella: false,
      mostra: false,
      invia: false,
      radius: 1000,
      // Array will be automatically processed with visualization.arrayToDataTable function
      calcolato: false,
      chartDataHeader: ['Task', 'Place Number'],
      chartDataRows: [
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '']
      ],
      chartOptions: {
        title: 'Place number',
        chartArea: { left: '50px', top: '50px', width: '80%', height: '100%' }
      },
      updatedChartData: [],
      message: '',
      loading: false,
      fromServer: {},
      place: {},
      address_components: {},
      componentForm: {
        street_number: 'short_name', // civico
        route: 'long_name', // indirizzo
        locality: 'long_name', // citta
        administrative_area_level_1: 'short_name', // Regione
        administrative_area_level_2: 'short_name',
        country: 'long_name', // nazione
        postal_code: 'short_name' // cap
      },
      toSend: {
        street_number: '', // civico
        route: '', // indirizzo
        locality: '', // citta
        administrative_area_level_1: '', // Regione
        administrative_area_level_2: '',
        country: '', // nazione
        postal_code: '', // cap
        radius: 1000 //raggio default
      }
    };
  },

  computed: {
    google: gmapApi,
    center() {
      return {
        lat: this.fromServer.coords.lat,
        lng: this.fromServer.coords.lng
      };
    },
    icon() {
      return {
        scaledSize: this.google && new this.google.maps.Size(28, 28),
        url: require('../assets/marker_icons/marker_' +
          this.indicatore +
          '.svg')
      };
    },

    selectedPlaces() {
      return this.fromServer.index[this.indicatore].places;
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    chartData() {
      return [this.chartDataHeader, ...this.updatedChartData];
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }
  },
  methods: {
    toggleInfoWindow: function(marker, idx) {
      this.infoWindowPos = { lat: marker.latitudine, lng: marker.longitudine };
      this.infoContent = this.getInfoWindowContent(marker);

      //check if its the same marker that was selected if yes toggle
      if (this.currentMidx == idx) {
        this.infoWinOpen = !this.infoWinOpen;
      }
      //if different marker set infowindow to open and reset current marker index
      else {
        this.infoWinOpen = true;
        this.currentMidx = idx;
      }
    },
    getInfoWindowContent: function(marker) {
      return `<h6>${marker.nome}</h6><p>${marker.indirizzo}</p>`;
    },
    radiusChanged() {
      this.toSend.radius = this.radius;
      this.invia = true;
    },
    handleQuery() {
      this.infoWinOpen = false;
      this.invia = false;
      this.loading = true;

      UserService.postUserQuery(this.toSend).then(
        response => {
          this.fromServer = response.data;
          this.message = '';
          this.loading = false;
          this.calcolato = true;
          this.updateData();
        },
        error => {
          this.loading = false;
          this.message =
            (error.response && error.response.data.message) ||
            error.message ||
            error.toString();
        }
      );
    },

    setPlace(place) {
      if (!place) return;

      this.place = place;
      for (var component in this.toSend) {
        this.toSend[component] = '';
      }

      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (this.componentForm[addressType]) {
          var val =
            place.address_components[i][this.componentForm[addressType]];
          this.toSend[addressType] = val;
        }

        this.toSend.radius = this.radius;
        this.invia = true;
      }
      this.address_components = place.address_components;
    },

    updateData() {
      this.updatedChartData = [
        ['economia', this.fromServer.index.bank.places.length],
        ['ristorazione', this.fromServer.index.restaurant.places.length],
        ['sicurezza', this.fromServer.index.police.places.length],
        ['fitness', this.fromServer.index.gym.places.length],
        ['salute', this.fromServer.index.hospital.places.length],
        ['istruzione', this.fromServer.index.school.places.length]
      ];
    },

    mostraTabella(indicatore) {
      if (this.indicatore != indicatore) {
        this.other = true;
      } else {
        this.other = false;
      }
      this.infoWinOpen = false;
      this.indicatore = indicatore;
      this.places = this.fromServer.index[this.indicatore].places;

      if (this.other) {
        this.tabella = true;
      } else {
        this.tabella = !this.tabella;
      }
    }
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.custom-range {
  width: 80px;
}

.form-inline .form-control {
  min-width: 50%;
  width: 300px;
}

.pie-chart {
  width: 500px;
  height: 400px;
}

.btn-indicator {
  color: #fff;
  min-width: 90px;
  max-width: 90px;
}

.btn-bank {
  color: #fff;
  background-color: #3366cc;
  border-color: rgb(51, 102, 204);
  border: 2px solid rgb(51, 102, 204);
  background-color: white;
  color: #3366cc;
  cursor: pointer;
  margin: 0px 3px;
}
.btn-bank:hover,
.btn-bank:focus,
.btn-bank:active,
.btn-bank.active,
.open > .dropdown-toggle.btn-bank {
  color: #fff;
  background-color: rgb(4, 44, 124);
  border-color: rgb(4, 44, 124);
}
.btn-restaurant {
  color: #fff;
  background-color: #dc3912;
  border-color: #dc3912;
  border: 2px solid rgb(220, 57, 18);
  background-color: white;
  color: rgb(220, 57, 18);
  cursor: pointer;
  margin: 0px 3px;
}
.btn-restaurant:hover,
.btn-restaurant:focus,
.btn-restaurant:active,
.btn-restaurant.active,
.open > .dropdown-toggle.btn-restaurant {
  color: #fff;
  background-color: rgb(112, 29, 8);
  border-color: rgb(112, 29, 8);
}
.btn-police {
  color: #fff;
  background-color: #ff9900;
  border-color: rgb(255, 153, 0);
  border: 2px solid rgb(255, 153, 0);
  background-color: white;
  color: rgb(255, 153, 0);
  cursor: pointer;
  margin: 0px 3px;
}
.btn-police:hover,
.btn-police:focus,
.btn-police:active,
.btn-police.active,
.open > .dropdown-toggle.btn-police {
  color: #fff;
  background-color: rgb(175, 109, 9);
  border-color: rgb(175, 109, 9);
}

.btn-gym {
  color: #fff;
  background-color: #109618;
  border-color: rgb(16, 150, 24);
  border: 2px solid rgb(16, 150, 24);
  background-color: white;
  color: rgb(16, 150, 24);
  cursor: pointer;
  margin: 0px 3px;
}
.btn-gym:hover,
.btn-gym:focus,
.btn-gym:active,
.btn-gym.active,
.open > .dropdown-toggle.btn-gym {
  color: #fff;
  background-color: rgb(8, 71, 13);
  border-color: rgb(8, 71, 13);
}

.btn-hospital {
  color: #fff;
  background-color: #990099;
  border-color: rgb(153, 0, 153);
  border: 2px solid rgb(153, 0, 153);
  background-color: white;
  color: #990099;
  cursor: pointer;
  margin: 0px 3px;
}
.btn-hospital:hover,
.btn-hospital:focus,
.btn-hospital:active,
.btn-hospital.active,
.open > .dropdown-toggle.btn-hospital {
  color: #fff;
  background-color: rgb(83, 2, 83);
  border-color: rgb(83, 2, 83);
}
.btn-school {
  color: #fff;
  background-color: #0099c6;
  border-color: #0099c6;
  border: 2px solid rgb(0, 153, 198);
  background-color: white;
  color: rgb(0, 153, 198);
  cursor: pointer;
  margin: 0px 3px;
}
.btn-school:hover,
.btn-school:focus,
.btn-school:active,
.btn-school.active,
.open > .dropdown-toggle.btn-school {
  color: #fff;
  background-color: rgb(2, 73, 95);
  border-color: rgb(2, 73, 95);
}
#grafico {
  width: 400px;
  height: 300px;
}
img.center {
  text-align: center;
  margin: 0 auto;
  padding: 0px;
  width: 650px;
}
.jumbotron {
  background-image: url('../assets/Senzanome.jpg');
  background-size: cover;
}
.mappa {
  margin-bottom: 50px;
  border: 2px solid rgb(0, 0, 0);
  width: 700px;
  height: 300px;
}
/* style="width:700px;  height: 300px;" */
</style>