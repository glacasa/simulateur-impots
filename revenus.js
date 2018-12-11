class Revenu {
  constructor(type, montant, multiplicateur, abattement, csg) {
    this.type = type;
    this.montant = montant;
    this.multiplicateur = multiplicateur;
    this.abattement = abattement;
    this.csg = csg;
  }

  montantAnnuel() {
    return Math.trunc(this.montant * this.multiplicateur);
  }

  montantImposable() {
    return Math.trunc(this.montantAnnuel() * (1 - this.abattement));
  }
}

class Salaire extends Revenu {
  constructor(montant) {
    super("Revenu d'activité", montant, 12, 0.1, false);
  }
}

class Loyer extends Revenu {
  constructor(montant) {
    super("Revenu foncier", montant, 12, 0.3, true);
  }
}

class Dividende extends Revenu {
  constructor(montant) {
    super("Dividendes", montant, 1, 0.4, true);
  }
}
