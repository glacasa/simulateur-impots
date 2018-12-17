class Bareme {
  constructor(min, max, taux) {
    this.min = min;
    this.max = max;
    this.taux = taux;
  }

  affichageIntervalle() {
    if (this.min == 0) {
      return "Jusqu'à " + this.max + " €";
    }
    if (this.max == Number.MAX_VALUE) {
      return "Au dessus de " + this.min + " €";
    }
    return "De " + this.min + " à " + this.max + " €";
  }
}

var app = new Vue({
  el: "#app",
  data: {
    //Calcul du nombre de parts
    // https://www.service-public.fr/particuliers/vosdroits/F2702
    // https://www.service-public.fr/particuliers/vosdroits/F2705
    etatcivil: 1,
    nbEnfants: 0,
    partsSupplementaires: 0,

    // Revenus
    salaire: new Salaire(21600),
    foncier: new Foncier(0),
    dividendes: new Dividende(0),

    bareme: [
      // Barème 2018
      // https://fr.wikipedia.org/wiki/Bar%C3%A8mes_de_l%27imp%C3%B4t_sur_le_revenu_en_France
      new Bareme(0, 9807, 0),
      new Bareme(9807, 27086, 0.14),
      new Bareme(27086, 72617, 0.3),
      new Bareme(72617, 153783, 0.41),
      new Bareme(153783, Number.MAX_VALUE, 0.45)
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

      return this.etatcivil + partsEnfants + this.partsSupplementaires;
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
      // TODO : prise en compte du plafonnement
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

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
