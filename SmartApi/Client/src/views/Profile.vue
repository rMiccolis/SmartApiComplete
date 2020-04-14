<template>
  <div class="container">
    <header class="jumbotron">
      <h3>
        <strong>{{currentUser.username}}</strong> API Usage
      </h3>
    </header>
    <p>
      <strong>API_KEY:</strong>
      <code>
      {{currentUser.apikey}}</code>
    </p>
    <p>
      <strong>Email:</strong>
      {{currentUser.email}}
    </p>
    <p>
      <strong>API DOCUMENTATION:</strong>
    </p>
    <h6><strong>Complete query</strong></h6>
    <p>
      
      <strong>Required parameters</strong>
      <ul type="disc">
        <li><code>route</code> -- The address</li>
        <li><code>street_number</code> -- The street_number</li>
        <li><code>locality</code> -- The locality</li>
        <li><code>administrative_area_level_2</code> -- The administrative_area_level_2</li>
        <li><code>radius</code> -- The radius in meters</li>
        <li><code>API_KEY</code> -- Your personal API Key</li>
      </ul>
      <code>"http://localhost:3000/api/json&route=Via%20Bari&street_number=10&locality=Valenzano&administrative_area_level_2=BA&radius=1000&API_KEY={{currentUser.apikey}}"</code>
     </p>
      <hr>
       <h6><strong>Only Locality</strong></h6>
       <p>
     
      <strong>Required parameters</strong>
      <ul type="disc">
        <li><code>locality</code> -- The locality</li>
        <li><code>administrative_area_level_2</code> -- The administrative_area_level_2</li>
        <li><code>radius</code> -- The radius in meters</li>
        <li><code>API_KEY</code> -- Your personal API Key</li>
      </ul>
      <code>"http://localhost:3000/api/json&locality=Valenzano&administrative_area_level_2=BA&radius=1000&API_KEY={{currentUser.apikey}}"</code>
     </p>
      <hr>
      <h6><strong>Only address</strong></h6>
    <p>
      
      <strong>Required parameters</strong>
      <ul type="disc">
        <li><code>route</code> -- The address</li>
        <li><code>locality</code> -- The locality</li>
        <li><code>administrative_area_level_2</code> -- The administrative_area_level_2</li>
        <li><code>radius</code> -- The radius in meters</li>
        <li><code>API_KEY</code> -- Your personal API Key</li>
      </ul>
      <code>"http://localhost:3000/api/json&route=Via%20Bari&locality=Valenzano&administrative_area_level_2=BA&radius=1000&API_KEY={{currentUser.apikey}}"</code>  
      
    </p>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }
  }
};
</script>