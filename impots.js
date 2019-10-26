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
      return "Plus de " + this.min + " €";
    }
    return "De " + this.min + " € à " + this.max + " €";
  }
}

var listeBaremes = {
  // Barème sur les revenus de 2017
  2017: [
    new Bareme(0, 9807, 0),
    new Bareme(9808, 27086, 0.14),
    new Bareme(27087, 72617, 0.3),
    new Bareme(72618, 153783, 0.41),
    new Bareme(153784, Number.MAX_VALUE, 0.45)
  ],
  2018: [
    // https://www.service-public.fr/particuliers/vosdroits/F1419
    new Bareme(0, 9964, 0),
    new Bareme(9965, 27519, 0.14),
    new Bareme(27520, 73779, 0.3),
    new Bareme(73780, 156244, 0.41),
    new Bareme(156245, Number.MAX_VALUE, 0.45)
  ],
  // PLF 2020, sous réserve du vote par le parlement
  // http://www.assemblee-nationale.fr/15/projets/pl2272.asp
  2019: [
    new Bareme(0, 10064, 0),
    new Bareme(10065, 27794, 0.14),
    new Bareme(27795, 74517, 0.3),
    new Bareme(74518, 157806, 0.41),
    new Bareme(157807, Number.MAX_VALUE, 0.45)
  ],
  // barème 2020 ?
  2020: [
    new Bareme(0, 10064, 0),
    new Bareme(10065, 25659, 0.11),
    new Bareme(25660, 73369, 0.3),
    new Bareme(73370, 157806, 0.41),
    new Bareme(157807, Number.MAX_VALUE, 0.45)
  ]
};


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
    revenus: [new Salaire(21600)],

    // Ajout de revenus
    typeNouveauRevenu: "salaire",
    nouveauRevenu: new Salaire(0),

    // taux d'imposition et plafonds
    bareme: listeBaremes[2019],
    anciensBaremes: [
      {annee: 2017, bareme: listeBaremes[2017] },
      {annee: 2018, bareme: listeBaremes[2018] },
      {annee: 2019, bareme: listeBaremes[2019] },
      {annee: 2020, bareme: listeBaremes[2020] }
    ],

    montantsSpeciaux: {
      plafondQfParDemiPartSup: 1551,
      decoteCouple: {
        impotMax: 2627,
        baseCalcul: 1970,
      },
      decoteIndiv: {
        impotMax: 1595,
        baseCalcul: 1196,
      },
      allegementsIndiv: {
        revenuMaxAllegementDegressif: 21036,
        revenuMaxAllegementComplet: 18984,
        augmentationSeuilParPart: 3797 * 2
      },
    },

    // https://www.service-public.fr/particuliers/vosdroits/F2329
    tauxCsg: 0.172
  },
  computed: {
    parts: function () {
      var partsEnfants = 0;
      if (this.nbEnfants <= 2) {
        partsEnfants = this.nbEnfants / 2;
      } else {
        partsEnfants = this.nbEnfants - 1;
      }

      return this.etatcivil + partsEnfants + this.partsSupplementaires;
    },

    revenusTotaux: function () {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].montant;
      }
      return total;
    },
    totalImposable: function () {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].assietteIR();
      }
      return total;
    },

    totalImposableCsg: function () {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].assietteCSG();
      }
      return total;
    },

    imposableParPart() {
      return this.totalImposable / this.parts;
    },
    tauxMarginal: function () {
      let ref = this.imposableParPart;
      for (let i = 0; i < this.bareme.length; i++) {
        var tx = this.bareme[i];
        if (tx.min <= ref && tx.max > ref) {
          return Math.round(tx.taux * 100);
        }
      }
    },

    droitsSimples() {
      if (this.parts == 1) {
        return Math.round(this.calculImpot(this.totalImposable));
      }

      let impotSelonQuotientFamilial = this.calculImpot(this.imposableParPart) * this.parts;

      //TODO : plafonnement de la réduction quotient familial
      // https://www.service-public.fr/particuliers/vosdroits/F2702
      // https://www.service-public.fr/particuliers/vosdroits/F2705
      // var plafonnement = Math.round(
      //   this.plafonnementParPart / (this.parts - 1)
      // );
      // let impotPlafonne = this.calculImpot(this.totalImposable) - plafonnement;

      // if (impotSelonQuotientFamilial < impotPlafonne) {
      //   return Math.round(impotPlafonne);
      // } else {
      return Math.round(impotSelonQuotientFamilial);
      // }
    },
    decote() {
      let montant = this.droitsSimples;

      let calculDecote = this.etatcivil === 1
        ? this.montantsSpeciaux.decoteIndiv
        : this.montantsSpeciaux.decoteCouple;

      let decote = 0;
      if (montant <= calculDecote.impotMax) {
        decote = calculDecote.baseCalcul - montant * 0.75;
      }

      return Math.min(Math.round(decote), montant);
    },
    allegement() {
      let montant = this.droitsSimples - this.decote;

      let revenuMaxDegressif = this.montantsSpeciaux.allegementsIndiv.revenuMaxAllegementDegressif * this.etatcivil;
      revenuMaxDegressif += this.montantsSpeciaux.allegementsIndiv.augmentationSeuilParPart * (this.parts - this.etatcivil);

      if (this.totalImposable <= revenuMaxDegressif) {
        let allegementComplet = montant * 0.2;
        let revenuMaxComplet = this.montantsSpeciaux.allegementsIndiv.revenuMaxAllegementComplet * this.etatcivil;
        if (this.totalImposable <= revenuMaxComplet) {
          return Math.round(allegementComplet);
        }
        else {
          return Math.round(allegementComplet * ((revenuMaxDegressif - this.totalImposable) / (revenuMaxDegressif - revenuMaxComplet)));
        }
      }

      return 0;
    },
    montantTotalIR() {
      // https://www.service-public.fr/particuliers/vosdroits/F34328
      let montant = this.droitsSimples;

      // Décote
      montant -= this.decote;

      // Allegement sous conditions de ressources
      montant -= this.allegement;

      // TODO contribution hauts revenus
      // https://www.service-public.fr/particuliers/vosdroits/F31130

      return montant;
    },

    montantTotalCsg() {
      return Math.round(this.totalImposableCsg * this.tauxCsg);
    },

    impotsForfaitaires() {
      let impots = [];
      impots.total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        let forfaitaire = this.revenus[i].montantImpotForfaitaire();
        if (forfaitaire > 0) {
          impots.push(this.revenus[i]);
          impots.total += forfaitaire;
        }
      }

      return impots;
    },

    montantTotalImpots() {
      return this.montantTotalIR + this.montantTotalCsg + this.impotsForfaitaires.total;
    },

    pourcentagePrelevement() {
      if (!this.revenusTotaux) {
        return 0;
      }
      return ((this.montantTotalImpots) / this.revenusTotaux) * 100;
    }
  },
  watch: {
    typeNouveauRevenu: function (nouveauType) {
      var montant = this.nouveauRevenu.montant;
      this.nouveauRevenu = this.creerRevenu(nouveauType, montant);
    }
  },
  methods: {
    calculImpot(imposable) {
      let total = 0;
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

    creerRevenu(typeRevenu, montant) {
      switch (typeRevenu) {
        case "salaire":
          return new Salaire(montant);
        case "foncier":
          return new Foncier(montant);
        case "dividende":
          return new Dividende(montant);
        case "microentrepriseliberal":
          return new MicroEntrepriseLiberal(montant);
      }
      throw "Type de revenus inconnu";
    },

    ajoutRevenus() {
      this.revenus.push(this.nouveauRevenu);
      this.nouveauRevenu = new Salaire(0);
    },

    suppressionRevenus(r) {
      for (let i = 0; i < this.revenus.length; i++) {
        if (this.revenus[i] == r) {
          this.revenus.splice(i, 1);
        }
      }
    }
  }
});
