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

var infoAnnees = {
  2020: {
    bareme: [
      new Bareme(0, 10084, 0),
      new Bareme(10085, 25710, 0.11),
      new Bareme(25711, 73516, 0.3),
      new Bareme(73517, 158122, 0.41),
      new Bareme(158123, Number.MAX_VALUE, 0.45)
    ],
    plafondQfParDemiPartSup: 1567,
    decote: function (montant, etatcivil) {
      let impotMax = 0;
      let baseCalcul = 0;
      if (etatcivil === 1) {
        impotMax = 1717;
        baseCalcul = 777;
      }
      else {
        impotMax = 2842;
        baseCalcul = 1286;
      }

      let decote = 0;
      if (montant <= impotMax) {
        decote = baseCalcul - montant * 0.4525;
      }

      return Math.min(Math.round(decote), montant);
    }
  },
  2021: {
    bareme: [
      new Bareme(0, 10225, 0),
      new Bareme(10226, 26070, 0.11),
      new Bareme(26071, 74545, 0.3),
      new Bareme(74546, 160336, 0.41),
      new Bareme(160337, Number.MAX_VALUE, 0.45)
    ],
    plafondQfParDemiPartSup: 1570,
    decote: function (montant, etatcivil) {
      let impotMax = 0;
      let baseCalcul = 0;
      if (etatcivil === 1) {
        impotMax = 1722;
        baseCalcul = 779;
      }
      else {
        impotMax = 2849;
        baseCalcul = 1289;
      }

      let decote = 0;
      if (montant <= impotMax) {
        decote = baseCalcul - montant * 0.4525;
      }

      return Math.min(Math.round(decote), montant);
    }
  },
  2022: {
	bareme: [
		new Bareme(0, 10777, 0),
		new Bareme(10778, 27478, 0.11),
		new Bareme(27479, 48570, 0.3),
		new Bareme(78571, 168994, 0.41),
		new Bareme(168995, Number.MAX_VALUE, 0.45)
	],
	plafondQfParDemiPartSup: 1678,
	decote: function (montant, etatcivil) {
		let impotMax = 0;
		let baseCalcul = 0;
		if (etatcivil === 1) {
			impotMax = 1841;
			baseCalcul = 833;
		} else {
			impotMax = 3045;
			baseCalcul = 1378;
		}

		let decote = 0;
		if (montant <= impotMax) {
			decote = baseCalcul - montant * 0.4525;
		}

		return Math.min(Math.round(decote), montant);
	}
  }
};


var app = new Vue({
  el: "#app",
  data: {
    annee: 2022,
    listeAnnees: Object.keys(infoAnnees),

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

    // https://www.service-public.fr/particuliers/vosdroits/F2329
    tauxCsg: 0.172
  },
  computed: {
    // taux d'imposition et plafonds
    bareme: function () {
      return infoAnnees[this.annee].bareme;
    },
    infoCalcul: function () {
      return infoAnnees[this.annee];
    },

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

    revenuFiscalReference: function () {
      let total = 0;
      for (let i = 0; i < this.revenus.length; i++) {
        total += this.revenus[i].revenuReference();
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
      return this.infoCalcul.decote(this.droitsSimples, this.etatcivil);
    },
    montantTotalIR() {
      // https://www.service-public.fr/particuliers/vosdroits/F34328
      let montant = this.droitsSimples;

      // Décote
      montant -= this.decote;

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
