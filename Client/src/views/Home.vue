<template>
  <div class="container fluid" style="text-align: center; margin: 0px; padding: 0px; width: 100%">
    <h1>Bevenuto in Smart City API!</h1>
    <p
      class="lead"
    >Tramite queste API è possibile conoscere gli indicatori smart city, semplicemente inserendo la tua città o il tuo indirizzo</p>
    <hr class="my-4" />

    <div class="card">
      <img class="card-img-top" src="../assets/Example.png" alt="Card image cap" />
      <div class="card-body">
        <h5 class="card-title">Otterrai un indicatore complessivo che racchiude altri 6 indicatori:</h5>
        <p class="card-text">
        <ul>
          <li>Economia</li>
          <li>Ristorazione</li>
          <li>Sicurezza</li>
          <li>Salute</li>
          <li>Istruzione</li>
          <li>Ginnastica</li>
        </ul>
        </p>
        <a @click="registrati" class="btn btn-outline-info">Provalo Subito!</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',

  methods: {
    registrati() {
      this.$router.push('/register');
    }
  }
};
</script>
<style scoped>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  max-width: 50%;
  margin: auto;
}
.card-text {
  text-align: left;
}
</style>