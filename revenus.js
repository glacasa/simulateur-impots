class Revenu {
  constructor(libelle, montant, abattement) {
    this.libelle = libelle;
    this.montant = montant;
    this.abattement = abattement;
    this.optionName = null;

    this.maxDisplay = 360000;
    this.step = 600;
  }

  assietteIR() {
    return Math.round(this.montant * (1 - this.abattement));
  }

  assietteCSG() {
    return 0;
  }

  montantImpotForfaitaire() {
    return 0;
  }
}

class Salaire extends Revenu {
  constructor(montant) {
    super("Revenu d'activité", montant, 0.1);
  }
}

class Foncier extends Revenu {
  constructor(montant) {
    super("Revenu foncier", montant, 0.3);
    this.maxDisplay = 15000;
  }

  assietteCSG() {
    return Math.round(this.montant * (1 - this.abattement));
  }
}

class Dividende extends Revenu {

  constructor(montant) {
    super("Dividendes", montant, 0.4);
    this.step = 500;
    this.optionName = "Flat tax";
    this.option = true;
  }

  assietteIR() {
    if (this.option) {
      return 0;
    }

    return super.assietteIR();
  }

  assietteCSG() {
    if (this.option) {
      return 0;
    }

    return Math.round(this.montant);
  }

  montantImpotForfaitaire() {
    if (this.option) {
      return Math.round(this.montant * 0.3);
    }

    return 0;
  }
}
