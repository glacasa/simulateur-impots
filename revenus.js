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

  revenuReference() {
    return this.assietteIR();
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
    this.optionName = "PFU";
    this.option = false;
  }

  assietteIR() {
    if (this.option) {
      return 0;
    }

    return super.assietteIR();
  }

  revenuReference() {
    if (this.option) {
      return Math.round(this.montant);
    }
    
    return super.revenuReference();
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

class MicroEntrepriseLiberal extends Revenu {
  constructor(montant) {
    super("Micro-entrepreneur", montant, 0.34);
    this.maxDisplay = 70000;
  }
}
