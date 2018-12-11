var app = new Vue({
  el: "#app",
  data: {
    //Calcul du nombre de parts
    // https://www.service-public.fr/particuliers/vosdroits/F2705
    etatcivil: 1,
    nbEnfants: 0,

    // Revenus
    salaire: new Salaire(21600),
    foncier: new Foncier(0),
    dividendes: new Dividende(0),

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
    parts: function() {
      var partsEnfants = 0;
      if (this.nbEnfants <= 2) {
        partsEnfants = this.nbEnfants / 2;
      } else {
        partsEnfants = this.nbEnfants - 1;
      }

      return this.etatcivil + partsEnfants;
    },

    revenus: function() {
      return [this.salaire, this.foncier, this.dividendes];
    },

    revenusTotaux: function() {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].montant;
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
    tauxMarginal: function() {
      let ref = this.imposableParPart;
      for (let i = 0; i < this.bareme.length; i++) {
        var tx = this.bareme[i];
        if (tx.min <= ref && tx.max > ref) {
          return Math.round(tx.taux * 100);
        }
      }
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
      return Math.round(this.montantImpotParPart * this.parts);
    },

    montantTotalCsg() {
      return Math.round(this.totalImposableCsg * 0.172);
    },

    pourcentagePrelevement() {
      if (!this.revenusTotaux) {
        return 0;
      }
      return (this.montantTotalImpot / this.revenusTotaux) * 100;
    }
  }
});
