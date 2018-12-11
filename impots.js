var app = new Vue({
  el: "#app",
  data: {
    revenus: [
      new Salaire(1000),
      new Salaire(1000),
      new Loyer(200),
      new Dividende(20000)
    ],
    parts: 1,
    bareme: [
      // Barème 2018
      // https://fr.wikipedia.org/wiki/Bar%C3%A8mes_de_l%27imp%C3%B4t_sur_le_revenu_en_France
      { min: 0, max: 9807, taux: 0 },
      { min: 9807, max: 27086, taux: 0.14 },
      { min: 27086, max: 72617, taux: 0.3 },
      { min: 72617, max: 153783, taux: 0.41 },
      { min: 153783, max: Number.MAX_VALUE, taux: 0.45 }
    ]
  },
  computed: {
    revenusTotaux: function() {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].montantAnnuel();
      }
      return total;
    },
    totalImposable: function() {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].montantImposable();
      }
      return total;
    },
    totalImposableCsg: function() {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        if (this.revenus[i].csg) {
          total += this.revenus[i].montantImposable();
        }
      }
      return total;
    },

    imposableParPart() {
      return this.totalImposable / this.parts;
    },

    montantImpotParPart() {
      let total = 0;
      var imposable = this.imposableParPart;
      for (let i = 0; i < this.bareme.length; i++) {
        let tranche = this.bareme[i];
        if (imposable > tranche.min) {
          let max = imposable;
          if (imposable > tranche.max) {
            max = tranche.max;
          }
          total += (max - tranche.min) * tranche.taux;
        }
      }
      return total;
    },
    montantTotalImpot() {
      return this.montantImpotParPart * this.parts;
    },

    montantTotalCsg(){
        return this.totalImposableCsg * 0.172;
    },

    pourcentagePrelevement() {
      return (this.montantTotalImpot / this.revenusTotaux) * 100;
    }
  }
});
