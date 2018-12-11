class Revenu {
  constructor(type, montant, abattement, csg) {
    this.type = type;
    this.montant = montant;
    this.abattement = abattement;
    this.csg = csg;

    this.maxDisplay = 120000;
    this.step=600;
  }

  montantImposable() {
    return Math.round(this.montant * (1 - this.abattement));
  }
}

class Salaire extends Revenu {
  constructor(montant) {
    let a = {};
    super("Revenu d'activité", montant, 0.1, false);
  }
}

class Foncier extends Revenu {
  constructor(montant) {
    super("Revenu foncier", montant, 0.3, true);
    this.maxDisplay = 15000;
  }
}

class Dividende extends Revenu {
  constructor(montant) {
    super("Dividendes", montant, 0.4, true);
    this.step=500;
  }
}
